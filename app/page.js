'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Loader from './loader';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [currentBg, setCurrentBg] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);
  const [time, setTime] = useState(new Date());
  const router = useRouter();
  const checkedRef = useRef(false);

  const bgImages = [
    'https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1407305/pexels-photo-1407305.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/4503751/pexels-photo-4503751.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/4503267/pexels-photo-4503267.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/4505175/pexels-photo-4505175.jpeg?auto=compress&cs=tinysrgb&w=1920',
  ];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!checkedRef.current) {
      checkedRef.current = true;
      
      if (typeof window !== 'undefined') {
        // ✅ Check COOKIE, not localStorage
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('adminToken='))
          ?.split('=')[1];
        
        // ✅ Only read user from localStorage if cookie exists
        if (token) {
          const userStr = localStorage.getItem('adminUser');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              if (user.isAdmin) {
                setIsAdminLoggedIn(true);
                setAdminName(user.firstName || 'Admin');
              }
            } catch (e) {}
          }
        } else {
          // ❌ No cookie → clear localStorage to prevent false login
          localStorage.removeItem('adminUser');
          setIsAdminLoggedIn(false);
        }
      }
    }

    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setFadeIn(true), 100);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5001/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('adminUser');
    setIsAdminLoggedIn(false);
    setAdminName('');
    router.push('/admin/login');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <Loader size={120} label="Growing your garden" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-green-900">
      {bgImages.map((img, index) => (
        <div
          key={index}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${img})`,
            opacity: currentBg === index ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
            zIndex: 0,
          }}
        />
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 z-[1]" />

      <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
        <div className="absolute top-[5%] left-[5%] w-[50vw] h-[50vw] sm:w-72 sm:h-72 md:w-96 md:h-96 bg-green-500/15 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute top-[15%] right-[5%] w-[40vw] h-[40vw] sm:w-60 sm:h-60 md:w-80 md:h-80 bg-yellow-500/15 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[5%] left-[20%] w-[45vw] h-[45vw] sm:w-64 sm:h-64 md:w-96 md:h-96 bg-emerald-500/15 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {isAdminLoggedIn && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-600/90 to-green-700/90 backdrop-blur-sm text-white py-2 sm:py-3 px-3 sm:px-6 text-center z-30 animate-slideDown">
          <p className="text-[10px] sm:text-sm font-medium tracking-wide">
            👋 Welcome back, <strong>{adminName}</strong>! 
          </p>
        </div>
      )}

      <div 
        className={`text-center relative z-10 px-3 sm:px-4 w-full max-w-6xl mx-auto py-8 sm:py-12 transition-all duration-1000 ease-out ${
          fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="mb-6 sm:mb-8">
          <div className="clock-container inline-block">
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-wider tabular-nums drop-shadow-2xl">
              {formatTime(time)}
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm text-green-300/80 mt-2 tracking-wide font-medium">
              {formatDate(time)}
            </div>
            <div className="flex justify-center gap-1 mt-1.5">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="logo-container w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600" />
            <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-2 tracking-tight drop-shadow-lg">
          GreenScape
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="h-px w-4 sm:w-8 md:w-10 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          <span className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-green-300 drop-shadow-md tracking-wide">
            Admin Panel
          </span>
          <div className="h-px w-4 sm:w-8 md:w-10 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        </div>
        
        <p className="text-gray-200 mb-6 sm:mb-8 max-w-[90%] sm:max-w-sm mx-auto text-[11px] sm:text-xs md:text-sm leading-relaxed drop-shadow-md opacity-75">
          Manage your plant inventory, track orders, and grow your business with ease.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-center mb-8 sm:mb-12">
          {isAdminLoggedIn ? (
            <>
              <button onClick={() => router.push('/admin/dashboard')} className="btn-modern btn-dashboard">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 btn-icon-z" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="btn-icon-z">Dashboard</span>
              </button>
              <button onClick={handleLogout} className="btn-modern btn-logout">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 btn-icon-z" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="btn-icon-z">Logout</span>
              </button>
            </>
          ) : (
            <button onClick={() => router.push('/admin/login')} className="btn-modern btn-login">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 btn-icon-z" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="btn-icon-z">Admin Login</span>
            </button>
          )}
        </div>

        <div className="border-t border-white/10 pt-4 sm:pt-6">
          <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-400/60 tracking-wider">
            © 2024 GreenScape. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-slideDown { animation: slideDown 0.5s ease-out; }

        .clock-container {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          padding: 1rem 2rem;
          border-radius: 1.5rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .logo-container {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .logo-container:hover {
          transform: scale(1.1) rotate(5deg);
        }

        .btn-modern {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.7rem 2rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 0.75rem;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.5);
          cursor: pointer;
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
          background: transparent;
          transition: all 0.3s ease;
          font-family: inherit;
          outline: none;
        }

        @media (min-width: 640px) {
          .btn-modern {
            padding: 0.8rem 2.5rem;
            font-size: 0.95rem;
            border-radius: 0.875rem;
          }
        }
        @media (min-width: 768px) {
          .btn-modern {
            padding: 0.9rem 3rem;
            font-size: 1rem;
            border-radius: 1rem;
          }
        }

        .btn-login::before,
        .btn-dashboard::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0%;
          height: 100%;
          background: linear-gradient(135deg, #059669, #047857);
          transition: width 0.5s ease;
          z-index: 0;
        }

        .btn-login:hover::before,
        .btn-dashboard:hover::before {
          width: 100%;
        }

        .btn-login:hover,
        .btn-dashboard:hover {
          border-color: transparent;
          box-shadow: 0 10px 30px rgba(5, 150, 105, 0.5);
          transform: translateY(-2px);
        }

        .btn-logout::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 0%;
          height: 100%;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          transition: width 0.5s ease;
          z-index: 0;
        }

        .btn-logout:hover::before {
          width: 100%;
        }

        .btn-logout:hover {
          border-color: transparent;
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.5);
          transform: translateY(-2px);
        }

        .btn-icon-z {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}