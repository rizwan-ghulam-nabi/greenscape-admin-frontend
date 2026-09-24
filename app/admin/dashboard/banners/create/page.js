// // app/admin/dashboard/banners/create/page.js
// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import axios from 'axios';
// import { 
//   Save, X, Trash2, UploadCloud, Monitor, Tablet, Smartphone,
//   Layout, Image as ImageIcon, CheckCircle2, Sparkles, Filter,
//   ChevronDown, ChevronRight, Loader2, Wand2
// } from 'lucide-react';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

// // ============================================================
// // 🎨 BANNER TEMPLATES
// // ============================================================
// const BANNER_TEMPLATES = [
//   {
//     id: 1,
//     name: 'Modern Nature',
//     category: 'Nature',
//     recommended: true,
//     image: 'https://images.unsplash.com/photo-1542559137-8f88a8c56c4e?w=1920&h=768&fit=crop&crop=center&q=80',
//     buttonText: 'Shop Now',
//     overlayType: 'Dark',
//     overlayOpacity: 30,
//     buttonPosition: 'Center',
//     buttonStyle: 'Solid',
//     buttonBgColor: '#0f5a2e',
//     buttonTextColor: '#FFFFFF',
//   },
//   {
//     id: 2,
//     name: 'Urban Jungle',
//     category: 'Modern',
//     recommended: false,
//     image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1920&h=768&fit=crop&crop=center&q=80',
//     buttonText: 'Browse Collection',
//     overlayType: 'Dark',
//     overlayOpacity: 40,
//     buttonPosition: 'Center Left',
//     buttonStyle: 'Solid',
//     buttonBgColor: '#ffffff',
//     buttonTextColor: '#0f5a2e',
//   },
//   {
//     id: 3,
//     name: 'Spring Bloom',
//     category: 'Seasonal',
//     recommended: false,
//     image: 'https://images.unsplash.com/photo-1520412099556-4024751c3834?w=1920&h=768&fit=crop&crop=center&q=80',
//     buttonText: 'Explore Now',
//     overlayType: 'Light',
//     overlayOpacity: 20,
//     buttonPosition: 'Bottom Center',
//     buttonStyle: 'Solid',
//     buttonBgColor: '#0f5a2e',
//     buttonTextColor: '#FFFFFF',
//   },
//   {
//     id: 4,
//     name: 'Minimalist',
//     category: 'Modern',
//     recommended: false,
//     image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1920&h=768&fit=crop&crop=center&q=80',
//     buttonText: 'Shop the Sale',
//     overlayType: 'Dark',
//     overlayOpacity: 30,
//     buttonPosition: 'Center',
//     buttonStyle: 'Outline',
//     buttonBgColor: 'transparent',
//     buttonTextColor: '#FFFFFF',
//   },
//   {
//     id: 5,
//     name: 'Golden Hour',
//     category: 'Seasonal',
//     recommended: false,
//     image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1920&h=768&fit=crop&crop=center&q=80',
//     buttonText: 'Shop Sale',
//     overlayType: 'Dark',
//     overlayOpacity: 35,
//     buttonPosition: 'Bottom Left',
//     buttonStyle: 'Solid',
//     buttonBgColor: '#f59e0b',
//     buttonTextColor: '#FFFFFF',
//   },
//   {
//     id: 6,
//     name: 'Fresh Start',
//     category: 'Nature',
//     recommended: false,
//     image: 'https://images.unsplash.com/photo-1509423358764-83c59f3b7e6c?w=1920&h=768&fit=crop&crop=center&q=80',
//     buttonText: 'Shop New',
//     overlayType: 'Dark',
//     overlayOpacity: 25,
//     buttonPosition: 'Center Right',
//     buttonStyle: 'Ghost',
//     buttonBgColor: 'transparent',
//     buttonTextColor: '#FFFFFF',
//   },
// ];

// // ============================================================
// // ✅ BUTTON POSITION MAP (for live preview)
// // ============================================================
// const BUTTON_POSITION_CLASSES = {
//   'Bottom Left':   'bottom-8 left-8',
//   'Bottom Center': 'bottom-8 left-1/2 -translate-x-1/2',
//   'Bottom Right':  'bottom-8 right-8',
//   'Center':        'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
//   'Center Left':   'top-1/2 left-8 -translate-y-1/2',
//   'Center Right':  'top-1/2 right-8 -translate-y-1/2',
//   'Top Left':      'top-8 left-8',
//   'Top Right':     'top-8 right-8',
// };

// const BUTTON_SIZE_CLASSES = {
//   Small:  'px-4 py-2 text-xs',
//   Medium: 'px-6 py-3 text-sm',
//   Large:  'px-8 py-4 text-base',
// };

// const BUTTON_RADIUS_CLASSES = {
//   none: 'rounded-none',
//   sm:   'rounded-sm',
//   md:   'rounded-lg',
//   lg:   'rounded-xl',
//   full: 'rounded-full',
// };

// export default function CreateBannerPage() {
//   const router = useRouter();
//   const fileInputRef = useRef(null);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const [categories, setCategories] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [previewDevice, setPreviewDevice] = useState('desktop');

//   const [selectedTemplate, setSelectedTemplate] = useState(null);
//   const [templateFilter, setTemplateFilter] = useState('All');

//   const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
//   const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

//   // ============================================================
//   // ✅ CLEAN FORM STATE — No heading, subheading, textColor
//   // ============================================================
//   const [formData, setFormData] = useState({
//     title: '',
//     bannerType: 'Hero Large',
//     linkType: 'None',
//     categoryId: '',
//     productId: '',
//     customUrl: '',
//     image: '',
//     order: 1,
//     isActive: true,

//     // Display
//     showOnDesktop: true,
//     showOnTablet: true,
//     showOnMobile: true,
//     startDate: '',
//     endDate: '',
//     showOnPages: { home: true, shop: false, category: false, product: false },

//     // Overlay
//     overlayType: 'Dark',
//     overlayOpacity: 30,

//     // ✅ Button configuration (the star of the show!)
//     button: {
//       text: 'Shop Now',
//       position: 'Center',
//       size: 'Medium',
//       style: 'Solid',
//       bgColor: '#0f5a2e',
//       textColor: '#FFFFFF',
//       hoverBgColor: '#0a4221',
//       borderRadius: 'md',
//       showArrow: true,
//     },

//     // Layout
//     marginTop: 0,
//     marginBottom: 0,
//     animation: 'Fade In',
//     animationDuration: 800,
//     altText: '',
//   });

//   const [imagePreview, setImagePreview] = useState(null);
//   const [uploadingImage, setUploadingImage] = useState(false);

//   // ============================================================
//   // 🚀 AI GENERATION
//   // ============================================================
//   const [aiPrompt, setAiPrompt] = useState('');
//   const [aiGeneratedImages, setAiGeneratedImages] = useState([]);
//   const [selectedAiImage, setSelectedAiImage] = useState(null);
//   const [aiLoading, setAiLoading] = useState(false);
//   const [retryCount, setRetryCount] = useState(0);

//   const generateAIBanner = async () => {
//     if (!aiPrompt.trim()) {
//       setError('Please enter a prompt for the AI.');
//       return;
//     }

//     setAiLoading(true);
//     setError('');
//     setAiGeneratedImages([]);
//     setSelectedAiImage(null);

//     try {
//       const res = await axios.post('/api/replicate/generate', { prompt: aiPrompt });
//       if (res.data.imageUrl) {
//         setAiGeneratedImages([{ url: res.data.imageUrl }]);
//         setSelectedAiImage({ url: res.data.imageUrl });
//         setRetryCount(0);
//       } else {
//         setError('AI generation failed.');
//       }
//     } catch (err) {
//       console.error('AI Error:', err.response?.data?.error || err.message);
//       if (retryCount < 3) {
//         setRetryCount((prev) => prev + 1);
//         setError(`AI generation failed. Try again (Attempt ${retryCount + 1}/3)`);
//       } else {
//         setError('AI generation failed after 3 attempts.');
//         setRetryCount(0);
//       }
//     } finally {
//       setAiLoading(false);
//     }
//   };

//   const handleApproveAiImage = (imageObj) => {
//     if (!imageObj || !imageObj.url) return;
//     setImagePreview(imageObj.url);
//     setFormData((prev) => ({ ...prev, image: imageObj.url }));
//     setAiGeneratedImages([]);
//     setSelectedAiImage(null);
//     if (!formData.title) {
//       setFormData((prev) => ({ ...prev, title: aiPrompt.substring(0, 50) }));
//     }
//     if (!formData.altText) {
//       setFormData((prev) => ({ ...prev, altText: aiPrompt }));
//     }
//   };

//   // ============================================================
//   // FETCH DATA
//   // ============================================================
//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/categories`, { withCredentials: true });
//       if (res.data) {
//         const data = Array.isArray(res.data) ? res.data : res.data.categories || res.data.data || [];
//         setCategories(data);
//       }
//     } catch (err) {
//       console.error('Failed to load categories:', err);
//       if (err.response?.status === 401 || err.response?.status === 403) {
//         router.push('/admin/login');
//       }
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/products`, { withCredentials: true });
//       if (res.data) {
//         const data = Array.isArray(res.data) ? res.data : res.data.products || res.data.data || [];
//         setProducts(data);
//       }
//     } catch (err) {
//       console.error('Failed to load products:', err);
//     }
//   };

//   // ============================================================
//   // IMAGE UPLOAD
//   // ============================================================
//   const handleImageUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!cloudName || !uploadPreset) {
//       setError('Cloudinary configuration missing.');
//       return;
//     }

//     setUploadingImage(true);
//     const formDataUpload = new FormData();
//     formDataUpload.append('file', file);
//     formDataUpload.append('upload_preset', uploadPreset);

//     try {
//       const res = await axios.post(
//         `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
//         formDataUpload
//       );
//       setImagePreview(res.data.secure_url);
//       setFormData((prev) => ({ ...prev, image: res.data.secure_url }));
//     } catch (err) {
//       setError('Failed to upload image.');
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   const triggerFileInput = () => fileInputRef.current?.click();

//   // ============================================================
//   // ✅ TEMPLATE LOADER (button-only)
//   // ============================================================
//   const loadTemplate = (template) => {
//     setSelectedTemplate(template);
//     setImagePreview(template.image);
//     setFormData((prev) => ({
//       ...prev,
//       image: template.image,
//       title: template.name + ' Banner',
//       overlayType: template.overlayType,
//       overlayOpacity: template.overlayOpacity,
//       button: {
//         ...prev.button,
//         text: template.buttonText,
//         position: template.buttonPosition || 'Center',
//         style: template.buttonStyle || 'Solid',
//         bgColor: template.buttonBgColor || '#0f5a2e',
//         textColor: template.buttonTextColor || '#FFFFFF',
//       },
//       altText: template.name,
//     }));
//     setError('');
//   };

//   // ============================================================
//   // HANDLERS
//   // ============================================================
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     if (type === 'checkbox') {
//       setFormData((prev) => ({ ...prev, [name]: checked }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleButtonChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       button: { ...prev.button, [field]: value },
//     }));
//   };

//   const handlePagesChange = (page) => {
//     setFormData((prev) => ({
//       ...prev,
//       showOnPages: { ...prev.showOnPages, [page]: !prev.showOnPages[page] },
//     }));
//   };

//   // ============================================================
//   // SUBMIT
//   // ============================================================
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setLoading(true);

//     if (!formData.title || !formData.image) {
//       setError('Please fill in Title and upload an Image.');
//       setLoading(false);
//       return;
//     }

//     try {
//       const submissionData = {
//         title: formData.title,
//         bannerType: formData.bannerType,
//         linkType: formData.linkType,
//         categoryId: formData.linkType === 'Category' ? formData.categoryId : null,
//         productId: formData.linkType === 'Product' ? formData.productId : null,
//         customUrl: formData.linkType === 'Custom URL' ? formData.customUrl : null,
//         image: formData.image,
//         order: formData.order,
//         isActive: formData.isActive,
//         startDate: formData.startDate || null,
//         endDate: formData.endDate || null,

//         // ✅ Button object (clean, single source of truth)
//         button: {
//           text: formData.button.text || 'Shop Now',
//           position: formData.button.position,
//           size: formData.button.size,
//           style: formData.button.style,
//           bgColor: formData.button.bgColor,
//           textColor: formData.button.textColor,
//           hoverBgColor: formData.button.hoverBgColor,
//           borderRadius: formData.button.borderRadius,
//           showArrow: formData.button.showArrow,
//         },

//         overlayType: formData.overlayType,
//         overlayOpacity: formData.overlayOpacity,

//         showOnDesktop: formData.showOnDesktop,
//         showOnTablet: formData.showOnTablet,
//         showOnMobile: formData.showOnMobile,
//         showOnPages: formData.showOnPages,

//         marginTop: formData.marginTop,
//         marginBottom: formData.marginBottom,
//         animation: formData.animation,
//         animationDuration: formData.animationDuration,
//         altText: formData.altText,
//       };

//       const res = await axios.post(`${API_BASE_URL}/banners`, submissionData, {
//         withCredentials: true,
//       });

//       if (res.status === 201 || res.status === 200) {
//         setSuccess('Banner created successfully! 🎉');
//         setTimeout(() => router.push('/admin/dashboard/banners'), 1500);
//       }
//     } catch (err) {
//       console.error(err);
//       if (err.response?.status === 401 || err.response?.status === 403) {
//         router.push('/admin/login');
//       } else {
//         setError(err.response?.data?.error || 'Failed to create banner.');
//         setLoading(false);
//       }
//     }
//   };

//   const getPreviewWrapperStyles = () => {
//     switch (previewDevice) {
//       case 'mobile': return 'max-w-[375px] aspect-[9/16]';
//       case 'tablet': return 'max-w-[768px] aspect-[4/3]';
//       default: return 'max-w-full aspect-[2.5/1]';
//     }
//   };

//   const filteredTemplates = templateFilter === 'All'
//     ? BANNER_TEMPLATES
//     : BANNER_TEMPLATES.filter((t) => t.category === templateFilter);

//   const categoriesList = ['All', ...new Set(BANNER_TEMPLATES.map((t) => t.category))];

//   // ============================================================
//   // ✅ Compute button preview styles
//   // ============================================================
//   const getPreviewButtonStyle = () => {
//     const { style, bgColor, textColor } = formData.button;
//     if (style === 'Solid') {
//       return { backgroundColor: bgColor, color: textColor, border: 'none' };
//     }
//     if (style === 'Outline') {
//       return { backgroundColor: 'transparent', color: textColor, border: `2px solid ${textColor}` };
//     }
//     return {
//       backgroundColor: 'rgba(255,255,255,0.15)',
//       color: textColor,
//       border: 'none',
//       backdropFilter: 'blur(8px)',
//     };
//   };

//   const buttonPositionClass = BUTTON_POSITION_CLASSES[formData.button.position] || BUTTON_POSITION_CLASSES['Center'];
//   const buttonSizeClass = BUTTON_SIZE_CLASSES[formData.button.size] || BUTTON_SIZE_CLASSES['Medium'];
//   const buttonRadiusClass = BUTTON_RADIUS_CLASSES[formData.button.borderRadius] || BUTTON_RADIUS_CLASSES['md'];

//   // ============================================================
//   // RENDER
//   // ============================================================
//   return (
//     <div className="space-y-8 pb-12 max-w-[1600px] mx-auto">

//       {/* HEADER */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
//         <div>
//           <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//             <Link href="/admin/dashboard/banners" className="hover:text-green-600">Banners</Link>
//             <span>›</span>
//             <span className="text-gray-900 font-medium">Create New Banner</span>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Create New Banner</h1>
//           <p className="text-gray-500 text-sm mt-1">Choose a template, upload your own, or use AI.</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <Link href="/admin/dashboard/banners" className="px-6 py-2.5 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
//             Cancel
//           </Link>
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="flex items-center gap-2 px-6 py-2.5 bg-[#0f5a2e] text-white rounded-lg text-sm font-medium hover:bg-[#0a4221] transition-colors shadow-md disabled:opacity-70"
//           >
//             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Publish Banner</>}
//           </button>
//         </div>
//       </div>

//       {/* FEEDBACK */}
//       {(error || success) && (
//         <div className="px-4">
//           {error && (
//             <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-3 mb-4">
//               <span className="text-lg">⚠️</span> {error}
//             </div>
//           )}
//           {success && (
//             <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-3 mb-4">
//               <span className="text-lg">✅</span> {success}
//             </div>
//           )}
//         </div>
//       )}

//       {/* MAIN LAYOUT */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

//         {/* === COLUMN 1: TEMPLATES & AI === */}
//         <div className="lg:col-span-4 space-y-6">

//           {/* AI GENERATOR */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
//             <div className="flex items-center gap-2">
//               <Sparkles className="w-5 h-5 text-purple-600" />
//               <h2 className="text-base font-semibold text-gray-900">✨ AI Image Generator</h2>
//             </div>
//             <p className="text-xs text-gray-400">Describe the scene you want.</p>

//             <div className="flex gap-2">
//               <input
//                 type="text"
//                 value={aiPrompt}
//                 onChange={(e) => setAiPrompt(e.target.value)}
//                 placeholder="Modern plant shop, warm lighting..."
//                 className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 disabled={aiLoading}
//               />
//               <button
//                 onClick={generateAIBanner}
//                 disabled={aiLoading || !aiPrompt.trim()}
//                 className="px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
//               >
//                 {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
//                 Generate
//               </button>
//             </div>

//             {aiGeneratedImages.length > 0 && (
//               <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-xs font-semibold text-gray-700">AI Generated</span>
//                   <div className="flex gap-2">
//                     <button onClick={() => setAiGeneratedImages([])} className="text-xs text-gray-400 hover:text-red-500">Discard</button>
//                     <button onClick={() => handleApproveAiImage(selectedAiImage)} className="text-xs bg-[#0f5a2e] text-white px-3 py-1 rounded-full font-medium">
//                       Approve ✅
//                     </button>
//                   </div>
//                 </div>
//                 <div className="w-full aspect-[2.5/1] rounded-lg overflow-hidden border border-gray-200 bg-white relative">
//                   <img src={selectedAiImage?.url || aiGeneratedImages[0].url} alt="AI" className="w-full h-full object-cover" />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* TEMPLATES */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center gap-2">
//                 <Layout className="w-5 h-5 text-blue-600" />
//                 <h2 className="text-base font-semibold text-gray-900">📐 Templates</h2>
//               </div>
//               <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
//                 {filteredTemplates.length} templates
//               </span>
//             </div>

//             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
//               {categoriesList.map((cat) => (
//                 <button
//                   key={cat}
//                   onClick={() => setTemplateFilter(cat)}
//                   className={`px-3 py-1 text-[10px] font-medium rounded-full whitespace-nowrap ${
//                     templateFilter === cat
//                       ? 'bg-green-100 text-green-700 border border-green-200'
//                       : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//                   }`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>

//             <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
//               {filteredTemplates.map((template) => (
//                 <button
//                   key={template.id}
//                   onClick={() => loadTemplate(template)}
//                   className={`group relative aspect-[2.5/1] rounded-lg overflow-hidden border-2 ${
//                     selectedTemplate?.id === template.id
//                       ? 'border-green-500 ring-2 ring-green-500/20'
//                       : 'border-gray-200 hover:border-green-300'
//                   }`}
//                 >
//                   <img src={template.image} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
//                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                     <span className="text-white text-[10px] font-bold bg-green-600 px-3 py-1.5 rounded-full">Use Template</span>
//                   </div>
//                   {selectedTemplate?.id === template.id && (
//                     <div className="absolute top-1 right-1">
//                       <span className="bg-green-500 text-white rounded-full p-1">
//                         <CheckCircle2 className="w-4 h-4" />
//                       </span>
//                     </div>
//                   )}
//                   <div className="absolute bottom-1 left-1 right-1">
//                     <span className="text-[8px] text-white bg-black/50 px-2 py-0.5 rounded block truncate text-center">
//                       {template.name}
//                     </span>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* BANNER INFO */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
//             <h2 className="text-base font-semibold text-gray-900">Banner Information</h2>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (Internal) <span className="text-red-500">*</span></label>
//               <input
//                 type="text"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
//                 placeholder="Summer Sale Banner"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner Type</label>
//               <select name="bannerType" value={formData.bannerType} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
//                 <option value="Hero Large">Hero Banner (Large)</option>
//                 <option value="Hero Small">Hero Banner (Small)</option>
//                 <option value="Sidebar">Sidebar</option>
//                 <option value="Popup">Popup</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Link Type</label>
//               <select name="linkType" value={formData.linkType} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
//                 <option value="None">No Link</option>
//                 <option value="Category">Category</option>
//                 <option value="Product">Product</option>
//                 <option value="Custom URL">Custom URL</option>
//               </select>
//             </div>

//             {formData.linkType === 'Category' && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Category</label>
//                 <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
//                   <option value="">Choose a category...</option>
//                   {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
//                 </select>
//               </div>
//             )}

//             {formData.linkType === 'Product' && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Product</label>
//                 <select name="productId" value={formData.productId} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
//                   <option value="">Choose a product...</option>
//                   {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
//                 </select>
//               </div>
//             )}

//             {formData.linkType === 'Custom URL' && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Custom URL</label>
//                 <input
//                   type="text"
//                   name="customUrl"
//                   value={formData.customUrl}
//                   onChange={handleChange}
//                   className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
//                   placeholder="https://..."
//                 />
//               </div>
//             )}

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
//               <input
//                 type="number"
//                 name="order"
//                 value={formData.order}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
//               />
//             </div>

//             <div className="flex items-center justify-between pt-2">
//               <div>
//                 <label className="text-sm font-medium text-gray-700">Active</label>
//                 <p className="text-xs text-gray-500">Inactive banners are hidden.</p>
//               </div>
//               <button
//                 onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full ${formData.isActive ? 'bg-green-600' : 'bg-gray-200'}`}
//               >
//                 <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* === COLUMN 2: DESIGN + PREVIEW === */}
//         <div className="lg:col-span-5 space-y-6">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
//             <div>
//               <h2 className="text-base font-semibold text-gray-900">Banner Image</h2>
//               <p className="text-xs text-gray-400 mt-1">Upload a high-resolution image or use a template/AI above.</p>
//             </div>

//             {/* Image upload area */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Image <span className="text-red-500">*</span></label>
//               <div className="w-full aspect-[2.5/1] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-green-400">
//                 <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
//                 {imagePreview ? (
//                   <div className="w-full h-full relative">
//                     <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
//                     <button
//                       onClick={() => {
//                         setImagePreview(null);
//                         setFormData((prev) => ({ ...prev, image: '' }));
//                         if (fileInputRef.current) fileInputRef.current.value = '';
//                       }}
//                       className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-red-50"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                     <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
//                       <button onClick={triggerFileInput} className="px-4 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-lg hover:bg-black/70">
//                         Replace Image
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <button onClick={triggerFileInput} disabled={uploadingImage} className="flex flex-col items-center gap-3 text-gray-500 hover:text-green-600 p-4">
//                     {uploadingImage ? (
//                       <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#2B7A4B] border-t-transparent" />
//                     ) : (
//                       <>
//                         <UploadCloud className="w-12 h-12 text-gray-300" />
//                         <div className="text-center">
//                           <span className="text-sm font-medium block">Click to upload</span>
//                           <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (Max 5MB)</span>
//                         </div>
//                       </>
//                     )}
//                   </button>
//                 )}
//               </div>
//               <p className="text-xs text-gray-400 mt-2">Recommended: 1920x768 (2.5:1)</p>
//             </div>
//           </div>

//           {/* ✅ LIVE PREVIEW */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <div>
//                 <h2 className="text-base font-semibold text-gray-900">Live Preview</h2>
//                 <p className="text-xs text-gray-400 mt-1">See how it looks on different devices.</p>
//               </div>
//             </div>

//             <div className="bg-gray-50 rounded-xl p-1.5 border border-gray-200 flex gap-1 mb-6 w-fit">
//               {[
//                 { key: 'desktop', icon: Monitor, label: 'Desktop' },
//                 { key: 'tablet', icon: Tablet, label: 'Tablet' },
//                 { key: 'mobile', icon: Smartphone, label: 'Mobile' },
//               ].map(({ key, icon: Icon, label }) => (
//                 <button
//                   key={key}
//                   onClick={() => setPreviewDevice(key)}
//                   className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
//                     previewDevice === key ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   <Icon className="w-3.5 h-3.5" /> {label}
//                 </button>
//               ))}
//             </div>

//             <div className={`mx-auto rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200 transition-all duration-300 ${getPreviewWrapperStyles()}`}>
//               <div className="relative w-full h-full bg-gray-100">
//                 <img
//                   src={imagePreview || 'https://placehold.co/1920x768/e2e8f0/94a3b8?text=Your+Banner+Preview'}
//                   alt="Banner Preview"
//                   className="w-full h-full object-cover"
//                 />

//                 {/* Overlay */}
//                 <div
//                   className="absolute inset-0 pointer-events-none"
//                   style={{
//                     backgroundColor:
//                       formData.overlayType === 'Dark'
//                         ? `rgba(0,0,0,${formData.overlayOpacity / 100})`
//                         : formData.overlayType === 'Light'
//                         ? `rgba(255,255,255,${formData.overlayOpacity / 100})`
//                         : 'transparent',
//                   }}
//                 />

//                 {/* ✅ Button — positioned per admin config */}
//                 <div className={`absolute ${buttonPositionClass} z-10`}>
//                   <button
//                     className={`inline-flex items-center gap-2 font-semibold transition-all ${buttonSizeClass} ${buttonRadiusClass}`}
//                     style={getPreviewButtonStyle()}
//                   >
//                     {formData.button.text || 'Shop Now'}
//                     {formData.button.showArrow && <ChevronRight className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* === COLUMN 3: DISPLAY & STYLING === */}
//         <div className="lg:col-span-3 space-y-6">

//           {/* ✅ BUTTON CUSTOMIZATION — The main event */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
//                 <Sparkles className="w-4 h-4 text-[#0f5a2e]" />
//               </div>
//               <h2 className="text-base font-semibold text-gray-900">Button Customization</h2>
//             </div>

//             {/* Text */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Text</label>
//               <input
//                 type="text"
//                 value={formData.button.text}
//                 onChange={(e) => handleButtonChange('text', e.target.value)}
//                 placeholder="Shop Now"
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
//               />
//             </div>

//             {/* Position */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
//               <select
//                 value={formData.button.position}
//                 onChange={(e) => handleButtonChange('position', e.target.value)}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
//               >
//                 <option value="Center">Center</option>
//                 <option value="Center Left">Center Left</option>
//                 <option value="Center Right">Center Right</option>
//                 <option value="Bottom Left">Bottom Left</option>
//                 <option value="Bottom Center">Bottom Center</option>
//                 <option value="Bottom Right">Bottom Right</option>
//                 <option value="Top Left">Top Left</option>
//                 <option value="Top Right">Top Right</option>
//               </select>
//             </div>

//             {/* Size */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Size</label>
//               <div className="grid grid-cols-3 gap-2">
//                 {['Small', 'Medium', 'Large'].map((size) => (
//                   <button
//                     key={size}
//                     onClick={() => handleButtonChange('size', size)}
//                     className={`py-2 rounded-lg text-xs font-medium border ${
//                       formData.button.size === size
//                         ? 'bg-[#0f5a2e] text-white border-[#0f5a2e]'
//                         : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
//                     }`}
//                   >
//                     {size}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Style */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Style</label>
//               <div className="grid grid-cols-3 gap-2">
//                 {['Solid', 'Outline', 'Ghost'].map((style) => (
//                   <button
//                     key={style}
//                     onClick={() => handleButtonChange('style', style)}
//                     className={`py-2 rounded-lg text-xs font-medium border ${
//                       formData.button.style === style
//                         ? 'bg-[#0f5a2e] text-white border-[#0f5a2e]'
//                         : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
//                     }`}
//                   >
//                     {style}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Colors */}
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs font-medium text-gray-500 mb-1">Background</label>
//                 <input
//                   type="color"
//                   value={formData.button.bgColor}
//                   onChange={(e) => handleButtonChange('bgColor', e.target.value)}
//                   className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
//                 <input
//                   type="color"
//                   value={formData.button.textColor}
//                   onChange={(e) => handleButtonChange('textColor', e.target.value)}
//                   className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
//                 />
//               </div>
//             </div>

//             {/* Border Radius */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Shape</label>
//               <select
//                 value={formData.button.borderRadius}
//                 onChange={(e) => handleButtonChange('borderRadius', e.target.value)}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
//               >
//                 <option value="none">Square</option>
//                 <option value="sm">Slightly Rounded</option>
//                 <option value="md">Rounded</option>
//                 <option value="lg">More Rounded</option>
//                 <option value="full">Pill</option>
//               </select>
//             </div>

//             {/* Show Arrow */}
//             <label className="flex items-center gap-2 text-sm text-gray-700 pt-2">
//               <input
//                 type="checkbox"
//                 checked={formData.button.showArrow}
//                 onChange={(e) => handleButtonChange('showArrow', e.target.checked)}
//                 className="rounded border-gray-300 text-[#0f5a2e]"
//               />
//               Show arrow icon
//             </label>
//           </div>

//           {/* Display Settings */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
//             <h2 className="text-base font-semibold text-gray-900">Display</h2>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Show On</label>
//               <div className="space-y-2">
//                 <label className="flex items-center gap-2 text-sm">
//                   <input type="checkbox" checked={formData.showOnDesktop} onChange={() => setFormData((p) => ({ ...p, showOnDesktop: !p.showOnDesktop }))} className="rounded border-gray-300" />
//                   Desktop
//                 </label>
//                 <label className="flex items-center gap-2 text-sm">
//                   <input type="checkbox" checked={formData.showOnTablet} onChange={() => setFormData((p) => ({ ...p, showOnTablet: !p.showOnTablet }))} className="rounded border-gray-300" />
//                   Tablet
//                 </label>
//                 <label className="flex items-center gap-2 text-sm">
//                   <input type="checkbox" checked={formData.showOnMobile} onChange={() => setFormData((p) => ({ ...p, showOnMobile: !p.showOnMobile }))} className="rounded border-gray-300" />
//                   Mobile
//                 </label>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
//               <input
//                 type="datetime-local"
//                 name="startDate"
//                 value={formData.startDate}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
//               <input
//                 type="datetime-local"
//                 name="endDate"
//                 value={formData.endDate}
//                 onChange={handleChange}
//                 className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Show on Pages</label>
//               <div className="grid grid-cols-2 gap-2 text-xs">
//                 <label className="flex items-center gap-2">
//                   <input type="checkbox" checked={formData.showOnPages.home} onChange={() => handlePagesChange('home')} className="rounded border-gray-300" />
//                   Home
//                 </label>
//                 <label className="flex items-center gap-2">
//                   <input type="checkbox" checked={formData.showOnPages.shop} onChange={() => handlePagesChange('shop')} className="rounded border-gray-300" />
//                   Shop
//                 </label>
//                 <label className="flex items-center gap-2">
//                   <input type="checkbox" checked={formData.showOnPages.category} onChange={() => handlePagesChange('category')} className="rounded border-gray-300" />
//                   Category
//                 </label>
//                 <label className="flex items-center gap-2">
//                   <input type="checkbox" checked={formData.showOnPages.product} onChange={() => handlePagesChange('product')} className="rounded border-gray-300" />
//                   Product
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* Overlay */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
//             <h2 className="text-base font-semibold text-gray-900">Overlay</h2>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
//               <select name="overlayType" value={formData.overlayType} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
//                 <option value="Dark">Dark</option>
//                 <option value="Light">Light</option>
//                 <option value="None">None</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Opacity</label>
//               <div className="flex items-center gap-4">
//                 <input
//                   type="range"
//                   name="overlayOpacity"
//                   min="0"
//                   max="100"
//                   value={formData.overlayOpacity}
//                   onChange={handleChange}
//                   className="w-full"
//                 />
//                 <span className="text-sm font-semibold w-12">{formData.overlayOpacity}%</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ADDITIONAL SETTINGS */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
//         <h2 className="text-base font-semibold text-gray-900">Additional Settings</h2>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">Top Margin (px)</label>
//             <input type="number" name="marginTop" value={formData.marginTop} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">Bottom Margin (px)</label>
//             <input type="number" name="marginBottom" value={formData.marginBottom} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">Animation</label>
//             <select name="animation" value={formData.animation} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
//               <option value="Fade In">Fade In</option>
//               <option value="Slide Up">Slide Up</option>
//               <option value="None">None</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (ms)</label>
//             <input type="number" name="animationDuration" value={formData.animationDuration} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
//           </div>
//           <div className="md:col-span-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">Alt Text (SEO)</label>
//             <input
//               type="text"
//               name="altText"
//               value={formData.altText}
//               onChange={handleChange}
//               className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg"
//               placeholder="Summer sale banner"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }











// new version 17/9/2026

// app/admin/dashboard/banners/create/page.js
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import {
  Save, Trash2, UploadCloud, Monitor, Tablet, Smartphone,
  Layout, CheckCircle2, Sparkles,
  ChevronRight, Loader2, Wand2, Move, Tag
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

// ============================================================
// 🎨 BANNER TEMPLATES (button now uses x/y %)
// ============================================================
const BANNER_TEMPLATES = [
  {
    id: 1, name: 'Modern Nature', category: 'Nature', recommended: true,
    image: 'https://images.unsplash.com/photo-1542559137-8f88a8c56c4e?w=1920&h=768&fit=crop&crop=center&q=80',
    buttonText: 'Shop Now',
    overlayType: 'Dark', overlayOpacity: 30,
    buttonX: 50, buttonY: 50,
    buttonWidth: 160, buttonHeight: 48,
    buttonStyle: 'Solid', buttonBgColor: '#0f5a2e', buttonTextColor: '#FFFFFF',
    badge: null,
  },
  {
    id: 2, name: 'Urban Jungle', category: 'Modern', recommended: false,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1920&h=768&fit=crop&crop=center&q=80',
    buttonText: 'Browse Collection',
    overlayType: 'Dark', overlayOpacity: 40,
    buttonX: 20, buttonY: 50,
    buttonWidth: 200, buttonHeight: 52,
    buttonStyle: 'Solid', buttonBgColor: '#ffffff', buttonTextColor: '#0f5a2e',
    badge: { text: 'New', bg: '#f59e0b', color: '#fff', x: 20, y: 30, shape: 'pill' },
  },
  {
    id: 3, name: 'Spring Bloom', category: 'Seasonal', recommended: false,
    image: 'https://images.unsplash.com/photo-1520412099556-4024751c3834?w=1920&h=768&fit=crop&crop=center&q=80',
    buttonText: 'Explore Now',
    overlayType: 'Light', overlayOpacity: 20,
    buttonX: 50, buttonY: 82,
    buttonWidth: 160, buttonHeight: 48,
    buttonStyle: 'Solid', buttonBgColor: '#0f5a2e', buttonTextColor: '#FFFFFF',
    badge: { text: '50% OFF', bg: '#dc2626', color: '#fff', x: 82, y: 22, shape: 'pill' },
  },
  {
    id: 4, name: 'Minimalist', category: 'Modern', recommended: false,
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1920&h=768&fit=crop&crop=center&q=80',
    buttonText: 'Shop the Sale',
    overlayType: 'Dark', overlayOpacity: 30,
    buttonX: 50, buttonY: 50,
    buttonWidth: 160, buttonHeight: 48,
    buttonStyle: 'Outline', buttonBgColor: 'transparent', buttonTextColor: '#FFFFFF',
    badge: null,
  },
  {
    id: 5, name: 'Golden Hour', category: 'Seasonal', recommended: false,
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1920&h=768&fit=crop&crop=center&q=80',
    buttonText: 'Shop Sale',
    overlayType: 'Dark', overlayOpacity: 35,
    buttonX: 18, buttonY: 82,
    buttonWidth: 160, buttonHeight: 48,
    buttonStyle: 'Solid', buttonBgColor: '#f59e0b', buttonTextColor: '#FFFFFF',
    badge: { text: '🔥 Hot', bg: '#dc2626', color: '#fff', x: 82, y: 22, shape: 'pill' },
  },
  {
    id: 6, name: 'Fresh Start', category: 'Nature', recommended: false,
    image: 'https://images.unsplash.com/photo-1509423358764-83c59f3b7e6c?w=1920&h=768&fit=crop&crop=center&q=80',
    buttonText: 'Shop New',
    overlayType: 'Dark', overlayOpacity: 25,
    buttonX: 82, buttonY: 50,
    buttonWidth: 140, buttonHeight: 46,
    buttonStyle: 'Ghost', buttonBgColor: 'transparent', buttonTextColor: '#FFFFFF',
    badge: null,
  },
];

const BUTTON_SIZE_CLASSES = {
  Small: 'px-4 py-2 text-xs',
  Medium: 'px-6 py-3 text-sm',
  Large: 'px-8 py-4 text-base',
  Custom: '',
};

const BUTTON_RADIUS_CLASSES = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full',
};

const BADGE_SHAPES = { pill: 'rounded-full', square: 'rounded-none', rounded: 'rounded-lg' };

export default function CreateBannerPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const bannerRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [previewDevice, setPreviewDevice] = useState('desktop');

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateFilter, setTemplateFilter] = useState('All');

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // ============================================================
  // ✅ CLEAN FORM STATE
  // ============================================================
  const [formData, setFormData] = useState({
    title: '',
    bannerType: 'Hero Large',
    linkType: 'None',
    categoryId: '',
    productId: '',
    customUrl: '',
    image: '',
    order: 1,
    isActive: true,

    showOnDesktop: true, showOnTablet: true, showOnMobile: true,
    startDate: '', endDate: '',
    showOnPages: { home: true, shop: false, category: false, product: false },

    overlayType: 'Dark',
    overlayOpacity: 30,

    button: {
      text: 'Shop Now',
      x: 50, y: 50,
      width: 160, height: 48,
      size: 'Custom',
      style: 'Solid',
      bgColor: '#0f5a2e',
      textColor: '#FFFFFF',
      hoverBgColor: '#0a4221',
      borderRadius: 'md',
      showArrow: true,
    },

    badge: {
      enabled: false,
      text: '50% OFF',
      x: 82, y: 22,
      bgColor: '#dc2626',
      textColor: '#FFFFFF',
      shape: 'pill',
      fontSize: 14,
      paddingX: 14,
      paddingY: 6,
    },

    marginTop: 0,
    marginBottom: 0,
    animation: 'Fade In',
    animationDuration: 800,
    altText: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // ============================================================
  // 🚀 AI GENERATION
  // ============================================================
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGeneratedImages, setAiGeneratedImages] = useState([]);
  const [selectedAiImage, setSelectedAiImage] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const generateAIBanner = async () => {
    if (!aiPrompt.trim()) { setError('Please enter a prompt for the AI.'); return; }
    setAiLoading(true); setError(''); setAiGeneratedImages([]); setSelectedAiImage(null);
    try {
      const res = await axios.post('/api/replicate/generate', { prompt: aiPrompt });
      if (res.data.imageUrl) {
        setAiGeneratedImages([{ url: res.data.imageUrl }]);
        setSelectedAiImage({ url: res.data.imageUrl });
        setRetryCount(0);
      } else setError('AI generation failed.');
    } catch (err) {
      if (retryCount < 3) {
        setRetryCount(p => p + 1);
        setError(`AI generation failed. Try again (Attempt ${retryCount + 1}/3)`);
      } else {
        setError('AI generation failed after 3 attempts.');
        setRetryCount(0);
      }
    } finally { setAiLoading(false); }
  };

  const handleApproveAiImage = (imageObj) => {
    if (!imageObj?.url) return;
    setImagePreview(imageObj.url);
    setFormData(prev => ({ ...prev, image: imageObj.url }));
    setAiGeneratedImages([]); setSelectedAiImage(null);
    if (!formData.title) setFormData(prev => ({ ...prev, title: aiPrompt.substring(0, 50) }));
    if (!formData.altText) setFormData(prev => ({ ...prev, altText: aiPrompt }));
  };

  // ============================================================
  // ✅ FETCH DATA — all inside the effect (fixes set-state-in-effect)
  // ============================================================
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/categories`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/products`, { withCredentials: true }),
        ]);
        if (cancelled) return;

        const catData = Array.isArray(catRes.data)
          ? catRes.data
          : catRes.data?.categories || catRes.data?.data || [];
        const prodData = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.products || prodRes.data?.data || [];

        setCategories(catData);
        setProducts(prodData);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/admin/login');
        } else {
          console.error('Failed to load data:', err);
        }
      }
    };

    load();

    return () => { cancelled = true; };
  }, [router]);

  // ============================================================
  // IMAGE UPLOAD
  // ============================================================
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!cloudName || !uploadPreset) { setError('Cloudinary configuration missing.'); return; }
    setUploadingImage(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, fd);
      setImagePreview(res.data.secure_url);
      setFormData(prev => ({ ...prev, image: res.data.secure_url }));
    } catch { setError('Failed to upload image.'); }
    finally { setUploadingImage(false); }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  // ============================================================
  // ✅ TEMPLATE LOADER
  // ============================================================
  const loadTemplate = (template) => {
    setSelectedTemplate(template);
    setImagePreview(template.image);
    setFormData(prev => ({
      ...prev,
      image: template.image,
      title: template.name + ' Banner',
      overlayType: template.overlayType,
      overlayOpacity: template.overlayOpacity,
      button: {
        ...prev.button,
        text: template.buttonText,
        x: template.buttonX ?? 50,
        y: template.buttonY ?? 50,
        width: template.buttonWidth ?? 160,
        height: template.buttonHeight ?? 48,
        size: 'Custom',
        style: template.buttonStyle || 'Solid',
        bgColor: template.buttonBgColor || '#0f5a2e',
        textColor: template.buttonTextColor || '#FFFFFF',
      },
      badge: template.badge
        ? { ...prev.badge, ...template.badge, enabled: true }
        : { ...prev.badge, enabled: false },
      altText: template.name,
    }));
    setError('');
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleButtonChange = (field, value) =>
    setFormData(prev => ({ ...prev, button: { ...prev.button, [field]: value } }));

  const handleBadgeChange = (field, value) =>
    setFormData(prev => ({ ...prev, badge: { ...prev.badge, [field]: value } }));

  const handlePagesChange = (page) =>
    setFormData(prev => ({ ...prev, showOnPages: { ...prev.showOnPages, [page]: !prev.showOnPages[page] } }));

  // ============================================================
  // ✅ DRAG LOGIC
  // ============================================================
  const handleDragStart = (target) => (e) => {
    e.preventDefault();
    setDragging(target);
  };

  const handleDragMove = useCallback((e) => {
    if (!dragging || !bannerRef.current) return;
    const rect = bannerRef.current.getBoundingClientRect();
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    let xPct = ((clientX - rect.left) / rect.width) * 100;
    let yPct = ((clientY - rect.top) / rect.height) * 100;
    xPct = Math.max(0, Math.min(100, xPct));
    yPct = Math.max(0, Math.min(100, yPct));
    if (dragging === 'button') {
      setFormData(prev => ({ ...prev, button: { ...prev.button, x: Math.round(xPct), y: Math.round(yPct) } }));
    } else if (dragging === 'badge') {
      setFormData(prev => ({ ...prev, badge: { ...prev.badge, x: Math.round(xPct), y: Math.round(yPct) } }));
    }
  }, [dragging]);

  const handleDragEnd = useCallback(() => setDragging(null), []);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [dragging, handleDragMove, handleDragEnd]);

  // ============================================================
  // SUBMIT
  // ============================================================
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError(''); setSuccess(''); setLoading(true);

    if (!formData.title || !formData.image) {
      setError('Please fill in Title and upload an Image.');
      setLoading(false); return;
    }

    try {
      const submissionData = {
        title: formData.title,
        bannerType: formData.bannerType,
        linkType: formData.linkType,
        categoryId: formData.linkType === 'Category' ? formData.categoryId : null,
        productId: formData.linkType === 'Product' ? formData.productId : null,
        customUrl: formData.linkType === 'Custom URL' ? formData.customUrl : null,
        image: formData.image,
        order: formData.order,
        isActive: formData.isActive,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,

        button: {
          text: formData.button.text || 'Shop Now',
          x: formData.button.x,
          y: formData.button.y,
          width: formData.button.width,
          height: formData.button.height,
          size: formData.button.size,
          style: formData.button.style,
          bgColor: formData.button.bgColor,
          textColor: formData.button.textColor,
          hoverBgColor: formData.button.hoverBgColor,
          borderRadius: formData.button.borderRadius,
          showArrow: formData.button.showArrow,
        },

        badge: formData.badge.enabled ? {
          text: formData.badge.text,
          x: formData.badge.x,
          y: formData.badge.y,
          bgColor: formData.badge.bgColor,
          textColor: formData.badge.textColor,
          shape: formData.badge.shape,
          fontSize: formData.badge.fontSize,
          paddingX: formData.badge.paddingX,
          paddingY: formData.badge.paddingY,
        } : null,

        overlayType: formData.overlayType,
        overlayOpacity: formData.overlayOpacity,
        showOnDesktop: formData.showOnDesktop,
        showOnTablet: formData.showOnTablet,
        showOnMobile: formData.showOnMobile,
        showOnPages: formData.showOnPages,
        marginTop: formData.marginTop,
        marginBottom: formData.marginBottom,
        animation: formData.animation,
        animationDuration: formData.animationDuration,
        altText: formData.altText,
      };

      const res = await axios.post(`${API_BASE_URL}/banners`, submissionData, { withCredentials: true });
      if (res.status === 201 || res.status === 200) {
        setSuccess('Banner created successfully! 🎉');
        setTimeout(() => router.push('/admin/dashboard/banners'), 1500);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) router.push('/admin/login');
      else { setError(err.response?.data?.error || 'Failed to create banner.'); setLoading(false); }
    }
  };

  const getPreviewWrapperStyles = () => {
    switch (previewDevice) {
      case 'mobile': return 'max-w-[375px] aspect-[9/16]';
      case 'tablet': return 'max-w-[768px] aspect-[4/3]';
      default: return 'max-w-full aspect-[2.5/1]';
    }
  };

  const filteredTemplates = templateFilter === 'All'
    ? BANNER_TEMPLATES
    : BANNER_TEMPLATES.filter(t => t.category === templateFilter);

  const categoriesList = ['All', ...new Set(BANNER_TEMPLATES.map(t => t.category))];

  const getPreviewButtonStyle = () => {
    const { style, bgColor, textColor } = formData.button;
    if (style === 'Solid') return { backgroundColor: bgColor, color: textColor, border: 'none' };
    if (style === 'Outline') return { backgroundColor: 'transparent', color: textColor, border: `2px solid ${textColor}` };
    return { backgroundColor: 'rgba(255,255,255,0.15)', color: textColor, border: 'none', backdropFilter: 'blur(8px)' };
  };

  const buttonSizeClass = formData.button.size !== 'Custom'
    ? BUTTON_SIZE_CLASSES[formData.button.size] || BUTTON_SIZE_CLASSES.Medium
    : '';
  const buttonRadiusClass = BUTTON_RADIUS_CLASSES[formData.button.borderRadius] || BUTTON_RADIUS_CLASSES.md;

  const buttonStyle = {
    position: 'absolute',
    left: `${formData.button.x}%`,
    top: `${formData.button.y}%`,
    transform: 'translate(-50%, -50%)',
    ...getPreviewButtonStyle(),
    ...(formData.button.size === 'Custom'
      ? { width: `${formData.button.width}px`, height: `${formData.button.height}px` }
      : {}),
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="space-y-8 pb-12 max-w-[1600px] mx-auto">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/dashboard/banners" className="hover:text-green-600">Banners</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Create New Banner</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Banner</h1>
          <p className="text-gray-500 text-sm mt-1">Drag the button or badge anywhere in the preview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard/banners" className="px-6 py-2.5 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
          <button onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0f5a2e] text-white rounded-lg text-sm font-medium hover:bg-[#0a4221] shadow-md disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Publish Banner</>}
          </button>
        </div>
      </div>

      {(error || success) && (
        <div className="px-4">
          {error && <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-3 mb-4">⚠️ {error}</div>}
          {success && <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-3 mb-4">✅ {success}</div>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ============ COLUMN 1 ============ */}
        <div className="lg:col-span-4 space-y-6">

          {/* AI */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-semibold text-gray-900">✨ AI Image Generator</h2>
            </div>
            <p className="text-xs text-gray-400">Describe the scene you want.</p>
            <div className="flex gap-2">
              <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                placeholder="Modern plant shop, warm lighting..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={aiLoading} />
              <button onClick={generateAIBanner} disabled={aiLoading || !aiPrompt.trim()}
                className="px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Generate
              </button>
            </div>
            {aiGeneratedImages.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">AI Generated</span>
                  <div className="flex gap-2">
                    <button onClick={() => setAiGeneratedImages([])} className="text-xs text-gray-400 hover:text-red-500">Discard</button>
                    <button onClick={() => handleApproveAiImage(selectedAiImage)} className="text-xs bg-[#0f5a2e] text-white px-3 py-1 rounded-full font-medium">Approve ✅</button>
                  </div>
                </div>
                <div className="w-full aspect-[2.5/1] rounded-lg overflow-hidden border border-gray-200 bg-white relative">
                  <Image
                    src={selectedAiImage?.url || aiGeneratedImages[0].url}
                    alt="AI generated banner"
                    fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>

          {/* TEMPLATES */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">📐 Templates</h2>
              </div>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{filteredTemplates.length} templates</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categoriesList.map(cat => (
                <button key={cat} onClick={() => setTemplateFilter(cat)}
                  className={`px-3 py-1 text-[10px] font-medium rounded-full whitespace-nowrap ${templateFilter === cat ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {filteredTemplates.map(t => (
                <button key={t.id} onClick={() => loadTemplate(t)}
                  className={`group relative aspect-[2.5/1] rounded-lg overflow-hidden border-2 ${selectedTemplate?.id === t.id ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-200 hover:border-green-300'}`}>
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    sizes="200px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-bold bg-green-600 px-3 py-1.5 rounded-full">Use Template</span>
                  </div>
                  {selectedTemplate?.id === t.id && (
                    <span className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1"><CheckCircle2 className="w-4 h-4" /></span>
                  )}
                  <span className="absolute bottom-1 left-1 right-1 text-[8px] text-white bg-black/50 px-2 py-0.5 rounded block truncate text-center">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* BANNER INFO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Banner Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (Internal) <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" placeholder="Summer Sale Banner" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner Type</label>
              <select name="bannerType" value={formData.bannerType} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <option value="Hero Large">Hero Banner (Large)</option>
                <option value="Hero Small">Hero Banner (Small)</option>
                <option value="Sidebar">Sidebar</option>
                <option value="Popup">Popup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Link Type</label>
              <select name="linkType" value={formData.linkType} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <option value="None">No Link</option>
                <option value="Category">Category</option>
                <option value="Product">Product</option>
                <option value="Custom URL">Custom URL</option>
              </select>
            </div>
            {formData.linkType === 'Category' && (
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <option value="">Choose a category...</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            )}
            {formData.linkType === 'Product' && (
              <select name="productId" value={formData.productId} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <option value="">Choose a product...</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            )}
            {formData.linkType === 'Custom URL' && (
              <input type="text" name="customUrl" value={formData.customUrl} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" placeholder="https://..." />
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Order</label>
              <input type="number" name="order" value={formData.order} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Active</label>
                <p className="text-xs text-gray-500">Inactive banners are hidden.</p>
              </div>
              <button onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${formData.isActive ? 'bg-green-600' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ============ COLUMN 2 ============ */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Banner Image</h2>
              <p className="text-xs text-gray-400 mt-1">Upload a high-resolution image or use a template/AI above.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Image <span className="text-red-500">*</span></label>
              <div className="w-full aspect-[2.5/1] bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group hover:border-green-400">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                {imagePreview ? (
                  <div className="w-full h-full relative">
                    <Image
                      src={imagePreview}
                      alt="Banner preview"
                      fill
                      sizes="(max-width: 1024px) 100vw, 600px"
                      className="object-cover"
                      unoptimized={imagePreview.startsWith('blob:')}
                    />
                    <button onClick={() => { setImagePreview(null); setFormData(p => ({ ...p, image: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-red-50 z-10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                      <button onClick={triggerFileInput} className="px-4 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-lg hover:bg-black/70">Replace Image</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={triggerFileInput} disabled={uploadingImage} className="flex flex-col items-center gap-3 text-gray-500 hover:text-green-600 p-4">
                    {uploadingImage ? <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#2B7A4B] border-t-transparent" /> : (
                      <>
                        <UploadCloud className="w-12 h-12 text-gray-300" />
                        <div className="text-center">
                          <span className="text-sm font-medium block">Click to upload</span>
                          <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (Max 5MB)</span>
                        </div>
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">Recommended: 1920x768 (2.5:1)</p>
            </div>
          </div>

          {/* LIVE PREVIEW */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Live Preview</h2>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Move className="w-3 h-3" /> Drag the button / badge to reposition.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-1.5 border border-gray-200 flex gap-1 mb-6 w-fit">
              {[
                { key: 'desktop', icon: Monitor, label: 'Desktop' },
                { key: 'tablet', icon: Tablet, label: 'Tablet' },
                { key: 'mobile', icon: Smartphone, label: 'Mobile' },
              ].map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => setPreviewDevice(key)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${previewDevice === key ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>

            <div ref={bannerRef}
              className={`mx-auto rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200 transition-all duration-300 ${getPreviewWrapperStyles()} ${dragging ? 'select-none' : ''}`}>
              <div className="relative w-full h-full bg-gray-100">
                <Image
                  src={imagePreview || 'https://placehold.co/1920x768/e2e8f0/94a3b8?text=Your+Banner+Preview'}
                  alt="Banner Preview"
                  fill
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover pointer-events-none"
                  draggable={false}
                  unoptimized={!imagePreview || imagePreview.startsWith('blob:')}
                />

                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor:
                      formData.overlayType === 'Dark' ? `rgba(0,0,0,${formData.overlayOpacity / 100})`
                        : formData.overlayType === 'Light' ? `rgba(255,255,255,${formData.overlayOpacity / 100})`
                        : 'transparent',
                  }} />

                {formData.badge.enabled && formData.badge.text && (
                  <div
                    onMouseDown={handleDragStart('badge')}
                    onTouchStart={handleDragStart('badge')}
                    className={`absolute z-20 cursor-move font-bold shadow-md ${BADGE_SHAPES[formData.badge.shape] || 'rounded-full'} ${dragging === 'badge' ? 'ring-2 ring-blue-400' : ''}`}
                    style={{
                      left: `${formData.badge.x}%`,
                      top: `${formData.badge.y}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: formData.badge.bgColor,
                      color: formData.badge.textColor,
                      fontSize: `${formData.badge.fontSize}px`,
                      padding: `${formData.badge.paddingY}px ${formData.badge.paddingX}px`,
                    }}>
                    {formData.badge.text}
                  </div>
                )}

                <button
                  onMouseDown={handleDragStart('button')}
                  onTouchStart={handleDragStart('button')}
                  className={`absolute z-10 inline-flex items-center justify-center gap-2 font-semibold transition-shadow cursor-move ${buttonSizeClass} ${buttonRadiusClass} ${dragging === 'button' ? 'ring-2 ring-blue-400 shadow-2xl' : ''}`}
                  style={buttonStyle}>
                  {formData.button.text || 'Shop Now'}
                  {formData.button.showArrow && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Tip:</strong> Drag the green button or the badge to reposition them freely.
                Position is saved as a percentage, so it scales perfectly on every screen.
              </p>
            </div>
          </div>
        </div>

        {/* ============ COLUMN 3 ============ */}
        <div className="lg:col-span-3 space-y-6">

          {/* BUTTON CUSTOMIZATION */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#0f5a2e]" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Button Customization</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Text</label>
              <input type="text" value={formData.button.text} onChange={e => handleButtonChange('text', e.target.value)}
                placeholder="Shop Now" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <Move className="w-3 h-3" /> Position (drag or adjust)
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>X</span><span>{formData.button.x}%</span></div>
                <input type="range" min="0" max="100" value={formData.button.x}
                  onChange={e => handleButtonChange('x', Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Y</span><span>{formData.button.y}%</span></div>
                <input type="range" min="0" max="100" value={formData.button.y}
                  onChange={e => handleButtonChange('y', Number(e.target.value))} className="w-full" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Size Preset</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['Small', 'Medium', 'Large', 'Custom'].map(size => (
                  <button key={size} onClick={() => handleButtonChange('size', size)}
                    className={`py-1.5 rounded-lg text-[10px] font-medium border ${formData.button.size === size ? 'bg-[#0f5a2e] text-white border-[#0f5a2e]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {formData.button.size === 'Custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Width (px)</label>
                  <input type="number" min="40" max="600" value={formData.button.width}
                    onChange={e => handleButtonChange('width', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Height (px)</label>
                  <input type="number" min="24" max="200" value={formData.button.height}
                    onChange={e => handleButtonChange('height', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['Solid', 'Outline', 'Ghost'].map(style => (
                  <button key={style} onClick={() => handleButtonChange('style', style)}
                    className={`py-2 rounded-lg text-xs font-medium border ${formData.button.style === style ? 'bg-[#0f5a2e] text-white border-[#0f5a2e]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Background</label>
                <input type="color" value={formData.button.bgColor} onChange={e => handleButtonChange('bgColor', e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
                <input type="color" value={formData.button.textColor} onChange={e => handleButtonChange('textColor', e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Shape</label>
              <select value={formData.button.borderRadius} onChange={e => handleButtonChange('borderRadius', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <option value="none">Square</option>
                <option value="sm">Slightly Rounded</option>
                <option value="md">Rounded</option>
                <option value="lg">More Rounded</option>
                <option value="full">Pill</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 pt-2">
              <input type="checkbox" checked={formData.button.showArrow} onChange={e => handleButtonChange('showArrow', e.target.checked)}
                className="rounded border-gray-300 text-[#0f5a2e]" />
              Show arrow icon
            </label>
          </div>

          {/* PEAK DETAILS / BADGE */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Tag className="w-4 h-4 text-orange-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Peak Details</h2>
              </div>
              <button onClick={() => handleBadgeChange('enabled', !formData.badge.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${formData.badge.enabled ? 'bg-orange-500' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.badge.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {formData.badge.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Badge Text</label>
                  <input type="text" value={formData.badge.text} onChange={e => handleBadgeChange('text', e.target.value)}
                    placeholder="50% OFF" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                  <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <Move className="w-3 h-3" /> Position
                  </span>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>X</span><span>{formData.badge.x}%</span></div>
                    <input type="range" min="0" max="100" value={formData.badge.x}
                      onChange={e => handleBadgeChange('x', Number(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Y</span><span>{formData.badge.y}%</span></div>
                    <input type="range" min="0" max="100" value={formData.badge.y}
                      onChange={e => handleBadgeChange('y', Number(e.target.value))} className="w-full" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Background</label>
                    <input type="color" value={formData.badge.bgColor} onChange={e => handleBadgeChange('bgColor', e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
                    <input type="color" value={formData.badge.textColor} onChange={e => handleBadgeChange('textColor', e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Shape</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['pill', 'rounded', 'square'].map(shape => (
                      <button key={shape} onClick={() => handleBadgeChange('shape', shape)}
                        className={`py-2 rounded-lg text-xs font-medium border capitalize ${formData.badge.shape === shape ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Font</label>
                    <input type="number" min="8" max="40" value={formData.badge.fontSize}
                      onChange={e => handleBadgeChange('fontSize', Number(e.target.value))}
                      className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Pad X</label>
                    <input type="number" min="4" max="60" value={formData.badge.paddingX}
                      onChange={e => handleBadgeChange('paddingX', Number(e.target.value))}
                      className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Pad Y</label>
                    <input type="number" min="2" max="40" value={formData.badge.paddingY}
                      onChange={e => handleBadgeChange('paddingY', Number(e.target.value))}
                      className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Display settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Display</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Show On</label>
              <div className="space-y-2">
                {[['showOnDesktop', 'Desktop'], ['showOnTablet', 'Tablet'], ['showOnMobile', 'Mobile']].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={formData[key]} onChange={() => setFormData(p => ({ ...p, [key]: !p[key] }))} className="rounded border-gray-300" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
              <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
              <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Show on Pages</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['home', 'shop', 'category', 'product'].map(p => (
                  <label key={p} className="flex items-center gap-2 capitalize">
                    <input type="checkbox" checked={formData.showOnPages[p]} onChange={() => handlePagesChange(p)} className="rounded border-gray-300" />
                    {p}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Overlay */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Overlay</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <select name="overlayType" value={formData.overlayType} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <option value="Dark">Dark</option>
                <option value="Light">Light</option>
                <option value="None">None</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Opacity</label>
              <div className="flex items-center gap-4">
                <input type="range" name="overlayOpacity" min="0" max="100" value={formData.overlayOpacity} onChange={handleChange} className="w-full" />
                <span className="text-sm font-semibold w-12">{formData.overlayOpacity}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADDITIONAL SETTINGS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">Additional Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Top Margin (px)</label>
            <input type="number" name="marginTop" value={formData.marginTop} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bottom Margin (px)</label>
            <input type="number" name="marginBottom" value={formData.marginBottom} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Animation</label>
            <select name="animation" value={formData.animation} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <option value="Fade In">Fade In</option>
              <option value="Slide Up">Slide Up</option>
              <option value="None">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (ms)</label>
            <input type="number" name="animationDuration" value={formData.animationDuration} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" />
          </div>
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alt Text (SEO)</label>
            <input type="text" name="altText" value={formData.altText} onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg" placeholder="Summer sale banner" />
          </div>
        </div>
      </div>
    </div>
  );
}