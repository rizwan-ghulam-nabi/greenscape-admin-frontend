// app/admin/reports/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import * as XLSX from 'xlsx'; // ✅ Import Excel library
import { 
  Calendar, Download, TrendingUp, ShoppingBag, Users, 
  DollarSign, Leaf, Package, FileText, ChevronRight,
  Loader2, RefreshCw, Printer, FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

// --- Helpers ---
const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'Rs. 0';
  return `Rs. ${Number(amount).toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Color Palette
const CATEGORY_COLORS = ['#2B7A4B', '#4ADE80', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#ECFDF5'];
const STATUS_COLORS = {
  'Delivered': '#2B7A4B',
  'Processing': '#F59E0B',
  'Shipped': '#3B82F6',
  'Pending': '#9CA3AF',
  'Cancelled': '#EF4444'
};

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRangeText, setDateRangeText] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- State for Real Data ---
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProductsSold: 0,
    totalProfit: 0,
  });
  const [salesOverview, setSalesOverview] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // --- Calculate Date Range Text ---
  const getDateRangeText = (daysCount) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - daysCount);
    const format = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${format(start)} - ${format(end)}, ${end.getFullYear()}`;
  };

  // --- FETCH REAL DATA ---
  const fetchReportsData = async (daysCount = 30) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/dashboard?days=${daysCount}`, {
        withCredentials: true
      });

      if (res.data.success) {
        setStats(res.data.stats);
        setSalesOverview(res.data.salesOverview || []);
        setOrderStatus(res.data.orderStatus || []);
        setTopProducts(res.data.topProducts || []);
        setCategoryStats(res.data.categoryStats || []);
        setRecentOrders(res.data.recentOrders || []);
        setLowStockProducts(res.data.lowStockProducts || []);
        setDateRangeText(getDateRangeText(daysCount));
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reports:', err);
      if (err.response?.status === 401) {
        router.push('/admin/login');
      } else {
        setError('Failed to load reports data.');
      }
      setLoading(false);
    }
  };

  // --- Load data on initial mount ---
  useEffect(() => {
    fetchReportsData(30);
  }, []);

  // --- Handle Date Change ---
  const handleDateRangeChange = (days) => {
    fetchReportsData(days);
  };

  // --- Download as EXCEL (.xlsx) ---
  const handleDownloadExcel = async () => {
    try {
      setIsDownloading(true);

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Summary
      const summaryData = [
        ['GreenScape Sales Report'],
        [`Period: ${dateRangeText}`],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ['Metric', 'Value'],
        ['Total Revenue', stats.totalRevenue],
        ['Total Orders', stats.totalOrders],
        ['Total Customers', stats.totalCustomers],
        ['Products Sold', stats.totalProductsSold],
        ['Average Order Value', stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

      // Sheet 2: Order Status
      const orderStatusData = [
        ['Order Status', 'Count'],
        ...orderStatus.map(item => [item._id, item.count])
      ];
      const ws2 = XLSX.utils.aoa_to_sheet(orderStatusData);
      XLSX.utils.book_append_sheet(wb, ws2, 'Order Status');

      // Sheet 3: Top Products
      const topProductsData = [
        ['Rank', 'Product Name', 'Sold', 'Revenue'],
        ...topProducts.map((product, idx) => [
          idx + 1,
          product.name || 'Unknown Product',
          product.sold || 0,
          product.totalRevenue || 0
        ])
      ];
      const ws3 = XLSX.utils.aoa_to_sheet(topProductsData);
      XLSX.utils.book_append_sheet(wb, ws3, 'Top Products');

      // Sheet 4: Recent Orders
      const recentOrdersData = [
        ['Order ID', 'Customer', 'Amount', 'Status', 'Date'],
        ...recentOrders.map(order => [
          order._id.slice(-6),
          order.user?.firstName || 'Unknown',
          order.totalAmount || 0,
          order.orderStatus || 'Pending',
          new Date(order.createdAt).toLocaleDateString()
        ])
      ];
      const ws4 = XLSX.utils.aoa_to_sheet(recentOrdersData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Recent Orders');

      // Sheet 5: Sales Overview
      const salesData = [
        ['Date', 'Revenue', 'Orders'],
        ...salesOverview.map(item => [
          new Date(item._id).toLocaleDateString(),
          item.totalRevenue || 0,
          item.totalOrders || 0
        ])
      ];
      const ws5 = XLSX.utils.aoa_to_sheet(salesData);
      XLSX.utils.book_append_sheet(wb, ws5, 'Sales Overview');

      // Download the file
      XLSX.writeFile(wb, `sales-report-${new Date().toISOString().split('T')[0]}.xlsx`);

      setIsDownloading(false);
      alert('✅ Excel report downloaded successfully!');
    } catch (err) {
      console.error('Error downloading Excel:', err);
      setIsDownloading(false);
      alert('❌ Failed to download Excel report');
    }
  };

  // --- Generate Report (Text) ---
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const reportContent = generateReportContent();

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-report-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setIsGenerating(false);
      alert('✅ Report generated and downloaded successfully!');
    } catch (err) {
      console.error('Error generating report:', err);
      setIsGenerating(false);
      alert('❌ Failed to generate report');
    }
  };

  // --- Generate Report Content ---
  const generateReportContent = () => {
    const date = new Date().toLocaleString();
    let content = `=========================================\n`;
    content += `        SALES REPORT - GreenScape\n`;
    content += `=========================================\n`;
    content += `Generated: ${date}\n`;
    content += `Period: ${dateRangeText}\n`;
    content += `\n`;
    content += `--- SUMMARY ---\n`;
    content += `Total Revenue: ${formatCurrency(stats.totalRevenue)}\n`;
    content += `Total Orders: ${formatNumber(stats.totalOrders)}\n`;
    content += `Total Customers: ${formatNumber(stats.totalCustomers)}\n`;
    content += `Products Sold: ${formatNumber(stats.totalProductsSold)}\n`;
    content += `Average Order Value: ${formatCurrency(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)}\n`;
    content += `\n`;
    content += `--- ORDER STATUS ---\n`;
    orderStatus.forEach(item => {
      content += `${item._id}: ${item.count}\n`;
    });
    content += `\n`;
    content += `--- TOP PRODUCTS ---\n`;
    topProducts.forEach((product, idx) => {
      content += `${idx + 1}. ${product.name || 'Unknown'} - ${product.sold || 0} sold - ${formatCurrency(product.totalRevenue || 0)}\n`;
    });
    content += `\n`;
    content += `--- RECENT ORDERS ---\n`;
    recentOrders.forEach((order) => {
      content += `#${order._id.slice(-6)} - ${order.user?.firstName || 'Unknown'} - ${formatCurrency(order.totalAmount || 0)} - ${order.orderStatus || 'Pending'}\n`;
    });
    content += `\n`;
    content += `=========================================\n`;
    content += `        END OF REPORT\n`;
    content += `=========================================\n`;
    return content;
  };

  // --- Print Report ---
  const handlePrint = () => {
    window.print();
  };

  // --- Data Transformation for Charts ---
  const chartData = salesOverview.map(item => ({
    date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: item.totalRevenue || 0,
    orders: item.totalOrders || 0,
  }));

  // Calculate Order Status percentages
  const totalOrdersCount = orderStatus.reduce((sum, item) => sum + item.count, 0);
  const orderStatusData = orderStatus.map(item => ({
    name: item._id,
    value: item.count,
    percentage: totalOrdersCount > 0 ? Math.round((item.count / totalOrdersCount) * 100) : 0,
    color: STATUS_COLORS[item._id] || '#9CA3AF'
  }));

  // Calculate derived stats
  const averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

  // --- STATS CARDS ---
  const statCards = [
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      icon: <DollarSign className="w-5 h-5 text-[#2B7A4B]" />,
      bg: 'bg-green-50',
      color: '#2B7A4B',
      period: dateRangeText,
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingBag className="w-5 h-5 text-orange-500" />,
      bg: 'bg-orange-50',
      color: '#F97316',
      period: dateRangeText,
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: <Users className="w-5 h-5 text-blue-500" />,
      bg: 'bg-blue-50',
      color: '#3B82F6',
      period: dateRangeText,
    },
    {
      title: 'Products Sold',
      value: stats.totalProductsSold,
      icon: <Package className="w-5 h-5 text-purple-500" />,
      bg: 'bg-purple-50',
      color: '#8B5CF6',
      period: dateRangeText,
    }
  ];

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 animate-spin text-[#2B7A4B]" />
          <p className="text-sm text-gray-500 animate-pulse">Loading reports...</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-red-50 rounded-xl p-8 max-w-lg">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchReportsData(30)} 
            className="px-4 py-2 bg-[#2B7A4B] text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* --- TOP HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Link href="/admin/dashboard" className="hover:text-[#2B7A4B]">Dashboard</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Reports</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Date Picker */}
          <div className="relative group">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-[#2B7A4B] transition-colors cursor-pointer shadow-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{dateRangeText}</span>
            </div>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 overflow-hidden">
              <div className="py-1">
                <button onClick={() => handleDateRangeChange(7)} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-gray-600">Last 7 Days</button>
                <button onClick={() => handleDateRangeChange(30)} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-gray-600">Last 30 Days</button>
                <button onClick={() => handleDateRangeChange(90)} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-gray-600">Last 3 Months</button>
              </div>
            </div>
          </div>
          
          {/* Download Excel */}
          <button
            onClick={handleDownloadExcel}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-[#2B7A4B] text-white text-sm font-medium rounded-lg hover:bg-[#1d5e37] transition-colors shadow-sm disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            {isDownloading ? 'Downloading...' : 'Download Excel'}
          </button>

          {/* Generate Text Report */}
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-green-600" />}
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-gray-500" />
          </button>
          
          {/* Refresh */}
          <button
            onClick={() => fetchReportsData(30)}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* --- 1. STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {/* ✅ FIXED: Only Revenue shows Rs., others show numbers */}
                  {stat.title === 'Total Revenue' 
                    ? formatCurrency(stat.value) 
                    : formatNumber(stat.value)}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{stat.period}</p>
          </div>
        ))}
      </div>

      {/* --- 2. MIDDLE CHARTS ROW --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Sales Overview (Line Chart) */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Sales Overview</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2B7A4B]"></div>
                <span className="text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div>
                <span className="text-gray-600">Orders</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No sales data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 10 }} 
                    dy={10}
                    interval={Math.floor(chartData.length / 6)}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickFormatter={(value) => `Rs. ${value/1000}k`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value, name) => [name === 'Revenue' ? formatCurrency(value) : value, name]}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue" 
                    stroke="#2B7A4B" 
                    strokeWidth={2} 
                    dot={false} 
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders" 
                    name="Orders" 
                    stroke="#F97316" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    dot={false} 
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sales by Category (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-4">Sales by Category</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {categoryStats.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No category data</div>
            ) : (
              <>
                <div className="relative w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={categoryStats} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={60} 
                        outerRadius={80} 
                        paddingAngle={2} 
                        dataKey="value"
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-gray-500 font-medium">Total</span>
                    <span className="text-sm font-bold text-gray-900">{formatNumber(categoryStats.reduce((sum, item) => sum + item.value, 0))}</span>
                  </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-y-2 gap-x-4 mt-2">
                  {categoryStats.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}></div>
                        <span className="truncate text-gray-600">{item._id}</span>
                      </div>
                      <span className="font-medium text-gray-700 ml-2 shrink-0">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- 3. BOTTOM GRID ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Selling Products */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Top Selling Products</h3>
            <Link href="/admin/dashboard/products" className="text-xs font-medium text-[#2B7A4B] hover:text-green-800">View All</Link>
          </div>
          <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
            {topProducts.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No product data</div>
            ) : (
              topProducts.map((product, idx) => (
                <div key={idx} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">{idx + 1}</div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name || 'Unknown Product'}</p>
                    <p className="text-[10px] text-gray-400">{product.sold || 0} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(product.totalRevenue || 0)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Status Overview */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-gray-900 mb-4">Order Status Overview</h3>
          
          <div className="flex flex-col items-center flex-1 justify-center">
            {orderStatusData.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-300">0</span>
                </div>
                <span className="text-xs mt-3">No orders placed yet</span>
              </div>
            ) : (
              <>
                <div className="relative w-36 h-36 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={orderStatusData} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={50} 
                        outerRadius={70} 
                        paddingAngle={2} 
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-bold text-gray-900">{formatNumber(totalOrdersCount)}</span>
                    <span className="text-[10px] text-gray-500">Total Orders</span>
                  </div>
                </div>

                <div className="w-full space-y-1.5">
                  {orderStatusData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs px-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium text-gray-700">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Recent Orders + Low Stock */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Orders</h3>
              <Link href="/admin/dashboard/orders" className="text-xs font-medium text-[#2B7A4B] hover:text-green-800">View All</Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">No orders yet</div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs font-medium text-gray-900">#{order._id.slice(-6)}</p>
                      <p className="text-[10px] text-gray-400">{order.user?.firstName || 'Unknown'} • {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount || 0)}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.orderStatus === 'Processing' ? 'bg-blue-100 text-blue-700' :
                        order.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.orderStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Low Stock Alert</h3>
              <Link href="/admin/dashboard/inventory" className="text-xs font-medium text-[#2B7A4B] hover:text-green-800">View All</Link>
            </div>
            
            {lowStockProducts.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-4">✅ All items are well stocked</div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-900 truncate">{product.name}</span>
                    </div>
                    <span className="text-xs font-bold text-red-600">{product.stock} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}