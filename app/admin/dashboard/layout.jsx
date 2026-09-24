// // app/admin/dashboard/layout.jsx
// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import AdminSidebar from '@/components/AdminSidebar';
// import { Menu, User, X } from 'lucide-react';

// export default function DashboardLayout({ children }) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [isTablet, setIsTablet] = useState(false);

//   // Detect screen size with debounce for performance
//   useEffect(() => {
//     let resizeTimer;
    
//     const checkScreen = () => {
//       const width = window.innerWidth;
//       const mobile = width < 768;
//       const tablet = width >= 768 && width < 1024;
      
//       setIsMobile(mobile);
//       setIsTablet(tablet);
      
//       // On desktop (>=1024px): sidebar always open by default
//       // On tablet: sidebar can be toggled, default open
//       // On mobile: sidebar closed by default
//       if (!mobile) {
//         setIsSidebarOpen(true);
//       } else {
//         setIsSidebarOpen(false);
//       }
//     };
    
//     checkScreen();
//     window.addEventListener('resize', () => {
//       clearTimeout(resizeTimer);
//       resizeTimer = setTimeout(checkScreen, 150);
//     });
    
//     return () => {
//       window.removeEventListener('resize', () => {
//         clearTimeout(resizeTimer);
//         resizeTimer = setTimeout(checkScreen, 150);
//       });
//     };
//   }, []);

//   // Close sidebar on mobile when clicking outside
//   const handleCloseSidebar = useCallback(() => {
//     if (isMobile || isTablet) {
//       setIsSidebarOpen(false);
//     }
//   }, [isMobile, isTablet]);

//   // Get main content margin based on sidebar state and device
//   const getMainMargin = () => {
//     // On mobile: no margin, sidebar is overlay
//     if (isMobile) return 'ml-0';
    
//     // On tablet and desktop: margin based on sidebar state
//     if (isSidebarOpen) {
//       return 'ml-[280px]';
//     } else {
//       return 'ml-[70px]';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 w-full relative">
      
//       {/* Sidebar - Fixed Position with proper z-index */}
//       <aside 
//         className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
//           isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'
//         } ${isSidebarOpen ? 'w-[280px]' : 'w-[70px]'}`}
//         aria-label="Dashboard navigation"
//       >
//         <AdminSidebar 
//           isOpen={isSidebarOpen} 
//           setIsOpen={setIsSidebarOpen} 
//           isMobile={isMobile}
//           isTablet={isTablet}
//         />
//       </aside>

//       {/* Mobile/Tablet Backdrop with blur effect */}
//       {(isMobile || isTablet) && isSidebarOpen && (
//         <div 
//           className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
//           onClick={handleCloseSidebar}
//         />
//       )}

//       {/* Main Content Area */}
//       <main 
//         className={`min-h-screen transition-all duration-300 ease-in-out ${getMainMargin()}`}
//       >
//         {/* Mobile Header */}
//         {isMobile && (
//           <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
//             <div className="flex items-center gap-2">
//               <button 
//                 onClick={() => setIsSidebarOpen(true)} 
//                 className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
//                 aria-label="Open menu"
//               >
//                 <Menu className="w-5 h-5" />
//               </button>
//               <span className="text-gray-900 font-bold text-lg">GreenScape</span>
//             </div>
//             <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
//               <User className="w-4 h-4 text-gray-600" />
//             </button>
//           </header>
//         )}

//         {/* Tablet Header */}
//         {isTablet && (
//           <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
//             <div className="flex items-center gap-2">
//               <button 
//                 onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
//                 className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
//                 aria-label="Toggle menu"
//               >
//                 {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//               </button>
//               <span className="text-gray-900 font-bold text-lg">GreenScape</span>
//             </div>
//             <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
//               <User className="w-4 h-4 text-gray-600" />
//             </button>
//           </header>
//         )}

//         {/* Desktop Header - NO BURGER MENU HERE */}
//         {!isMobile && !isTablet && (
//           <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
//             <div className="flex items-center gap-3">
//               <span className="text-gray-900 font-bold text-lg">GreenScape</span>
//               <span className="text-sm text-gray-500 hidden sm:inline">| Admin Dashboard</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="text-right hidden sm:block">
//                 <p className="text-sm font-medium text-gray-900">Admin User</p>
//                 <p className="text-xs text-gray-500">admin@greenscape.com</p>
//               </div>
//               <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
//                 <User className="w-4 h-4 text-gray-600" />
//               </button>
//             </div>
//           </header>
//         )}

//         {/* Dashboard Content - with proper padding and max-width */}
//         <div className="p-4 sm:p-6 lg:p-8">
//           <div className="max-w-[1200px] mx-auto w-full">
//             {children}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }




// new version 17/9/2026

// app/admin/dashboard/layout.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Menu, User, X } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';   // ✅ ADD THIS

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // ✅ Pull real user from context
  const { user } = useAuth();

  // Display name + email with graceful fallbacks
  const displayName =
    user?.firstName || user?.name || user?.username || 'Admin User';
  const displayEmail = user?.email || '';

  // Detect screen size with debounce for performance
  useEffect(() => {
    let resizeTimer;

    const checkScreen = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;

      setIsMobile(mobile);
      setIsTablet(tablet);

      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    checkScreen();

    const handler = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkScreen, 150);
    };

    window.addEventListener('resize', handler);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handler);
    };
  }, []);

  const handleCloseSidebar = useCallback(() => {
    if (isMobile || isTablet) {
      setIsSidebarOpen(false);
    }
  }, [isMobile, isTablet]);

  const getMainMargin = () => {
    if (isMobile) return 'ml-0';
    if (isSidebarOpen) return 'ml-[280px]';
    return 'ml-[70px]';
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full relative">

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
          isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'
        } ${isSidebarOpen ? 'w-[280px]' : 'w-[70px]'}`}
        aria-label="Dashboard navigation"
      >
        <AdminSidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />
      </aside>

      {/* Backdrop */}
      {(isMobile || isTablet) && isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={handleCloseSidebar}
        />
      )}

      <main
        className={`min-h-screen transition-all duration-300 ease-in-out ${getMainMargin()}`}
      >
        {/* Mobile Header */}
        {isMobile && (
          <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="text-gray-900 font-bold text-lg">GreenScape</span>
            </div>
            <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <User className="w-4 h-4 text-gray-600" />
            </button>
          </header>
        )}

        {/* Tablet Header */}
        {isTablet && (
          <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <span className="text-gray-900 font-bold text-lg">GreenScape</span>
            </div>
            <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <User className="w-4 h-4 text-gray-600" />
            </button>
          </header>
        )}

        {/* ✅ Desktop Header — now uses real user */}
        {!isMobile && !isTablet && (
          <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-gray-900 font-bold text-lg">GreenScape</span>
              <span className="text-sm text-gray-500 hidden sm:inline">
                | Admin Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">
                  {displayEmail}
                </p>
              </div>
              <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <User className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </header>
        )}

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1200px] mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}