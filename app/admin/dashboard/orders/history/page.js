'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Download, MoreVertical, Eye, ChevronLeft, ChevronRight,
  Clock, RefreshCw, Inbox, CheckCircle, XCircle, Truck, Package
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api/admin';

export default function OrderHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // ==========================================
  // ✅ FETCH DATA FROM API
  // ==========================================
  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter !== 'all' ? statusFilter : '',
        payment: paymentFilter !== 'all' ? paymentFilter : '',
        search: searchTerm,
        sort: sortBy,
        date: dateRange
      });

      const res = await axios.get(`${API_BASE_URL}/orders/history?${params}`, {
        withCredentials: true
      });

      if (res && res.data) {
        setOrders(res.data.orders || []);
        setTotalOrders(res.data.totalOrders || 0);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching order history:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load order history.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, [currentPage, statusFilter, paymentFilter, dateRange, sortBy]);

  // ==========================================
  // ✅ UPDATE ORDER STATUS
  // ==========================================
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const statusValue = newStatus.toLowerCase();
      
      const res = await axios.put(
        `${API_BASE_URL}/orders/${orderId}/status`,
        { status: statusValue },
        { withCredentials: true }
      );

      if (res.data) {
        setOrders(prev => prev.map(order => 
          order._id === orderId 
            ? { ...order, orderStatus: statusValue }
            : order
        ));
        
        setOpenDropdownId(null);
        alert(`✅ Order status updated to ${newStatus}`);
      }
    } catch (err) {
      console.error('❌ Error updating order status:', err);
      alert(`❌ ${err.response?.data?.error || err.message || 'Failed to update order status'}`);
    }
  };

  // ==========================================
  // ✅ HANDLE DROPDOWN OPEN (FIXED POSITION)
  // ==========================================
  const handleDropdownOpen = (orderId, e) => {
    e.stopPropagation();
    
    // Get button position
    const buttonRect = e.currentTarget.getBoundingClientRect();
    
    // Calculate position (fixed to viewport)
    setDropdownPosition({
      top: buttonRect.bottom + 5,
      left: Math.max(10, buttonRect.right - 192) // 192px = w-48
    });
    
    setOpenDropdownId(orderId);
  };

  // Close dropdown when clicking anywhere
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ==========================================
  // ✅ UI HELPER
  // ==========================================
  const getStatusBadge = (status) => {
    const styles = {
      'pending': 'bg-gray-100 text-gray-700 border-gray-200',
      'processing': 'bg-gray-100 text-gray-700 border-gray-200',
      'shipped': 'bg-gray-100 text-gray-700 border-gray-200',
      'delivered': 'bg-green-100 text-green-700 border-green-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
      'refunded': 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'processing': return <Package className="w-3 h-3" />;
      case 'shipped': return <Truck className="w-3 h-3" />;
      case 'delivered': return <CheckCircle className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      case 'refunded': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  // ==========================================
  // ✅ STATUS OPTIONS
  // ==========================================
  const statusOptions = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Refunded'
  ];

  // ==========================================
  // ✅ RENDER
  // ==========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B7A4B]"></div>
        <p className="ml-3 text-gray-500">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ {error}</p>
          <button 
            onClick={fetchOrderHistory}
            className="px-4 py-2 bg-[#2B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#23663e]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Order History <Clock className="w-6 h-6 text-gray-400" />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View complete history of all completed, cancelled, and refunded orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchOrderHistory}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* --- FILTER & SEARCH TOOLBAR --- */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        
        <div className="relative flex-1 w-full lg:w-auto lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Customer or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] focus:border-transparent"
          />
        </div>

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
              <option value="refunded">Refunded</option>
            </select>
            <select 
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
            >
              <option value="all">All Payment</option>
              <option value="credit">Credit Card</option>
              <option value="paypal">PayPal</option>
              <option value="apple_pay">Apple Pay</option>
              <option value="cod">COD</option>
            </select>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
            >
              <option value="all">Date Range</option>
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 3 months</option>
            </select>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
            >
              <option value="newest">Sort By</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Total</option>
              <option value="lowest">Lowest Total</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- ORDER HISTORY TABLE --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="rounded border-gray-300 text-[#2B7A4B] focus:ring-[#2B7A4B]" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
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
                  <td colSpan="10">
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <Inbox className="w-10 h-10 text-gray-400 mb-3" />
                      <h3 className="text-base font-semibold text-gray-900 mb-1">No orders found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <input type="checkbox" className="rounded border-gray-300 text-[#2B7A4B] focus:ring-[#2B7A4B]" />
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900 text-sm">{order.orderNumber || order._id?.slice(-6)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">
                            {order.user?.firstName?.[0] || order.shippingAddress?.firstName?.[0] || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.user?.firstName || order.shippingAddress?.firstName || 'Customer'} {order.user?.lastName || order.shippingAddress?.lastName || ''}
                          </p>
                          <p className="text-xs text-gray-500">{order.user?.phone || order.shippingAddress?.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {order.user?.email || order.shippingAddress?.email || 'No email'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 text-center">{order.items?.length || 0}</td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      Rs. {(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{order.paymentMethod || 'N/A'}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)} {order.orderStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-gray-500 hover:text-[#2B7A4B] hover:bg-green-50 rounded-md transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* ===== THREE DOTS BUTTON (NO DROPDOWN HERE) ===== */}
                        <button 
                          onClick={(e) => handleDropdownOpen(order._id, e)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                        >
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
      </div>

      {/* ==========================================
          FIXED POSITION DROPDOWN (GRAY BACKGROUND)
      ========================================== */}
      {openDropdownId && (
        <div 
          className="fixed z-[99999] bg-gray-50 rounded-xl shadow-2xl border border-gray-200 w-48 overflow-hidden"
          style={{ 
            top: dropdownPosition.top, 
            left: dropdownPosition.left,
            maxHeight: '300px',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-100 border-b border-gray-200">
            Change Status
          </div>
          
          {/* Status Options */}
          <div className="py-1">
            {statusOptions.map((status) => {
              const currentOrder = orders.find(o => o._id === openDropdownId);
              const isSelected = currentOrder?.orderStatus?.toLowerCase() === status.toLowerCase();
              
              return (
                <button
                  key={status}
                  onClick={() => updateOrderStatus(openDropdownId, status)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                    isSelected 
                      ? 'bg-gray-200 text-gray-900 font-medium' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-gray-500">{getStatusIcon(status)}</span>
                  <span>{status}</span>
                  {isSelected && (
                    <CheckCircle className="w-4 h-4 ml-auto text-[#2B7A4B]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}