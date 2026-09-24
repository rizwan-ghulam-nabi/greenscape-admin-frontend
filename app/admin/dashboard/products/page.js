// app/admin/dashboard/products/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { 
  Plus, Pencil, Trash2, Search, Leaf,
  ChevronLeft, ChevronRight, Menu, X, LayoutDashboard,
  Eye, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import Image from 'next/image';

const API_BASE_URL = 'http://localhost:5001/api/admin';

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ===== STATE FOR REAL CATEGORIES =====
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Delete Modal
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  
   // ===== 3. USE EFFECT THIRD (after functions) =====
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


 const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`, {
        withCredentials: true,
      });

      let productsData = res.data;
      if (productsData && productsData.data && Array.isArray(productsData.data)) {
        productsData = productsData.data;
      } else if (productsData && productsData.products && Array.isArray(productsData.products)) {
        productsData = productsData.products;
      } else if (productsData && productsData.success && productsData.data && Array.isArray(productsData.data)) {
        productsData = productsData.data;
      } else if (!Array.isArray(productsData)) {
        productsData = [];
      }

      setProducts(productsData);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/admin/login');
      }
      setLoading(false);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`, {
        withCredentials: true,
      });
      setCategories(res.data || []);
      setLoadingCategories(false);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setLoadingCategories(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await axios.delete(`${API_BASE_URL}/products/${deleteId}`, {
        withCredentials: true,
      });
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleting(false);
      fetchProducts();
      showToast('Product deleted successfully!', 'success');
    } catch (err) {
      setDeleting(false);
      showToast('Failed to delete product.', 'error');
    }
  };

  const toggleProductStatus = async (id, currentStatus) => {
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/products/${id}/toggle-status`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        fetchProducts();
        showToast(
          `Product ${currentStatus ? 'deactivated' : 'activated'} successfully!`,
          'success'
        );
      }
    } catch (err) {
      showToast('Failed to toggle product status.', 'error');
    }
  };




  // ===== FILTERING LOGIC =====
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    const matchesStock = filterStock === 'all' || 
                         (filterStock === 'in-stock' && product.stock > 0) ||
                         (filterStock === 'low-stock' && product.stock > 0 && product.stock <= 10) ||
                         (filterStock === 'out-of-stock' && product.stock === 0);

    const matchesStatus = filterStatus === 'all' ||
                          (filterStatus === 'active' && product.isActive) ||
                          (filterStatus === 'inactive' && !product.isActive);

    return matchesSearch && matchesCategory && matchesStock && matchesStatus;
  });

  // ===== PAGINATION LOGIC =====
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const clearFilters = () => {
    setFilterCategory('all');
    setFilterStock('all');
    setFilterStatus('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return { text: 'Out of Stock', className: 'bg-red-100 text-red-700' };
    } else if (stock <= 10) {
      return { text: `Low Stock (${stock})`, className: 'bg-yellow-100 text-yellow-700' };
    } else {
      return { text: `In Stock (${stock})`, className: 'bg-green-100 text-green-700' };
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
    <div className="relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
           toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
           <Clock className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: '', type: '' })}>
            <X className="w-4 h-4 hover:text-gray-600" />
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Manage your product inventory.</p>
        </div>
        
        {/* Action Buttons Container */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterMenuOpen(true)}
            className="flex items-center justify-center p-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors relative"
          >
            <Menu className="w-5 h-5" />
            {(filterCategory !== 'all' || filterStock !== 'all' || filterStatus !== 'all') && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#2B7A4B] rounded-full border-2 border-white"></span>
            )}
          </button>

          <Link 
            href="/admin/dashboard/products/create" 
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name, category, or SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterCategory !== 'all' || filterStock !== 'all' || filterStatus !== 'all' 
                      ? 'No products found matching your filters.' 
                      : 'No products yet. Add your first product!'}
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const stockBadge = getStockBadge(product.stock);
                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                            <img 
                              src={product.image || '/placeholder-product.png'} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/placeholder-product.png';
                              }}
                            />
                          </div> */}


 {/* use Image instead of img */}
 
 <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative">
  <Image
    src={product.image || '/placeholder-product.png'}
    alt={product.name || 'Product'}
    fill
    sizes="48px"
    className="object-cover"
    unoptimized
    onError={(e) => {
      e.currentTarget.src = '/placeholder-product.png';
    }}
  />
</div>



                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500">SKU: {product.sku || 'N/A'}</p>
                              {product.isFeatured && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded-full">
                                  Featured
                                </span>
                              )}
                              {product.isBestSeller && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-semibold rounded-full">
                                  Best Seller
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                    

{/* change currency from Usd to Pkr */}
<td className="px-6 py-4 text-sm font-medium text-gray-900">
  Rs. {product.price.toLocaleString('en-PK')}
  {product.oldPrice && product.oldPrice > product.price && (
    <span className="ml-2 text-xs text-red-500 line-through">
      Rs. {product.oldPrice.toLocaleString('en-PK')}
    </span>
  )}
</td>

                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockBadge.className}`}>
                          {stockBadge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleProductStatus(product._id, product.isActive)}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            product.isActive 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* View Product Button */}
                          <Link 
                            href={`/products/${product.slug || product._id}`}
                            target="_blank"
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Product"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          {/* Edit Product Button */}
                          <Link 
                            href={`/admin/dashboard/products/edit/${product._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>

                          {/* Delete Product Button */}
                          <button
                            onClick={() => {
                              setDeleteId(product._id);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
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

        {/* Pagination Controls */}
        {filteredProducts.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> of{' '}
              <span className="font-medium">{filteredProducts.length}</span> results
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

      {/* LEFT SIDE FILTER PANEL (Drawer) */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isFilterMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Leaf className="w-5 h-5 text-[#2B7A4B]" />
            <h2 className="text-lg font-bold text-gray-900">Filter Products</h2>
          </div>
          <button 
            onClick={() => setIsFilterMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Content */}
        <div className="p-6 space-y-6">
          
          <div>
            <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] bg-white"
            >
              <option value="all">All Categories</option>
              {loadingCategories ? (
                <option disabled>Loading categories...</option>
              ) : categories.length === 0 ? (
                <option disabled>No categories found</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label htmlFor="filterStock" className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
            <select
              id="filterStock"
              value={filterStock}
              onChange={(e) => {
                setFilterStock(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock (≤ 10)</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-2">Product Status</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {(filterCategory !== 'all' || filterStock !== 'all' || filterStatus !== 'all' || searchTerm) && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Filters</p>
              <div className="flex flex-wrap gap-2">
                {filterCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2B7A4B]/10 text-[#2B7A4B] text-xs font-medium rounded-full">
                    Category: {filterCategory}
                  </span>
                )}
                {filterStock !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2B7A4B]/10 text-[#2B7A4B] text-xs font-medium rounded-full">
                    Stock: {filterStock.replace('-', ' ')}
                  </span>
                )}
                {filterStatus !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2B7A4B]/10 text-[#2B7A4B] text-xs font-medium rounded-full">
                    Status: {filterStatus}
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2B7A4B]/10 text-[#2B7A4B] text-xs font-medium rounded-full">
                    Search: {searchTerm}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Panel Actions */}
          <div className="pt-6 mt-auto space-y-3">
            <button
              onClick={() => {
                setIsFilterMenuOpen(false);
                window.location.href = '/admin/dashboard';
              }}
              className="flex items-center gap-2 w-full py-3 px-4 bg-gray-50 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <LayoutDashboard className="w-4 h-4" />
              Back to Dashboard
            </button>

            <button
              onClick={clearFilters}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop Overlay for Left Panel */}
      {isFilterMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsFilterMenuOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone and will remove all associated data.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}