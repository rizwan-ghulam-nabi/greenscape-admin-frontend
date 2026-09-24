// app/admin/dashboard/users/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Users, Search, Filter, Download, Plus, MoreHorizontal,
  ChevronLeft, ChevronRight, Shield, UserCog, UserCheck,
  Crown, AlertCircle, RefreshCw, Settings,
  LayoutDashboard, ShoppingBag, Package, Users as UsersIcon,
  Star, FileText, Image as ImageIcon, BarChart3, FolderOpen, Layers
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function AllUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // ==========================================
  // ✅ HELPERS (defined FIRST so they're available everywhere)
  // ==========================================

  // ✅ Robust user status detection
  const getUserStatus = (user) => {
    const status = (user?.status || '').toLowerCase();
    
    if (status === 'active' || status === 'online') return 'Active';
    if (status === 'inactive' || status === 'offline') return 'Inactive';
    if (status === 'suspended' || status === 'banned') return 'Suspended';
    
    if (user?.isActive === true || user?.isOnline === true) return 'Active';
    if (user?.isActive === false) return 'Inactive';
    
    return 'Active'; // Default fallback
  };

  // ✅ Status badge styling
  const getStatusBadge = (user) => {
    const status = getUserStatus(user);
    
    const styles = {
      'Active':    { bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
      'Inactive':  { bg: 'bg-gray-100 text-gray-600',   dot: 'bg-gray-400' },
      'Suspended': { bg: 'bg-red-100 text-red-600',     dot: 'bg-red-500' },
    };
    
    return styles[status] || styles['Inactive'];
  };

  // ✅ Role badge color
  const getRoleBadge = (role) => {
    const colors = {
      'superadmin': 'bg-purple-100 text-purple-700',
      'super-admin': 'bg-purple-100 text-purple-700',
      'admin': 'bg-green-100 text-green-700',
      'editor': 'bg-blue-100 text-blue-700',
      'manager': 'bg-orange-100 text-orange-700',
      'support': 'bg-teal-100 text-teal-700',
      'customer': 'bg-gray-100 text-gray-700',
      'viewer': 'bg-gray-100 text-gray-700'
    };
    return colors[role?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  // ✅ Role icon
  const getRoleIcon = (role) => {
    const icons = {
      'superadmin': Crown,
      'super-admin': Crown,
      'admin': Shield,
      'editor': FileText,
      'manager': UserCog,
      'support': UserCheck,
      'customer': Users,
      'viewer': Users
    };
    return icons[role?.toLowerCase()] || Users;
  };

  // ✅ User initials
  const getUserInitials = (user) => {
    const first = user?.firstName?.[0] || '';
    const last = user?.lastName?.[0] || '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || 'U';
  };

  // ✅ Display name
  const getDisplayName = (user) => {
    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    return fullName || user?.email?.split('@')[0] || 'User';
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // ✅ Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // ==========================================
  // ✅ FETCH USERS
  // ==========================================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/users`, {
        withCredentials: true
      });

      let fetchedUsers = [];
      if (res.data?.success && Array.isArray(res.data.users)) {
        fetchedUsers = res.data.users;
      } else if (Array.isArray(res.data?.users)) {
        fetchedUsers = res.data.users;
      } else if (Array.isArray(res.data)) {
        fetchedUsers = res.data;
      }

      console.log('👥 Users fetched:', fetchedUsers.length);
      if (fetchedUsers[0]) {
        console.log('👤 First user fields:', Object.keys(fetchedUsers[0]));
        console.log('📊 Status:', fetchedUsers[0].status);
        console.log('📊 isActive:', fetchedUsers[0].isActive);
        console.log('📊 isOnline:', fetchedUsers[0].isOnline);
      }

      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401) {
        router.push('/admin/login');
      } else {
        setError(err.response?.data?.error || 'Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // ✅ FILTERED USERS (now helpers exist above)
  // ==========================================
  const filteredUsers = users.filter(user => {
    const searchMatch = 
      !searchTerm ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase());

    const roleMatch = 
      roleFilter === 'all' || 
      user.role?.toLowerCase() === roleFilter.toLowerCase();

    const userStatus = getUserStatus(user);
    const statusMatch = 
      statusFilter === 'all' || 
      userStatus.toLowerCase() === statusFilter.toLowerCase();

    return searchMatch && roleMatch && statusMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // ==========================================
  // ✅ LOADING STATE
  // ==========================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B7A4B]"></div>
          <p className="mt-4 text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-red-50 rounded-xl p-8 max-w-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchUsers} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2B7A4B] text-white rounded-lg text-sm hover:bg-[#1d5e37]"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // ✅ RENDER
  // ==========================================
  return (
    <div className="space-y-6 pb-10">
      
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Users</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Link href="/admin/dashboard" className="hover:text-green-600">Home</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Users & Roles</span>
            <span>›</span>
            <span className="text-gray-900 font-medium">All Users</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2B7A4B] text-white text-sm font-medium rounded-lg hover:bg-[#1d5e37]">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* ===== TOOLBAR ===== */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 border rounded-lg hover:bg-gray-50 ${showFilters ? 'border-[#2B7A4B] bg-green-50' : 'border-gray-200'}`}
            >
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
            <button 
              onClick={fetchUsers}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
              >
                <option value="all">All Roles</option>
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
                <option value="editor">Editor</option>
                <option value="manager">Manager</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            {(roleFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => { setRoleFilter('all'); setStatusFilter('all'); setCurrentPage(1); }}
                className="text-xs text-red-600 hover:underline mt-5"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ===== USERS TABLE ===== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Last Login</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p>No users found</p>
                    {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                      <p className="text-xs text-gray-400 mt-1">
                        Try adjusting your filters
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  const statusBadge = getStatusBadge(user);
                  const userStatus = getUserStatus(user);
                  const initials = getUserInitials(user);
                  const displayName = getDisplayName(user);
                  
                  return (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {user.profileImage ? (
                            <img 
                              src={user.profileImage} 
                              alt={displayName}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-medium text-sm"
                            style={{ display: user.profileImage ? 'none' : 'flex' }}
                          >
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {displayName}
                            </p>
                            <p className="text-xs text-gray-400">
                              @{user.firstName?.toLowerCase() || user.email?.split('@')[0]}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getRoleBadge(user.role)}`}>
                          <RoleIcon className="w-3 h-3" />
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                          {userStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {user.lastLogin ? (
                          <>
                            {formatDate(user.lastLogin)}
                            <span className="block text-[10px] text-gray-400">
                              at {formatTime(user.lastLogin)}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Never logged in</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button 
                          onClick={() => router.push(`/admin/dashboard/users/${user._id}`)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                          title="View details"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center text-sm rounded-md ${
                    currentPage === i + 1 
                      ? 'bg-[#2B7A4B] text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}