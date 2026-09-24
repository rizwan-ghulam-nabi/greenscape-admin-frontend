// app/admin/orders/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, Clock, CheckCircle, XCircle, 
  Search, Filter, Download, MoreVertical, Eye,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/admin';

export default function OrdersPage() {
  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data Hooks
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });
  const itemsPerPage = 10;

  // --- Fetch Data on Load ---
  useEffect(() => {
    fetchOrdersData();
  }, [currentPage]);

  // Separate effect for filters
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      fetchOrdersData();
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter, paymentFilter]);

  const fetchOrdersData = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter !== 'all' ? statusFilter : '',
        paymentStatus: paymentFilter !== 'all' ? paymentFilter : '',
        search: searchTerm
      });

      const res = await axios.get(`${API_BASE_URL}/orders?${params}`, {
        withCredentials: true, // Use cookies for auth
      });

      console.log('📦 Orders API Response:', res.data); // Debug log

      // Handle the API response structure from your backend
      if (res.data) {
        // Set orders from the response
        setOrders(res.data.orders || []);
        
        // Set total orders from pagination or analytics
        setTotalOrders(
          res.data.pagination?.totalOrders || 
          res.data.analytics?.totalOrders || 
          (res.data.orders || []).length
        );
        
        // Set analytics
        if (res.data.analytics) {
          setAnalytics(res.data.analytics);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      
      // If 401, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else {
        setError('Failed to load order data.');
      }
      setLoading(false);
    }
  };

  // --- UI Helpers ---
  const getStatusBadge = (status) => {
    const statusMap = {
      'delivered': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'shipped': 'bg-blue-100 text-blue-700 border-blue-200',
      'processing': 'bg-orange-100 text-orange-700 border-orange-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    
    const normalizedStatus = status?.toLowerCase() || 'pending';
    return statusMap[normalizedStatus] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${(amount || 0).toFixed(2)}`;
  };

  // --- Loading State ---
  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#2B7A4B]"></div>
          <p className="text-sm text-gray-500 animate-pulse">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-red-600">
        <div className="text-center space-y-3">
          <p>{error}</p>
          <button 
            onClick={() => fetchOrdersData()} 
            className="px-4 py-2 bg-[#2B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#23663e]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // --- Stats Cards Data ---
  const statsCards = [
    {
      title: 'Total Orders',
      value: analytics.totalOrders || totalOrders,
      icon: '📦',
      bg: 'bg-blue-50',
      color: 'text-blue-600'
    },
    {
      title: 'Pending',
      value: analytics.pendingOrders || orders.filter(o => o.orderStatus === 'pending').length,
      icon: '⏳',
      bg: 'bg-yellow-50',
      color: 'text-yellow-600'
    },
    {
      title: 'Processing',
      value: analytics.processingOrders || orders.filter(o => o.orderStatus === 'processing').length,
      icon: '🔄',
      bg: 'bg-orange-50',
      color: 'text-orange-600'
    },
    {
      title: 'Delivered',
      value: analytics.deliveredOrders || orders.filter(o => o.orderStatus === 'delivered').length,
      icon: '✅',
      bg: 'bg-emerald-50',
      color: 'text-emerald-600'
    },
    {
      title: 'Cancelled',
      value: analytics.cancelledOrders || orders.filter(o => o.orderStatus === 'cancelled').length,
      icon: '❌',
      bg: 'bg-red-50',
      color: 'text-red-600'
    }
  ];

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- Page Content Wrapper --- */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Order Management 
              <ShoppingBag className="w-6 h-6 text-gray-400" />
            </h1>
            <p className="text-sm text-gray-500 mt-1">View and manage all customer orders from your store.</p>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statsCards.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          {/* Search */}
          <div className="relative flex-1 w-full lg:w-auto lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order Number or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] focus:border-transparent"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select 
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
              >
                <option value="all">All Payment</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex-1 sm:flex-none">
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#23663e] transition-colors flex-1 sm:flex-none shadow-sm">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" className="rounded border-gray-300 text-[#2B7A4B] focus:ring-[#2B7A4B]" />
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Items</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' 
                        ? 'No orders match your filters.' 
                        : 'No orders found. Orders will appear here when customers place them.'}
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr key={order._id || index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <input type="checkbox" className="rounded border-gray-300 text-[#2B7A4B] focus:ring-[#2B7A4B]" />
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900 text-sm">
                          #{order.orderNumber || order._id?.slice(-6) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {(order.user?.firstName || 'G')[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {order.user?.firstName || 'Guest'} {order.user?.lastName || ''}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.user?.email || order.shippingAddress?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 text-center">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {order.paymentStatus || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(order.orderStatus)}`}>
                          {order.orderStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 text-gray-500 hover:text-[#2B7A4B] hover:bg-green-50 rounded-md transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
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

          {/* Pagination */}
          {totalOrders > 0 && (
            <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} orders
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
                <button className="px-3 py-1 bg-[#2B7A4B] text-white rounded-md text-sm font-medium">{currentPage}</button>
                <button 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * itemsPerPage >= totalOrders}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}