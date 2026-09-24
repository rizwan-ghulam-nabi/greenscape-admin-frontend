// app/admin/dashboard/collections/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Plus, Search, Pencil, Trash2, Package, 
  Loader2, AlertCircle, RefreshCw, Star, Layers
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function AdminCollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch collections
  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/collections`, {
        withCredentials: true,
        timeout: 10000 // 10 seconds timeout
      });

      // ✅ Handle multiple response formats
      if (res.data?.collections) {
        setCollections(res.data.collections);
      } else if (Array.isArray(res.data)) {
        setCollections(res.data);
      } else if (res.data?.data?.collections) {
        setCollections(res.data.data.collections);
      } else {
        console.log('Collections response:', res.data);
        setCollections([]);
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
      
      if (err.response?.status === 401) {
        router.push('/admin/login');
      } else {
        setError('Failed to load collections. Make sure backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete collection
  const handleDelete = async () => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/collections/${deleteId}`, {
        withCredentials: true
      });

      if (res.data?.success) {
        setCollections(collections.filter(c => c._id !== deleteId));
        setShowDeleteModal(false);
        setDeleteId(null);
        alert('✅ Collection deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting collection:', err);
      alert('❌ Failed to delete collection');
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCollections();
  }, []);

  // Filter collections
  const filteredCollections = collections.filter(collection => 
    collection.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && collections.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="mt-4 text-gray-500">Loading collections...</p>
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
            <Link href="/admin/dashboard" className="hover:text-green-600">Dashboard</Link>
            <span>›</span>
            <span className="text-green-700 font-medium">Collections</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product collections</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCollections}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <Link
            href="/admin/dashboard/collections/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Collection
          </Link>
        </div>
      </div>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={fetchCollections} className="ml-auto text-sm font-medium hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* ===== SEARCH ===== */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search collections..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
          />
        </div>
      </div>

      {/* ===== COLLECTIONS TABLE ===== */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Collection</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    No collections found
                  </td>
                </tr>
              ) : (
                filteredCollections.map((collection) => (
                  <tr key={collection._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {collection.image ? (
                            <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{collection.name}</p>
                          <p className="text-xs text-gray-500">{collection.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">/{collection.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {collection.category?.name || collection.category || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        {collection.products?.length || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {collection.featured ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        collection.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {collection.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(collection.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/dashboard/collections/edit/${collection._id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setDeleteId(collection._id);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
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
      </div>

      {/* ===== DELETE MODAL ===== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Collection</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this collection? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
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