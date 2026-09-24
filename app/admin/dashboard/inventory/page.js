'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { 
  Search, Filter, Download, Plus, 
  Eye, Pencil, Trash2, ChevronLeft, ChevronRight,
  Package, CheckCircle, AlertTriangle, XCircle,
  TrendingUp, MoreHorizontal, ArrowUpDown,
  List, LayoutGrid, UploadCloud, RefreshCw,
  X, Loader2, FileSpreadsheet, Printer
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api/admin';

export default function InventoryPage() {
  const router = useRouter();
  
  // ===== DATA STATES =====
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalValue: 0
  });

  // ===== UI STATES =====
  const [viewMode, setViewMode] = useState('table'); // table | grid
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  
  // ===== PAGINATION =====
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ===== SELECTION & BULK ACTIONS =====
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  // ===== MODALS =====
  const [adjustStockProduct, setAdjustStockProduct] = useState(null);
  const [adjustStockValue, setAdjustStockValue] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ===== SORTING =====
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // ===== CHECK AUTH ON MOUNT =====
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/me`, { withCredentials: true });
        if (!res.data?.success) {
          router.push('/admin/login');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/admin/login');
      }
    };
    
    checkAuth();
  }, [router]);

  // ===== FETCH DATA =====
  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use withCredentials to send cookies
      const res = await axios.get(`${API_BASE_URL}/products`, { 
        withCredentials: true 
      });

      if (res.data.success) {
        setProducts(res.data.data);
        setFilteredProducts(res.data.data);
        calculateStats(res.data.data);
        
        // Reset pagination
        setCurrentPage(1);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      if (err.response?.status === 401) {
        router.push('/admin/login');
      } else {
        setError('Failed to load inventory data');
        setLoading(false);
      }
    }
  };

  const calculateStats = (data) => {
    const inStock = data.filter(p => p.stock > 10).length;
    const lowStock = data.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStock = data.filter(p => p.stock === 0).length;
    const totalValue = data.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);

    setStats({
      total: data.length,
      inStock, lowStock, outOfStock, totalValue
    });
  };

  // ===== FILTERING & SEARCH (Client-Side) =====
  useEffect(() => {
    let result = products;

    // 1. Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.sku?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      );
    }

    // 2. Category Filter
    if (filterCategory !== 'all') {
      result = result.filter(p => p.category === filterCategory);
    }

    // 3. Stock Filter
    if (filterStock !== 'all') {
      if (filterStock === 'in-stock') result = result.filter(p => p.stock > 10);
      else if (filterStock === 'low-stock') result = result.filter(p => p.stock > 0 && p.stock <= 10);
      else if (filterStock === 'out-of-stock') result = result.filter(p => p.stock === 0);
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page on filter change
  }, [searchTerm, filterCategory, filterStock, products]);

  // ===== SORTING =====
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = useMemo(() => {
    let sortableItems = [...filteredProducts];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle nested or missing values
        if (!aVal) aVal = '';
        if (!bVal) bVal = '';
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProducts, sortConfig]);

  // ===== PAGINATION =====
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  // ===== SELECTION HANDLERS =====
  const handleSelectAll = (e) => {
    setSelectedIds(e.target.checked ? paginatedProducts.map(p => p._id) : []);
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // ===== BULK ACTIONS =====
  const executeBulkAction = async () => {
    if (!selectedIds.length || !bulkAction) return;
    
    setIsProcessing(true);
    try {
      if (bulkAction === 'delete') {
        await axios.delete(`${API_BASE_URL}/products/bulk`, {
          withCredentials: true,
          data: { ids: selectedIds }
        });
      } else if (bulkAction === 'export') {
        // Generate CSV
        const csvData = products.filter(p => selectedIds.includes(p._id));
        exportToCSV(csvData);
        setIsBulkActionOpen(false);
        setIsProcessing(false);
        return;
      }
      
      setIsBulkActionOpen(false);
      setSelectedIds([]);
      fetchInventoryData();
      alert('Bulk action completed successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to execute bulk action.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== STOCK ADJUSTMENT =====
  const handleStockAdjust = async () => {
    if (!adjustStockProduct) return;
    try {
      await axios.put(`${API_BASE_URL}/products/${adjustStockProduct._id}`, 
        { stock: parseInt(adjustStockValue) },
        { withCredentials: true }
      );
      setAdjustStockProduct(null);
      fetchInventoryData();
      alert('Stock updated successfully!');
    } catch (err) {
      alert('Failed to update stock.');
    }
  };

  // ===== CSV EXPORT =====
  const exportToCSV = (dataToExport) => {
    const data = dataToExport || filteredProducts;
    const headers = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Value'];
    const rows = data.map(p => [
      `"${p.name}"`, p.sku, `"${p.category}"`, p.price, p.stock, (p.price * p.stock)
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ===== HELPERS =====
  const getStockBadge = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', className: 'bg-red-50 text-red-600 border-red-200' };
    if (stock <= 10) return { label: `Low Stock (${stock})`, className: 'bg-orange-50 text-orange-600 border-orange-200' };
    return { label: `In Stock (${stock})`, className: 'bg-green-50 text-green-600 border-green-200' };
  };

  const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0 }).format(amount || 0);

  // ===== SKELETON LOADER =====
  if (loading && products.length === 0) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-red-50 rounded-xl p-8 max-w-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchInventoryData} className="px-4 py-2 bg-[#2B7A4B] text-white rounded-lg text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage stock levels, values, and product listings.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchInventoryData} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center shadow-sm">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search name, SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-gray-700 w-40 lg:w-64"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button onClick={() => exportToCSV()} className="flex items-center gap-2 px-4 py-2 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e] shadow-sm">
            <FileSpreadsheet className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard icon={Package} label="Total Products" value={stats.total} subtext="All time" color="bg-emerald-500" />
        <StatsCard icon={CheckCircle} label="In Stock" value={stats.inStock} subtext={`${Math.round((stats.inStock/stats.total)*100) || 0}% of total`} color="bg-green-500" />
        <StatsCard icon={AlertTriangle} label="Low Stock" value={stats.lowStock} subtext={`${Math.round((stats.lowStock/stats.total)*100) || 0}% of total`} color="bg-orange-500" />
        <StatsCard icon={XCircle} label="Out of Stock" value={stats.outOfStock} subtext={`${Math.round((stats.outOfStock/stats.total)*100) || 0}% of total`} color="bg-red-500" />
        <StatsCard icon={TrendingUp} label="Total Value" value={formatCurrency(stats.totalValue)} subtext="Real-time valuation" color="bg-indigo-500" />
      </div>

      {/* --- FILTER BAR --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['all', 'in-stock', 'low-stock', 'out-of-stock'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStock(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filterStock === tab ? 'bg-[#2B7A4B] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'all' ? 'All Products' : tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-[#2B7A4B]"
          >
            <option value="all">All Categories</option>
            {/* Add unique categories dynamically */}
            {[...new Set(products.map(p => p.category))].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('table')} className={`p-2 ${viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <Link href="/admin/dashboard/products/create" className="flex items-center gap-2 px-4 py-2 bg-[#2B7A4B] text-white rounded-lg font-medium hover:bg-[#23663e]">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* --- BULK ACTIONS BAR --- */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <p className="text-sm text-indigo-700 font-medium">{selectedIds.length} products selected</p>
          <div className="flex gap-2">
            <button onClick={() => setIsBulkActionOpen(true)} className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm hover:bg-indigo-50">
              Bulk Actions
            </button>
            <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-gray-500 text-sm hover:text-gray-700">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* --- DATA DISPLAY: TABLE OR GRID --- */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 w-12">
                    <input type="checkbox" className="rounded border-gray-300 text-[#2B7A4B] focus:ring-[#2B7A4B]" 
                      onChange={handleSelectAll} checked={selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0} />
                  </th>
                  {['name', 'category', 'stock'].map((key) => (
                    <th key={key} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort(key)}>
                      <div className="flex items-center gap-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                        {sortConfig.key === key && (
                          <ArrowUpDown className={`w-3 h-3 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProducts.map((product) => {
                  const stockBadge = getStockBadge(product.stock);
                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300 text-[#2B7A4B]" 
                          checked={selectedIds.includes(product._id)} onChange={() => handleSelectOne(product._id)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <img src={product.image || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.stock}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{product.sku || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stockBadge.className}`}>
                          {stockBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(product.price)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/dashboard/products/edit/${product._id}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button onClick={() => { setAdjustStockProduct(product); setAdjustStockValue(product.stock); }} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded">
                            <UploadCloud className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setDeleteId(product._id); setShowDeleteModal(true); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedProducts.length)} of {sortedProducts.length} items
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 border border-gray-200">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 px-2">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50 border border-gray-200">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* --- CARD VIEW (MOBILE / GRID) --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedProducts.map((product) => {
            const stockBadge = getStockBadge(product.stock);
            return (
              <div key={product._id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow group">
                <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                   <img src={product.image || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover" />
                   <div className="absolute top-2 right-2">
                     <input type="checkbox" className="rounded border-gray-300 text-[#2B7A4B]"
                       checked={selectedIds.includes(product._id)} onChange={() => handleSelectOne(product._id)} />
                   </div>
                </div>
                <h3 className="font-bold text-gray-800 text-sm truncate">{product.name}</h3>
                <p className="text-xs text-gray-400 mb-2">{product.sku}</p>
                <div className="flex justify-between items-center mt-2">
                   <span className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</span>
                   <span className={`text-xs px-2 py-0.5 rounded-full border ${stockBadge.className}`}>{stockBadge.label}</span>
                </div>
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Link href={`/admin/dashboard/products/edit/${product._id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</Link>
                  <button onClick={() => { setAdjustStockProduct(product); setAdjustStockValue(product.stock); }} className="text-orange-600 hover:text-orange-800 text-xs font-medium">Stock</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- BULK ACTION MODAL --- */}
      {isBulkActionOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Bulk Actions</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedIds.length} products selected.</p>
            <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg mb-4">
              <option value="">Select an action...</option>
              <option value="export">Export Selected to CSV</option>
              <option value="delete">Delete Selected Products</option>
            </select>
            <div className="flex gap-3">
              <button onClick={() => setIsBulkActionOpen(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={executeBulkAction} disabled={!bulkAction || isProcessing} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Execute'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STOCK ADJUSTMENT MODAL --- */}
      {adjustStockProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Adjust Stock: {adjustStockProduct.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Current stock: {adjustStockProduct.stock}</p>
            <input type="number" value={adjustStockValue} onChange={(e) => setAdjustStockValue(e.target.value)} 
              className="w-full p-3 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-[#2B7A4B]" />
            <div className="flex gap-3">
              <button onClick={() => setAdjustStockProduct(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleStockAdjust} className="flex-1 py-2 bg-[#2B7A4B] text-white rounded-lg hover:bg-[#23663e]">Update Stock</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={async () => {
                try {
                  await axios.delete(`${API_BASE_URL}/products/${deleteId}`, { withCredentials: true });
                  setShowDeleteModal(false);
                  fetchInventoryData();
                } catch (err) {
                  alert('Failed to delete product.');
                }
              }} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Sub-component
function StatsCard({ icon: Icon, label, value, subtext, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
        {subtext}
      </div>
    </div>
  );
}