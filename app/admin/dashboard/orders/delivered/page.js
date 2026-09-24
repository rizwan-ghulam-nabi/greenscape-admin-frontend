// app/admin/dashboard/orders/delivered/page.js
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Clock, Loader2, X, DollarSign, Package, Truck, 
  CheckCircle, XCircle, Eye, Search, User, Mail, Phone,
  MapPin, CreditCard, RotateCcw, RefreshCw, Send
} from 'lucide-react';
import PaymentStatusBadge from '@/components/PaymentStatusBadge';

const API_BASE_URL = 'http://localhost:5001/api/admin';

export default function DeliveredOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('delivered');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Email notification state
  const [emailNotification, setEmailNotification] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // ===== FETCH DELIVERED ORDERS =====
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/orders?status=delivered`, {
        withCredentials: true
      });
      setOrders(res.data.orders || []);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ===== FILTER ORDERS BY SEARCH =====
  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(search) ||
      order.user?.firstName?.toLowerCase().includes(search) ||
      order.user?.lastName?.toLowerCase().includes(search) ||
      order.user?.email?.toLowerCase().includes(search)
    );
  });

  // ===== OPEN MODAL =====
  const openModal = (order) => {
    setSelectedOrder(order);
    setOrderStatus(order.orderStatus || 'delivered');
    setPaymentStatus(order.paymentStatus || 'pending');
    setEmailNotification('');
    setEmailSent(false);
    setShowModal(true);
  };

  // ===== SAVE CHANGES (With Email Logic) =====
  const saveChanges = async () => {
    try {
      setSaving(true);
      setEmailSent(false);
      setEmailNotification('');
      
      let emailWasSent = false;
      let emailMessage = '';
      
      // Update order status
      if (orderStatus !== selectedOrder.orderStatus) {
        const res = await axios.put(
          `${API_BASE_URL}/orders/${selectedOrder._id}/status`,
          { status: orderStatus },
          { withCredentials: true }
        );
        
        // Check if email was sent automatically by backend
        if (res.data?.emailSent) {
          emailWasSent = true;
          emailMessage = `Email sent to ${selectedOrder.user?.email}`;
          setEmailSent(true);
          setEmailNotification(`📧 ${emailMessage}`);
        }
      }
      
      // Update payment status
      if (paymentStatus !== selectedOrder.paymentStatus) {
        await axios.put(
          `${API_BASE_URL}/orders/${selectedOrder._id}/payment`,
          { paymentStatus: paymentStatus },
          { withCredentials: true }
        );
      }
      
      // Show appropriate message
      if (emailWasSent) {
        alert(`✅ Status updated! 📧 Email sent to customer.`);
      } else {
        alert('✅ Status updated successfully!');
      }
      
      setShowModal(false);
      fetchOrders();
      
    } catch (err) {
      console.error('Error:', err);
      alert(`❌ ${err.response?.data?.error || 'Failed to update'}`);
    } finally {
      setSaving(false);
    }
  };

  // ===== STATUS HELPERS =====
  const getOrderStatusBadge = (status) => {
    const styles = {
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'processing': 'bg-blue-100 text-blue-700 border-blue-200',
      'shipped': 'bg-purple-100 text-purple-700 border-purple-200',
      'delivered': 'bg-green-100 text-green-700 border-green-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
      'refunded': 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getOrderStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'processing': return <Package className="w-3 h-3" />;
      case 'shipped': return <Truck className="w-3 h-3" />;
      case 'delivered': return <CheckCircle className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#2B7A4B]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Delivered Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage orders that have been delivered
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(orders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.paymentStatus !== 'paid').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Paid Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.paymentStatus === 'paid').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== SEARCH BAR ===== */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
          />
        </div>
      </div>

      {/* ===== ORDERS TABLE ===== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-600 font-medium">No delivered orders found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.user?.firstName} {order.user?.lastName}</p>
                          <p className="text-xs text-gray-500">{order.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-4 font-medium text-gray-900">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-4">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getOrderStatusBadge(order.orderStatus)}`}>
                        {getOrderStatusIcon(order.orderStatus)} {order.orderStatus || 'Delivered'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => openModal(order)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#2B7A4B] text-white rounded-lg text-xs font-medium hover:bg-[#23663e] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
          STATUS CHANGE MODAL
      ========================================== */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#2B7A4B] to-[#1a5c35] p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Manage Order</h2>
                  <p className="text-green-200 text-sm mt-1">{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              {/* Email Notification - Shows when email sent */}
              {emailSent && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <Send className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">{emailNotification}</span>
                </div>
              )}

              {/* Order Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Customer</p>
                    <p className="text-sm text-gray-600">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                    <p className="text-xs text-gray-500">{selectedOrder.user?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">Total</p>
                    <p className="text-xl font-bold text-[#2B7A4B]">{formatCurrency(selectedOrder.totalAmount)}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3 flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}
                  <span className="mx-1">•</span>
                  <CreditCard className="w-3 h-3" />
                  {selectedOrder.paymentMethod}
                </div>
              </div>

              {/* Order Status */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderStatus(status)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        orderStatus === status
                          ? 'bg-[#2B7A4B] text-white border-transparent shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {getOrderStatusIcon(status)}
                      <span className="capitalize">{status}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Status */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['pending', 'paid', 'failed', 'refunded'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setPaymentStatus(status)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        paymentStatus === status
                          ? 'bg-[#2B7A4B] text-white border-transparent shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {status === 'paid' ? <DollarSign className="w-3 h-3" /> : status === 'pending' ? <Clock className="w-3 h-3" /> : status === 'failed' ? <XCircle className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
                      <span className="capitalize">{status}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}