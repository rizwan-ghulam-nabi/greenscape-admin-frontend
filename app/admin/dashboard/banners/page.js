// // app/admin/dashboard/banners/page.js
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';
// import {
//   Plus, Pencil, Trash2, Search, Eye,
//   ChevronLeft, ChevronRight, Image as ImageIcon,
//   LayoutGrid, Tag
// } from 'lucide-react';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

// export default function BannersPage() {
//   const router = useRouter();
//   const [banners, setBanners] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8;

//   // Delete Modal
//   const [deleteId, setDeleteId] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);

//   // ===== FETCH BANNERS =====
//   useEffect(() => {
//     fetchBanners();
//   }, []);

//   const fetchBanners = async () => {
//     try {
//       setLoading(true);

//       const res = await axios.get(`${API_BASE_URL}/banners`, {
//         withCredentials: true,
//       });

//       // ✅ Handle multiple response shapes safely
//       let bannersData = [];

//       if (Array.isArray(res.data)) {
//         bannersData = res.data;
//       } else if (Array.isArray(res.data?.banners)) {
//         bannersData = res.data.banners;
//       } else if (Array.isArray(res.data?.data)) {
//         bannersData = res.data.data;
//       } else {
//         console.warn('⚠️ Unexpected banners response shape:', res.data);
//       }

//       console.log('📥 Banners fetched:', bannersData.length);
//       setBanners(bannersData);
//     } catch (err) {
//       console.error('❌ Error fetching banners:', err);
//       if (err.response?.status === 401 || err.response?.status === 403) {
//         router.push('/admin/login');
//       } else {
//         setBanners([]); // ✅ Always an array
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle Delete
//   const handleDelete = async () => {
//     try {
//       await axios.delete(`${API_BASE_URL}/banners/${deleteId}`, {
//         withCredentials: true,
//       });

//       setShowDeleteModal(false);
//       setDeleteId(null);
//       fetchBanners();
//     } catch (err) {
//       alert('Failed to delete banner.');
//     }
//   };

//   // Toggle Active Status
//   const toggleStatus = async (banner) => {
//     try {
//       await axios.put(
//         `${API_BASE_URL}/banners/${banner._id}`,
//         { isActive: !banner.isActive },
//         { withCredentials: true }
//       );
//       fetchBanners();
//     } catch (err) {
//       alert('Failed to update banner status.');
//     }
//   };

//   // Filter banners based on search
//   // ✅ Added Array.isArray() guard + safe field access
//   const filteredBanners = Array.isArray(banners)
//     ? banners.filter((banner) => {
//         const title = (banner.title || '').toLowerCase();
//         const type = (banner.bannerType || '').toLowerCase();
//         const search = searchTerm.toLowerCase();
//         return title.includes(search) || type.includes(search);
//       })
//     : [];

//   // Pagination logic
//   const totalPages = Math.ceil(filteredBanners.length / itemsPerPage) || 1;
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedBanners = filteredBanners.slice(
//     startIndex,
//     startIndex + itemsPerPage
//   );

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B7A4B]"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 pb-10">
      
//       {/* --- HEADER --- */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//             <Link href="/admin/dashboard" className="hover:text-green-600">
//               Dashboard
//             </Link>
//             <span>›</span>
//             <span className="text-green-700 font-medium">Banners</span>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Manage your website banners and promotional images.
//           </p>
//         </div>
//         <Link
//           href="/admin/dashboard/banners/create"
//           className="flex items-center gap-2 px-4 py-2.5 bg-[#0f5a2e] text-white rounded-lg font-medium hover:bg-[#0a4221] transition-colors shadow-sm"
//         >
//           <Plus className="w-4 h-4" />
//           Create New Banner
//         </Link>
//       </div>

//       {/* --- SEARCH BAR --- */}
//       <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search banners by title or type..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
//           />
//         </div>
//       </div>

//       {/* --- BANNERS TABLE --- */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   Banner
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   Type
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   Order
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {paginatedBanners.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
//                     {searchTerm
//                       ? 'No banners found matching your search.'
//                       : 'No banners created yet. Create your first banner!'}
//                   </td>
//                 </tr>
//               ) : (
//                 paginatedBanners.map((banner) => (
//                   <tr key={banner._id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-14 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
//                           <img
//                             src={
//                               banner.image ||
//                               'https://placehold.co/200x100/e2e8f0/1e293b?text=No+Image'
//                             }
//                             alt={banner.title || 'Banner'}
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
//                         <div>
//                           <p className="font-medium text-gray-900">
//                             {banner.title || 'Untitled Banner'}
//                           </p>
//                           <p className="text-xs text-gray-500 line-clamp-1">
//                             {banner.linkType !== 'None'
//                               ? `Links to: ${banner.linkType}`
//                               : 'No Link'}
//                           </p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {banner.bannerType || 'Hero Large'}
//                     </td>
//                     <td className="px-6 py-4 text-sm">
//                       <button
//                         onClick={() => toggleStatus(banner)}
//                         className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
//                           banner.isActive
//                             ? 'bg-green-100 text-green-700 hover:bg-green-200'
//                             : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
//                         }`}
//                       >
//                         {banner.isActive ? 'Active' : 'Inactive'}
//                       </button>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-600 text-center">
//                       {banner.order || 1}
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex items-center justify-end gap-2">
//                         <Link
//                           href={`/admin/dashboard/banners/edit/${banner._id}`}
//                           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                         >
//                           <Pencil className="w-4 h-4" />
//                         </Link>
//                         <button
//                           onClick={() => {
//                             setDeleteId(banner._id);
//                             setShowDeleteModal(true);
//                           }}
//                           className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* --- PAGINATION --- */}
//         {filteredBanners.length > 0 && (
//           <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
//             <p className="text-sm text-gray-500">
//               Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
//               <span className="font-medium">
//                 {Math.min(startIndex + itemsPerPage, filteredBanners.length)}
//               </span>{' '}
//               of <span className="font-medium">{filteredBanners.length}</span> results
//             </p>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => handlePageChange(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </button>
//               <span className="text-sm font-medium text-gray-700">
//                 Page {currentPage} of {totalPages}
//               </span>
//               <button
//                 onClick={() => handlePageChange(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* --- DELETE CONFIRMATION MODAL --- */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
//             <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Banner</h3>
//             <p className="text-gray-600 mb-6">
//               Are you sure you want to delete this banner? This action cannot be undone.
//             </p>
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









// new verion 17/9/2026

// app/admin/dashboard/banners/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Plus, Pencil, Trash2, Search,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function BannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Delete Modal
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ============================================================
  // ✅ FETCH BANNERS — inside useEffect, with cleanup flag
  // ============================================================
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE_URL}/banners`, {
        withCredentials: true,
      });

      // ✅ Handle multiple response shapes safely
      let bannersData = [];
      if (Array.isArray(res.data)) {
        bannersData = res.data;
      } else if (Array.isArray(res.data?.banners)) {
        bannersData = res.data.banners;
      } else if (Array.isArray(res.data?.data)) {
        bannersData = res.data.data;
      } else {
        console.warn('⚠️ Unexpected banners response shape:', res.data);
      }

      console.log('📥 Banners fetched:', bannersData.length);
      setBanners(bannersData);
    } catch (err) {
      console.error('❌ Error fetching banners:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/admin/login');
      } else {
        setBanners([]); // ✅ Always an array
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${API_BASE_URL}/banners`, {
          withCredentials: true,
        });

        // ✅ Safe multi-shape parsing
        let bannersData = [];
        if (Array.isArray(res.data)) {
          bannersData = res.data;
        } else if (Array.isArray(res.data?.banners)) {
          bannersData = res.data.banners;
        } else if (Array.isArray(res.data?.data)) {
          bannersData = res.data.data;
        } else {
          console.warn('⚠️ Unexpected banners response shape:', res.data);
        }

        if (cancelled) return; // ⛔ prevent setState after unmount
        setBanners(bannersData);
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/admin/login');
        } else {
          setBanners([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => { cancelled = true; };
  }, [router]);

  // Handle Delete
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/banners/${deleteId}`, {
        withCredentials: true,
      });

      setShowDeleteModal(false);
      setDeleteId(null);

      // Refetch in a fresh async context (not sync in effect)
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/banners`, {
          withCredentials: true,
        });
        const bannersData = Array.isArray(res.data)
          ? res.data
          : res.data?.banners || res.data?.data || [];
        setBanners(bannersData);
      } catch (e) {
        setBanners([]);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      alert('Failed to delete banner.');
    }
  };

  // Toggle Active Status
  const toggleStatus = async (banner) => {
    try {
      await axios.put(
        `${API_BASE_URL}/banners/${banner._id}`,
        { isActive: !banner.isActive },
        { withCredentials: true }
      );

      // Optimistic update instead of full refetch
      setBanners((prev) =>
        prev.map((b) =>
          b._id === banner._id ? { ...b, isActive: !b.isActive } : b
        )
      );
    } catch (err) {
      alert('Failed to update banner status.');
    }
  };

  // Filter banners based on search
  const filteredBanners = Array.isArray(banners)
    ? banners.filter((banner) => {
        const title = (banner.title || '').toLowerCase();
        const type = (banner.bannerType || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return title.includes(search) || type.includes(search);
      })
    : [];

  // Pagination
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBanners = filteredBanners.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B7A4B]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-green-600">
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-green-700 font-medium">Banners</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your website banners and promotional images.
          </p>
        </div>
        <Link
          href="/admin/dashboard/banners/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0f5a2e] text-white rounded-lg font-medium hover:bg-[#0a4221] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Banner
        </Link>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search banners by title or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
          />
        </div>
      </div>

      {/* --- BANNERS TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Banner
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedBanners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm
                      ? 'No banners found matching your search.'
                      : 'No banners created yet. Create your first banner!'}
                  </td>
                </tr>
              ) : (
                paginatedBanners.map((banner) => {
                  const imageSrc =
                    banner.image ||
                    'https://placehold.co/200x100/e2e8f0/1e293b?text=No+Image';
                  const isRemote = imageSrc.startsWith('http');

                  return (
                    <tr key={banner._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                            {/* ✅ Next.js Image */}
                            <Image
                              src={imageSrc}
                              alt={banner.title || 'Banner'}
                              fill
                              sizes="56px"
                              className="object-cover"
                              unoptimized={!isRemote || imageSrc.includes('placehold.co')}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {banner.title || 'Untitled Banner'}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {banner.linkType !== 'None'
                                ? `Links to: ${banner.linkType}`
                                : 'No Link'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {banner.bannerType || 'Hero Large'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => toggleStatus(banner)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            banner.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">
                        {banner.order || 1}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/dashboard/banners/edit/${banner._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setDeleteId(banner._id);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* --- PAGINATION --- */}
        {filteredBanners.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredBanners.length)}
              </span>{' '}
              of <span className="font-medium">{filteredBanners.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Banner</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this banner? This action cannot be undone.
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