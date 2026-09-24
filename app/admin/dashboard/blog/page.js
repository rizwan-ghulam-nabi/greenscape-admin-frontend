// // app/admin/dashboard/blog/page.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';
// import { 
//   Plus, Search, Filter, MoreHorizontal, Eye, Pencil, Trash2, 
//   FileText, CheckCircle, Clock, AlertCircle, X, RefreshCw
// } from 'lucide-react';

// const API_BASE_URL = 'http://localhost:5001/api/admin';

// export default function BlogPostsPage() {
//   const router = useRouter();
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Stats State
//   const [stats, setStats] = useState({
//     total: 0,
//     published: 0,
//     drafts: 0,
//     trash: 0
//   });

//   // Filter State
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterCategory, setFilterCategory] = useState('all');
//   const [filterAuthor, setFilterAuthor] = useState('all');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;

//   // Modal State
//   const [deleteId, setDeleteId] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);

//   // === Fetch Blog Posts ===
//   const fetchBlogPosts = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const params = new URLSearchParams({
//         page: currentPage,
//         limit: itemsPerPage,
//         search: searchTerm,
//         category: filterCategory !== 'all' ? filterCategory : '',
//         author: filterAuthor !== 'all' ? filterAuthor : '',
//         status: filterStatus !== 'all' ? filterStatus : ''
//       });

//       const res = await axios.get(`${API_BASE_URL}/blog?${params}`, {
//         withCredentials: true,
//         timeout: 10000
//       });

//       console.log('📦 Blog Posts API Response:', res.data);

//       if (res.data && res.data.success) {
//         setPosts(res.data.posts || []);
        
//         // Calculate stats from response
//         if (res.data.pagination) {
//           setStats(prev => ({ ...prev, total: res.data.pagination.total || res.data.posts?.length || 0 }));
//         }
//       }
      
//       setLoading(false);
//     } catch (err) {
//       console.error('❌ Error fetching blog posts:', err);
      
//       if (err.response?.status === 401) {
//         router.push('/admin/login');
//       } else {
//         setError('Failed to load blog posts.');
//       }
//       setLoading(false);
//     }
//   };

//   // === Fetch Blog Stats ===
//   const fetchBlogStats = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/blog/stats`, {
//         withCredentials: true,
//         timeout: 10000
//       });

//       if (res.data && res.data.success) {
//         setStats(res.data.stats);
//       }
//     } catch (err) {
//       console.error('❌ Error fetching blog stats:', err);
//     }
//   };

//   // === Initial Load ===
//   useEffect(() => {
//     fetchBlogPosts();
//     fetchBlogStats();
//   }, []);

//   // === Fetch on Filter Change ===
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       fetchBlogPosts();
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [currentPage, searchTerm, filterCategory, filterAuthor, filterStatus]);

//   // === Calculate Stats from Posts ===
//   const calculateStats = (data) => {
//     setStats({
//       total: data.length,
//       published: data.filter(p => p.status === 'Published').length,
//       drafts: data.filter(p => p.status === 'Draft').length,
//       trash: data.filter(p => p.status === 'Trash').length,
//     });
//   };

//   // === Handle Delete ===
//   const handleDelete = async () => {
//     try {
//       await axios.delete(`${API_BASE_URL}/blog/${deleteId}`, {
//         withCredentials: true
//       });
      
//       setPosts(posts.filter(p => p._id !== deleteId));
//       setShowDeleteModal(false);
//       setDeleteId(null);
      
//       // Refresh stats
//       fetchBlogStats();
      
//       alert('✅ Post deleted successfully');
//     } catch (err) {
//       console.error('❌ Error deleting post:', err);
//       alert(`❌ ${err.response?.data?.error || 'Failed to delete post'}`);
//       setShowDeleteModal(false);
//       setDeleteId(null);
//     }
//   };

//   // === Filtering Logic (Client-side for display) ===
//   const filteredPosts = posts.filter(post => {
//     const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                           post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
//     const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    
//     return matchesSearch && matchesCategory && matchesStatus;
//   });

//   // === Pagination Logic ===
//   const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedPosts = filteredPosts.slice(startIndex, startIndex + itemsPerPage);

//   // === Helpers ===
//   const getStatusBadge = (status) => {
//     const styles = {
//       'Published': 'bg-green-100 text-green-700',
//       'Draft': 'bg-orange-100 text-orange-700',
//       'Trash': 'bg-red-100 text-red-700',
//     };
//     return styles[status] || 'bg-gray-100 text-gray-700';
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
//            ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
//   };

//   // === Loading State ===
//   if (loading && posts.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96 w-full">
//         <div className="flex flex-col items-center gap-3">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B7A4B]"></div>
//           <p className="text-sm text-gray-500 animate-pulse">Loading blog posts...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
      
//       {/* --- Header --- */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//             <Link href="/admin/dashboard" className="hover:text-green-600 transition-colors">Dashboard</Link>
//             <span>›</span>
//             <span className="text-gray-900 font-medium">Blog Posts</span>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
//           <p className="text-sm text-gray-500 mt-1">Manage and organize your blog posts.</p>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => {
//               fetchBlogPosts();
//               fetchBlogStats();
//             }}
//             className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
//             title="Refresh"
//           >
//             <RefreshCw className="w-4 h-4 text-gray-600" />
//           </button>
//           <div className="relative bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center shadow-sm w-full sm:w-64">
//             <Search className="w-4 h-4 text-gray-400 mr-2" />
//             <input
//               type="text"
//               placeholder="Search here..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="bg-transparent border-none outline-none text-sm text-gray-700 w-full"
//             />
//           </div>
//           <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
//             <Filter className="w-4 h-4 text-gray-600" />
//           </button>
//         </div>
//       </div>

//       {/* --- Error Message --- */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
//           <AlertCircle className="w-4 h-4" />
//           {error}
//           <button 
//             onClick={() => { setError(null); fetchBlogPosts(); }}
//             className="ml-auto text-red-600 hover:text-red-800 font-medium"
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       {/* --- Stats Cards --- */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard 
//           icon={<FileText className="w-5 h-5 text-green-600" />}
//           bgColor="bg-green-50"
//           label="Total Posts"
//           value={stats.total}
//           subtext="All posts"
//           chartColor="stroke-green-500"
//         />
//         <StatCard 
//           icon={<CheckCircle className="w-5 h-5 text-orange-600" />}
//           bgColor="bg-orange-50"
//           label="Published"
//           value={stats.published}
//           subtext={`${stats.total > 0 ? Math.round((stats.published/stats.total)*100) : 0}% of total`}
//           chartColor="stroke-orange-400"
//         />
//         <StatCard 
//           icon={<Clock className="w-5 h-5 text-blue-600" />}
//           bgColor="bg-blue-50"
//           label="Drafts"
//           value={stats.drafts}
//           subtext={`${stats.total > 0 ? Math.round((stats.drafts/stats.total)*100) : 0}% of total`}
//           chartColor="stroke-blue-400"
//         />
//         <StatCard 
//           icon={<Trash2 className="w-5 h-5 text-purple-600" />}
//           bgColor="bg-purple-50"
//           label="Trash"
//           value={stats.trash}
//           subtext={`${stats.total > 0 ? Math.round((stats.trash/stats.total)*100) : 0}% of total`}
//           chartColor="stroke-purple-400"
//         />
//       </div>

//       {/* --- Main Data Card --- */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
//         {/* Card Header */}
//         <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//           <div>
//             <h2 className="text-lg font-bold text-gray-900">All Blog Posts</h2>
//             <p className="text-sm text-gray-500 mt-1">Manage and organize your blog posts.</p>
//           </div>
//           <Link 
//             href="/admin/dashboard/blog/create" 
//             className="flex items-center gap-2 px-4 py-2 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e] transition-colors shadow-sm"
//           >
//             <Plus className="w-4 h-4" />
//             Add New Post
//           </Link>
//         </div>

//         {/* Filters Bar */}
//         <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-3">
//           <select 
//             value={filterCategory}
//             onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
//             className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
//           >
//             <option value="all">All Categories</option>
//             {[...new Set(posts.map(p => p.category))].filter(Boolean).map(cat => (
//               <option key={cat} value={cat}>{cat}</option>
//             ))}
//           </select>

//           <select 
//             value={filterStatus}
//             onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
//             className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
//           >
//             <option value="all">All Status</option>
//             <option value="Published">Published</option>
//             <option value="Draft">Draft</option>
//             <option value="Trash">Trash</option>
//           </select>

//           <button 
//             onClick={() => {
//               setSearchTerm('');
//               setFilterCategory('all');
//               setFilterStatus('all');
//               setCurrentPage(1);
//             }}
//             className="px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
//           >
//             Clear Filters
//           </button>
//         </div>

//         {/* Data Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50/80 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Post</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
//                 <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {posts.length === 0 ? (
//                 <tr>
//                   <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
//                     <div className="flex flex-col items-center gap-3">
//                       <FileText className="w-10 h-10 text-gray-300" />
//                       <p>No blog posts found.</p>
//                       <Link 
//                         href="/admin/dashboard/blog/create"
//                         className="text-sm text-[#2B7A4B] hover:text-green-800 font-medium"
//                       >
//                         + Create your first post
//                       </Link>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 posts.map((post) => (
//                   <tr key={post._id || post.id} className="hover:bg-gray-50 transition-colors group">
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
//                           {post.image ? (
//                             <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
//                           ) : (
//                             <div className="w-full h-full flex items-center justify-center bg-gray-100">
//                               <FileText className="w-5 h-5 text-gray-400" />
//                             </div>
//                           )}
//                         </div>
//                         <div>
//                           <p className="font-medium text-gray-900 text-sm">{post.title || 'Untitled'}</p>
//                           <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{post.excerpt || 'No excerpt'}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2 text-sm text-gray-600">
//                         <span className="p-1 bg-green-50 text-green-600 rounded-md">
//                           <FileText className="w-3 h-3" />
//                         </span>
//                         {post.category || 'Uncategorized'}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2 text-sm text-gray-600">
//                         <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-[10px] font-bold text-green-700">
//                           {post.author?.firstName?.[0] || post.author?.name?.[0] || 'A'}
//                         </div>
//                         {post.author?.firstName || post.author?.name || 'Admin'} {post.author?.lastName || ''}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(post.status)}`}>
//                         <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${(
//                           post.status === 'Published' ? 'bg-green-600' :
//                           post.status === 'Draft' ? 'bg-orange-600' :
//                           'bg-red-600'
//                         )}`}></span>
//                         {post.status || 'Draft'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
//                       {formatDate(post.createdAt)}
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
//                           <Eye className="w-4 h-4" />
//                         </button>
//                         <Link href={`/admin/dashboard/blog/edit/${post._id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
//                           <Pencil className="w-4 h-4" />
//                         </Link>
//                         <button 
//                           onClick={() => {
//                             setDeleteId(post._id);
//                             setShowDeleteModal(true);
//                           }}
//                           className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                         <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
//                           <MoreHorizontal className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {posts.length > 0 && (
//           <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
//             <p className="text-sm text-gray-500">
//               Showing <span className="font-medium">{posts.length}</span> posts
//             </p>
//             <button
//               onClick={() => {
//                 setCurrentPage(prev => prev + 1);
//                 fetchBlogPosts();
//               }}
//               className="px-4 py-2 bg-[#2B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#23663e] transition-colors"
//             >
//               Load More
//             </button>
//           </div>
//         )}
//       </div>

//       {/* --- Delete Confirmation Modal --- */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="p-2 bg-red-100 rounded-full">
//                 <AlertCircle className="w-6 h-6 text-red-600" />
//               </div>
//               <h3 className="text-lg font-bold text-gray-900">Delete Post</h3>
//             </div>
//             <p className="text-gray-600 mb-6">Are you sure you want to delete this blog post? This action cannot be undone.</p>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setShowDeleteModal(false)}
//                 className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDelete}
//                 className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // --- Stat Card Sub-component ---
// function StatCard({ icon, bgColor, label, value, subtext, chartColor }) {
//   return (
//     <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
//       <div className="flex items-center justify-between mb-2">
//         <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
//           {icon}
//         </div>
//         <div className="h-8 w-16">
//           <svg width="100%" height="100%" viewBox="0 0 60 30" preserveAspectRatio="none">
//             <path 
//               d="M0 25 Q10 20 20 22 T40 15 T60 18" 
//               fill="none" 
//               className={chartColor}
//               strokeWidth="2"
//             />
//           </svg>
//         </div>
//       </div>
//       <div>
//         <p className="text-xs font-medium text-gray-500">{label}</p>
//         <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
//         <p className="text-[10px] text-gray-400 mt-1">{subtext}</p>
//       </div>
//     </div>
//   );
// }















// new version 17/9/2026

// app/admin/dashboard/blog/page.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Plus, Search, Filter, MoreHorizontal, Eye, Pencil, Trash2,
  FileText, CheckCircle, Clock, AlertCircle, RefreshCw
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api/admin';

export default function BlogPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    trash: 0,
  });

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ✅ Bump this to force refetch without calling the fetcher manually
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ============================================================
  // ✅ DATA FETCH — all inside effect, first statement is await
  // ============================================================
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // ---- 1. Fetch Posts ----
        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          category: filterCategory !== 'all' ? filterCategory : '',
          author: filterAuthor !== 'all' ? filterAuthor : '',
          status: filterStatus !== 'all' ? filterStatus : '',
        });

        const res = await axios.get(`${API_BASE_URL}/blog?${params}`, {
          withCredentials: true,
          timeout: 10000,
        });

        if (cancelled) return;
        console.log('📦 Blog Posts API Response:', res.data);

        if (res.data?.success) {
          setPosts(res.data.posts || []);
          if (res.data.pagination) {
            setStats((prev) => ({
              ...prev,
              total:
                res.data.pagination.total ||
                res.data.posts?.length ||
                0,
            }));
          }
        }

        // ---- 2. Fetch Stats ----
        try {
          const statsRes = await axios.get(`${API_BASE_URL}/blog/stats`, {
            withCredentials: true,
            timeout: 10000,
          });
          if (cancelled) return;
          if (statsRes.data?.success) {
            setStats(statsRes.data.stats);
          }
        } catch (statErr) {
          // Not fatal — posts still loaded
          if (!cancelled) {
            console.error('❌ Error fetching blog stats:', statErr);
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.error('❌ Error fetching blog posts:', err);
        if (err.response?.status === 401) {
          router.push('/admin/login');
        } else {
          setError('Failed to load blog posts.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // ✅ Debounce for search/filter typing (only when relevant filters change)
    const timer = setTimeout(() => {
      load();
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    currentPage,
    searchTerm,
    filterCategory,
    filterAuthor,
    filterStatus,
    refreshKey,
    router,
  ]);

  // ============================================================
  // DELETE
  // ============================================================
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/blog/${deleteId}`, {
        withCredentials: true,
      });

      // Optimistic UI: remove row immediately
      setPosts((prev) => prev.filter((p) => p._id !== deleteId));
      setShowDeleteModal(false);
      setDeleteId(null);

      // Trigger refetch to sync stats + pagination
      setRefreshKey((k) => k + 1);

      alert('✅ Post deleted successfully');
    } catch (err) {
      console.error('❌ Error deleting post:', err);
      alert(`❌ ${err.response?.data?.error || 'Failed to delete post'}`);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  // ============================================================
  // Filtering (client-side)
  // ============================================================
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || post.category === filterCategory;
    const matchesStatus =
      filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ============================================================
  // Helpers
  // ============================================================
  const getStatusBadge = (status) => {
    const styles = {
      Published: 'bg-green-100 text-green-700',
      Draft: 'bg-orange-100 text-orange-700',
      Trash: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return (
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) +
      ' at ' +
      date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  // ============================================================
  // Loading
  // ============================================================
  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B7A4B]" />
          <p className="text-sm text-gray-500 animate-pulse">
            Loading blog posts...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">

      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link
              href="/admin/dashboard"
              className="hover:text-green-600 transition-colors"
            >
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Blog Posts</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and organize your blog posts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
          <div className="relative bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center shadow-sm w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search here..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none outline-none text-sm text-gray-700 w-full"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* --- Error --- */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button
            onClick={() => {
              setError(null);
              setRefreshKey((k) => k + 1);
            }}
            className="ml-auto text-red-600 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5 text-green-600" />}
          bgColor="bg-green-50"
          label="Total Posts"
          value={stats.total}
          subtext="All posts"
          chartColor="stroke-green-500"
        />
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-orange-600" />}
          bgColor="bg-orange-50"
          label="Published"
          value={stats.published}
          subtext={`${
            stats.total > 0
              ? Math.round((stats.published / stats.total) * 100)
              : 0
          }% of total`}
          chartColor="stroke-orange-400"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-blue-600" />}
          bgColor="bg-blue-50"
          label="Drafts"
          value={stats.drafts}
          subtext={`${
            stats.total > 0
              ? Math.round((stats.drafts / stats.total) * 100)
              : 0
          }% of total`}
          chartColor="stroke-blue-400"
        />
        <StatCard
          icon={<Trash2 className="w-5 h-5 text-purple-600" />}
          bgColor="bg-purple-50"
          label="Trash"
          value={stats.trash}
          subtext={`${
            stats.total > 0
              ? Math.round((stats.trash / stats.total) * 100)
              : 0
          }% of total`}
          chartColor="stroke-purple-400"
        />
      </div>

      {/* --- Main Card --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">All Blog Posts</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and organize your blog posts.
            </p>
          </div>
          <Link
            href="/admin/dashboard/blog/create"
            className="flex items-center gap-2 px-4 py-2 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Post
          </Link>
        </div>

        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
          >
            <option value="all">All Categories</option>
            {[...new Set(posts.map((p) => p.category))]
              .filter(Boolean)
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
          >
            <option value="all">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Trash">Trash</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('all');
              setFilterStatus('all');
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Clear Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Post
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-10 h-10 text-gray-300" />
                      <p>No blog posts found.</p>
                      <Link
                        href="/admin/dashboard/blog/create"
                        className="text-sm text-[#2B7A4B] hover:text-green-800 font-medium"
                      >
                        + Create your first post
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const imageSrc = post.image;
                  const isRemote = imageSrc?.startsWith('http');

                  return (
                    <tr
                      key={post._id || post.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                            {imageSrc ? (
                              /* ✅ Next.js Image */
                              <Image
                                src={imageSrc}
                                alt={post.title || 'Blog post'}
                                fill
                                sizes="48px"
                                className="object-cover"
                                unoptimized={!isRemote || imageSrc.includes('placehold.co')}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <FileText className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {post.title || 'Untitled'}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                              {post.excerpt || 'No excerpt'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="p-1 bg-green-50 text-green-600 rounded-md">
                            <FileText className="w-3 h-3" />
                          </span>
                          {post.category || 'Uncategorized'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-[10px] font-bold text-green-700">
                            {post.author?.firstName?.[0] ||
                              post.author?.name?.[0] ||
                              'A'}
                          </div>
                          {post.author?.firstName || post.author?.name || 'Admin'}{' '}
                          {post.author?.lastName || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                            post.status
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              post.status === 'Published'
                                ? 'bg-green-600'
                                : post.status === 'Draft'
                                ? 'bg-orange-600'
                                : 'bg-red-600'
                            }`}
                          />
                          {post.status || 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/admin/dashboard/blog/edit/${post._id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setDeleteId(post._id);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {posts.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{posts.length}</span> posts
            </p>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 bg-[#2B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#23663e] transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>

      {/* --- Delete Modal --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Post</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this blog post? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

// ============================================================
// Stat Card sub-component
// ============================================================
function StatCard({ icon, bgColor, label, value, subtext, chartColor }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div
          className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}
        >
          {icon}
        </div>
        <div className="h-8 w-16">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 60 30"
            preserveAspectRatio="none"
          >
            <path
              d="M0 25 Q10 20 20 22 T40 15 T60 18"
              fill="none"
              className={chartColor}
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-[10px] text-gray-400 mt-1">{subtext}</p>
      </div>
    </div>
  );
}