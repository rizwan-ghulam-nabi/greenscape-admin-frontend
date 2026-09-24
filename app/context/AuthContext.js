// app/context/AuthContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check authentication by calling backend
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/admin/me', {
          method: 'GET',
          credentials: 'include', // ✅ Automatically sends httpOnly cookie
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.admin) {
            setUser(data.admin);
            // Store in localStorage for UI (optional)
            localStorage.setItem('adminUser', JSON.stringify(data.admin));
          } else {
            setUser(null);
            localStorage.removeItem('adminUser');
          }
        } else {
          setUser(null);
          localStorage.removeItem('adminUser');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        localStorage.removeItem('adminUser');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // ✅ Sets httpOnly cookie
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // ✅ Admin is returned from backend
      const admin = data.admin || data.user;
      
      if (!admin.isAdmin) {
        throw new Error('Access denied. Admin only.');
      }

      // ✅ Store admin in localStorage (for UI only)
      localStorage.setItem('adminUser', JSON.stringify(admin));
      setUser(admin);
      
      return { success: true, user: admin };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:5001/api/admin/logout', {
        method: 'POST',
        credentials: 'include', // ✅ Clears httpOnly cookie
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // ✅ Clear localStorage
      localStorage.removeItem('adminUser');
      setUser(null);
      
      // ✅ Redirect to login
      window.location.href = '/admin/login';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user, 
      isAdmin: user?.isAdmin || false, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}