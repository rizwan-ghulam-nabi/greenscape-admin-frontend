// app/admin/dashboard/products/edit/[id]/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { 
  ArrowLeft, Save, Eye, Trash2, Plus, Image as ImageIcon, 
  X, Check, Edit, UploadCloud, Loader2, ChevronDown
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api/admin';

export default function EditProductPage({ params }) {
  const router = useRouter();
  const { id } = params; // Get the product ID from the URL
  
  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // --- PRODUCT DATA ---
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDesc: '',
    description: '',
    category: '',
    tags: [],
    price: '',
    salePrice: '',
    discount: '',
    stock: 0,
    lowStockThreshold: 5,
    sku: '',
    weight: '',
    shippingClass: 'standard',
    image: '',
    gallery: [],
    isActive: true,
    isFeatured: false,
    trackInventory: true,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  });

  const [tagInput, setTagInput] = useState('');
  
  // --- IMAGE STATES ---
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // --- CATEGORIES ---
  const [categories, setCategories] = useState([]);

  // Load environment variables for Cloudinary
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // --- FETCH PRODUCT & CATEGORIES ON MOUNT ---
  useEffect(() => {
    if (id) {
      fetchProductData();
      fetchCategories();
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const res = await axios.get(`${API_BASE_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data) {
        const product = res.data;
        // Populate form with data
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          shortDesc: product.shortDesc || '',
          description: product.desc || '',
          category: product.category || '',
          tags: product.tags || [],
          price: product.price || '',
          salePrice: product.salePrice || '',
          discount: product.discount || '',
          stock: product.stock || 0,
          lowStockThreshold: product.lowStockThreshold || 5,
          sku: product.sku || '',
          weight: product.weight || '',
          shippingClass: product.shippingClass || 'standard',
          image: product.image || '',
          gallery: product.gallery || [],
          isActive: product.isActive !== false,
          isFeatured: product.isFeatured || false,
          trackInventory: product.trackInventory !== false,
          metaTitle: product.metaTitle || '',
          metaDescription: product.metaDescription || '',
          metaKeywords: product.metaKeywords || '',
        });

        // Set images
        if (product.image) {
          setMainImageUrl(product.image);
          setMainImagePreview(product.image);
        }
        if (product.gallery && product.gallery.length > 0) {
          setGalleryUrls(product.gallery);
          setGalleryPreviews(product.gallery);
        }
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product data.');
      setLoading(false);
    }
  };

  // In EditProductPage, change the fetchCategories function to this:

const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const res = await axios.get(`${API_BASE_URL}/categories`, { // ✅ Corrected path
      headers: { Authorization: `Bearer ${token}` }
    });
    setCategories(res.data || []);
  } catch (err) {
    console.error('Failed to load categories:', err);
  }
};

  // --- HANDLE TEXT INPUTS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- HANDLE TAGS ---
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

  // --- CLOUDINARY IMAGE UPLOAD HELPERS ---
  const openCloudinaryWidget = (type, index = -1) => {
    if (!cloudName || !uploadPreset) {
      setError('Cloudinary configuration missing.');
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
          sources: ['local', 'url'],
          multiple: false,
          cropping: true,
          croppingAspectRatio: 1,
          resourceType: 'image',
          maxFileSize: 5000000,
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            const secureUrl = result.info.secure_url;
            if (type === 'main') {
              setMainImageUrl(secureUrl);
              setMainImagePreview(secureUrl);
              setUploadingMainImage(false);
              setFormData(prev => ({ ...prev, image: secureUrl }));
            } else if (type === 'gallery') {
              const newGallery = [...galleryUrls, secureUrl];
              setGalleryUrls(newGallery);
              setGalleryPreviews(newGallery);
              setFormData(prev => ({ ...prev, gallery: newGallery }));
              setUploadingGallery(false);
            }
          }
        }
      );
      if (type === 'main') setUploadingMainImage(true);
      else setUploadingGallery(true);
      widget.open();
    } else {
      setTimeout(() => openCloudinaryWidget(type, index), 500);
    }
  };

  const removeGalleryImage = (index) => {
    const newGallery = galleryUrls.filter((_, i) => i !== index);
    setGalleryUrls(newGallery);
    setGalleryPreviews(newGallery);
    setFormData(prev => ({ ...prev, gallery: newGallery }));
  };

  // --- HANDLE FORM SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    if (!formData.name || !formData.price || !formData.category) {
      setError('Please fill in Name, Price, and Category.');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const productData = {
        name: formData.name,
        slug: formData.slug,
        shortDesc: formData.shortDesc,
        desc: formData.description,
        category: formData.category,
        tags: formData.tags,
        price: parseFloat(formData.price) || 0,
        salePrice: parseFloat(formData.salePrice) || 0,
        discount: parseFloat(formData.discount) || 0,
        stock: parseInt(formData.stock) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
        sku: formData.sku,
        weight: formData.weight,
        shippingClass: formData.shippingClass,
        image: formData.image,
        gallery: formData.gallery,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        trackInventory: formData.trackInventory,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
      };

      const res = await axios.put(`${API_BASE_URL}/products/${id}`, productData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 200) {
        setSuccess('Product updated successfully! 🎉');
        setTimeout(() => {
          router.push('/admin/dashboard/products');
        }, 1500);
      }

    } catch (err) {
      console.error('Update Product Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to update product.');
      setSaving(false);
    }
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B7A4B]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/dashboard/products" className="hover:text-green-600 transition-colors">Products</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Edit Product</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500 text-sm mt-1">Update product details, pricing, inventory and more.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={`/products/${id}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Eye className="w-4 h-4" />
            View Product
          </Link>
          <Link 
            href="/admin/dashboard/products"
            className="px-6 py-2.5 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0f5a2e] text-white rounded-lg text-sm font-medium hover:bg-[#0a4221] transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Update Product
          </button>
        </div>
      </div>

      {/* --- FEEDBACK MESSAGES --- */}
      <div className="px-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-3 mb-4">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-3 mb-4">
            <span className="text-lg">✅</span> {success}
          </div>
        )}
      </div>

      {/* --- MAIN 3-COLUMN LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* === LEFT COLUMN: BASIC INFO (8/12) === */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  placeholder="Enter a clear and descriptive product name."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  placeholder="This will be used in the URL. Use lowercase letters, numbers, and hyphens."
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Short Description
                </label>
                <textarea
                  name="shortDesc"
                  value={formData.shortDesc}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all resize-none"
                  placeholder="A short summary of the product."
                />
              </div>

              {/* Description (Rich Text Editor Wrapper) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                {/* In a real production app, use React Quill or Tiptap here. For this demo, we use a textarea */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex gap-2 text-gray-500">
                    <span className="text-xs">Paragraph</span>
                    <span className="text-xs cursor-pointer hover:text-gray-700">B</span>
                    <span className="text-xs cursor-pointer hover:text-gray-700">I</span>
                    <span className="text-xs cursor-pointer hover:text-gray-700">U</span>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="8"
                    className="w-full px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 resize-y min-h-[150px]"
                    placeholder="Detailed description of the product..."
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                >
                  <option value="">Choose the product category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tags
                </label>
                <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-200 bg-gray-50 rounded-lg focus-within:ring-2 focus-within:ring-green-600 focus-within:bg-white transition-all">
                  {formData.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                    >
                      {tag}
                      <button 
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-700 placeholder-gray-400 text-sm py-1"
                    placeholder="Add tags..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. SEO Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">SEO Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  placeholder="Snake Plant (Sansevieria) | GreenScape"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Meta Description
                </label>
                <input
                  type="text"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  placeholder="Buy Snake Plant online from GreenScape..."
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  placeholder="snake plant, sansevieria, indoor plant"
                />
              </div>
            </div>
          </div>
        </div>

        {/* === CENTER COLUMN: IMAGES (4/12) === */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Product Images */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Product Images <span className="font-normal text-gray-400 text-sm">*</span></h2>
            
            {/* Main Image Preview */}
            <div className="relative w-full aspect-square bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-4 group">
              {mainImagePreview ? (
                <img 
                  src={mainImagePreview} 
                  alt="Main Product" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <span className="text-sm">No Main Image</span>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded shadow">Primary</span>
              </div>
              <button
                onClick={() => openCloudinaryWidget('main')}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 shadow-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
              >
                {uploadingMainImage ? 'Uploading...' : 'Replace Image'}
              </button>
            </div>

            {/* Gallery Thumbnails */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Product Gallery <span className="font-normal text-xs text-gray-400">(Optional)</span></h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {galleryPreviews.map((img, index) => (
                  <div key={index} className="relative w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden group">
                    <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-red-50 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => openCloudinaryWidget('gallery')}
                  className="w-20 h-20 flex-shrink-0 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:bg-green-50 hover:border-green-400 transition-colors group"
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
              <p className="text-xs text-gray-400 mt-2">PNG, JPG or WEBP. Max 5MB. Recommended size: 800x800px.</p>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: SIDEBAR (4/12 span but offsets) === */}
        <div className="lg:col-span-4 lg:col-start-9 space-y-6">
          
          {/* Product Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Product Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-500 mt-0.5">Inactive products will not be visible to customers.</p>
                </div>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-green-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700">Featured Product</label>
                  <p className="text-xs text-gray-500 mt-0.5">Featured products will be shown on homepage.</p>
                </div>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isFeatured ? 'bg-green-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Pricing</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Regular Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sale Price
                </label>
                <input
                  type="number"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  placeholder="Leave empty if no discount."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Discount <span className="text-xs text-gray-400 font-normal">(%)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 text-sm">%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Inventory</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  placeholder="5"
                />
                <p className="text-xs text-gray-400 mt-1">You will be notified when stock is low.</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <label className="text-sm font-medium text-gray-700">Track Inventory</label>
                  <p className="text-xs text-gray-500 mt-0.5">Enable to track product inventory.</p>
                </div>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, trackInventory: !prev.trackInventory }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.trackInventory ? 'bg-green-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.trackInventory ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Shipping</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                  placeholder="1.20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Shipping Class
                </label>
                <select
                  name="shippingClass"
                  value={formData.shippingClass}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-all"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="free">Free Shipping</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}