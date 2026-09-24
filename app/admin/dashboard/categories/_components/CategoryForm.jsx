'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { ArrowLeft, Loader2, Save, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api/admin';

export default function CategoryForm({ initialData = null, isEdit = false }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    status: 'Active',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Prefill on edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        image: initialData.image || '',
        status: initialData.status || 'Active',
      });
    }
  }, [initialData]);

  // Slug preview (frontend only — backend generates the real one)
  const previewSlug = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Category name is required';
    else if (formData.name.trim().length < 2)
      newErrors.name = 'Name must be at least 2 characters';

    if (formData.image && !/^https?:\/\/.+/.test(formData.image)) {
      newErrors.image = 'Must be a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEdit && initialData?._id) {
        await axios.put(
          `${API_BASE_URL}/categories/${initialData._id}`,
          formData,
          { withCredentials: true }
        );
      } else {
        await axios.post(`${API_BASE_URL}/categories`, formData, {
          withCredentials: true,
        });
      }
      // ✅ Redirect back to list
      router.push('/admin/dashboard/categories');
      router.refresh();
    } catch (err) {
      setServerError(
        err.response?.data?.error || err.message || 'Something went wrong'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/admin/dashboard"
          className="hover:text-green-600 transition-colors"
        >
          Dashboard
        </Link>
        <span>›</span>
        <Link
          href="/admin/dashboard/categories"
          className="hover:text-green-600 transition-colors"
        >
          Categories
        </Link>
        <span>›</span>
        <span className="text-green-700 font-medium">
          {isEdit ? 'Edit' : 'Create'}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/dashboard/categories"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          aria-label="Back to categories"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Category' : 'Add New Category'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit
              ? 'Update the category details below'
              : 'Fill in the details to create a new category'}
          </p>
        </div>
      </div>

      {/* Error banner */}
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2 text-sm">
          <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 max-w-3xl space-y-6"
      >
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Indoor Plants"
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
              errors.name
                ? 'border-red-400 focus:ring-red-200'
                : 'border-gray-200 focus:ring-[#2B7A4B]'
            }`}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>
          )}
          <p className="text-[11px] text-gray-400 mt-1.5">
            Slug preview:{' '}
            <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded">
              {previewSlug(formData.name) || 'auto-generated'}
            </span>
          </p>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of the category"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] resize-none"
          />
        </div>

        {/* Image URL */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Image URL
          </label>
          <input
            type="text"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition ${
              errors.image
                ? 'border-red-400 focus:ring-red-200'
                : 'border-gray-200 focus:ring-[#2B7A4B]'
            }`}
          />
          {errors.image && (
            <p className="text-red-500 text-xs mt-1.5">{errors.image}</p>
          )}

          {/* Live preview */}
          {formData.image && !errors.image && (
            <div className="mt-3 flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML =
                      '<span class="text-[10px] text-gray-400">Invalid</span>';
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">Image preview</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Status
          </label>
          <div className="flex gap-2">
            {['Active', 'Inactive'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, status: s }))}
                className={`px-5 py-2 rounded-lg border text-sm font-medium transition ${
                  formData.status === s
                    ? s === 'Active'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0f5a2e] hover:bg-[#0a4221] text-white rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {submitting
              ? isEdit
                ? 'Updating...'
                : 'Creating...'
              : isEdit
              ? 'Update Category'
              : 'Create Category'}
          </button>
          <Link
            href="/admin/dashboard/categories"
            className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}