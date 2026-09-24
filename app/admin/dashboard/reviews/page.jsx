// app/admin/dashboard/reviews/page.jsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { 
  Star, Search, Filter, Download, Eye, Trash2, 
  CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight, 
  Leaf, User, Box, RefreshCw, AlertCircle, X, Plus, MessageSquare, Send
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [activeTab, setActiveTab] = useState('All');
  const [selectedReviews, setSelectedReviews] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Data
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  // Modals
  const [replyModal, setReplyModal] = useState({ open: false, review: null, text: '' });
  const [viewModal, setViewModal] = useState({ open: false, review: null });
  const [addModal, setAddModal] = useState({
    open: false,
    productId: '',
    rating: 5,
    title: '',
    comment: '',
    userName: 'Admin',
    email: '',
  });
  const [products, setProducts] = useState([]);

  // ==========================================
  // ✅ FETCH REVIEWS
  // ==========================================
  const fetchReviewsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/reviews`, {
        withCredentials: true,
      });

      let fetchedReviews = [];
      if (Array.isArray(res.data?.reviews)) fetchedReviews = res.data.reviews;
      else if (Array.isArray(res.data?.data)) fetchedReviews = res.data.data;

      const approved = res.data.approvedCount ?? fetchedReviews.filter(r => (r.status || 'pending').toLowerCase() === 'approved').length;
      const pending = res.data.pendingCount ?? fetchedReviews.filter(r => (r.status || 'pending').toLowerCase() === 'pending').length;
      const rejected = res.data.rejectedCount ?? fetchedReviews.filter(r => (r.status || '').toLowerCase() === 'rejected').length;
      const avg = res.data.averageRating ?? 0;

      setReviews(fetchedReviews);
      setStats({
        totalReviews: res.data.totalReviews ?? fetchedReviews.length,
        averageRating: avg,
        approved,
        pending,
        rejected,
      });
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.error || err.message;
      if (status === 401) setError('Not authenticated. Please login as admin.');
      else if (status === 404) setError('Backend endpoint /api/admin/reviews not found.');
      else setError(`Failed to load reviews: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Products fetch — uses admin endpoint
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products?limit=200`, {
        withCredentials: true,
      });

      let list = [];
      if (Array.isArray(res.data?.products)) list = res.data.products;
      else if (Array.isArray(res.data?.data)) list = res.data.data;
      else if (Array.isArray(res.data)) list = res.data;

      console.log('✅ Products loaded:', list.length);
      setProducts(list);
    } catch (err) {
      console.error('❌ Failed to fetch products:', err.response?.status, err.message);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchReviewsData();
    fetchProducts();
  }, []);

  // ==========================================
  // ✅ ACTIONS
  // ==========================================
  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await axios.put(`${API_BASE_URL}/reviews/${id}/approve`, {}, { withCredentials: true });
      await fetchReviewsData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection (optional):') || 'Violates guidelines';
    try {
      setActionLoading(id);
      await axios.put(`${API_BASE_URL}/reviews/${id}/reject`, { reason }, { withCredentials: true });
      await fetchReviewsData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      setActionLoading(id);
      await axios.delete(`${API_BASE_URL}/reviews/${id}`, { withCredentials: true });
      await fetchReviewsData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyModal.text.trim()) return;
    try {
      setActionLoading(replyModal.review._id);
      await axios.put(
        `${API_BASE_URL}/reviews/${replyModal.review._id}/reply`,
        { reply: replyModal.text.trim() },
        { withCredentials: true }
      );
      setReplyModal({ open: false, review: null, text: '' });
      await fetchReviewsData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send reply');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddReviewSubmit = async () => {
    if (!addModal.productId || !addModal.comment.trim()) {
      alert('Product and comment are required');
      return;
    }
    try {
      setActionLoading('add');
      await axios.post(
        `${API_BASE_URL}/reviews`,
        {
          productId: addModal.productId,
          rating: Number(addModal.rating),
          title: addModal.title,
          comment: addModal.comment,
          userName: addModal.userName || 'Admin',
          email: addModal.email || '',
        },
        { withCredentials: true }
      );
      setAddModal({ open: false, productId: '', rating: 5, title: '', comment: '', userName: 'Admin', email: '' });
      await fetchReviewsData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedReviews.length === 0) return;
    try {
      await axios.post(`${API_BASE_URL}/reviews/bulk/approve`, { ids: selectedReviews }, { withCredentials: true });
      setSelectedReviews([]);
      await fetchReviewsData();
    } catch (err) {
      alert(err.response?.data?.error || 'Bulk approve failed');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) return;
    if (!confirm(`Delete ${selectedReviews.length} reviews permanently?`)) return;
    try {
      await axios.post(`${API_BASE_URL}/reviews/bulk/delete`, { ids: selectedReviews }, { withCredentials: true });
      setSelectedReviews([]);
      await fetchReviewsData();
    } catch (err) {
      alert(err.response?.data?.error || 'Bulk delete failed');
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`} 
        />
      ))}
    </div>
  );

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') return 'bg-green-100 text-green-700 border border-green-200';
    if (s === 'rejected') return 'bg-red-100 text-red-700 border border-red-200';
    return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  };

  const getStatusIcon = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') return <CheckCircle className="w-3.5 h-3.5" />;
    if (s === 'rejected') return <XCircle className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
  };

  const getStatusLabel = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'approved') return 'Approved';
    if (s === 'rejected') return 'Rejected';
    return 'Pending';
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedReviews(filteredReviews.map(r => r._id));
    else setSelectedReviews([]);
  };

  const handleSelectRow = (id) => {
    if (selectedReviews.includes(id)) setSelectedReviews(selectedReviews.filter(item => item !== id));
    else setSelectedReviews([...selectedReviews, id]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getProductName = (r) => r.product?.name || r.productName || r.productId?.name || 'Unknown Product';
  const getProductImage = (r) => r.product?.image || r.productImage || r.productId?.image || null;
  const getProductCategory = (r) => r.product?.category || r.productCategory || r.productId?.category || 'N/A';
  const getCustomerName = (r) => r.customer?.name || r.user?.name || r.userName || r.name || 'Guest';
  const getCustomerEmail = (r) => r.customer?.email || r.user?.email || r.email || r.userEmail || '';
  const getReviewComment = (r) => r.comment || r.text || r.review || r.body || 'No comment provided';

  // ==========================================
  // FILTERED
  // ==========================================
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      if (activeTab !== 'All') {
        const status = (review.status || 'pending').toLowerCase();
        if (status !== activeTab.toLowerCase()) return false;
      }

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const match =
          getReviewComment(review).toLowerCase().includes(search) ||
          getCustomerName(review).toLowerCase().includes(search) ||
          getCustomerEmail(review).toLowerCase().includes(search) ||
          getProductName(review).toLowerCase().includes(search);
        if (!match) return false;
      }

      if (ratingFilter !== 'all') {
        if ((review.rating || 0) !== Number(ratingFilter)) return false;
      }

      if (dateFilter !== 'all') {
        const days = Number(dateFilter);
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        if (new Date(review.createdAt).getTime() < cutoff) return false;
      }

      return true;
    });
  }, [reviews, activeTab, searchTerm, ratingFilter, dateFilter]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setRatingFilter('all');
    setDateFilter('all');
    setActiveTab('All');
  };

  const hasActiveFilters = searchTerm || ratingFilter !== 'all' || dateFilter !== 'all';

  // ==========================================
  // PDF EXPORT
  // ==========================================
  const handleExportPDF = () => {
    try {
      const printDate = new Date().toLocaleString();
      const html = `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"/><title>GreenScape Reviews</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: -apple-system, Arial, sans-serif; padding: 32px; color: #111; background: #fff; }
          h1 { color: #0f5a2e; margin: 0 0 8px; font-size: 24px; }
          .subtitle { color: #666; font-size: 12px; margin-bottom: 24px; }
          .stats { display: flex; gap: 20px; margin-bottom: 24px; padding: 16px; background: #f5f9f6; border-radius: 8px; flex-wrap: wrap; }
          .stat { flex: 1; min-width: 100px; }
          .stat-label { font-size: 11px; color: #666; text-transform: uppercase; }
          .stat-value { font-size: 20px; font-weight: 700; color: #0f5a2e; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #0f5a2e; color: #fff; text-align: left; padding: 10px 8px; font-size: 11px; text-transform: uppercase; }
          td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
          tr:nth-child(even) { background: #f9fafb; }
          .status-approved { color: #16a34a; font-weight: 600; }
          .status-pending { color: #ca8a04; font-weight: 600; }
          .status-rejected { color: #dc2626; font-weight: 600; }
          .stars { color: #eab308; letter-spacing: 1px; }
          .reply { color: #0f5a2e; font-style: italic; font-size: 11px; margin-top: 4px; }
          .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999; text-align: center; }
          @media print { body { padding: 16px; } }
        </style></head><body>
        <h1>GreenScape — Reviews Report</h1>
        <div class="subtitle">Generated on ${printDate}</div>
        <div class="stats">
          <div class="stat"><div class="stat-label">Total</div><div class="stat-value">${stats.totalReviews}</div></div>
          <div class="stat"><div class="stat-label">Average</div><div class="stat-value">${stats.averageRating || '—'}</div></div>
          <div class="stat"><div class="stat-label">Approved</div><div class="stat-value">${stats.approved}</div></div>
          <div class="stat"><div class="stat-label">Pending</div><div class="stat-value">${stats.pending}</div></div>
          <div class="stat"><div class="stat-label">Rejected</div><div class="stat-value">${stats.rejected}</div></div>
        </div>
        <table><thead><tr>
          <th>Review</th><th>Product</th><th>Customer</th><th>Rating</th><th>Status</th><th>Date</th>
        </tr></thead><tbody>
        ${filteredReviews.map((r) => {
          const status = (r.status || 'pending').toLowerCase();
          const stars = '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0));
          const reply = r.adminReply ? `<div class="reply">↳ Store reply: ${escapeHtml(r.adminReply)}</div>` : '';
          return `<tr>
            <td style="max-width:300px;">${escapeHtml(getReviewComment(r))}${reply}</td>
            <td>${escapeHtml(getProductName(r))}</td>
            <td><strong>${escapeHtml(getCustomerName(r))}</strong><br/><span style="color:#999;font-size:10px;">${escapeHtml(getCustomerEmail(r))}</span></td>
            <td><span class="stars">${stars}</span> ${r.rating || 0}/5</td>
            <td class="status-${status}">${getStatusLabel(r.status)}</td>
            <td>${formatDate(r.createdAt)}</td>
          </tr>`;
        }).join('')}
        </tbody></table>
        <div class="footer">GreenScape · ${filteredReviews.length} review(s)</div>
        </body></html>
      `;

      const w = window.open('', '_blank', 'width=1000,height=800');
      if (!w) return alert('Please allow popups to export PDF');
      w.document.write(html);
      w.document.close();
      w.onload = () => setTimeout(() => { w.focus(); w.print(); }, 250);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0f5a2e]"></div>
          <p className="text-sm text-gray-500 animate-pulse">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="max-w-lg w-full bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-gray-900 text-lg font-semibold mb-2">Failed to Load Reviews</h2>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchReviewsData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f5a2e] text-white rounded-lg text-sm font-semibold hover:bg-[#0a4221]"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER — ✅ RESPONSIVE
  // ==========================================
  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reviews</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
            <Link href="/admin/dashboard" className="hover:text-[#0f5a2e]">Dashboard</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Reviews</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none min-w-[140px]">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f5a2e] w-full sm:w-56"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium border whitespace-nowrap ${
              showFilters || hasActiveFilters
                ? 'bg-[#0f5a2e] text-white border-[#0f5a2e]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {hasActiveFilters && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>

          <button 
            onClick={() => setAddModal({ ...addModal, open: true })}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Review</span>
          </button>

          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#0f5a2e] text-white rounded-lg text-sm font-semibold hover:bg-[#0a4221] whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* BULK ACTIONS */}
      {selectedReviews.length > 0 && (
        <div className="bg-[#0f5a2e]/5 border border-[#0f5a2e]/20 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-gray-700">
            <strong>{selectedReviews.length}</strong> review(s) selected
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleBulkApprove}
              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700"
            >
              Approve All
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700"
            >
              Delete All
            </button>
            <button
              onClick={() => setSelectedReviews([])}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
            <button onClick={() => setShowFilters(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Rating</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              {hasActiveFilters ? (
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100"
                >
                  Clear All Filters
                </button>
              ) : (
                <p className="text-xs text-gray-400 py-2">No filters applied</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STATS CARDS — ✅ Responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 fill-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Total</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 fill-yellow-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Avg Rating</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.averageRating || '—'}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Approved</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.approved}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Pending</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 shadow-sm col-span-2 sm:col-span-2 md:col-span-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Rejected</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.rejected}</p>
          </div>
        </div>
      </div>

      {/* TABLE CARD — ✅ Full width, responsive */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-2 sm:px-4 overflow-x-auto">
          {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-[#0f5a2e] text-[#0f5a2e]' 
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab} 
              <span className="ml-1 text-[10px] sm:text-xs opacity-60">
                ({tab === 'All' ? stats.totalReviews : stats[tab.toLowerCase()] || 0})
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[900px]">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="p-3 sm:p-4 w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-[#0f5a2e] focus:ring-[#0f5a2e]"
                    onChange={handleSelectAll}
                    checked={selectedReviews.length === filteredReviews.length && filteredReviews.length > 0}
                  />
                </th>
                <th className="p-3 sm:p-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider">Review</th>
                <th className="p-3 sm:p-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider">Product</th>
                <th className="p-3 sm:p-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider">Customer</th>
                <th className="p-3 sm:p-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider">Rating</th>
                <th className="p-3 sm:p-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider">Status</th>
                <th className="p-3 sm:p-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider">Date</th>
                <th className="p-3 sm:p-4 font-semibold text-[10px] sm:text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-10 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Star className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 text-sm">
                        {reviews.length === 0 
                          ? 'No reviews in the database yet.' 
                          : hasActiveFilters
                            ? 'No reviews match your filters.'
                            : `No ${activeTab.toLowerCase()} reviews.`}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="text-xs text-[#0f5a2e] hover:underline font-medium"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => {
                  const isBusy = actionLoading === review._id;
                  return (
                    <tr key={review._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 sm:p-4">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-[#0f5a2e] focus:ring-[#0f5a2e]"
                          checked={selectedReviews.includes(review._id)}
                          onChange={() => handleSelectRow(review._id)}
                        />
                      </td>
                      <td className="p-3 sm:p-4 min-w-[240px] max-w-[360px]">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {getProductImage(review) ? (
                              <img 
                                src={getProductImage(review)} 
                                alt={getProductName(review)} 
                                className="w-full h-full object-cover" 
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <Box className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-900 font-medium line-clamp-2 leading-snug text-sm">
                              {getReviewComment(review)}
                            </p>
                            {review.adminReply && (
                              <div className="mt-2 bg-green-50 border-l-2 border-green-500 px-2 py-1 rounded-r">
                                <p className="text-[10px] text-green-700 font-semibold flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  Store reply:
                                </p>
                                <p className="text-[11px] text-gray-700 italic line-clamp-2">
                                  {review.adminReply}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-50 border border-green-100 flex-shrink-0 flex items-center justify-center">
                            <Leaf className="w-4 h-4 text-[#0f5a2e]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-900 font-medium text-sm truncate">{getProductName(review)}</p>
                            <p className="text-[10px] text-gray-500 truncate">{getProductCategory(review)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-900 font-medium truncate text-sm">{getCustomerName(review)}</p>
                            <p className="text-[10px] text-gray-500 truncate">{getCustomerEmail(review)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating || 0)}
                          <span className="text-[10px] text-gray-500">{(review.rating || 0)}.0</span>
                        </div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${getStatusBadge(review.status)}`}>
                          {getStatusIcon(review.status)}
                          {getStatusLabel(review.status)}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(review.createdAt)}
                        <br />
                        <span className="text-[10px] text-gray-400">
                          {formatTime(review.createdAt)}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => setViewModal({ open: true, review })}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setReplyModal({ open: true, review, text: review.adminReply || '' })}
                            className="p-1.5 text-gray-400 hover:text-[#0f5a2e] hover:bg-green-50 rounded-lg transition-colors"
                            title="Reply"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          {getStatusLabel(review.status) !== 'Approved' && (
                            <button 
                              onClick={() => handleApprove(review._id)}
                              disabled={isBusy}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {getStatusLabel(review.status) !== 'Rejected' && (
                            <button 
                              onClick={() => handleReject(review._id)}
                              disabled={isBusy}
                              className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(review._id)}
                            disabled={isBusy}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 border-t border-gray-200 bg-gray-50 gap-3">
          <p className="text-xs text-gray-500">
            Showing {filteredReviews.length} of {reviews.length} reviews
            {hasActiveFilters && ' (filtered)'}
          </p>
          
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg bg-[#0f5a2e] text-white text-sm font-bold flex items-center justify-center">
              1
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          REPLY MODAL
      ========================================== */}
      {replyModal.open && replyModal.review && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Reply to Review</h3>
              <button 
                onClick={() => setReplyModal({ open: false, review: null, text: '' })}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">
                <strong className="text-gray-700">{getCustomerName(replyModal.review)}</strong> wrote:
              </p>
              <p className="text-sm text-gray-700 italic">
                "{getReviewComment(replyModal.review)}"
              </p>
              <div className="mt-1">{renderStars(replyModal.review.rating)}</div>
            </div>

            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Your reply (visible on product page)
            </label>
            <textarea
              value={replyModal.text}
              onChange={(e) => setReplyModal({ ...replyModal, text: e.target.value })}
              rows={4}
              maxLength={1000}
              placeholder="Thank you for your feedback..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f5a2e] resize-none"
            />
            <p className="text-[10px] text-gray-400 text-right mt-1">
              {replyModal.text.length}/1000
            </p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setReplyModal({ open: false, review: null, text: '' })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={!replyModal.text.trim() || actionLoading === replyModal.review._id}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f5a2e] text-white rounded-lg text-sm font-semibold hover:bg-[#0a4221] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          VIEW MODAL
      ========================================== */}
      {viewModal.open && viewModal.review && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Review Details</h3>
              <button 
                onClick={() => setViewModal({ open: false, review: null })}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Product</p>
                <p className="text-sm text-gray-900 font-medium">{getProductName(viewModal.review)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <p className="text-sm text-gray-900">{getProductCategory(viewModal.review)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Customer</p>
                <p className="text-sm text-gray-900 font-medium">{getCustomerName(viewModal.review)}</p>
                <p className="text-xs text-gray-500">{getCustomerEmail(viewModal.review)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Rating</p>
                {renderStars(viewModal.review.rating || 0)}
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadge(viewModal.review.status)}`}>
                  {getStatusIcon(viewModal.review.status)}
                  {getStatusLabel(viewModal.review.status)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="text-sm text-gray-900">{formatDate(viewModal.review.createdAt)}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              {viewModal.review.title && (
                <>
                  <p className="text-xs text-gray-500 mb-1">Title</p>
                  <p className="text-sm text-gray-900 font-semibold mb-3">{viewModal.review.title}</p>
                </>
              )}
              <p className="text-xs text-gray-500 mb-1">Comment</p>
              <p className="text-sm text-gray-700">{getReviewComment(viewModal.review)}</p>
            </div>

            {viewModal.review.adminReply && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-green-700 font-semibold mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Your Reply
                </p>
                <p className="text-sm text-gray-700 italic bg-green-50 p-3 rounded">
                  {viewModal.review.adminReply}
                </p>
                {viewModal.review.adminRepliedAt && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Replied {formatDate(viewModal.review.adminRepliedAt)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          ADD REVIEW MODAL
      ========================================== */}
      {addModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Review (as Admin)</h3>
              <button 
                onClick={() => setAddModal({ ...addModal, open: false })}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={addModal.productId}
                  onChange={(e) => setAddModal({ ...addModal, productId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f5a2e]"
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setAddModal({ ...addModal, rating: n })}
                      className="p-0.5"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          n <= addModal.rating 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'fill-gray-200 text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Your Name</label>
                <input
                  type="text"
                  value={addModal.userName}
                  onChange={(e) => setAddModal({ ...addModal, userName: e.target.value })}
                  placeholder="Admin"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f5a2e]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Email (optional)</label>
                <input
                  type="email"
                  value={addModal.email}
                  onChange={(e) => setAddModal({ ...addModal, email: e.target.value })}
                  placeholder="admin@greenscape.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f5a2e]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Title</label>
                <input
                  type="text"
                  value={addModal.title}
                  onChange={(e) => setAddModal({ ...addModal, title: e.target.value })}
                  placeholder="Great product!"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f5a2e]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={addModal.comment}
                  onChange={(e) => setAddModal({ ...addModal, comment: e.target.value })}
                  rows={4}
                  maxLength={2000}
                  placeholder="Share your thoughts..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f5a2e] resize-none"
                />
                <p className="text-[10px] text-gray-400 text-right mt-1">
                  {addModal.comment.length}/2000
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setAddModal({ ...addModal, open: false })}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddReviewSubmit}
                disabled={actionLoading === 'add' || !addModal.productId || !addModal.comment.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f5a2e] text-white rounded-lg text-sm font-semibold hover:bg-[#0a4221] disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {actionLoading === 'add' ? 'Adding...' : 'Add Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}