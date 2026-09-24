// app/admin/dashboard/blog/edit/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { 
  ArrowLeft, Save, Eye, Image as ImageIcon, 
  Tag, Upload, X, Loader2, CheckCircle, AlertCircle,
  Trash2, Calendar, Clock, Eye as EyeIcon
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    category: '',
    status: 'Draft',
    tags: []
  });

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  // Categories
  const categories = [
    'Plant Care', 'Indoor Plants', 'Outdoor Plants', 'Gardening Tips',
    'DIY & Decor', 'Succulents', 'Fertilizers & Soil', 'Pest Control',
    'Seasonal Care', 'Sustainable Living'
  ];

  // Generate slug from title
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Fetch post data
  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/blog/${postId}`, {
        withCredentials: true
      });

      console.log('📦 Fetched post:', res.data);

      if (res.data?.success && res.data?.post) {
        const post = res.data.post;
        
        setFormData({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          image: post.image || '',
          category: post.category || '',
          status: post.status || 'Draft',
          tags: post.tags || []
        });

        setImagePreview(post.image || null);
        setOriginalData(post);
      } else {
        setError('Post not found');
      }
    } catch (err) {
      console.error('❌ Error fetching post:', err);
      
      if (err.response?.status === 401) {
        router.push('/admin/login');
      } else if (err.response?.status === 404) {
        setError('Post not found');
      } else {
        setError('Failed to load blog post.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load post on mount
  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Handle title change
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image URL
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image: url }));
    if (url) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  // Handle tags
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.excerpt.trim()) {
      setError('Excerpt is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt,
        content: formData.content,
        image: formData.image || null,
        category: formData.category,
        status: formData.status,
        tags: formData.tags
      };

      console.log('📤 Updating post:', updateData);

      const res = await axios.put(`${API_BASE_URL}/blog/${postId}`, updateData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('✅ Update response:', res.data);

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/dashboard/blog');
        }, 2000);
      } else {
        setError(res.data?.error || 'Failed to update blog post');
      }
    } catch (err) {
      console.error('❌ Error updating post:', err);

      if (err.response) {
        console.error('Server error:', err.response.data);
        setError(err.response.data?.error || err.response.data?.message || 'Server error');
      } else if (err.request) {
        setError('Cannot connect to server. Check if backend is running.');
      } else {
        setError('Error: ' + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await axios.delete(`${API_BASE_URL}/blog/${postId}`, {
        withCredentials: true
      });

      if (res.data?.success) {
        router.push('/admin/dashboard/blog');
      } else {
        alert(res.data?.error || 'Failed to delete post');
      }
    } catch (err) {
      console.error('❌ Error deleting post:', err);
      alert(err.response?.data?.error || 'Failed to delete post');
    }
  };

  // Word count
  const wordCount = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B7A4B]"></div>
          <p className="text-sm text-gray-500 animate-pulse">Loading blog post...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !formData.title) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-500 mb-6">The post you're trying to edit doesn't exist or has been removed.</p>
          <Link 
            href="/admin/dashboard/blog" 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog Posts
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Post Updated!</h2>
          <p className="text-gray-500">Your blog post has been updated successfully.</p>
          <Link 
            href="/admin/dashboard/blog" 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog Posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
      
      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-green-600 transition-colors">Dashboard</Link>
            <span>›</span>
            <Link href="/admin/dashboard/blog" className="hover:text-green-600 transition-colors">Blog Posts</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Edit Post</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
          <p className="text-sm text-gray-500 mt-1">Update your blog post content and settings.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/dashboard/blog')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* --- Error Message --- */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === LEFT COLUMN: Post Content === */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Title Input */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Post Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter your post title..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] focus:border-transparent"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Slug: <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded">{formData.slug || 'auto-generated'}</span>
              </p>
              <p className="text-xs text-gray-400">{formData.title.length}/100 characters</p>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Post Content <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{wordCount} words</span>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
              </div>
            </div>
            
            {showPreview ? (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-4">{formData.title || 'Post Title'}</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{formData.content || 'Your content will appear here...'}</p>
              </div>
            ) : (
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your blog content here..."
                rows={15}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] focus:border-transparent resize-y min-h-[300px]"
              />
            )}
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Excerpt / Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Write a brief summary of your post..."
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-2">{formData.excerpt.length}/300 characters</p>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-green-500 hover:text-green-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] focus:border-transparent"
            />
          </div>
        </div>

        {/* === RIGHT COLUMN: Post Settings === */}
        <div className="space-y-6">
          
          {/* Image */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Featured Image
            </label>
            
            {imagePreview ? (
              <div className="relative group">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, image: '' }));
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#2B7A4B] transition-colors">
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">Drop image here or</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
            
            {/* Image URL Input */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                OR Paste Image URL
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={handleImageUrlChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
              />
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Post Status
            </label>
            <div className="space-y-2">
              {[
                { value: 'Published', label: 'Published', description: 'Visible to everyone' },
                { value: 'Draft', label: 'Draft', description: 'Only visible to admin' },
                { value: 'Trash', label: 'Trash', description: 'Move to trash' }
              ].map((option) => (
                <label 
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.status === option.value 
                      ? 'border-[#2B7A4B] bg-green-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={formData.status === option.value}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Post Info */}
          {originalData && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Post Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-900">
                    {new Date(originalData.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="text-gray-900">
                    {new Date(originalData.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Views:</span>
                  <span className="text-gray-900">{originalData.views || 0}</span>
                </div>
                {originalData.author && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Author:</span>
                    <span className="text-gray-900">
                      {originalData.author.firstName || 'Admin'} {originalData.author.lastName || ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Bottom Action Bar --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky bottom-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            {formData.status === 'Published' ? 'This post will be visible to everyone.' : 'This post will be saved as a draft.'}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard/blog')}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#23663e] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {formData.status === 'Published' ? 'Update & Publish' : 'Update Post'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}