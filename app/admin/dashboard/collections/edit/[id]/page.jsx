// app/admin/dashboard/collections/edit/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { 
  ArrowLeft, Save, Package, Image as ImageIcon, 
  Loader2, CheckCircle, AlertCircle, X, Star, Search,
  Trash2
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id;

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    category: '',
    isActive: true,
    featured: false,
    sortOrder: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch collection data
  useEffect(() => {
    fetchCollection();
    fetchData();
  }, [collectionId]);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/collections/${collectionId}`, {
        withCredentials: true
      });

      if (res.data?.success && res.data?.collection) {
        const collection = res.data.collection;
        setFormData({
          name: collection.name || '',
          slug: collection.slug || '',
          description: collection.description || '',
          image: collection.image || '',
          category: collection.category?.name || collection.category || '',
          isActive: collection.isActive ?? true,
          featured: collection.featured ?? false,
          sortOrder: collection.sortOrder || 0
        });
        setSelectedProducts(collection.products?.map(p => p._id || p) || []);
        setImagePreview(collection.image || null);
      }
    } catch (err) {
      console.error('Error fetching collection:', err);
      setError('Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/categories`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/products`, { withCredentials: true, params: { limit: 100 } })
      ]);

      if (catRes.data?.success) {
        setCategories(catRes.data.categories);
      }
      if (prodRes.data?.success) {
        setProducts(prodRes.data.products);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Collection name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const collectionData = {
        ...formData,
        products: selectedProducts
      };

      const res = await axios.put(`${API_BASE_URL}/collections/${collectionId}`, collectionData, {
        withCredentials: true
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => router.push('/admin/dashboard/collections'), 2000);
      }
    } catch (err) {
      console.error('Error updating collection:', err);
      setError(err.response?.data?.error || 'Failed to update collection');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/collections/${collectionId}`, {
        withCredentials: true
      });
      router.push('/admin/dashboard/collections');
    } catch (err) {
      console.error('Error deleting collection:', err);
      alert('Failed to delete collection');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProduct = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Collection Updated!</h2>
          <Link href="/admin/dashboard/collections" className="text-green-600 hover:underline">
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-6xl mx-auto">
      
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-green-600">Dashboard</Link>
            <span>›</span>
            <Link href="/admin/dashboard/collections" className="hover:text-green-600">Collections</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Edit</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Collection</h1>
          <p className="text-sm text-gray-500 mt-1">Update your collection details</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard/collections"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===== FORM ===== */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Collection Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Collection Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                  placeholder="e.g. Indoor Plants"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this collection..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Products</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
              />
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No products found
                </div>
              ) : (
                filteredProducts.map(product => (
                  <label
                    key={product._id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => toggleProduct(product._id)}
                      className="w-4 h-4 text-green-600"
                    />
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">${product.price}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <p className="text-sm text-gray-500 mt-2">
              <span className="font-medium text-green-600">{selectedProducts.length}</span> product(s) selected
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Collection Image */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Collection Image</h2>
            
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, image: '' });
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result);
                        setFormData({ ...formData, image: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="collection-image"
                />
                <label htmlFor="collection-image" className="text-sm text-green-600 cursor-pointer hover:underline">
                  Upload Image
                </label>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm font-medium text-gray-700">Active (visible on storefront)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-yellow-500"
                />
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  Featured Collection
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ===== SUBMIT BUTTON ===== */}
        <div className="lg:col-span-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}