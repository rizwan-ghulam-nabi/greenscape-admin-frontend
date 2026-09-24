// components/AdminSidebar.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ShoppingBag, Package, FolderOpen, Users, 
  Box, Ticket, Star, FileText, Image as ImageIcon, BarChart3, 
  Shield, Settings, LogOut, ChevronRight, X, User, Menu,
  Layers , Percent  // ✅ ADDED: Import Layers icon for Collections
} from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function AdminSidebar({ isOpen, setIsOpen, isMobile, isTablet }) {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const { logout } = useAuth();

  const user = {
    firstName: 'Super',
    lastName: 'Admin',
    role: 'Super Administrator'
  };

  const toggleSubmenu = (name) => {
    setExpandedMenu(prev => prev === name ? null : name);
  };

  const handleLogout = async () => {
    await logout();
  };

  const navigationLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    
    { 
  name: 'Discounts', 
  href: '/admin/dashboard/discounts', 
  icon: Percent 
},

    { 
      name: 'Orders', 
      icon: ShoppingBag, 
      hasSubmenu: true,
      submenu: [
        { name: 'All Orders', href: '/admin/dashboard/orders' },
        { name: 'Pending Orders', href: '/admin/dashboard/orders/pending' },
        { name: 'processing Orders', href: '/admin/dashboard/orders/processing' },
        { name: 'shipped Orders', href: '/admin/dashboard/orders/shipped' },
        { name: 'delivered Orders', href: '/admin/dashboard/orders/delivered' },
        { name: 'cancelled Orders', href: '/admin/dashboard/orders/cancelled' },
        { name: 'Order History', href: '/admin/dashboard/orders/history' }
      ]
    },
    { 
      name: 'Products', 
      icon: Package, 
      hasSubmenu: true,
      submenu: [
        { name: 'All Products', href: '/admin/dashboard/products' },
        { name: 'Add New', href: '/admin/dashboard/products/create' },
      ]
    },
    { 
      name: 'Categories', 
      icon: FolderOpen, 
      hasSubmenu: true,
      submenu: [
        { name: 'All Categories', href: '/admin/dashboard/categories' },
        { name: 'Add New', href: '/admin/dashboard/categories/create' },
      ]
    },
    { // ✅ ADDED: Collections Menu
      name: 'Collections', 
      icon: Layers, 
      hasSubmenu: true,
      submenu: [
        { name: 'All Collections', href: '/admin/dashboard/collections' },
        { name: 'Create Collection', href: '/admin/dashboard/collections/create' },
      ]
    },
    { name: 'Customers', href: '/admin/dashboard/customers', icon: Users },
    { name: 'Inventory', href: '/admin/dashboard/inventory', icon: Box },
    { name: 'Reviews', href: '/admin/dashboard/reviews', icon: Star },
    { 
      name: 'Blog Posts', 
      icon: FileText, 
      hasSubmenu: true,
      submenu: [
        { name: 'All Posts', href: '/admin/dashboard/blog' },
        { name: 'Create Post', href: '/admin/dashboard/blog/create' },
      ]
    },
    { 
      name: 'Banners', 
      icon: ImageIcon, 
      hasSubmenu: true,
      submenu: [
        { name: 'All Banners', href: '/admin/dashboard/banners' },
        { name: 'Create Banner', href: '/admin/dashboard/banners/create' },
      ]
    },
    { name: 'Reports', href: '/admin/dashboard/reports', icon: BarChart3 },
    { 
      name: 'Users & Roles', 
      icon: Shield, 
      hasSubmenu: true,
      submenu: [
        { name: 'All Users', href: '/admin/dashboard/users' },
        { name: 'Roles & Permissions', href: '/admin/dashboard/users/roles' }
      ]
    },
    { 
      name: 'Settings', 
      icon: Settings, 
      hasSubmenu: true,
      submenu: [
        { name: 'General', href: '/admin/dashboard/settings/general' },
        { name: 'Payment', href: '/admin/dashboard/settings/payment' },
        { name: 'Shipping', href: '/admin/dashboard/settings/shipping' }
      ]
    },
  ];

  // Close sidebar on mobile/tablet when clicking a link
  const handleLinkClick = () => {
    if (isMobile || isTablet) {
      setIsOpen(false);
    }
  };

  // Calculate sidebar width based on state and device
  const getSidebarWidth = () => {
    if (isOpen) {
      return 'w-[280px]';
    } else {
      return 'w-[70px]';
    }
  };

  return (
    <>
      {/* Mobile Backdrop - only show on mobile/tablet when sidebar is open */}
      {(isMobile || isTablet) && isOpen && (
        <div 
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-[#021a12] text-white transition-all duration-300 ease-in-out ${getSidebarWidth()}`}>
        
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img src="/background.png" alt="Sidebar Background" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-black/70 z-0"></div>

        <div className="relative z-10 flex flex-col h-full w-full">
          
          {/* Header Section */}
          <div className="shrink-0 px-4 pt-4 pb-4 border-b border-white/10">
            {isOpen ? (
              /* OPEN STATE: Burger menu on RIGHT of logo */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#paint0_linear)" />
                      <defs>
                        <linearGradient id="paint0_linear" x1="4" y1="2" x2="20" y2="22">
                          <stop stopColor="#4ade80"/>
                          <stop offset="1" stopColor="#22c55e"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="transition-opacity duration-200">
                    <h1 className="text-lg font-bold text-white whitespace-nowrap">Green<span className="text-[#4ade80]">Scape</span></h1>
                    <p className="text-[10px] text-[#a7f3d0]/60 whitespace-nowrap">Admin Panel</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              /* CLOSED STATE: Burger menu ABOVE logo, centered */
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => setIsOpen(true)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#paint0_linear)" />
                    <defs>
                      <linearGradient id="paint0_linear" x1="4" y1="2" x2="20" y2="22">
                        <stop stopColor="#4ade80"/>
                        <stop offset="1" stopColor="#22c55e"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* User Profile - only show when open */}
          {isOpen && (
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                <div className="w-8 h-8 bg-[#4ade80]/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-[#4ade80]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-[#a7f3d0]/60 truncate">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {navigationLinks.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const isExpanded = expandedMenu === item.name;
              
              return (
                <div key={item.name} className="relative">
                  {item.hasSubmenu ? (
                    <div 
                      onClick={() => toggleSubmenu(item.name)} 
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                        isActive ? 'bg-[#4ade80]/15 text-[#4ade80]' : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                      title={!isOpen ? item.name : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {isOpen && <span className="text-[14px] font-medium whitespace-nowrap">{item.name}</span>}
                      </div>
                      {isOpen && <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />}
                    </div>
                  ) : (
                    <Link 
                      href={item.href} 
                      onClick={handleLinkClick}
                      className={`flex items-center justify-start px-3 py-2.5 rounded-xl transition-all ${
                        isActive ? 'bg-[#4ade80]/15 text-[#4ade80]' : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                      title={!isOpen ? item.name : undefined}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {isOpen && <span className="ml-3 text-[14px] font-medium whitespace-nowrap">{item.name}</span>}
                    </Link>
                  )}

                  {item.hasSubmenu && isExpanded && isOpen && (
                    <div className="ml-4 mt-1 pl-3 border-l border-white/10">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          onClick={handleLinkClick}
                          className={`block px-3 py-2 text-[14px] rounded-lg transition-all ${
                            pathname === sub.href ? 'text-[#4ade80] bg-[#4ade80]/10' : 'text-gray-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom */}
          <div className="shrink-0 px-4 py-4 border-t border-white/10">
            <button 
              onClick={handleLogout} 
              className={`flex items-center w-full px-2 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all ${
                isOpen ? 'justify-start' : 'justify-center'
              }`}
              title={!isOpen ? 'Logout' : undefined}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {isOpen && <span className="ml-3 text-[15px] font-medium whitespace-nowrap">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}