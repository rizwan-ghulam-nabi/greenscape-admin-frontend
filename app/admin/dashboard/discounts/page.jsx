// app/admin/dashboard/discounts/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Plus, Search, Filter, MoreVertical, Pencil, Trash2,
  Calendar, Tag, Percent, DollarSign, CheckCircle, Clock,
  XCircle, AlertCircle, Loader2, RefreshCw, TrendingUp,
  TrendingDown, Package
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function DiscountsPage() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    expired: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete modal
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ==========================================
  // ✅ FETCH DISCOUNTS
  // ==========================================
  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        type: typeFilter !== 'all' ? typeFilter : '',
        status: statusFilter !== 'all' ? statusFilter : '',
      });

      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const res = await axios.get(`${API_BASE_URL}/discounts?${params}`, {
        withCredentials: true,
      });

      if (res.data?.success) {
        setDiscounts(res.data.discounts || []);
        setStats(res.data.stats || { total: 0, active: 0, scheduled: 0, expired: 0 });
        setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Error fetching discounts:', err);
      if (err.response?.status === 401) {
        router.push('/admin/login');
      } else {
        setError('Failed to load discounts');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDiscounts();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, typeFilter, statusFilter, dateRange]);

  // ==========================================
  // ✅ DELETE DISCOUNT
  // ==========================================
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/discounts/${deleteId}`, {
        withCredentials: true,
      });
      setDiscounts(discounts.filter(d => d._id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchDiscounts();
    } catch (err) {
      console.error('Error deleting discount:', err);
      alert('Failed to delete discount');
    }
  };

  // ==========================================
  // ✅ TOGGLE STATUS
  // ==========================================
  const handleToggleStatus = async (id) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/discounts/${id}/toggle`, {}, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setDiscounts(discounts.map(d => 
          d._id === id ? { ...d, isActive: !d.isActive } : d
        ));
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  // ==========================================
  // ✅ HELPERS
  // ==========================================
  const getStatusBadge = (discount) => {
    const now = new Date();
    const start = new Date(discount.startDate);
    const end = new Date(discount.endDate);

    if (!discount.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
          <XCircle className="w-3 h-3" />
          Inactive
        </span>
      );
    }

    if (now < start) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
          <Clock className="w-3 h-3" />
          Scheduled
        </span>
      );
    }

    if (now > end) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <XCircle className="w-3 h-3" />
          Expired
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (type === 'percentage') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
          <Percent className="w-3 h-3" />
          Percentage
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
        <DollarSign className="w-3 h-3" />
        Fixed Amount
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getValueDisplay = (discount) => {
    if (discount.type === 'percentage') {
      return `${discount.value}%`;
    }
    return `Rs. ${discount.value}`;
  };

  const getAppliesToDisplay = (discount) => {
    if (discount.appliesTo === 'all_products') return 'All Plants';
    if (discount.appliesTo === 'specific_products') return `${discount.products?.length || 0} Selected Products`;
    if (discount.appliesTo === 'categories') return discount.categories?.map(c => c.name).join(', ') || 'Categories';
    if (discount.appliesTo === 'new_arrivals') return 'New Arrivals';
    return 'All Products';
  };

  // ==========================================
  // ✅ STAT CARDS
  // ==========================================
  const statCards = [
    {
      title: 'Total Discounts',
      value: stats.total,
      change: '+20%',
      trend: 'up',
      icon: Tag,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
    },
    {
      title: 'Active Discounts',
      value: stats.active,
      change: '+33%',
      trend: 'up',
      icon: CheckCircle,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Scheduled Discounts',
      value: stats.scheduled,
      change: '0%',
      trend: 'up',
      icon: Clock,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50',
    },
    {
      title: 'Expired Discounts',
      value: stats.expired,
      change: '-75%',
      trend: 'down',
      icon: XCircle,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
    },
  ];

  // ==========================================
  // ✅ RENDER
  // ==========================================
  if (loading && discounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2B7A4B]" />
          <p className="mt-4 text-gray-500">Loading discounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-green-600">Home</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Discounts</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Discounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage special discounts and deals for your products</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDiscounts}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <Link
            href="/admin/dashboard/discounts/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Discount
          </Link>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
            <div className="flex items-center gap-1">
              {stat.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={fetchDiscounts} className="ml-auto text-sm font-medium hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* ===== TOOLBAR ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search discounts by name, code or product..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
          >
            <option value="all">All Types</option>
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Reset */}
          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setStatusFilter('all');
              setDateRange({ start: '', end: '' });
              setCurrentPage(1);
            }}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applies To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center">
                    <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No discounts found</p>
                    <Link
                      href="/admin/dashboard/discounts/create"
                      className="inline-block mt-3 text-sm text-[#2B7A4B] hover:underline font-medium"
                    >
                      + Create your first discount
                    </Link>
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {discount.image ? (
                            <img
                              src={discount.image}
                              alt={discount.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-green-50">
                              <Tag className="w-5 h-5 text-green-600" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {discount.name}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {discount.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {discount.code}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {getTypeBadge(discount.type)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-gray-900 text-sm">
                        {getValueDisplay(discount)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {getAppliesToDisplay(discount)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(discount.startDate)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {formatDate(discount.endDate)}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(discount)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/dashboard/discounts/edit/${discount._id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setDeleteId(discount._id);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINATION ===== */}
        {pagination.total > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(pagination.page * itemsPerPage, pagination.total)} of {pagination.total} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (pagination.totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-[#2B7A4B] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== DELETE MODAL ===== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Discount</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this discount? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}