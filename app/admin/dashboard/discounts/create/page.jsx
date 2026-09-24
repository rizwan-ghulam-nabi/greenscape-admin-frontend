// app/admin/dashboard/discounts/create/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  ArrowLeft, Save, Tag, Percent, DollarSign, Calendar,
  Package, Layers, Loader2, CheckCircle, AlertCircle, X,
  Search, ChevronDown
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function CreateDiscountPage() {
  const router = useRouter();
  
  // ==========================================
  // ✅ FETCHED DATA
  // ==========================================
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');

  // ==========================================
  // ✅ FORM STATE
  // ==========================================
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ==========================================
  // ✅ FETCH PRODUCTS & CATEGORIES
  // ==========================================
  useEffect(() => {
    fetchData();
  }, []);

 const fetchData = async () => {
  try {
    setDataLoading(true);
    
    console.log('🔍 Starting fetch...');

    // ==========================================
    // ✅ FETCH PRODUCTS
    // ==========================================
    try {
      console.log('🔍 Fetching products from:', `${API_BASE_URL}/products`);
      
      const productsRes = await axios.get(`${API_BASE_URL}/products`, {
        withCredentials: true,
        params: { limit: 1000, page: 1 }
      });

      console.log('📦 Products API Response:', productsRes.data);
      console.log('📦 Response type:', typeof productsRes.data);
      console.log('📦 Response keys:', Object.keys(productsRes.data || {}));

      // Extract products array
      let productsData = [];
      if (Array.isArray(productsRes.data)) {
        productsData = productsRes.data;
      } else if (productsRes.data?.products && Array.isArray(productsRes.data.products)) {
        productsData = productsRes.data.products;
      } else if (productsRes.data?.data && Array.isArray(productsRes.data.data)) {
        productsData = productsRes.data.data;
      } else if (productsRes.data?.data?.products && Array.isArray(productsRes.data.data.products)) {
        productsData = productsRes.data.data.products;
      }

      console.log('✅ Extracted products:', productsData.length);
      if (productsData.length > 0) {
        console.log('✅ First product sample:', productsData[0]);
      }
      
      setProducts(productsData);
    } catch (err) {
      console.error('❌ Products fetch error:', err.response?.data || err.message);
      setProducts([]);
    }

    // ==========================================
    // ✅ FETCH CATEGORIES
    // ==========================================
    try {
      console.log('🔍 Fetching categories from:', `${API_BASE_URL}/categories`);
      
      const categoriesRes = await axios.get(`${API_BASE_URL}/categories`, {
        withCredentials: true
      });

      console.log('📦 Categories API Response:', categoriesRes.data);

      // Extract categories array
      let categoriesData = [];
      if (Array.isArray(categoriesRes.data)) {
        categoriesData = categoriesRes.data;
      } else if (categoriesRes.data?.categories && Array.isArray(categoriesRes.data.categories)) {
        categoriesData = categoriesRes.data.categories;
      } else if (categoriesRes.data?.data && Array.isArray(categoriesRes.data.data)) {
        categoriesData = categoriesRes.data.data;
      }

      console.log('✅ Extracted categories:', categoriesData.length);
      setCategories(categoriesData);
    } catch (err) {
      console.error('❌ Categories fetch error:', err.response?.data || err.message);
      setCategories([]);
    }

  } catch (err) {
    console.error('❌ Overall error:', err);
  } finally {
    setDataLoading(false);
    console.log('🔍 Fetch complete');
  }
};

  // ==========================================
  // ✅ GENERATE CODE FROM NAME
  // ==========================================
  const generateCode = (name) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      code: formData.code || generateCode(name),
    });
  };

  // ==========================================
  // ✅ TOGGLE PRODUCT SELECTION
  // ==========================================
  const toggleProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId],
    }));
  };

  // ==========================================
  // ✅ TOGGLE CATEGORY SELECTION
  // ==========================================
  const toggleCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  // ==========================================
  // ✅ HANDLE SUBMIT
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) return setError('Discount name is required');
    if (!formData.code.trim()) return setError('Discount code is required');
    if (!formData.value || parseFloat(formData.value) <= 0) return setError('Discount value is required');
    if (!formData.startDate) return setError('Start date is required');
    if (!formData.endDate) return setError('End date is required');
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return setError('End date must be after start date');
    }
    if (formData.type === 'percentage' && parseFloat(formData.value) > 100) {
      return setError('Percentage cannot exceed 100%');
    }
    if (formData.appliesTo === 'specific_products' && formData.products.length === 0) {
      return setError('Please select at least one product');
    }
    if (formData.appliesTo === 'categories' && formData.categories.length === 0) {
      return setError('Please select at least one category');
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        minPurchase: parseFloat(formData.minPurchase) || 0,
        maxUses: parseInt(formData.maxUses) || 0,
        maxUsesPerCustomer: parseInt(formData.maxUsesPerCustomer) || 1,
      };

      const res = await axios.post(`${API_BASE_URL}/discounts`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => router.push('/admin/dashboard/discounts'), 2000);
      }
    } catch (err) {
      console.error('Error creating discount:', err);
      setError(err.response?.data?.error || 'Failed to create discount');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ✅ FILTERED PRODUCTS
  // ==========================================
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ==========================================
  // ✅ SUCCESS STATE
  // ==========================================
  if (success) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Discount Created!</h2>
          <p className="text-gray-500 mb-6">Your discount has been created successfully.</p>
          <Link
            href="/admin/dashboard/discounts"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Discounts
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // ✅ MAIN RENDER
  // ==========================================
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
            <span className="text-gray-900 font-medium">Create</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Discount</h1>
          <p className="text-sm text-gray-500 mt-1">Create a new discount or promotional deal</p>
        </div>
        <Link
          href="/admin/dashboard/discounts"
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
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

      {/* ===== FORM ===== */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===== LEFT COLUMN ===== */}
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
                  onChange={handleNameChange}
                  placeholder="e.g. Summer Sale"
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
                  placeholder="e.g. SUMMER20"
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
                  placeholder="Get 20% off on all indoor plants"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>
            </div>
          </div>

          {/* Discount Type */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Discount Type</h2>

            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'percentage' })}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'percentage'
                    ? 'border-[#2B7A4B] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Percent className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">Percentage</p>
                  <p className="text-xs text-gray-500">e.g. 20% OFF</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'fixed' })}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'fixed'
                    ? 'border-[#2B7A4B] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 text-sm">Fixed Amount</p>
                  <p className="text-xs text-gray-500">e.g. Rs. 500 OFF</p>
                </div>
              </button>
            </div>

            {/* Value Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount (Rs.)'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === 'percentage' ? '20' : '500'}
                  min="0"
                  max={formData.type === 'percentage' ? '100' : undefined}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  {formData.type === 'percentage' ? '%' : 'Rs.'}
                </span>
              </div>
            </div>
          </div>

          {/* Applies To */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Apply Discount To</h2>

            <div className="space-y-3 mb-4">
              {[
                { id: 'all_products', label: 'All Products', desc: 'Apply to every product in your store', icon: Package },
                { id: 'specific_products', label: 'Specific Products', desc: 'Choose which products to discount', icon: Package },
                { id: 'categories', label: 'Categories', desc: 'Apply to entire categories', icon: Layers },
                { id: 'new_arrivals', label: 'New Arrivals', desc: 'Apply to newly added products', icon: Tag },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, appliesTo: option.id })}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    formData.appliesTo === option.id
                      ? 'border-[#2B7A4B] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <option.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    formData.appliesTo === option.id ? 'border-[#2B7A4B] bg-[#2B7A4B]' : 'border-gray-300'
                  }`}>
                    {formData.appliesTo === option.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Product Selection */}
            {formData.appliesTo === 'specific_products' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Select Products</h3>
                  <span className="text-xs text-green-600 font-medium">
                    {formData.products.length} selected
                  </span>
                </div>

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
                  {dataLoading ? (
                    <div className="p-6 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[#2B7A4B] mx-auto" />
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No products found
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
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
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.images?.[0] || product.image ? (
                            <img
                              src={product.images?.[0] || product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Rs. {product.price}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Category Selection */}
            {formData.appliesTo === 'categories' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">
                  Select Categories ({formData.categories.length} selected)
                </h3>

                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                  {categories.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No categories found
                    </div>
                  ) : (
                    categories.map((cat) => (
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
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="space-y-6">

          {/* Schedule */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Schedule</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
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
                  End Date <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Uses Per Customer
                </label>
                <input
                  type="number"
                  value={formData.maxUsesPerCustomer}
                  onChange={(e) => setFormData({ ...formData, maxUsesPerCustomer: e.target.value })}
                  placeholder="1"
                  min="1"
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
                <p className="text-xs text-gray-500">Enable this discount immediately</p>
              </div>
            </label>
          </div>
        </div>

        {/* ===== SUBMIT ===== */}
        <div className="lg:col-span-3 flex gap-3">
          <Link
            href="/admin/dashboard/discounts"
            className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#2B7A4B] text-white rounded-xl font-medium hover:bg-[#23663e] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Creating...' : 'Create Discount'}
          </button>
        </div>
      </form>
    </div>
  );
}