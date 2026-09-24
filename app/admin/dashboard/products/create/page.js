'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { 
  Image as ImageIcon, Loader2, AlertCircle, CheckCircle, X, Plus, 
  Trash2, ArrowUp, ArrowDown, Tag, Save, FileText, Box,
  Layers, Maximize, RefreshCw, Upload, Eye, List
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api/admin';

export default function CreateProductPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('general');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDesc: '',
    category: '',
    subCategory: '',
    tags: [],
    price: '',
    oldPrice: '',
    costPrice: '',
    stock: '',
    lowStockAlert: 5,
    sku: '',
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    hasVariations: false,
    variations: [],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    seoSlug: '',
  });

  const [tagInput, setTagInput] = useState('');
  
  // Cloudinary State
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  
  // Loading State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Categories State
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Load environment variables
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // ==========================================
  // FETCH CATEGORIES ON MOUNT (FIXED)
  // ==========================================
  useEffect(() => {
    fetchCategories();
  }, []);

  // ==========================================
  // AUTO-GENERATE SLUG FROM NAME
  // ==========================================
  useEffect(() => {
    if (formData.name && !formData.slug) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug, seoSlug: generatedSlug }));
    }
  }, [formData.name]);

  // ==========================================
  // AUTO-GENERATE SKU
  // ==========================================
  useEffect(() => {
    if (!formData.sku && formData.category) {
      const prefix = formData.category.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(1000 + Math.random() * 9000);
      const generatedSku = `${prefix}-${timestamp}-${random}`;
      setFormData(prev => ({ ...prev, sku: generatedSku }));
    }
  }, [formData.category]);

  // ==========================================
  // FUNCTIONS
  // ==========================================
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // ✅ FIXED: Use withCredentials instead of localStorage token
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      
      const res = await axios.get(`${API_BASE_URL}/categories`, {
        withCredentials: true, // ✅ Sends cookie
      });

      console.log('📦 Categories API Response:', res.data);

      // ✅ Handle different response structures
      let categoriesData = res.data;
      
      if (categoriesData && categoriesData.data && Array.isArray(categoriesData.data)) {
        categoriesData = categoriesData.data;
      } else if (categoriesData && categoriesData.categories && Array.isArray(categoriesData.categories)) {
        categoriesData = categoriesData.categories;
      } else if (!Array.isArray(categoriesData)) {
        categoriesData = [];
      }

      setCategories(categoriesData);
      if (categoriesData.length > 0) {
        setFormData(prev => ({ ...prev, category: categoriesData[0].name }));
      }
      setLoadingCategories(false);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleDimensionChange = (dimension, value) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value
      }
    }));
  };

  // ==========================================
  // CLOUDINARY UPLOAD WITH DRAG & DROP
  // ==========================================
  const openCloudinaryWidget = (type, index = -1) => {
    if (!cloudName || !uploadPreset) {
      setError('Cloudinary configuration missing. Please check your .env.local file.');
      return;
    }

    if (!document.querySelector('script[src*="upload-widget.cloudinary"]')) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => openCloudinaryWidget(type, index);
      return;
    }

    if (window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: uploadPreset,
          sources: ['local', 'url', 'camera'],
          multiple: type === 'gallery',
          cropping: type === 'main',
          croppingAspectRatio: 1,
          showAdvancedOptions: false,
          resourceType: 'image',
          maxFileSize: 5000000,
          styles: {
            palette: {
              window: '#021a12',
              source: '#ffffff',
              windowBorder: '#4ade80',
              tabIcon: '#4ade80',
              inactiveTabIcon: '#a7f3d0',
              menuIcons: '#4ade80',
              link: '#4ade80',
              action: '#4ade80',
              inProgress: '#4ade80',
              complete: '#4ade80',
              error: '#ef4444',
              textDark: '#000000',
              textLight: '#ffffff'
            }
          }
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            if (result.info.resource_type === 'image') {
              const secureUrl = result.info.secure_url;
              
              if (type === 'main') {
                setImageUrl(secureUrl);
                setImagePreview(secureUrl);
                setUploadingImage(false);
              } else if (type === 'gallery') {
                setGalleryUrls(prev => [...prev, secureUrl]);
                setGalleryPreviews(prev => [...prev, secureUrl]);
                setUploadingGallery(false);
              }
            } else {
              setError('Upload failed: Please select an image file.');
              if (type === 'main') setUploadingImage(false);
              else setUploadingGallery(false);
            }
          }
        }
      );
      
      if (type === 'main') setUploadingImage(true);
      else setUploadingGallery(true);
      widget.open();
    } else {
      setTimeout(() => openCloudinaryWidget(type, index), 500);
    }
  };

  // Drag & Drop for main image
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      openCloudinaryWidget('main');
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryUrls(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ==========================================
  // TAG MANAGEMENT
  // ==========================================
  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput(''); 
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // ==========================================
  // VARIATIONS MANAGEMENT
  // ==========================================
  const addVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [
        ...prev.variations,
        { sku: '', price: '', stock: 0, attributes: {}, image: '' }
      ]
    }));
  };

  const removeVariation = (index) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const updateVariation = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  // ==========================================
  // CREATE NEW CATEGORY (FIXED)
  // ==========================================
  const createNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      // ✅ Use withCredentials instead of localStorage token
      const res = await axios.post(`${API_BASE_URL}/categories`, 
        { name: newCategoryName.trim() },
        { withCredentials: true } // ✅ Sends cookie
      );
      
      if (res.status === 201 || res.status === 200) {
        setShowNewCategoryInput(false);
        setNewCategoryName('');
        fetchCategories();
        setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
        showToast('Category created successfully!', 'success');
      }
    } catch (err) {
      showToast('Failed to create category.', 'error');
    }
  };

  // ==========================================
  // FORM SUBMIT (FIXED)
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.name) {
      setError('Product name is required.');
      setLoading(false);
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price.');
      setLoading(false);
      return;
    }

    if (!formData.category) {
      setError('Please select a category.');
      setLoading(false);
      return;
    }

    if (!imageUrl) {
      setError('Please upload a product image.');
      setLoading(false);
      return;
    }

    try {
      // ✅ Use withCredentials instead of localStorage token
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        desc: formData.description,
        shortDesc: formData.shortDesc || formData.description?.substring(0, 200),
        category: formData.category,
        subCategory: formData.subCategory,
        price: parseFloat(formData.price) || 0,
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : 0,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
        stock: parseInt(formData.stock) || 0,
        sku: formData.sku,
        lowStockAlert: parseInt(formData.lowStockAlert) || 5,
        tags: formData.tags || [],
        image: imageUrl,
        gallery: galleryUrls || [],
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        isBestSeller: formData.isBestSeller,
        isNewArrival: formData.isNewArrival,
        weight: formData.weight ? parseFloat(formData.weight) : 0,
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : 0,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : 0,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : 0
        },
        hasVariations: formData.hasVariations,
        variations: formData.variations || [],
        metaTitle: formData.metaTitle || formData.name.substring(0, 60),
        metaDescription: formData.metaDescription || formData.shortDesc || formData.description?.substring(0, 160),
        searchKeywords: formData.tags || []
      };

      console.log('📦 Sending product data:', productData);

      const res = await axios.post(`${API_BASE_URL}/products`, productData, {
        withCredentials: true, // ✅ Sends cookie
        headers: { 
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 201 || res.status === 200) {
        showToast('Product created successfully! 🎉', 'success');
        setTimeout(() => {
          router.push('/admin/dashboard/products');
        }, 1500);
      }

    } catch (err) {
      console.error('Create Product Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create product.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: '', type: '' })}>
            <X className="w-4 h-4 hover:text-gray-600" />
          </button>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-gray-100/80">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/dashboard/products" className="hover:text-green-600 transition-colors">Products</Link>
            <span>•</span>
            <span className="text-gray-900 font-medium">Create New</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-500 text-sm mt-1">Fill in the details to add a new item to your store.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard/products" className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
                Cancel
              </Link>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-[#0f5a2e] text-white rounded-lg text-sm font-medium hover:bg-[#0a4221] transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Product
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50/50 px-8">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { id: 'general', label: 'General', icon: FileText },
              { id: 'images', label: 'Images', icon: ImageIcon },
              { id: 'pricing', label: 'Pricing & Inventory', icon: Box },
              { id: 'variations', label: 'Variations', icon: Layers },
              { id: 'seo', label: 'SEO', icon: Eye },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#0f5a2e] text-[#0f5a2e]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error/Success Messages */}
        <div className="px-8 pt-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5" /> {success}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* ===== TAB: GENERAL ===== */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                    placeholder="e.g. Monstera Deliciosa"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Slug <span className="text-xs text-gray-400 font-normal">(Auto-generated from name)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                      placeholder="product-slug"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const generatedSlug = formData.name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '');
                        setFormData(prev => ({ ...prev, slug: generatedSlug }));
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-600">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex gap-3 text-gray-500 text-xs">
                    <span className="font-medium">Paragraph</span>
                    <span className="cursor-pointer hover:text-gray-700">B</span>
                    <span className="cursor-pointer hover:text-gray-700">I</span>
                    <span className="cursor-pointer hover:text-gray-700">U</span>
                    <span className="cursor-pointer hover:text-gray-700">List</span>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    rows="6"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-gray-900 focus:outline-none resize-y min-h-[150px]"
                    placeholder="Detailed description of the product..."
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="shortDesc" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Short Description
                </label>
                <textarea
                  id="shortDesc"
                  name="shortDesc"
                  rows="2"
                  value={formData.shortDesc}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all resize-y"
                  placeholder="A brief summary for product listings (max 200 characters)"
                  maxLength="200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                      disabled={loadingCategories || categories.length === 0}
                    >
                      {loadingCategories ? (
                        <option value="">Loading categories...</option>
                      ) : categories.length === 0 ? (
                        <option value="">No categories found</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(true)}
                      className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {showNewCategoryInput && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="New category name"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        onKeyDown={(e) => e.key === 'Enter' && createNewCategory()}
                      />
                      <button
                        type="button"
                        onClick={createNewCategory}
                        className="px-3 py-2 bg-[#0f5a2e] text-white rounded-lg text-sm hover:bg-[#0a4221]"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryInput(false)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Sub-Category
                  </label>
                  <input
                    type="text"
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                    placeholder="e.g. Indoor Plants"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-200 bg-gray-50 rounded-xl focus-within:ring-2 focus-within:ring-green-600 focus-within:bg-white transition-all">
                  {formData.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button 
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-600 transition-colors focus:outline-none"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-700 placeholder-gray-400 text-sm py-1"
                    placeholder="e.g. Best Seller, New Arrival..."
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  🏷️ Type a tag and press <kbd className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] font-semibold">Enter</kbd> to add it
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Status
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'isActive', label: 'Active', color: 'green' },
                    { key: 'isFeatured', label: 'Featured', color: 'purple' },
                    { key: 'isBestSeller', label: 'Best Seller', color: 'orange' },
                    { key: 'isNewArrival', label: 'New Arrival', color: 'blue' },
                  ].map((status) => (
                    <button
                      key={status.key}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, [status.key]: !prev[status.key] }))}
                      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                        formData[status.key]
                          ? `bg-${status.color}-50 border-${status.color}-200 text-${status.color}-700`
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}
                    >
                      <span className="text-sm font-medium">{status.label}</span>
                      <div className={`w-3 h-3 rounded-full ${
                        formData[status.key] ? `bg-${status.color}-500` : 'bg-gray-300'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: IMAGES ===== */}
          {activeTab === 'images' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Product Image <span className="text-red-500">*</span>
                  </label>

                  {imagePreview ? (
                    <div className="relative group w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img
                        src={imagePreview}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openCloudinaryWidget('main')}
                          className="px-3 py-2 bg-white/90 rounded-lg text-sm font-medium text-gray-700 hover:bg-white"
                        >
                          <Upload className="w-4 h-4 inline mr-1" /> Change
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl('');
                            setImagePreview(null);
                          }}
                          className="px-3 py-2 bg-red-500/90 rounded-lg text-sm font-medium text-white hover:bg-red-500"
                        >
                          <Trash2 className="w-4 h-4 inline mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${
                        dragOver
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 bg-gray-50/50 hover:border-green-400 hover:bg-green-50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {uploadingImage ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-[#2B7A4B]" />
                          <span className="text-sm text-gray-500">Uploading to Cloudinary...</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 text-gray-400 group-hover:text-green-500 transition-colors">
                            <Upload className="w-12 h-12" />
                          </div>
                          <span className="text-sm text-gray-500 font-medium">Drag & drop or click to upload</span>
                          <span className="text-xs text-gray-400">Powered by Cloudinary</span>
                          <button
                            type="button"
                            onClick={() => openCloudinaryWidget('main')}
                            className="mt-2 px-4 py-2 bg-[#0f5a2e] text-white rounded-lg text-sm hover:bg-[#0a4221]"
                          >
                            Choose Image
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gallery Images <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                  </label>
                  
                  <div className="flex flex-wrap gap-3 mb-2 min-h-[120px]">
                    {galleryPreviews.map((img, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
                        <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-1 right-1 bg-white/90 p-1 rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => openCloudinaryWidget('gallery')}
                      disabled={uploadingGallery}
                      className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50 flex flex-col items-center justify-center hover:bg-green-50 hover:border-green-400 transition-all group"
                    >
                      {uploadingGallery ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                      ) : (
                        <>
                          <Plus className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors" />
                          <span className="text-[10px] text-gray-400 group-hover:text-green-500 transition-colors mt-1">Add More</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">PNG, JPG or WEBP. Max 5MB each. Recommended: 800x800px.</p>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: PRICING & INVENTORY ===== */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="oldPrice" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Old Price ($) <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="oldPrice"
                      name="oldPrice"
                      value={formData.oldPrice}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  {formData.oldPrice && parseFloat(formData.oldPrice) > parseFloat(formData.price) && (
                    <p className="text-xs text-green-600 mt-1">
                      Discount: {Math.round(((parseFloat(formData.oldPrice) - parseFloat(formData.price)) / parseFloat(formData.oldPrice)) * 100)}% off!
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cost Price ($) <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="costPrice"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lowStockAlert" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Low Stock Alert Threshold
                  </label>
                  <input
                    type="number"
                    id="lowStockAlert"
                    name="lowStockAlert"
                    value={formData.lowStockAlert}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                    placeholder="5"
                  />
                  <p className="text-xs text-gray-400 mt-1">You'll be notified when stock falls below this number.</p>
                </div>
              </div>

              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1.5">
                  SKU (Stock Keeping Unit)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                    placeholder="Auto-generated from category"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const prefix = formData.category.substring(0, 3).toUpperCase();
                      const timestamp = Date.now().toString().slice(-6);
                      const random = Math.floor(1000 + Math.random() * 9000);
                      setFormData(prev => ({ ...prev, sku: `${prefix}-${timestamp}-${random}` }));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Auto-generates if left empty.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (cm)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Length</label>
                      <input
                        type="number"
                        value={formData.dimensions.length}
                        onChange={(e) => handleDimensionChange('length', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Width</label>
                      <input
                        type="number"
                        value={formData.dimensions.width}
                        onChange={(e) => handleDimensionChange('width', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Height</label>
                      <input
                        type="number"
                        value={formData.dimensions.height}
                        onChange={(e) => handleDimensionChange('height', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB: VARIATIONS ===== */}
          {activeTab === 'variations' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Product Variations
                  </label>
                  <p className="text-xs text-gray-400">Enable if this product has different variations (size, color, etc.)</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, hasVariations: !prev.hasVariations }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.hasVariations ? 'bg-green-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.hasVariations ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {formData.hasVariations && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addVariation}
                      className="flex items-center gap-2 px-4 py-2 bg-[#0f5a2e] text-white rounded-lg text-sm font-medium hover:bg-[#0a4221]"
                    >
                      <Plus className="w-4 h-4" /> Add Variation
                    </button>
                  </div>

                  {formData.variations.map((variation, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Variation #{index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeVariation(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="SKU"
                          value={variation.sku}
                          onChange={(e) => updateVariation(index, 'sku', e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={variation.price}
                          onChange={(e) => updateVariation(index, 'price', e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={variation.stock}
                          onChange={(e) => updateVariation(index, 'stock', parseInt(e.target.value))}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Attributes (e.g. Size: Large, Color: Red)"
                        value={Object.entries(variation.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        onChange={(e) => {
                          const attrs = {};
                          e.target.value.split(',').forEach(part => {
                            const [key, val] = part.split(':').map(s => s.trim());
                            if (key && val) attrs[key] = val;
                          });
                          updateVariation(index, 'attributes', attrs);
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== TAB: SEO ===== */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Meta Title <span className="text-xs text-gray-400 font-normal">(60 characters max)</span>
                  </label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    maxLength="60"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                    placeholder="e.g. Monstera Deliciosa | Buy Online at GreenScape"
                  />
                  <p className="text-xs text-right mt-1 text-gray-400">{formData.metaTitle?.length || 0}/60</p>
                </div>

                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Meta Description <span className="text-xs text-gray-400 font-normal">(160 characters max)</span>
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    rows="2"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    maxLength="160"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all resize-none"
                    placeholder="A compelling description for search engines..."
                  />
                  <p className="text-xs text-right mt-1 text-gray-400">{formData.metaDescription?.length || 0}/160</p>
                </div>

                <div>
                  <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    id="metaKeywords"
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                    placeholder="monstera, indoor plant, houseplant"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions (Bottom) */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
            <Link 
              href="/admin/dashboard/products" 
              className="w-full sm:w-auto px-6 py-3 text-gray-600 bg-gray-100 font-medium rounded-xl hover:bg-gray-200 hover:text-gray-900 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-[#0f5a2e] text-white font-semibold rounded-xl hover:bg-[#0a4221] transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Product
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}