// app/admin/dashboard/customers/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Users, UserCheck, Crown, UserX, Search, Filter, 
  MoreHorizontal, ArrowUpDown, X, Mail, Phone, MessageSquare,
  Package, Calendar, MapPin, ShoppingBag, TrendingUp, ChevronLeft, ChevronRight,
  Download, UserPlus, Eye, RefreshCw, AlertCircle, ArrowRight
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function CustomersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    vipCustomers: 0,
    inactiveCustomers: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCustomers: 0 });
  
  // Selected Customer for Side Panel
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);

  // ✅ NEW: Real orders for the selected customer
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
      });

      const res = await axios.get(`${API_BASE_URL}/customers?${params}`, {
        withCredentials: true
      });

      if (res.data?.customers) {
        setCustomers(res.data.customers);
        setStats({
          totalCustomers: res.data.stats?.totalCustomers || 0,
          activeCustomers: res.data.stats?.activeCustomers || 0,
          vipCustomers: res.data.stats?.repeatCustomers || 0,
          inactiveCustomers: res.data.stats?.inactiveCustomers || 0,
        });
        setPagination(res.data.pagination);
        
        // Auto-select first customer
        if (res.data.customers?.length > 0 && !selectedCustomer) {
          setSelectedCustomer(res.data.customers[0]);
          setShowSidePanel(true);
          fetchCustomerOrders(res.data.customers[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      if (err.response?.status === 401) {
        router.push('/admin/login');
      } else {
        setError('Failed to load customers');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch real orders for selected customer
  const fetchCustomerOrders = async (customerId) => {
    try {
      setOrdersLoading(true);
      setCustomerOrders([]); // Clear old data

      const res = await axios.get(
        `${API_BASE_URL}/orders?customerId=${customerId}&limit=3`,
        { withCredentials: true }
      );

      if (res.data?.orders) {
        setCustomerOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch single customer details
  const fetchCustomerDetails = async (customerId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customers/${customerId}`, {
        withCredentials: true
      });
      
      if (res.data?.customer) {
        setSelectedCustomer(res.data.customer);
        setShowSidePanel(true);
        // ✅ Also fetch this customer's real orders
        fetchCustomerOrders(customerId);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    }
  };

  // Initial load & filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, statusFilter]);

  // ✅ Helper: Format currency in PKR (Rs)
  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getInitials = (customer) => {
    return `${customer.firstName?.[0] || ''}${customer.lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (index) => {
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500'];
    return colors[index % colors.length];
  };

  const getStatusBadge = (customer) => {
    if (customer.isOnline) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
        Inactive
      </span>
    );
  };

  // ✅ NEW: Order status badge colors
  const getOrderStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered' || s === 'completed') return 'text-green-600';
    if (s === 'shipped') return 'text-blue-600';
    if (s === 'processing') return 'text-purple-600';
    if (s === 'cancelled') return 'text-red-600';
    return 'text-yellow-600';
  };

  // Stat Cards
  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      change: '+14.2% vs last month',
      icon: Users,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
    },
    {
      title: 'Active Customers',
      value: stats.activeCustomers,
      change: '+10.5% vs last month',
      icon: UserCheck,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      title: 'VIP Customers',
      value: stats.vipCustomers,
      change: '+8.3% vs last month',
      icon: Crown,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-50',
    },
    {
      title: 'Inactive Customers',
      value: stats.inactiveCustomers,
      change: '-5.6% vs last month',
      icon: UserX,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50',
    },
  ];

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f5a2e]"></div>
          <p className="mt-4 text-gray-500">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Link href="/admin/dashboard" className="hover:text-green-600">Home</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Customers</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0f5a2e] text-white rounded-lg text-sm font-medium hover:bg-[#0a4221] transition-colors">
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.iconBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              <span className="text-green-600 font-medium">↑ {stat.change}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex gap-6">
        
        {/* ===== TABLE SECTION ===== */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">All Customers</h2>
              <span className="text-sm text-gray-400">({pagination.totalCustomers})</span>
            </div>
            
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f5a2e]"
                />
              </div>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <ArrowUpDown className="w-4 h-4 text-gray-600" />
              </button>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <MoreHorizontal className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Orders</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer, index) => (
                    <tr 
                      key={customer._id} 
                      className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${
                        selectedCustomer?._id === customer._id ? 'bg-green-50/50' : ''
                      }`}
                      onClick={() => fetchCustomerDetails(customer._id)}
                    >
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-white font-medium text-sm`}>
                            {getInitials(customer)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {customer.fullName || `${customer.firstName} ${customer.lastName}`}
                            </p>
                            <p className="text-xs text-gray-400">@{customer.firstName?.toLowerCase() || 'customer'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{customer.email}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{customer.phone || '—'}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 text-center font-medium">{customer.totalOrders || 0}</td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{formatCurrency(customer.totalSpent)}</td>
                      <td className="px-4 py-4">{getStatusBadge(customer)}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{formatDate(customer.createdAt)}</td>
                      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalCustomers > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * itemsPerPage) + 1} to {Math.min(pagination.page * itemsPerPage, pagination.totalCustomers)} of {pagination.totalCustomers} entries
              </p>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
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
                      className={`w-8 h-8 flex items-center justify-center text-sm rounded-md ${
                        currentPage === pageNum ? 'bg-[#0f5a2e] text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ===== CUSTOMER INFO SIDE PANEL ===== */}
        {showSidePanel && selectedCustomer && (
          <div className="w-80 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
            {/* Panel Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Customer Information</h3>
              <button 
                onClick={() => setShowSidePanel(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Profile */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg`}>
                  {getInitials(selectedCustomer)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedCustomer.fullName || `${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                  </p>
                  <p className="text-xs text-gray-400">@{selectedCustomer.firstName?.toLowerCase()}</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full mt-1">
                    {selectedCustomer.isOnline ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <button className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span className="text-[10px] text-gray-600">Email</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-[10px] text-gray-600">Call</span>
                </button>
                <button className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="text-[10px] text-gray-600">Message</span>
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="p-4 border-b border-gray-100 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-gray-400 text-sm mt-0.5">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedCustomer.fullName || `${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-gray-400 text-sm mt-0.5">
                  <Mail className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-gray-400 text-sm mt-0.5">
                  <Phone className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">{selectedCustomer.phone || '—'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-gray-400 text-sm mt-0.5">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs text-gray-500">Joined Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedCustomer.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-gray-400 text-sm mt-0.5">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium text-gray-900">{selectedCustomer.status || 'Active'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-gray-400 text-sm mt-0.5">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">{selectedCustomer.country || '—'}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Statistics</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{selectedCustomer.totalOrders || 0}</p>
                  <p className="text-[10px] text-gray-400">Total Orders</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedCustomer.totalSpent)}</p>
                  <p className="text-[10px] text-gray-400">Total Spent</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                    <Crown className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedCustomer.totalOrders > 0
                      ? formatCurrency(selectedCustomer.totalSpent / selectedCustomer.totalOrders)
                      : formatCurrency(0)}
                  </p>
                  <p className="text-[10px] text-gray-400">Avg. Order Value</p>
                </div>
              </div>
            </div>

            {/* ✅ RECENT ORDERS — NOW REAL DATA */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Recent Orders</h4>
                <button className="text-xs text-green-600 hover:text-green-700">View All</button>
              </div>

              {ordersLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-400">
                  No orders yet
                </div>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                    >
                      <div>
                        <p className="text-xs font-medium text-gray-900">
                          #{order.orderNumber || order._id?.slice(-6)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <span className={`text-[10px] capitalize ${getOrderStatusColor(order.orderStatus)}`}>
                          {order.orderStatus || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* View Profile Button */}
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => router.push(`/admin/dashboard/customers/${selectedCustomer._id}`)}
                className="w-full py-2.5 bg-[#0f5a2e] text-white rounded-lg text-sm font-medium hover:bg-[#0a4221] transition-colors flex items-center justify-center gap-2"
              >
                View Customer Profile
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}