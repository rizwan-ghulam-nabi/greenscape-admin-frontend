// // app/admin/dashboard/blog/create/page.jsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import axios from 'axios';
// import { 
//   ArrowLeft, Save, Eye, Image as ImageIcon, 
//   Tag, Upload, X, Loader2, CheckCircle, AlertCircle
// } from 'lucide-react';

// // Use relative URL to avoid CORS issues with Next.js proxy
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

// export default function CreateBlogPostPage() {
//   const router = useRouter();
  
//   const [formData, setFormData] = useState({
//     title: '',
//     slug: '',
//     excerpt: '',
//     content: '',
//     image: '',
//     category: '',
//     status: 'Draft',
//     tags: []
//   });
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [tagInput, setTagInput] = useState('');

//   const categories = [
//     'Plant Care', 'Indoor Plants', 'Outdoor Plants', 'Gardening Tips',
//     'DIY & Decor', 'Succulents', 'Fertilizers & Soil', 'Pest Control',
//     'Seasonal Care', 'Sustainable Living'
//   ];

//   const generateSlug = (text) => {
//     return text
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/(^-|-$)/g, '');
//   };

//   const handleTitleChange = (e) => {
//     const title = e.target.value;
//     setFormData(prev => ({ ...prev, title, slug: generateSlug(title) }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//         setFormData(prev => ({ ...prev, image: reader.result }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleImageUrlChange = (e) => {
//     const url = e.target.value;
//     setFormData(prev => ({ ...prev, image: url }));
//     if (url) setImagePreview(url);
//   };

//   const handleAddTag = (e) => {
//     if (e.key === 'Enter' && tagInput.trim()) {
//       e.preventDefault();
//       if (!formData.tags.includes(tagInput.trim())) {
//         setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
//       }
//       setTagInput('');
//     }
//   };

//   const handleRemoveTag = (tagToRemove) => {
//     setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validation
//     if (!formData.title.trim()) return setError('Title is required');
//     if (!formData.excerpt.trim()) return setError('Excerpt is required');
//     if (!formData.content.trim()) return setError('Content is required');
//     if (!formData.category) return setError('Category is required');

//     try {
//       setLoading(true);
//       setError(null);

//       const postData = {
//         title: formData.title,
//         slug: formData.slug || generateSlug(formData.title),
//         excerpt: formData.excerpt,
//         content: formData.content,
//         image: formData.image || null,
//         category: formData.category,
//         status: formData.status,
//         tags: formData.tags
//       };

//       console.log('📤 Sending post data:', postData);

//       const res = await axios.post(`${API_BASE_URL}/blog`, postData, {
//         withCredentials: true,
//         headers: { 'Content-Type': 'application/json' }
//       });

//       console.log('✅ Response:', res.data);

//       if (res.data?.success) {
//         setSuccess(true);
//         setTimeout(() => router.push('/admin/dashboard/blog'), 2000);
//       } else {
//         setError(res.data?.error || 'Failed to create blog post');
//       }
//     } catch (err) {
//       console.error('❌ Error creating post:', err);
      
//       if (err.response) {
//         console.error('Server error:', err.response.data);
//         setError(err.response.data?.error || err.response.data?.message || 'Server error');
//       } else if (err.request) {
//         setError('Cannot connect to server. Check if backend is running.');
//       } else {
//         setError('Error: ' + err.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (success) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center space-y-4">
//           <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
//             <CheckCircle className="w-8 h-8 text-green-600" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900">Post Created!</h2>
//           <p className="text-gray-500">Your blog post has been created successfully.</p>
//           <Link href="/admin/dashboard/blog" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e] transition-colors">
//             <ArrowLeft className="w-4 h-4" />
//             Back to Blog Posts
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Create New Blog Post</h1>
//           <p className="text-sm text-gray-500 mt-1">Write and publish a new blog post.</p>
//         </div>
//         <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
//           <ArrowLeft className="w-4 h-4" />
//           Back
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
//           <AlertCircle className="w-4 h-4" />
//           {error}
//           <button onClick={() => setError(null)} className="ml-auto">
//             <X className="w-4 h-4" />
//           </button>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-6">
//           {/* Title */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Post Title <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={formData.title}
//               onChange={handleTitleChange}
//               placeholder="Enter your post title..."
//               className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
//             />
//           </div>

//           {/* Content */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Post Content <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={formData.content}
//               onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//               placeholder="Write your blog content here..."
//               rows={15}
//               className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] resize-y min-h-[300px]"
//             />
//           </div>

//           {/* Excerpt */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Excerpt / Summary <span className="text-red-500">*</span>
//             </label>
//             <textarea
//               value={formData.excerpt}
//               onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
//               placeholder="Write a brief summary..."
//               rows={3}
//               maxLength={300}
//               className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] resize-none"
//             />
//           </div>
//         </div>

//         {/* Right Column - Settings */}
//         <div className="space-y-6">
//           {/* Image */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-3">Featured Image</label>
//             {imagePreview ? (
//               <div className="relative">
//                 <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
//                 <button
//                   onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, image: '' })); }}
//                   className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
//             ) : (
//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
//                 <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
//                 <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200">
//                   <Upload className="w-4 h-4" />
//                   Upload Image
//                   <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
//                 </label>
//               </div>
//             )}
//             <input
//               type="text"
//               value={formData.image}
//               onChange={handleImageUrlChange}
//               placeholder="OR paste image URL"
//               className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-3"
//             />
//           </div>

//           {/* Category */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-3">
//               Category <span className="text-red-500">*</span>
//             </label>
//             <select
//               value={formData.category}
//               onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//               className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
//             >
//               <option value="">Select Category</option>
//               {categories.map((cat) => (
//                 <option key={cat} value={cat}>{cat}</option>
//               ))}
//             </select>
//           </div>

//           {/* Status */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//             <label className="block text-sm font-semibold text-gray-700 mb-3">Post Status</label>
//             <div className="space-y-2">
//               {['Published', 'Draft', 'Trash'].map((status) => (
//                 <label key={status} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${formData.status === status ? 'border-[#2B7A4B] bg-green-50' : 'border-gray-200'}`}>
//                   <input
//                     type="radio"
//                     name="status"
//                     value={status}
//                     checked={formData.status === status}
//                     onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                   />
//                   <span className="text-sm font-medium">{status}</span>
//                 </label>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Submit Button */}
//       <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#2B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#23663e] disabled:opacity-70"
//         >
//           {loading ? (
//             <>
//               <Loader2 className="w-4 h-4 animate-spin" />
//               Creating...
//             </>
//           ) : (
//             <>
//               <Save className="w-4 h-4" />
//               {formData.status === 'Published' ? 'Publish Post' : 'Save Post'}
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }







// new verison 17/9/2026

// app/admin/dashboard/blog/create/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import {
  ArrowLeft, Save, Image as ImageIcon,
  Upload, X, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function CreateBlogPostPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    category: '',
    status: 'Draft',
    tags: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [tagInput, setTagInput] = useState('');

  const categories = [
    'Plant Care', 'Indoor Plants', 'Outdoor Plants', 'Gardening Tips',
    'DIY & Decor', 'Succulents', 'Fertilizers & Soil', 'Pest Control',
    'Seasonal Care', 'Sustainable Living',
  ];

  const generateSlug = (text) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({ ...prev, title, slug: generateSlug(title) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image: url }));
    setImagePreview(url || null);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return setError('Title is required');
    if (!formData.excerpt.trim()) return setError('Excerpt is required');
    if (!formData.content.trim()) return setError('Content is required');
    if (!formData.category) return setError('Category is required');

    try {
      setLoading(true);
      setError(null);

      const postData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt,
        content: formData.content,
        image: formData.image || null,
        category: formData.category,
        status: formData.status,
        tags: formData.tags,
      };

      const res = await axios.post(`${API_BASE_URL}/blog`, postData, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => router.push('/admin/dashboard/blog'), 2000);
      } else {
        setError(res.data?.error || 'Failed to create blog post');
      }
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data?.error ||
            err.response.data?.message ||
            'Server error'
        );
      } else if (err.request) {
        setError('Cannot connect to server. Check if backend is running.');
      } else {
        setError('Error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Post Created!</h2>
          <p className="text-gray-500">
            Your blog post has been created successfully.
          </p>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Blog Post
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Write and publish a new blog post.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Post Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter your post title..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
            />
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Post Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Write your blog content here..."
              rows={15}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] resize-y min-h-[300px]"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Excerpt / Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) =>
                setFormData({ ...formData, excerpt: e.target.value })
              }
              placeholder="Write a brief summary..."
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] resize-none"
            />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-600"
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
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Image */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Featured Image
            </label>
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-lg border border-gray-200 overflow-hidden">
                {/* ✅ Next.js Image */}
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover"
                  unoptimized={imagePreview.startsWith('data:') || imagePreview.startsWith('blob:')}
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setFormData((prev) => ({ ...prev, image: '' }));
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200">
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
            <input
              type="text"
              value={formData.image}
              onChange={handleImageUrlChange}
              placeholder="OR paste image URL"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mt-3"
            />
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Post Status
            </label>
            <div className="space-y-2">
              {['Published', 'Draft', 'Trash'].map((status) => (
                <label
                  key={status}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
                    formData.status === status
                      ? 'border-[#2B7A4B] bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={formData.status === status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  />
                  <span className="text-sm font-medium">{status}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#2B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#23663e] disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {formData.status === 'Published' ? 'Publish Post' : 'Save Post'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}