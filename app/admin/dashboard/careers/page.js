// app/admin/dashboard/careers/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  Briefcase, Search, Trash2, Loader2, X, Download, Mail, Phone,
  MapPin, Globe, FileText, ChevronLeft, ChevronRight, AlertCircle,
} from 'lucide-react';

// ✅ FIX: NEXT_PUBLIC_API_URL is "http://localhost:5001/api/admin"
// Strip the /api/admin suffix so we can build clean /api/... paths
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const API_BASE_URL = RAW_API_URL
  .replace(/\/api\/admin\/?$/, '')  // strip /api/admin
  .replace(/\/api\/?$/, '')         // strip /api if no /admin
  .replace(/\/$/, '');              // strip trailing slash

// Now:
// RAW_API_URL  = http://localhost:5001/api/admin
// API_BASE_URL = http://localhost:5001

const STATUS_STYLES = {
  new:         { bg: 'bg-blue-100 text-blue-700 border-blue-200',       label: 'New' },
  reviewing:   { bg: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Reviewing' },
  shortlisted: { bg: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Shortlisted' },
  interviewed: { bg: 'bg-indigo-100 text-indigo-700 border-indigo-200', label: 'Interviewed' },
  rejected:    { bg: 'bg-red-100 text-red-700 border-red-200',          label: 'Rejected' },
  hired:       { bg: 'bg-green-100 text-green-700 border-green-200',    label: 'Hired' },
};

const STATUS_OPTIONS = ['new', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'hired'];

export default function AdminCareersPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({});
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/careers/applications`, {
        params: {
          status: filter,
          search: debouncedSearch,
          page: currentPage,
          limit: 15,
        },
        withCredentials: true,
      });

      setApplications(res.data.applications || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setCounts(res.data.counts || {});
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (id, status) => {
    try {
      setUpdatingStatus(true);
      await axios.put(
        `${API_BASE_URL}/api/careers/applications/${id}/status`,
        { status },
        { withCredentials: true }
      );
      setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
      if (selected?._id === id) setSelected({ ...selected, status });
      fetchApplications();
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`${API_BASE_URL}/api/careers/applications/${deleteId}`, {
        withCredentials: true,
      });
      setApplications((prev) => prev.filter((a) => a._id !== deleteId));
      setDeleteId(null);
      if (selected?._id === deleteId) setSelected(null);
      fetchApplications();
    } catch (err) {
      alert('Failed to delete application.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-green-600">
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-green-700 font-medium">Job Applications</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Job Applications
            {counts.new > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {counts.new} new
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage applications for open positions.
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or position..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setFilter('all');
              setCurrentPage(1);
            }}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[#2B7A4B] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setCurrentPage(1);
              }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s
                  ? 'bg-[#2B7A4B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {STATUS_STYLES[s].label}
              {counts[s] > 0 && (
                <span className="ml-1.5 text-xs opacity-75">({counts[s]})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* LIST + DETAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LIST */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#2B7A4B] animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {search || filter !== 'all'
                  ? 'No applications match your filters.'
                  : 'No applications yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[700px] overflow-y-auto">
              {applications.map((app) => (
                <button
                  key={app._id}
                  onClick={() => setSelected(app)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selected?._id === app._id ? 'bg-[#2B7A4B]/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {app.status === 'new' && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                      <span className="font-semibold text-gray-900 truncate">
                        {app.fullName}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${
                        STATUS_STYLES[app.status].bg
                      }`}
                    >
                      {STATUS_STYLES[app.status].label}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-[#2B7A4B] mb-1 truncate">
                    {app.positionTitle}
                  </p>
                  <p className="text-xs text-gray-500 truncate mb-1">{app.email}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(app.createdAt)}</p>
                </button>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* DETAIL */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
              <Briefcase className="w-14 h-14 text-gray-200 mb-4" />
              <p className="text-gray-500">Select an application to review</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-[#2B7A4B] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {selected.fullName?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-gray-900 truncate">
                        {selected.fullName}
                      </h2>
                      <p className="text-sm text-gray-500 truncate">
                        Applied for{' '}
                        <span className="text-[#2B7A4B] font-medium">
                          {selected.positionTitle}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <a
                    href={`mailto:${selected.email}`}
                    className="inline-flex items-center gap-1.5 text-[#2B7A4B] hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {selected.email}
                  </a>
                  <a
                    href={`tel:${selected.phone}`}
                    className="inline-flex items-center gap-1.5 text-gray-600 hover:text-[#2B7A4B]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {selected.phone}
                  </a>
                  {selected.city && (
                    <span className="inline-flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {selected.city}
                    </span>
                  )}
                </div>

                {(selected.portfolioUrl || selected.linkedinUrl) && (
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {selected.portfolioUrl && (
                      <a
                        href={selected.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Portfolio
                      </a>
                    )}
                    {selected.linkedinUrl && (
                      <a
                        href={selected.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Application Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(selected._id, s)}
                        disabled={updatingStatus || selected.status === s}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          selected.status === s
                            ? STATUS_STYLES[s].bg + ' border-current'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        } disabled:opacity-50`}
                      >
                        {STATUS_STYLES[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Resume
                  </label>
                  <a
                    href={selected.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 p-3 bg-[#2B7A4B]/5 border border-[#2B7A4B]/20 rounded-xl hover:bg-[#2B7A4B]/10 transition-colors w-full"
                  >
                    <div className="w-10 h-10 bg-[#2B7A4B] rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selected.resumeName || 'Resume'}
                      </p>
                      <p className="text-xs text-[#2B7A4B]">Click to view / download</p>
                    </div>
                    <Download className="w-4 h-4 text-[#2B7A4B] flex-shrink-0" />
                  </a>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Cover Letter
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selected.coverLetter}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
                  <p>
                    Applied on{' '}
                    <span className="font-medium text-gray-700">
                      {formatDate(selected.createdAt)}
                    </span>
                  </p>
                  {selected.reviewedAt && (
                    <p className="mt-1">
                      Last reviewed{' '}
                      <span className="font-medium text-gray-700">
                        {formatDate(selected.reviewedAt)}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 p-4 bg-gray-50 flex flex-wrap gap-2">
                <a
                  href={`mailto:${selected.email}?subject=Re: Your application for ${encodeURIComponent(selected.positionTitle)}`}
                  onClick={() => handleStatusChange(selected._id, 'shortlisted')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#23663e]"
                >
                  <Mail className="w-4 h-4" />
                  Email Applicant
                </a>

                <button
                  onClick={() => setDeleteId(selected._id)}
                  className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Application?</h3>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              This application will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}