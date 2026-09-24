// // app/admin/dashboard/page.js
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useAuth } from '@/app/context/AuthContext';
// import axios from 'axios';
// import {
//   Calendar, ShoppingBag, TrendingUp, Users, Package,
//   DollarSign, ChevronDown, ArrowUpRight, ArrowDownRight,
//   Box, Layers, Activity
// } from 'lucide-react';

// // Recharts imports
// import {
//   ResponsiveContainer,
//   ComposedChart,
//   Line,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
//   AreaChart,
//   Area
// } from 'recharts';

// const API_BASE_URL = 'http://localhost:5001/api/admin';

// // Custom Tooltip for all charts
// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-xs">
//         <p className="font-semibold text-gray-700 mb-1">{label}</p>
//         {payload.map((entry, idx) => (
//           <p key={idx} style={{ color: entry.color }} className="flex items-center gap-2">
//             {entry.name}: <span className="font-bold">{entry.value}</span>
//           </p>
//         ))}
//       </div>
//     );
//   }
//   return null;
// };

// // Color Palette
// const COLORS = ['#2B7A4B', '#3B82F6', '#F97316', '#EF4444', '#8B5CF6', '#EC4899'];

// export default function DashboardPage() {
//   const { user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // --- DATE RANGE STATE ---
//   const [days, setDays] = useState(7);
//   const [dateRangeText, setDateRangeText] = useState('');

//   // State for all data
//   const [stats, setStats] = useState({
//     totalOrders: 0,
//     totalRevenue: 0,
//     totalCustomers: 0,
//     totalProductsSold: 0,
//     totalProfit: 0,
//   });
//   const [salesOverview, setSalesOverview] = useState([]);
//   const [orderStatus, setOrderStatus] = useState([]);
//   const [recentOrders, setRecentOrders] = useState([]);
//   const [topProducts, setTopProducts] = useState([]);
//   const [lowStockProducts, setLowStockProducts] = useState([]);
//   const [categoryStats, setCategoryStats] = useState([]);
//   const [categories, setCategories] = useState([]);

//   // --- Calculate Date Range Text ---
//   const getDateRangeText = (daysCount) => {
//     const end = new Date();
//     const start = new Date();
//     start.setDate(start.getDate() - daysCount);
//     const format = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//     return `${format(start)} - ${format(end)}, ${end.getFullYear()}`;
//   };

//   // --- FETCH CATEGORIES ---
//   const fetchCategories = async () => {
//     try {
//       // Try multiple endpoints to find the right one
//       let res;
//       try {
//         res = await axios.get(`${API_BASE_URL}/categories`, {
//           withCredentials: true,
//         });
//       } catch (err) {
//         // If admin categories fails, try public categories
//         res = await axios.get(`${API_BASE_URL}/public/categories`, {
//           withCredentials: true,
//         });
//       }

//       console.log('📦 Categories API Response:', res.data);

//       // Handle different response structures
//       let categoriesData = res.data;

//       // If response is an object with data property
//       if (categoriesData && categoriesData.data && Array.isArray(categoriesData.data)) {
//         categoriesData = categoriesData.data;
//       }
//       // If response is an object with categories property
//       else if (categoriesData && categoriesData.categories && Array.isArray(categoriesData.categories)) {
//         categoriesData = categoriesData.categories;
//       }
//       // If response is an object with success/data structure
//       else if (categoriesData && categoriesData.success && categoriesData.data) {
//         categoriesData = categoriesData.data;
//       }
//       // If response is not an array, default to empty array
//       else if (!Array.isArray(categoriesData)) {
//         console.warn('⚠️ Categories data is not an array:', categoriesData);
//         categoriesData = [];
//       }

//       setCategories(categoriesData);

//       // Transform categories for pie chart
//       const categoryData = categoriesData.map(cat => ({
//         name: cat.name || 'Unnamed',
//         value: cat.products || cat.productCount || 1, // Use product count or default to 1
//       })).filter(item => item.value > 0);

//       setCategoryStats(categoryData);

//     } catch (err) {
//       console.error('❌ Error fetching categories:', err);
//       setCategories([]);
//       setCategoryStats([]);
//     }
//   };

//   // --- FETCH DASHBOARD DATA ---
//   const fetchDashboardData = async (daysCount) => {
//     try {
//       setLoading(true);

//       const res = await axios.get(`${API_BASE_URL}/dashboard?days=${daysCount}`, {
//         withCredentials: true,
//       });

//       if (res.data.success) {
//         setStats(res.data.stats);
//         setSalesOverview(res.data.salesOverview || []);
//         setOrderStatus(res.data.orderStatus || []);
//         setRecentOrders(res.data.recentOrders || []);
//         setTopProducts(res.data.topProducts || []);
//         setLowStockProducts(res.data.lowStockProducts || []);

//         // Fetch categories separately
//         await fetchCategories();
//       }
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching dashboard:', err);
//       if (err.response?.status === 401) {
//         window.location.href = '/admin/login';
//       } else {
//         setError('Failed to load dashboard data.');
//       }
//       setLoading(false);
//     }
//   };

//   // --- Load data on initial mount ---
//   useEffect(() => {
//     setDateRangeText(getDateRangeText(days));
//     fetchDashboardData(days);
//   }, []);

//   // --- Change Date Range Handler ---
//   const handleDateRangeChange = (newDays) => {
//     setDays(newDays);
//     setDateRangeText(getDateRangeText(newDays));
//     fetchDashboardData(newDays);
//   };

//   // --- HELPER FUNCTIONS ---
//   const formatCurrency = (amount) => {
//     return `Rs. ${(amount || 0).toFixed(2)}`;
//   };

//   const formatNumber = (num) => {
//     return new Intl.NumberFormat('en-US').format(num || 0);
//   };

//   const getStatusBadge = (status) => {
//     const styles = {
//       'delivered': 'bg-emerald-100 text-emerald-700',
//       'shipped': 'bg-blue-100 text-blue-700',
//       'processing': 'bg-orange-100 text-orange-700',
//       'pending': 'bg-yellow-100 text-yellow-700',
//       'cancelled': 'bg-red-100 text-red-700',
//     };
//     return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
//   };

//   // --- FIXED DATA TRANSFORMATION FOR CHARTS ---
//   // Handle different date formats from API
//   const formatDate = (dateStr) => {
//     if (!dateStr) return '';
//     try {
//       // Handle YYYY-MM-DD format
//       if (typeof dateStr === 'string' && dateStr.includes('-')) {
//         const parts = dateStr.split('-');
//         if (parts.length === 3) {
//           const month = new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-US', { month: 'short' });
//           const day = parseInt(parts[2]);
//           return `${month} ${day}`;
//         }
//       }

//       const date = new Date(dateStr);
//       if (isNaN(date.getTime())) {
//         return dateStr;
//       }
//       return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//     } catch (e) {
//       return dateStr;
//     }
//   };

//   // Transform sales overview data for charts
//   const chartData = (salesOverview || []).map(item => {
//     // Handle different possible field names
//     const date = item._id || item.date || item.day || '';
//     const revenue = item.totalRevenue || item.revenue || item.total || 0;
//     const orders = item.totalOrders || item.orders || item.count || 0;

//     return {
//       date: formatDate(date),
//       revenue: Number(revenue) || 0,
//       orders: Number(orders) || 0,
//     };
//   });

//   // Calculate profit from orders (assuming profit = revenue - cost)
//   const calculateProfit = (orders) => {
//     if (!orders || orders.length === 0) return 0;

//     let totalProfit = 0;
//     orders.forEach(order => {
//       // Assuming profit is 30% of revenue as a default calculation
//       // You can adjust this based on your business model
//       const orderProfit = (order.totalAmount || order.total || 0) * 0.3;
//       totalProfit += orderProfit;
//     });

//     return totalProfit;
//   };

//   // If no data, create a placeholder with today's data
//   const displayChartData = chartData.length > 0 ? chartData : [
//     {
//       date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
//       revenue: stats.totalRevenue || 0,
//       orders: stats.totalOrders || 0
//     }
//   ];

//   // Group data by month for monthly view
//   const monthlyData = (salesOverview || []).reduce((acc, item) => {
//     const date = new Date(item._id || item.date || item.day);
//     const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

//     if (!acc[monthKey]) {
//       acc[monthKey] = {
//         month: monthKey,
//         revenue: 0,
//         orders: 0,
//         profit: 0
//       };
//     }

//     const revenue = item.totalRevenue || item.revenue || item.total || 0;
//     const orders = item.totalOrders || item.orders || item.count || 0;

//     acc[monthKey].revenue += revenue;
//     acc[monthKey].orders += orders;
//     acc[monthKey].profit += revenue * 0.3; // Assuming 30% profit margin

//     return acc;
//   }, {});

//   const monthlyChartData = Object.values(monthlyData);

//   const totalOrdersCount = orderStatus.reduce((sum, item) => sum + item.count, 0);
//   const orderStatusData = orderStatus.map(item => ({
//     name: item._id,
//     value: item.count,
//     percentage: totalOrdersCount > 0 ? Math.round((item.count / totalOrdersCount) * 100) : 0
//   }));

//   // --- STATS CONFIG ---
//   const statsConfig = [
//     {
//       title: 'Total Revenue',
//       value: formatCurrency(stats.totalRevenue || 0),
//       icon: <DollarSign className="w-5 h-5" />,
//       bg: 'bg-blue-50 text-blue-600',
//       trend: '+12.5%',
//       trendUp: true,
//     },
//     {
//       title: 'Total Orders',
//       value: formatNumber(stats.totalOrders || 0),
//       icon: <ShoppingBag className="w-5 h-5" />,
//       bg: 'bg-emerald-50 text-emerald-600',
//       trend: '+8.2%',
//       trendUp: true,
//     },
//     {
//       title: 'Total Customers',
//       value: formatNumber(stats.totalCustomers || 0),
//       icon: <Users className="w-5 h-5" />,
//       bg: 'bg-purple-50 text-purple-600',
//       trend: '+3.1%',
//       trendUp: true,
//     },
//     {
//       title: 'Products Sold',
//       value: formatNumber(stats.totalProductsSold || 0),
//       icon: <Package className="w-5 h-5" />,
//       bg: 'bg-orange-50 text-orange-600',
//       trend: '-1.5%',
//       trendUp: false,
//     },
//     {
//       title: 'Total Profit',
//       value: formatCurrency(stats.totalProfit || calculateProfit(recentOrders)),
//       icon: <TrendingUp className="w-5 h-5" />,
//       bg: 'bg-rose-50 text-rose-600',
//       trend: '+15.3%',
//       trendUp: true,
//     },
//   ];

//   // --- LOADING / ERROR STATES ---
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="flex flex-col items-center gap-3">
//           <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#2B7A4B]"></div>
//           <p className="text-sm text-gray-500 animate-pulse">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-96 text-red-600 bg-red-50 rounded-xl p-8 max-w-lg mx-auto">
//         <p>{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 pb-10">

//       {/* --- TOP HEADER --- */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
//             Welcome back, {user?.firstName || 'Admin'}! 👋
//           </h1>
//           <p className="text-gray-500 text-xs sm:text-sm mt-1">
//             Here&#39;s an overview of your store&#39;s performance for the selected period.
//           </p>
//         </div>
//         <div className="flex items-center gap-3">

//           {/* --- Date Range Dropdown --- */}
//           <div className="relative">
//             <button
//               onClick={() => {
//                 const dropdown = document.getElementById('date-range-dropdown');
//                 dropdown?.classList.toggle('hidden');
//               }}
//               className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-700 hover:bg-gray-50 hover:border-[#2B7A4B] transition-all duration-200 cursor-pointer shadow-sm"
//             >
//               <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
//               <span className="font-medium hidden sm:inline">{dateRangeText}</span>
//               <span className="font-medium sm:hidden">Select Period</span>
//               <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 ml-1" />
//             </button>

//             <div
//               id="date-range-dropdown"
//               className="hidden absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
//             >
//               <div className="py-1">
//                 <button
//                   onClick={() => handleDateRangeChange(7)}
//                   className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-gray-50 transition-colors ${days === 7 ? 'text-[#2B7A4B] font-semibold bg-green-50' : 'text-gray-600'}`}
//                 >
//                   Last 7 Days
//                 </button>
//                 <button
//                   onClick={() => handleDateRangeChange(30)}
//                   className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-gray-50 transition-colors ${days === 30 ? 'text-[#2B7A4B] font-semibold bg-green-50' : 'text-gray-600'}`}
//                 >
//                   Last 30 Days
//                 </button>
//                 <button
//                   onClick={() => handleDateRangeChange(90)}
//                   className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-gray-50 transition-colors ${days === 90 ? 'text-[#2B7A4B] font-semibold bg-green-50' : 'text-gray-600'}`}
//                 >
//                   Last 3 Months
//                 </button>
//               </div>
//             </div>
//           </div>

//         </div>
//       </div>

//       {/* --- STATS GRID --- */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
//         {statsConfig.map((stat, idx) => (
//           <div
//             key={idx}
//             className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
//           >
//             <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-50 to-transparent opacity-50 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>

//             <div className="flex items-start justify-between relative z-10">
//               <div className="min-w-0">
//                 <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider truncate">{stat.title}</p>
//                 <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1 truncate">{stat.value}</p>
//               </div>
//               <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${stat.bg} flex items-center justify-center shadow-sm flex-shrink-0`}>
//                 {stat.icon}
//               </div>
//             </div>

//             <div className={`flex items-center gap-1 mt-2 sm:mt-3 text-[10px] sm:text-xs font-semibold ${stat.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
//               {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
//               {stat.trend}
//               <span className="text-gray-400 font-normal ml-1 hidden sm:inline">vs last period</span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* --- MONTHLY REVENUE CHART --- */}
//       <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
//         <div className="flex items-center justify-between mb-4 sm:mb-6">
//           <div>
//             <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Monthly Revenue & Profit</h3>
//             <p className="text-[10px] sm:text-xs text-gray-400">Track your earnings by month</p>
//           </div>
//           <div className="flex items-center gap-3 text-[10px] sm:text-xs">
//             <div className="flex items-center gap-1.5">
//               <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#2B7A4B]"></div>
//               <span className="text-gray-500">Revenue</span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#3B82F6]"></div>
//               <span className="text-gray-500">Profit</span>
//             </div>
//           </div>
//         </div>

//         <div className="h-64 sm:h-72 w-full">
//           <ResponsiveContainer width="100%" height="100%">
//             <ComposedChart data={monthlyChartData.length > 0 ? monthlyChartData : [{ month: new Date().toLocaleDateString('en-US', { month: 'short' }), revenue: stats.totalRevenue || 0, profit: stats.totalProfit || calculateProfit(recentOrders) || 0 }]} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
//               <XAxis
//                 dataKey="month"
//                 axisLine={false}
//                 tickLine={false}
//                 tick={{ fill: '#9ca3af', fontSize: 10 }}
//                 dy={10}
//               />
//               <YAxis
//                 axisLine={false}
//                 tickLine={false}
//                 tick={{ fill: '#9ca3af', fontSize: 10 }}
//                 tickFormatter={(value) => `Rs. ${value}`}
//               />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
//               <Bar
//                 dataKey="revenue"
//                 name="Revenue"
//                 barSize={30}
//                 fill="#2B7A4B"
//                 radius={[4, 4, 0, 0]}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="profit"
//                 name="Profit"
//                 stroke="#3B82F6"
//                 strokeWidth={3}
//                 dot={{ r: 4, fill: '#3B82F6' }}
//                 activeDot={{ r: 6 }}
//               />
//             </ComposedChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* --- CHARTS ROW 1 --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

//         {/* 1. Revenue vs Orders (Composed Chart) */}
//         <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
//           <div className="flex items-center justify-between mb-4 sm:mb-6">
//             <div>
//               <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Revenue & Orders</h3>
//               <p className="text-[10px] sm:text-xs text-gray-400">Daily performance over the selected period</p>
//             </div>
//             <div className="flex items-center gap-3 text-[10px] sm:text-xs">
//               <div className="flex items-center gap-1.5">
//                 <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#2B7A4B]"></div>
//                 <span className="text-gray-500">Revenue</span>
//               </div>
//               <div className="flex items-center gap-1.5">
//                 <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#3B82F6]"></div>
//                 <span className="text-gray-500">Orders</span>
//               </div>
//             </div>
//           </div>

//           <div className="h-64 sm:h-72 w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <ComposedChart data={displayChartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
//                 <XAxis
//                   dataKey="date"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: '#9ca3af', fontSize: 10 }}
//                   dy={10}
//                 />
//                 <YAxis
//                   yAxisId="left"
//                   orientation="left"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: '#9ca3af', fontSize: 10 }}
//                   tickFormatter={(value) => `Rs. ${value}`}
//                 />
//                 <YAxis
//                   yAxisId="right"
//                   orientation="right"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: '#9ca3af', fontSize: 10 }}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
//                 <Bar
//                   yAxisId="right"
//                   dataKey="orders"
//                   name="Orders"
//                   barSize={20}
//                   fill="#3B82F6"
//                   radius={[4, 4, 0, 0]}
//                 />
//                 <Line
//                   yAxisId="left"
//                   type="monotone"
//                   dataKey="revenue"
//                   name="Revenue"
//                   stroke="#2B7A4B"
//                   strokeWidth={3}
//                   dot={{ r: 4, fill: '#2B7A4B' }}
//                   activeDot={{ r: 6 }}
//                 />
//               </ComposedChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* 2. Order Status (Donut Chart) */}
//         <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm flex flex-col">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Order Status</h3>
//               <p className="text-[10px] sm:text-xs text-gray-400">Current distribution of all orders</p>
//             </div>
//             <Link href="/admin/dashboard/orders" className="text-[10px] sm:text-xs font-medium text-[#2B7A4B] hover:text-green-800 bg-green-50 px-2.5 sm:px-3 py-1 rounded-full">
//               View All
//             </Link>
//           </div>

//           <div className="flex-1 flex items-center justify-center relative">
//             {orderStatusData.length === 0 ? (
//               <div className="flex flex-col items-center justify-center text-gray-400">
//                 <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center">
//                   <span className="text-2xl sm:text-3xl font-bold text-gray-300">0</span>
//                 </div>
//                 <span className="text-[10px] sm:text-xs mt-3">No orders placed yet</span>
//               </div>
//             ) : (
//               <>
//                 <ResponsiveContainer width="100%" height={180}>
//                   <PieChart>
//                     <Pie
//                       data={orderStatusData}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={55}
//                       outerRadius={75}
//                       paddingAngle={2}
//                       dataKey="value"
//                     >
//                       {orderStatusData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
//                       ))}
//                     </Pie>
//                     <Tooltip content={<CustomTooltip />} />
//                   </PieChart>
//                 </ResponsiveContainer>

//                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//                   <span className="text-xl sm:text-2xl font-bold text-gray-900">{formatNumber(totalOrdersCount)}</span>
//                   <span className="text-[10px] text-gray-400">Total Orders</span>
//                 </div>
//               </>
//             )}
//           </div>

//           {orderStatusData.length > 0 && (
//             <div className="grid grid-cols-2 gap-2 mt-2">
//               {orderStatusData.map((item, idx) => (
//                 <div key={idx} className="flex items-center justify-between text-[10px] sm:text-xs px-2 py-1.5 bg-gray-50 rounded-lg">
//                   <div className="flex items-center gap-2 text-gray-600 min-w-0">
//                     <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
//                     <span className="truncate">{item.name}</span>
//                   </div>
//                   <span className="font-semibold text-gray-900 ml-1">{item.percentage}%</span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* --- CHARTS ROW 2 --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">


//         {/* 3. Category Distribution (Pie Chart) - COMPLETELY FIXED */}
        
//         <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Categories</h3>
//               <p className="text-[10px] sm:text-xs text-gray-400">Sales distribution by product category</p>
//             </div>
//             <Layers className="w-4 h-4 text-gray-400" />
//           </div>

//           <div className="w-full">
//             {categoryStats.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-52 text-gray-400 text-xs sm:text-sm space-y-2">
//                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
//                   <Package className="w-8 h-8 text-gray-300" />
//                 </div>
//                 <p>No category data available</p>
//                 <Link href="/admin/dashboard/categories" className="text-[10px] text-[#2B7A4B] hover:text-green-800 font-medium bg-green-50 px-3 py-1.5 rounded-full">
//                   + Add Category
//                 </Link>
//               </div>
//             ) : (
//               <>
//                 {/* ✅ FIXED: Chart with NO labels, NO negative margins */}
//                 <div className="h-48 sm:h-56 w-full flex items-center justify-center">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={categoryStats}
//                         cx="50%"
//                         cy="50%"
//                         labelLine={false}
//                         label={false} // ✅ NO labels on chart - they get cut off
//                         outerRadius={70}
//                         innerRadius={45}
//                         paddingAngle={2}
//                         dataKey="value"
//                       >
//                         {categoryStats.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                         ))}
//                       </Pie>
//                       <Tooltip content={<CustomTooltip />} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>

//                 {/* ✅ FIXED: Legend below chart - no overlap */}
//                 <div className="mt-4 space-y-2">
//                   {categoryStats.map((cat, idx) => {
//                     const total = categoryStats.reduce((sum, c) => sum + c.value, 0);
//                     const percentage = total > 0 ? Math.round((cat.value / total) * 100) : 0;

//                     return (
//                       <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
//                         <div className="flex items-center gap-2 min-w-0">
//                           <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
//                           <span className="text-sm font-medium text-gray-700 truncate">{cat.name}</span>
//                         </div>
//                         <span className="text-sm font-bold text-gray-900 ml-2">{percentage}%</span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </>
//             )}
//           </div>
//         </div>


//         {/* 4. Cumulative Sales Trend (Area Chart) */}
//         <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
//           <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

//           <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
//             <div>
//               <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Cumulative Sales Trend</h3>
//               <p className="text-[10px] sm:text-xs text-gray-400">Total revenue accumulated over time</p>
//             </div>
//             <Activity className="w-4 h-4 text-emerald-500" />
//           </div>

//           <div className="h-52 sm:h-64 w-full relative z-10">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={displayChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
//                 <defs>
//                   <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#2B7A4B" stopOpacity={0.3} />
//                     <stop offset="95%" stopColor="#2B7A4B" stopOpacity={0} />
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
//                 <XAxis
//                   dataKey="date"
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: '#9ca3af', fontSize: 10 }}
//                   dy={10}
//                 />
//                 <YAxis
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fill: '#9ca3af', fontSize: 10 }}
//                   tickFormatter={(value) => `Rs. ${value}`}
//                 />
//                 <Tooltip content={<CustomTooltip />} />
//                 <Area
//                   type="monotone"
//                   dataKey="revenue"
//                   stroke="#2B7A4B"
//                   strokeWidth={3}
//                   fillOpacity={1}
//                   fill="url(#colorRevenue)"
//                   dot={{ r: 4, fill: '#2B7A4B' }}
//                   activeDot={{ r: 6, fill: '#2B7A4B', stroke: '#fff', strokeWidth: 2 }}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* --- BOTTOM TABLES --- */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

//         {/* Recent Orders */}
//         <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//           <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
//             <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Recent Orders</h3>
//             <Link href="/admin/dashboard/orders" className="text-[10px] sm:text-xs font-medium text-[#2B7A4B] hover:text-green-800 transition-colors">
//               View All →
//             </Link>
//           </div>
//           <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
//             {recentOrders.length === 0 ? (
//               <div className="p-6 sm:p-8 text-center text-gray-400 text-xs sm:text-sm">No recent orders</div>
//             ) : (
//               recentOrders.map((order, idx) => (
//                 <div key={idx} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
//                   <div className="flex items-start justify-between mb-1 gap-2">
//                     <div className="min-w-0">
//                       <p className="text-[10px] sm:text-xs font-semibold text-gray-700 group-hover:text-[#2B7A4B] transition-colors truncate">
//                         #{order._id?.slice(-6) || 'GS-1234'}
//                       </p>
//                       <p className="text-[10px] sm:text-xs text-gray-500 truncate">{order.user?.firstName || 'Guest'} {order.user?.lastName || ''}</p>
//                     </div>
//                     <span className={`text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm flex-shrink-0 ${getStatusBadge(order.orderStatus || order.status)}`}>
//                       {order.orderStatus || order.status || 'Pending'}
//                     </span>
//                   </div>
//                   <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-400 mt-1">
//                     <span className="truncate">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
//                     <span className="font-semibold text-gray-700 ml-2">{formatCurrency(order.totalAmount || order.total)}</span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Top Selling Products */}
//         <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//           <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
//             <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Top Selling</h3>
//             <Link href="/admin/dashboard/products" className="text-[10px] sm:text-xs font-medium text-[#2B7A4B] hover:text-green-800 transition-colors">
//               View All →
//             </Link>
//           </div>
//           <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
//             {topProducts.length === 0 ? (
//               <div className="p-6 sm:p-8 text-center text-gray-400 text-xs sm:text-sm">No product data</div>
//             ) : (
//               topProducts.map((product, idx) => (
//                 <div key={idx} className="p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
//                   <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
//                     {product.image ? (
//                       <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
//                     ) : (
//                       <Box className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
//                     )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</p>
//                     <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">{product.sold || product.totalSold || 0} sold this period</p>
//                   </div>
//                   <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
//                     <div className="w-10 sm:w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
//                       <div className="h-full bg-[#2B7A4B] rounded-full" style={{ width: `${Math.min((product.sold || product.totalSold || 0) / 50, 1) * 100}%` }}></div>
//                     </div>
//                     <span className="text-[10px] sm:text-xs font-bold text-gray-700">{product.sold || product.totalSold || 0}</span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Low Stock Products */}
//         <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden md:col-span-2 lg:col-span-1">
//           <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
//             <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Low Stock</h3>
//             <Link href="/admin/dashboard/products" className="text-[10px] sm:text-xs font-medium text-[#2B7A4B] hover:text-green-800 transition-colors">
//               View All →
//             </Link>
//           </div>
//           <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
//             {lowStockProducts.length === 0 ? (
//               <div className="p-6 sm:p-8 text-center text-gray-400 text-xs sm:text-sm">All items are well stocked ✅</div>
//             ) : (
//               lowStockProducts.map((product, idx) => (
//                 <div key={idx} className="p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
//                   <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
//                     {product.image ? (
//                       <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-lg" />
//                     ) : (
//                       <Package className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
//                     )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</p>
//                     <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">{product.sku || 'SKU-0000'}</p>
//                   </div>
//                   <div className="text-right flex-shrink-0">
//                     <p className="text-xs sm:text-sm font-bold text-rose-600">{product.stock} left</p>
//                     <span className="text-[9px] text-red-400 font-medium">Reorder soon</span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }








// new version 17/9/2026

// app/admin/dashboard/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import axios from 'axios';
import {
  Calendar, ShoppingBag, TrendingUp, Users, Package,
  DollarSign, ChevronDown, ArrowUpRight, ArrowDownRight,
  Box, Layers, Activity, BarChart3, PieChart as PieIcon
} from 'lucide-react';

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const API_BASE_URL = 'http://localhost:5001/api/admin';

// ============================================================
// Custom Tooltip — professional styling
// ============================================================
const CustomTooltip = ({ active, payload, label, currency = false }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm px-3.5 py-2.5 rounded-xl shadow-xl border border-gray-100 text-xs min-w-[140px]">
      <p className="font-semibold text-gray-800 mb-2 border-b border-gray-100 pb-1.5">
        {label}
      </p>
      {payload.map((entry, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-500">{entry.name}</span>
          </div>
          <span className="font-bold text-gray-900">
            {currency && entry.name.toLowerCase().includes('revenue')
              ? `Rs. ${Number(entry.value).toLocaleString()}`
              : Number(entry.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Palette + helpers
// ============================================================
const COLORS = ['#2B7A4B', '#3B82F6', '#F97316', '#EF4444', '#8B5CF6', '#EC4899'];

const getDateRangeText = (daysCount) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysCount);
  const format = (date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${format(start)} - ${format(end)}, ${end.getFullYear()}`;
};

// ============================================================
// Empty-state component used in charts
// ============================================================
const EmptyState = ({ icon: Icon, title, subtitle, cta, href }) => (
  <div className="flex flex-col items-center justify-center h-full text-center py-8">
    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Icon className="w-6 h-6 text-gray-400" />
    </div>
    <p className="text-sm font-medium text-gray-700">{title}</p>
    {subtitle && (
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    )}
    {cta && href && (
      <Link
        href={href}
        className="mt-3 text-xs font-medium text-[#2B7A4B] hover:text-green-800 bg-green-50 px-3 py-1.5 rounded-full transition-colors"
      >
        {cta}
      </Link>
    )}
  </div>
);

// ============================================================
// Component
// ============================================================
export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [days, setDays] = useState(7);
  const dateRangeText = useMemo(() => getDateRangeText(days), [days]);

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProductsSold: 0,
    totalProfit: 0,
  });
  const [salesOverview, setSalesOverview] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);

  // ============================================================
  // Fetch dashboard + categories
  // ============================================================
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${API_BASE_URL}/dashboard?days=${days}`,
          { withCredentials: true }
        );
        if (cancelled) return;

        if (res.data?.success) {
          setStats(res.data.stats || {});
          setSalesOverview(res.data.salesOverview || []);
          setOrderStatus(res.data.orderStatus || []);
          setRecentOrders(res.data.recentOrders || []);
          setTopProducts(res.data.topProducts || []);
          setLowStockProducts(res.data.lowStockProducts || []);
        }

        // Categories
        try {
          let catRes;
          try {
            catRes = await axios.get(`${API_BASE_URL}/categories`, {
              withCredentials: true,
            });
          } catch {
            catRes = await axios.get(`${API_BASE_URL}/public/categories`, {
              withCredentials: true,
            });
          }
          if (cancelled) return;

          let categoriesData = catRes.data;
          if (categoriesData?.data && Array.isArray(categoriesData.data)) {
            categoriesData = categoriesData.data;
          } else if (
            categoriesData?.categories &&
            Array.isArray(categoriesData.categories)
          ) {
            categoriesData = categoriesData.categories;
          } else if (categoriesData?.success && categoriesData.data) {
            categoriesData = categoriesData.data;
          } else if (!Array.isArray(categoriesData)) {
            categoriesData = [];
          }

          setCategoryStats(
            categoriesData
              .map((cat) => ({
                name: cat.name || 'Unnamed',
                value: cat.products || cat.productCount || 1,
              }))
              .filter((item) => item.value > 0)
          );
        } catch (catErr) {
          if (!cancelled) setCategoryStats([]);
        }
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 401) {
          window.location.href = '/admin/login';
        } else {
          setError('Failed to load dashboard data.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [days]);

  // ============================================================
  // Helpers
  // ============================================================
  const formatCurrency = (amount) => {
    const n = Number(amount) || 0;
    if (n >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `Rs. ${(n / 1_000).toFixed(1)}k`;
    return `Rs. ${n.toFixed(0)}`;
  };

  const formatCurrencyFull = (amount) =>
    `Rs. ${(Number(amount) || 0).toLocaleString()}`;

  const formatNumber = (num) =>
    new Intl.NumberFormat('en-US').format(num || 0);

  const getStatusBadge = (status) => {
    const styles = {
      delivered: 'bg-emerald-100 text-emerald-700',
      shipped: 'bg-blue-100 text-blue-700',
      processing: 'bg-orange-100 text-orange-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const month = new Date(
            parts[0],
            parts[1] - 1,
            parts[2]
          ).toLocaleDateString('en-US', { month: 'short' });
          return `${month} ${parseInt(parts[2])}`;
        }
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // ============================================================
  // Derived chart data
  // ============================================================
  const displayChartData = useMemo(() => {
    const mapped = (salesOverview || []).map((item) => {
      const date = item._id || item.date || item.day || '';
      const revenue = item.totalRevenue || item.revenue || item.total || 0;
      const orders = item.totalOrders || item.orders || item.count || 0;
      return {
        date: formatDate(date),
        fullDate: date,
        revenue: Number(revenue) || 0,
        orders: Number(orders) || 0,
      };
    });

    if (mapped.length > 0) return mapped;

    return [
      {
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        revenue: stats.totalRevenue || 0,
        orders: stats.totalOrders || 0,
      },
    ];
  }, [salesOverview, stats.totalRevenue, stats.totalOrders]);

  // Monthly grouped
  const monthlyChartData = useMemo(() => {
    const monthlyData = (salesOverview || []).reduce((acc, item) => {
      const date = new Date(item._id || item.date || item.day);
      const monthKey = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          revenue: 0,
          orders: 0,
          profit: 0,
          sortKey: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
        };
      }
      const revenue = item.totalRevenue || item.revenue || item.total || 0;
      const orders = item.totalOrders || item.orders || item.count || 0;
      acc[monthKey].revenue += revenue;
      acc[monthKey].orders += orders;
      acc[monthKey].profit += revenue * 0.3;
      return acc;
    }, {});

    return Object.values(monthlyData).sort((a, b) => a.sortKey - b.sortKey);
  }, [salesOverview]);

  const monthlyTotals = useMemo(() => {
    return monthlyChartData.reduce(
      (acc, m) => ({
        revenue: acc.revenue + m.revenue,
        profit: acc.profit + m.profit,
      }),
      { revenue: 0, profit: 0 }
    );
  }, [monthlyChartData]);

  // Cumulative area chart data — accumulate revenue over time
const cumulativeChartData = useMemo(() => {
  return displayChartData.reduce((acc, d) => {
    const prevTotal = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    acc.push({ ...d, cumulative: prevTotal + d.revenue });
    return acc;
  }, []);
}, [displayChartData]);

  const totalOrdersCount = orderStatus.reduce(
    (sum, item) => sum + (item.count || 0),
    0
  );

  const orderStatusData = useMemo(
    () =>
      orderStatus.map((item) => ({
        name: item._id,
        value: item.count,
        percentage:
          totalOrdersCount > 0
            ? Math.round((item.count / totalOrdersCount) * 100)
            : 0,
      })),
    [orderStatus, totalOrdersCount]
  );

  // Stats config with trend deltas (visual only — wire to API later)
  const statsConfig = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      icon: <DollarSign className="w-5 h-5" />,
      bg: 'bg-blue-50 text-blue-600',
      ring: 'ring-blue-100',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Total Orders',
      value: formatNumber(stats.totalOrders || 0),
      icon: <ShoppingBag className="w-5 h-5" />,
      bg: 'bg-emerald-50 text-emerald-600',
      ring: 'ring-emerald-100',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Total Customers',
      value: formatNumber(stats.totalCustomers || 0),
      icon: <Users className="w-5 h-5" />,
      bg: 'bg-purple-50 text-purple-600',
      ring: 'ring-purple-100',
      trend: '+3.1%',
      trendUp: true,
    },
    {
      title: 'Products Sold',
      value: formatNumber(stats.totalProductsSold || 0),
      icon: <Package className="w-5 h-5" />,
      bg: 'bg-orange-50 text-orange-600',
      ring: 'ring-orange-100',
      trend: '-1.5%',
      trendUp: false,
    },
    {
      title: 'Total Profit',
      value: formatCurrency(stats.totalProfit || 0),
      icon: <TrendingUp className="w-5 h-5" />,
      bg: 'bg-rose-50 text-rose-600',
      ring: 'ring-rose-100',
      trend: '+15.3%',
      trendUp: true,
    },
  ];

  // ============================================================
  // Loading / error
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#2B7A4B]" />
          <p className="text-sm text-gray-500 animate-pulse">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-red-600 bg-red-50 rounded-xl p-8 max-w-lg mx-auto">
        <p>{error}</p>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="space-y-6 pb-10">

      {/* ============ HEADER ============ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.firstName || 'Admin'}! 👋
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Here&#39;s an overview of your store&#39;s performance for the selected period.
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              const dropdown = document.getElementById('date-range-dropdown');
              dropdown?.classList.toggle('hidden');
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-700 hover:bg-gray-50 hover:border-[#2B7A4B] transition-all duration-200 cursor-pointer shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <span className="font-medium hidden sm:inline">{dateRangeText}</span>
            <span className="font-medium sm:hidden">Period</span>
            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 ml-1" />
          </button>

          <div
            id="date-range-dropdown"
            className="hidden absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="py-1">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDays(d);
                    document.getElementById('date-range-dropdown')?.classList.add('hidden');
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm hover:bg-gray-50 transition-colors ${
                    days === d
                      ? 'text-[#2B7A4B] font-semibold bg-green-50'
                      : 'text-gray-600'
                  }`}
                >
                  {d === 7 ? 'Last 7 Days' : d === 30 ? 'Last 30 Days' : 'Last 3 Months'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============ STATS GRID ============ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statsConfig.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-50 to-transparent opacity-50 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-start justify-between relative z-10">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider truncate">
                  {stat.title}
                </p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1 truncate">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${stat.bg} flex items-center justify-center shadow-sm flex-shrink-0`}
              >
                {stat.icon}
              </div>
            </div>
            <div
              className={`flex items-center gap-1 mt-2 sm:mt-3 text-[10px] sm:text-xs font-semibold ${
                stat.trendUp ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {stat.trendUp ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {stat.trend}
              <span className="text-gray-400 font-normal ml-1 hidden sm:inline">
                vs last period
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ============ MONTHLY REVENUE & PROFIT ============ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-[#2B7A4B]" />
                Monthly Revenue &amp; Profit
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Revenue vs. estimated profit trend over the selected period
              </p>
            </div>

            <div className="flex items-center gap-5 sm:gap-7">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  Revenue
                </p>
                <p className="text-sm font-bold text-[#2B7A4B]">
                  {formatCurrencyFull(monthlyTotals.revenue)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  Profit
                </p>
                <p className="text-sm font-bold text-[#3B82F6]">
                  {formatCurrencyFull(monthlyTotals.profit)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  Margin
                </p>
                <p
                  className={`text-sm font-bold ${
                    monthlyTotals.revenue > 0
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`}
                >
                  {monthlyTotals.revenue > 0
                    ? `${(
                        (monthlyTotals.profit / monthlyTotals.revenue) *
                        100
                      ).toFixed(1)}%`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 sm:px-4 pt-6 pb-2">
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={
                  monthlyChartData.length > 0
                    ? monthlyChartData
                    : [
                        {
                          month: new Date().toLocaleDateString('en-US', {
                            month: 'short',
                          }),
                          revenue: stats.totalRevenue || 0,
                          profit: stats.totalProfit || 0,
                        },
                      ]
                }
                margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                barCategoryGap="25%"
              >
                <defs>
                  <linearGradient id="revenueBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2B7A4B" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#2B7A4B" stopOpacity={0.55} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickFormatter={(value) =>
                    value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                  }
                  width={45}
                />
                <Tooltip
                  content={<CustomTooltip currency />}
                  cursor={{ fill: 'rgba(43, 122, 75, 0.05)' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: '11px',
                    paddingTop: '12px',
                    fontWeight: 500,
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  name="Revenue"
                  barSize={36}
                  fill="url(#revenueBar)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#fff', stroke: '#3B82F6', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============ ROW 1: Revenue & Orders + Order Status ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Revenue vs Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-[#3B82F6]" />
                  Revenue &amp; Orders
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Daily performance over the last {days} days
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                    Avg Revenue
                  </p>
                  <p className="text-sm font-bold text-[#2B7A4B]">
                    {formatCurrency(
                      displayChartData.length > 0
                        ? displayChartData.reduce((s, d) => s + d.revenue, 0) /
                            displayChartData.length
                        : 0
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                    Avg Orders
                  </p>
                  <p className="text-sm font-bold text-[#3B82F6]">
                    {displayChartData.length > 0
                      ? (
                          displayChartData.reduce((s, d) => s + d.orders, 0) /
                          displayChartData.length
                        ).toFixed(1)
                      : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-2 sm:px-4 pt-6 pb-2">
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={displayChartData}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                  barCategoryGap="30%"
                >
                  <defs>
                    <linearGradient id="ordersBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="revenueLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2B7A4B" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2B7A4B" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }}
                    dy={10}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                    width={45}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    width={30}
                  />
                  <Tooltip
                    content={<CustomTooltip currency />}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '12px', fontWeight: 500 }}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="orders"
                    name="Orders"
                    barSize={22}
                    fill="url(#ordersBar)"
                    radius={[5, 5, 0, 0]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#2B7A4B"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#fff', stroke: '#2B7A4B', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#2B7A4B', stroke: '#fff', strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Order Status Donut */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-[#F97316]" />
                Order Status
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Distribution of all orders
              </p>
            </div>
            <Link
              href="/admin/dashboard/orders"
              className="text-[10px] sm:text-xs font-medium text-[#2B7A4B] hover:text-green-800 bg-green-50 px-3 py-1 rounded-full transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center relative p-4">
            {orderStatusData.length === 0 ? (
              <EmptyState
                icon={PieIcon}
                title="No orders yet"
                subtitle="Status breakdown will appear here"
              />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {formatNumber(totalOrdersCount)}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">
                    Total Orders
                  </span>
                </div>
              </>
            )}
          </div>

          {orderStatusData.length > 0 && (
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              {orderStatusData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[10px] sm:text-xs px-2.5 py-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-gray-600 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="truncate capitalize">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900 ml-1">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============ ROW 2: Categories + Cumulative Area ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-[#8B5CF6]" />
                Categories
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Product distribution by category
              </p>
            </div>
            <Layers className="w-4 h-4 text-gray-400" />
          </div>

          <div className="p-4">
            {categoryStats.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No categories yet"
                subtitle="Add your first category to see stats"
                cta="+ Add Category"
                href="/admin/dashboard/categories"
              />
            ) : (
              <>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={75}
                        innerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
                  {categoryStats.map((cat, idx) => {
                    const total = categoryStats.reduce(
                      (sum, c) => sum + c.value,
                      0
                    );
                    const percentage =
                      total > 0 ? Math.round((cat.value / total) * 100) : 0;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          />
                          <span className="text-xs font-medium text-gray-700 truncate">
                            {cat.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-gray-900 ml-2">
                          {percentage}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cumulative Sales Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

          <div className="p-5 sm:p-6 border-b border-gray-100 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                  <span className="w-1.5 h-4 rounded-full bg-emerald-500" />
                  Cumulative Sales Trend
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Total revenue accumulated over the selected period
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                  Total
                </p>
                <p className="text-base font-bold text-emerald-600">
                  {formatCurrencyFull(
                    cumulativeChartData[cumulativeChartData.length - 1]
                      ?.cumulative || 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="px-2 sm:px-4 pt-6 pb-2 relative z-10">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={cumulativeChartData}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="cumGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }}
                    dy={10}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                    width={45}
                  />
                  <Tooltip content={<CustomTooltip currency />} />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    name="Cumulative Revenue"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#cumGradient)"
                    dot={{ r: 3.5, fill: '#fff', stroke: '#10B981', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ============ BOTTOM TABLES ============ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-[#3B82F6]" />
              Recent Orders
            </h3>
            <Link
              href="/admin/dashboard/orders"
              className="text-[10px] sm:text-xs font-medium text-[#2B7A4B] hover:text-green-800 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
            {recentOrders.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-400 text-xs sm:text-sm">
                No recent orders
              </div>
            ) : (
              recentOrders.map((order, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-700 group-hover:text-[#2B7A4B] transition-colors truncate">
                        #{order._id?.slice(-6) || 'GS-1234'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                        {order.user?.firstName || 'Guest'}{' '}
                        {order.user?.lastName || ''}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm flex-shrink-0 capitalize ${getStatusBadge(
                        order.orderStatus || order.status
                      )}`}
                    >
                      {order.orderStatus || order.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-gray-400 mt-1">
                    <span className="truncate">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="font-semibold text-gray-700 ml-2">
                      {formatCurrencyFull(order.totalAmount || order.total)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-[#2B7A4B]" />
              Top Selling
            </h3>
            <Link
              href="/admin/dashboard/products"
              className="text-[10px] sm:text-xs font-medium text-[#2B7A4B] hover:text-green-800 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
            {topProducts.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-400 text-xs sm:text-sm">
                No product data
              </div>
            ) : (
              topProducts.map((product, idx) => {
                const sold = product.sold || product.totalSold || 0;
                const maxSold = Math.max(
                  ...topProducts.map(
                    (p) => p.sold || p.totalSold || 0
                  ),
                  1
                );
                const pct = (sold / maxSold) * 100;

                return (
                  <div
                    key={idx}
                    className="p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 overflow-hidden">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name || 'Product'}
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized={product.image.includes('placehold.co')}
                        />
                      ) : (
                        <Box className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">
                        {sold} sold this period
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#2B7A4B] to-emerald-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-700 w-6 text-right">
                        {sold}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-rose-500" />
              Low Stock
            </h3>
            <Link
              href="/admin/dashboard/products"
              className="text-[10px] sm:text-xs font-medium text-[#2B7A4B] hover:text-green-800 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
            {lowStockProducts.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-400 text-xs sm:text-sm">
                All items are well stocked ✅
              </div>
            ) : (
              lowStockProducts.map((product, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100 overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name || 'Product'}
                        fill
                        sizes="40px"
                        className="object-cover"
                        unoptimized={product.image.includes('placehold.co')}
                      />
                    ) : (
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 truncate">
                      {product.sku || 'SKU-0000'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs sm:text-sm font-bold text-rose-600">
                      {product.stock} left
                    </p>
                    <span className="text-[9px] text-red-400 font-medium">
                      Reorder soon
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}