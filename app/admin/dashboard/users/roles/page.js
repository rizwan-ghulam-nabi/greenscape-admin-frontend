// app/admin/dashboard/users/roles/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Shield, Users, UserCheck, Settings, LayoutDashboard, 
  ShoppingBag, Package, Box, FolderOpen, Layers, FileText, 
  Image as ImageIcon, BarChart3, Plus, ChevronRight, 
  AlertCircle, Loader2, Crown, X, Save, Trash2, User, CheckCircle2, Circle
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

export default function RolesPermissionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('admin');
  
  // ===== EDIT PROFILE MODAL STATE =====
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'customer',
    isAdmin: false,
    status: 'active',
    isActive: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ===== EDIT ROLE MODAL STATE =====
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    label: '',
    description: '',
    color: 'green'
  });
  const [rolePermissions, setRolePermissions] = useState([]);
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [roleSaveError, setRoleSaveError] = useState('');

  // Fetch real users
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE_URL}/users`, { withCredentials: true });

      if (res.data?.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401) {
        router.push('/admin/login');
      } else {
        setError('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // ===== EDIT PROFILE HANDLERS =====
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      isAdmin: user.isAdmin || false,
      status: user.status || 'active',
      isActive: user.isActive !== false
    });
    setSaveError('');
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');

    try {
      const userData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
        isAdmin: editForm.role === 'admin' || editForm.isAdmin,
        status: editForm.status,
        isActive: editForm.isActive
      };

      const res = await axios.put(
        `${API_BASE_URL}/users/${editingUser._id}`,
        userData,
        { withCredentials: true }
      );

      if (res.data?.success) {
        setShowEditModal(false);
        await fetchData();
        alert('User updated successfully!');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setSaveError(err.response?.data?.error || err.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  // ===== EDIT ROLE HANDLERS =====
  const openRoleModal = () => {
    const currentRole = roles.find(r => r.name === selectedRole) || roles[0];
    setRoleForm({
      name: currentRole.name,
      label: currentRole.label,
      description: currentRole.description,
      color: currentRole.color
    });
    
    // Initialize permissions based on role
    const initialPermissions = allPermissions.map(p => ({
      ...p,
      enabled: selectedRole === 'admin' ? p.admin : p.customer
    }));
    setRolePermissions(initialPermissions);
    
    setRoleSaveError('');
    setShowRoleModal(true);
  };

  const handleRoleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionToggle = (permName) => {
    setRolePermissions(prev => 
      prev.map(p => 
        p.name === permName ? { ...p, enabled: !p.enabled } : p
      )
    );
  };

  const handlePermissionAll = (permName) => {
    setRolePermissions(prev => 
      prev.map(p => 
        p.name === permName ? { ...p, enabled: true } : p
      )
    );
  };

  const handlePermissionNone = (permName) => {
    setRolePermissions(prev => 
      prev.map(p => 
        p.name === permName ? { ...p, enabled: false } : p
      )
    );
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setIsSavingRole(true);
    setRoleSaveError('');

    try {
      // Prepare data
      const roleData = {
        name: roleForm.name,
        label: roleForm.label,
        description: roleForm.description,
        color: roleForm.color,
        permissions: rolePermissions
          .filter(p => p.enabled)
          .map(p => p.name)
      };

      // In a real app, you would send this to your backend
      // For now, simulate success
      console.log('Saving role data:', roleData);
      
      // Alert success
      alert(`Role "${roleForm.label}" updated successfully!`);
      setShowRoleModal(false);
      
    } catch (err) {
      console.error('Error saving role:', err);
      setRoleSaveError(err.response?.data?.error || 'Failed to save role');
    } finally {
      setIsSavingRole(false);
    }
  };

  // ===== DELETE USER HANDLER =====
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const res = await axios.delete(`${API_BASE_URL}/users/${userId}`, {
        withCredentials: true
      });

      if (res.data?.success) {
        alert('User deleted successfully!');
        await fetchData();
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  // ===== TOGGLE USER STATUS =====
  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      const res = await axios.put(
        `${API_BASE_URL}/users/${user._id}`,
        { status: newStatus, isActive: newStatus === 'active' },
        { withCredentials: true }
      );

      if (res.data?.success) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Failed to update user status');
    }
  };

  // Count users by role
  const getAdminCount = () => {
    return users.filter(user => 
      user.isAdmin === true || 
      user.role === 'admin' || 
      user.role === 'superadmin' ||
      user.role === 'editor' ||
      user.role === 'manager' ||
      user.role === 'support' ||
      user.role === 'viewer'
    ).length;
  };

  const getCustomerCount = () => {
    return users.filter(user => 
      user.role === 'customer' || 
      user.isAdmin === false
    ).length;
  };

  // Role Definitions (Only 2 Real Roles)
  const roles = [
    {
      name: 'admin',
      label: 'Admin',
      description: 'Has full access to manage products, orders, customers, and settings.',
      color: 'green',
      icon: Shield,
      count: getAdminCount()
    },
    {
      name: 'customer',
      label: 'Customer',
      description: 'Can browse products, place orders, and manage their account.',
      color: 'blue',
      icon: Users,
      count: getCustomerCount()
    }
  ];

  const currentRole = roles.find(r => r.name === selectedRole) || roles[0];

  // Role color mapping
  const getRoleColor = (color) => {
    const colors = {
      'green': 'bg-green-100 text-green-600',
      'blue': 'bg-blue-100 text-blue-600',
      'purple': 'bg-purple-100 text-purple-600',
      'orange': 'bg-orange-100 text-orange-600',
      'red': 'bg-red-100 text-red-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  // All Permissions
  const allPermissions = [
    { name: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, admin: true, customer: false },
    { name: 'orders', label: 'Orders', icon: ShoppingBag, admin: true, customer: true },
    { name: 'products', label: 'Products', icon: Package, admin: true, customer: false },
    { name: 'customers', label: 'Customers', icon: Users, admin: true, customer: false },
    { name: 'inventory', label: 'Inventory', icon: Box, admin: true, customer: false },
    { name: 'categories', label: 'Categories', icon: FolderOpen, admin: true, customer: false },
    { name: 'collections', label: 'Collections', icon: Layers, admin: true, customer: false },
    { name: 'blog', label: 'Blog Posts', icon: FileText, admin: true, customer: false },
    { name: 'banners', label: 'Banners', icon: ImageIcon, admin: true, customer: false },
    { name: 'reports', label: 'Reports', icon: BarChart3, admin: true, customer: false },
    { name: 'settings', label: 'Settings', icon: Settings, admin: true, customer: false },
    { name: 'users', label: 'Users & Roles', icon: Users, admin: true, customer: false }
  ];

  // Filter permissions based on selected role
  const getPermissionsForRole = () => {
    if (selectedRole === 'admin') {
      return allPermissions.filter(p => p.admin);
    }
    return allPermissions.filter(p => p.customer);
  };

  const displayPermissions = getPermissionsForRole();

  // Get user status color
  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-700',
      'inactive': 'bg-gray-100 text-gray-600',
      'banned': 'bg-red-100 text-red-600',
      'pending': 'bg-yellow-100 text-yellow-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  // Get user type badge
  const getUserTypeBadge = (user) => {
    if (user.userType === 'admin') {
      return <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-purple-100 text-purple-700">Admin</span>;
    }
    return <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700">User</span>;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#2B7A4B]" />
          <p className="mt-4 text-gray-500">Loading roles & permissions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center bg-red-50 rounded-xl p-8 max-w-lg">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-[#2B7A4B] text-white rounded-lg text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Link href="/admin/dashboard" className="hover:text-green-600">Home</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Users & Roles</span>
            <span>›</span>
            <span className="text-gray-900 font-medium">Roles & Permissions</span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2B7A4B] text-white text-sm font-medium rounded-lg hover:bg-[#1d5e37]">
          <Plus className="w-4 h-4" />
          Add Role
        </button>
      </div>

      {/* ===== USER LIST SECTION ===== */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
            <p className="text-sm text-gray-500">Manage user accounts and their roles</p>
          </div>
          <span className="text-sm text-gray-500">{users.length} total users</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2B7A4B]/10 flex items-center justify-center text-[#2B7A4B] font-bold">
                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getUserTypeBadge(user)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' || user.role === 'superadmin'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role || 'customer'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full cursor-pointer ${getStatusColor(user.status || 'active')}`}
                      title="Click to toggle status"
                    >
                      {user.status || 'active'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-gray-500 hover:text-[#2B7A4B] hover:bg-[#2B7A4B]/10 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <User className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex gap-6">
        
        {/* ===== LEFT: ROLE LIST (Only 2 Real Roles) ===== */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">All Roles</h2>
            <p className="text-sm text-gray-500">Manage roles and their permissions</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {roles.map((role) => {
              const RoleIcon = role.icon;
              const isSelected = selectedRole === role.name;
              
              return (
                <button
                  key={role.name}
                  onClick={() => setSelectedRole(role.name)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-[#2B7A4B]/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(role.color)}`}>
                      <RoleIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{role.label}</p>
                      <p className="text-xs text-gray-500">{role.count} User{role.count > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== RIGHT: ROLE DETAILS ===== */}
        <div className="w-96 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
          
          {/* Role Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRoleColor(currentRole.color)}`}>
                <currentRole.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{currentRole.label}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                    selectedRole === 'admin' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedRole === 'admin' ? 'Admin Role' : 'Customer Role'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{currentRole.description}</p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Permissions ({displayPermissions.length})
            </h4>
            
            <div className="space-y-1">
              {displayPermissions.map((perm) => (
                <div key={perm.name} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <perm.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{perm.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-0.5 text-xs rounded-md bg-green-100 text-green-700 font-medium">All</button>
                    <button className="px-2 py-0.5 text-xs rounded-md text-gray-500 hover:bg-gray-100">Custom</button>
                    <button className="px-2 py-0.5 text-xs rounded-md text-gray-500 hover:bg-gray-100">None</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edit Role Button - NOW OPENS MODAL */}
          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={openRoleModal}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-[#2B7A4B] hover:text-[#2B7A4B] transition-colors"
            >
              <Settings className="w-4 h-4" />
              Edit Role
            </button>
          </div>
        </div>
      </div>

      {/* ===== EDIT ROLE MODAL ===== */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRoleColor(roleForm.color)}`}>
                  <currentRole.icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Role</h2>
                  <p className="text-xs text-gray-500">Update role details and permissions</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRoleModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Edit Role Form */}
            <form onSubmit={handleSaveRole} className="space-y-4">
              
              {/* Role Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <input
                    type="text"
                    name="name"
                    value={roleForm.name}
                    onChange={handleRoleInputChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Label</label>
                  <input
                    type="text"
                    name="label"
                    value={roleForm.label}
                    onChange={handleRoleInputChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                    required
                  />
                </div>
              </div>

              {/* Role Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={roleForm.description}
                  onChange={handleRoleInputChange}
                  rows="2"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] resize-none"
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Color</label>
                <div className="flex gap-2">
                  {['green', 'blue', 'purple', 'orange', 'red'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setRoleForm(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full transition-all ${
                        roleForm.color === color 
                          ? 'ring-2 ring-offset-2 ring-[#2B7A4B] scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: color === 'green' ? '#2B7A4B' : 
                                        color === 'blue' ? '#3B82F6' : 
                                        color === 'purple' ? '#8B5CF6' : 
                                        color === 'orange' ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Permissions Section */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Permissions</h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRolePermissions(prev => prev.map(p => ({ ...p, enabled: true })))}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md font-medium hover:bg-green-200"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setRolePermissions(prev => prev.map(p => ({ ...p, enabled: false })))}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-md font-medium hover:bg-gray-200"
                    >
                      Select None
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {rolePermissions.map((perm) => (
                    <div key={perm.name} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <perm.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{perm.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handlePermissionAll(perm.name)}
                          className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
                            perm.enabled 
                              ? 'bg-green-100 text-green-700 font-medium' 
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          All
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermissionNone(perm.name)}
                          className={`px-2 py-0.5 text-xs rounded-md transition-colors ${
                            !perm.enabled 
                              ? 'bg-gray-200 text-gray-700 font-medium' 
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          None
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePermissionToggle(perm.name)}
                          className="p-1"
                        >
                          {perm.enabled ? (
                            <CheckCircle2 className="w-5 h-5 text-[#2B7A4B]" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {roleSaveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {roleSaveError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingRole}
                  className="flex-1 py-2.5 bg-[#2B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#23663e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSavingRole ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Role
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== EDIT USER MODAL ===== */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2B7A4B]/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[#2B7A4B]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
                  <p className="text-xs text-gray-500">Update user profile and role</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveUser} className="space-y-4">
              
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={editForm.role}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="editor">Editor</option>
                  <option value="manager">Manager</option>
                  <option value="support">Support</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Admin Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  name="isAdmin"
                  checked={editForm.isAdmin}
                  onChange={handleEditInputChange}
                  className="w-4 h-4 text-[#2B7A4B] rounded focus:ring-[#2B7A4B]"
                />
                <label htmlFor="isAdmin" className="text-sm text-gray-700 font-medium">
                  Is Admin
                </label>
              </div>

              {/* Error Message */}
              {saveError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {saveError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-[#2B7A4B] text-white rounded-lg text-sm font-medium hover:bg-[#23663e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}