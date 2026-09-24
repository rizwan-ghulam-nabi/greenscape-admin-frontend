//  new version 


// app/admin/dashboard/categories/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  LayoutGrid, Plus, Search, Pencil, Trash2,
  ChevronLeft, ChevronRight, XCircle,
  Leaf, Tag, Loader2,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api/admin';

export default function CategoriesPage() {
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Delete modal only
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);




// ✅ useEffect AFTER the function definition
useEffect(() => {
  let isMounted = true;

  const load = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/categories/with-counts`, {
        withCredentials: true,
      });

      if (!isMounted) return;

      let categoriesData = res.data;
      if (categoriesData?.data && Array.isArray(categoriesData.data)) {
        categoriesData = categoriesData.data;
      } else if (
        categoriesData?.categories &&
        Array.isArray(categoriesData.categories)
      ) {
        categoriesData = categoriesData.categories;
      } else if (!Array.isArray(categoriesData)) {
        categoriesData = [];
      }

      setCategories(categoriesData);
      setLoading(false);
    } catch (err) {
      if (!isMounted) return;
      console.error('❌ Error fetching categories:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      } else {
        setError('Failed to load categories.');
        setCategories([]);
        setLoading(false);
      }
    }
  };

  load();

  return () => {
    isMounted = false;
  };
}, []);



  // --- STATS ---
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.status === 'Active').length;
  const inactiveCategories = categories.filter((c) => c.status === 'Inactive').length;
  const totalProducts = categories.reduce(
    (sum, c) => sum + (c.productCount ?? c.products ?? 0),
    0
  );

  const stats = [
    {
      title: 'Total Categories',
      value: totalCategories,
      subtext: 'All categories',
      icon: <LayoutGrid className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
    },
    {
      title: 'Active Categories',
      value: activeCategories,
      subtext: 'Currently active',
      icon: <Leaf className="w-5 h-5 text-cyan-600" />,
      bg: 'bg-cyan-50',
    },
    {
      title: 'Inactive Categories',
      value: inactiveCategories,
      subtext: 'Currently inactive',
      icon: <XCircle className="w-5 h-5 text-orange-500" />,
      bg: 'bg-orange-50',
    },
    {
      title: 'Total Products',
      value: totalProducts,
      subtext: 'Across all categories',
      icon: <Tag className="w-5 h-5 text-purple-500" />,
      bg: 'bg-purple-50',
    },
  ];

  // --- SEARCH & PAGINATION ---
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  // --- DELETE ---
  const handleDeleteCategory = async () => {
    try {
      setDeleting(true);
      await axios.delete(
        `${API_BASE_URL}/categories/${selectedCategory._id}`,
        { withCredentials: true }
      );
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      alert(err.response?.data?.error || 'Failed to delete category.');
    } finally {
      setDeleting(false);
    }
  };

  // --- TOGGLE STATUS ---
  const toggleStatus = async (category) => {
    try {
      setTogglingId(category._id);
      const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';
      await axios.put(
        `${API_BASE_URL}/categories/${category._id}`,
        { status: newStatus },
        { withCredentials: true }
      );
      fetchCategories();
    } catch (err) {
      console.error('Error toggling status:', err);
    } finally {
      setTogglingId(null);
    }
  };

  // --- STATUS BADGE ---
  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        Inactive
      </span>
    );
  };

  // --- LOADING / ERROR ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B7A4B]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link
              href="/admin/dashboard"
              className="hover:text-green-600 transition-colors"
            >
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-green-700 font-medium">Categories</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] focus:border-transparent"
            />
          </div>

          {/* ✅ CHANGED: Link instead of button */}
          <Link
            href="/admin/dashboard/categories/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0f5a2e] text-white rounded-lg text-sm font-medium hover:bg-[#0a4221] transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center flex-shrink-0`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Products
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm ? (
                      'No categories match your search.'
                    ) : (
                      <div className="space-y-3">
                        <p>No categories yet.</p>
                        <Link
                          href="/admin/dashboard/categories/create"
                          className="inline-flex items-center gap-2 text-[#2B7A4B] font-medium hover:underline"
                        >
                          <Plus className="w-4 h-4" />
                          Create your first category
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0">
                          <img
                            src={
                              category.image ||
                              'https://via.placeholder.com/100'
                            }
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                'https://via.placeholder.com/100?text=?';
                            }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 text-sm">
                            {category.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded mt-0.5">
                            slug: {category.slug || 'not set'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {category.description || 'No description provided'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center font-medium">
                      {category.productCount ?? category.products ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(category)}
                        disabled={togglingId === category._id}
                        className="disabled:opacity-50"
                        title="Click to toggle status"
                      >
                        {getStatusBadge(category.status)}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* ✅ CHANGED: Link to edit page */}
                        <Link
                          href={`/admin/dashboard/categories/edit/${category._id}`}
                          className="p-2 text-gray-500 hover:text-[#2B7A4B] hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {filteredCategories.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1} to{' '}
              {Math.min(startIndex + itemsPerPage, filteredCategories.length)}{' '}
              of {filteredCategories.length} categories
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-[#2B7A4B] text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE MODAL (still on the list page) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Category
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <strong>{selectedCategory?.name}</strong>? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                disabled={deleting}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

