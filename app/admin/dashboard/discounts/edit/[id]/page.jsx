// app/admin/dashboard/discounts/edit/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  ArrowLeft, Save, Tag, Percent, DollarSign, Calendar,
  Package, Layers, Loader2, CheckCircle, AlertCircle, X,
  Search, Trash2
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function EditDiscountPage() {
  const router = useRouter();
  const params = useParams();
  const discountId = params.id;

  // ==========================================
  // ✅ STATE
  // ==========================================
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    type: 'percentage',
    value: '',
    appliesTo: 'all_products',
    products: [],
    categories: [],
    minPurchase: '',
    maxUses: '',
    maxUsesPerCustomer: 1,
    startDate: '',
    endDate: '',
    isActive: true,
    image: '',
    badgeText: '',
  });

  // ==========================================
  // ✅ FETCH DATA
  // ==========================================
  useEffect(() => {
    fetchAll();
  }, [discountId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setDataLoading(true);

      const [discountRes, productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/discounts/${discountId}`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/products`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/categories`, { withCredentials: true }),
      ]);

      // Set discount data
      if (discountRes.data?.discount) {
        const d = discountRes.data.discount;
        setFormData({
          name: d.name || '',
          description: d.description || '',
          code: d.code || '',
          type: d.type || 'percentage',
          value: d.value || '',
          appliesTo: d.appliesTo || 'all_products',
          products: d.products?.map(p => p._id || p) || [],
          categories: d.categories?.map(c => c._id || c) || [],
          minPurchase: d.minPurchase || '',
          maxUses: d.maxUses || '',
          maxUsesPerCustomer: d.maxUsesPerCustomer || 1,
          startDate: d.startDate ? new Date(d.startDate).toISOString().split('T')[0] : '',
          endDate: d.endDate ? new Date(d.endDate).toISOString().split('T')[0] : '',
          isActive: d.isActive ?? true,
          image: d.image || '',
          badgeText: d.badgeText || '',
        });
      }

      // Set products
      if (productsRes.data?.products) {
        setProducts(productsRes.data.products);
      } else if (Array.isArray(productsRes.data)) {
        setProducts(productsRes.data);
      }

      // Set categories
      if (categoriesRes.data?.categories) {
        setCategories(categoriesRes.data.categories);
      } else if (Array.isArray(categoriesRes.data)) {
        setCategories(categoriesRes.data);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load discount');
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  };

  // ==========================================
  // ✅ SUBMIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return setError('Discount name is required');
    if (!formData.code.trim()) return setError('Discount code is required');
    if (!formData.value || parseFloat(formData.value) <= 0) return setError('Discount value is required');
    if (!formData.startDate || !formData.endDate) return setError('Start and end dates are required');
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return setError('End date must be after start date');
    }

    try {
      setSaving(true);
      setError(null);

      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        minPurchase: parseFloat(formData.minPurchase) || 0,
        maxUses: parseInt(formData.maxUses) || 0,
        maxUsesPerCustomer: parseInt(formData.maxUsesPerCustomer) || 1,
      };

      const res = await axios.put(`${API_BASE_URL}/discounts/${discountId}`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => router.push('/admin/dashboard/discounts'), 2000);
      }
    } catch (err) {
      console.error('Error updating discount:', err);
      setError(err.response?.data?.error || 'Failed to update discount');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // ✅ DELETE
  // ==========================================
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/discounts/${discountId}`, {
        withCredentials: true,
      });
      router.push('/admin/dashboard/discounts');
    } catch (err) {
      console.error('Error deleting discount:', err);
      alert('Failed to delete discount');
    }
  };

  // ==========================================
  // ✅ TOGGLE HELPERS
  // ==========================================
  const toggleProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId],
    }));
  };

  const toggleCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ==========================================
  // ✅ LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#2B7A4B]" />
      </div>
    );
  }

  // ==========================================
  // ✅ SUCCESS
  // ==========================================
  if (success) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Discount Updated!</h2>
          <Link
            href="/admin/dashboard/discounts"
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Discounts
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
            <Link href="/admin/dashboard/discounts" className="hover:text-green-600">Discounts</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Edit</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Discount</h1>
          <p className="text-sm text-gray-500 mt-1">Update discount details</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/discounts"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===== FORM (Same as create page) ===== */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>
            </div>
          </div>

          {/* Discount Type */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Discount Type</h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'percentage' })}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'percentage' ? 'border-[#2B7A4B] bg-green-50' : 'border-gray-200'
                }`}
              >
                <Percent className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">Percentage</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'fixed' })}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'fixed' ? 'border-[#2B7A4B] bg-green-50' : 'border-gray-200'
                }`}
              >
                <DollarSign className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">Fixed Amount</p>
                </div>
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount (Rs.)'}
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                min="0"
                max={formData.type === 'percentage' ? '100' : undefined}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
              />
            </div>
          </div>

          {/* Applies To */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Apply Discount To</h2>

            <div className="space-y-3 mb-4">
              {[
                { id: 'all_products', label: 'All Products', icon: Package },
                { id: 'specific_products', label: 'Specific Products', icon: Package },
                { id: 'categories', label: 'Categories', icon: Layers },
                { id: 'new_arrivals', label: 'New Arrivals', icon: Tag },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, appliesTo: option.id })}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    formData.appliesTo === option.id ? 'border-[#2B7A4B] bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <option.icon className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Product Selection */}
            {formData.appliesTo === 'specific_products' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-green-600 font-medium mb-3">
                  {formData.products.length} products selected
                </p>

                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                  />
                </div>

                <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <label
                      key={product._id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.products.includes(product._id)}
                        onChange={() => toggleProduct(product._id)}
                        className="w-4 h-4 text-[#2B7A4B] rounded"
                      />
                      <p className="text-sm font-medium text-gray-900 truncate flex-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">Rs. {product.price}</p>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Category Selection */}
            {formData.appliesTo === 'categories' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-green-600 font-medium mb-3">
                  {formData.categories.length} categories selected
                </p>

                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <label
                      key={cat._id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat._id)}
                        onChange={() => toggleCategory(cat._id)}
                        className="w-4 h-4 text-[#2B7A4B] rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">

          {/* Schedule */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Schedule</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>
            </div>
          </div>

          {/* Restrictions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Restrictions</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Purchase (Rs.)
                </label>
                <input
                  type="number"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Uses (0 = unlimited)
                </label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Status</h2>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-[#2B7A4B] rounded"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Active</p>
                <p className="text-xs text-gray-500">Enable this discount</p>
              </div>
            </label>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="lg:col-span-3 flex gap-3">
          <Link
            href="/admin/dashboard/discounts"
            className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#2B7A4B] text-white rounded-xl font-medium hover:bg-[#23663e] disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* ===== DELETE MODAL ===== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Discount?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium"
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