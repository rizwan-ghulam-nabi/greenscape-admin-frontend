// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('adminToken')?.value;

  // ==========================================
  // 1. PUBLIC: /admin/login (No login required)
  // ==========================================
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // ==========================================
  // 2. PROTECTED: All other /admin/* routes
  // ==========================================
  if (pathname.startsWith('/admin')) {
    // No token = redirect to /admin/login
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// ==========================================
// CONFIG: Apply to all /admin routes
// ==========================================
export const config = {
  matcher: '/admin/:path*',
};