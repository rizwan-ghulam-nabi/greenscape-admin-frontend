// app/admin/dashboard/customers/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, Package, 
  ShoppingBag, TrendingUp, Crown, Wifi, WifiOff, 
  Loader2, AlertCircle, MessageSquare, MoreHorizontal,
  ChevronDown, Download, Printer, Edit
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function CustomerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;

  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch customer details
  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/customers/${customerId}`, {
        withCredentials: true
      });

      if (res.data?.customer) {
        setCustomer(res.data.customer);
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching customer:', err);
      if (err.response?.status === 401) {
        router.push('/admin/login');
      } else {
        setError('Failed to load customer details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  // Helpers
  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }) + ' at ' + new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (customer) => {
    return `${customer.firstName?.[0] || ''}${customer.lastName?.[0] || ''}`.toUpperCase();
  };

  const getStatusBadge = (customer) => {
    if (customer.isOnline) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Online
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
        {customer.status === 'active' ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      'Delivered': 'bg-green-100 text-green-700',
      'Processing': 'bg-blue-100 text-blue-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Cancelled': 'bg-red-100 text-red-700',
      'Shipped': 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f5a2e]"></div>
          <p className="mt-4 text-gray-500">Loading customer profile...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error || 'Customer not found'}</p>
          <Link href="/admin/dashboard/customers" className="text-green-600 hover:underline">
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* ===== BREADCRUMB ===== */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-green-600">Home</Link>
            <span>›</span>
            <Link href="/admin/dashboard/customers" className="hover:text-green-600">Customers</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Customer Profile</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Profile</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/admin/dashboard/customers')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* ===== CUSTOMER HEADER CARD ===== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl">
              {getInitials(customer)}
            </div>
          </div>

          {/* Customer Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900">
                {customer.fullName || `${customer.firstName} ${customer.lastName}`}
              </h2>
              {getStatusBadge(customer)}
            </div>
            <p className="text-sm text-gray-500">@{customer.firstName?.toLowerCase()}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                {customer.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                {customer.phone || '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                {customer.country || '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                Joined {formatDate(customer.createdAt)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Mail className="w-5 h-5 text-green-600" />
              <span className="text-[10px] text-gray-600">Email</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Phone className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] text-gray-600">Call</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <span className="text-[10px] text-gray-600">Message</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
              <Edit className="w-5 h-5 text-orange-600" />
              <span className="text-[10px] text-gray-600">Edit</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-gray-100">
          <div className="p-4 text-center border-r border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{customer.totalOrders || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total Orders</p>
          </div>
          <div className="p-4 text-center border-r border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Spent</p>
          </div>
          <div className="p-4 text-center border-r border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(customer.totalSpent * 0.15)}</p>
            <p className="text-xs text-gray-500 mt-1">Avg. Order Value</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{formatDateTime(customer.lastLoginTime)}</p>
            <p className="text-xs text-gray-500 mt-1">Last Login</p>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN - Order History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order History */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Order History</h3>
              <button className="text-sm text-green-600 hover:text-green-700">View All</button>
            </div>
            
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                No orders yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <div key={order._id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">#{order._id.slice(-6)}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getOrderStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDateTime(order.createdAt)}</span>
                      <span>{order.items?.length || 0} items</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Customer Activity</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Wifi className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Login</p>
                    <p className="text-xs text-gray-500">{formatDateTime(customer.lastLoginTime)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-xs text-gray-500">{formatDate(customer.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Customer Details */}
        <div className="space-y-6">
          
          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{customer.phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Country</p>
                  <p className="text-sm font-medium text-gray-900">{customer.country || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Registered On</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(customer.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium text-gray-900">{customer.status || 'Active'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <ShoppingBag className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-900">{customer.totalOrders || 0}</p>
                <p className="text-[10px] text-gray-500">Total Orders</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                <p className="text-[10px] text-gray-500">Total Spent</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <Crown className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-gray-900">{formatCurrency(customer.totalSpent * 0.15)}</p>
                <p className="text-[10px] text-gray-500">Avg. Order</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}