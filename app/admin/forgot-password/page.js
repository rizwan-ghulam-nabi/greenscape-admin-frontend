// app/admin/forgot-password/page.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email');

      setSent(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">

      {/* ===== LEFT: BRAND PANEL ===== */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col p-12 text-white overflow-hidden">
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/images/img.jpg"
            alt="Plant Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#052e16]/95 via-[#052e16]/85 to-[#052e16]/95 z-0"></div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-16">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 7v8" />
                <path d="M8 9v4" />
                <path d="M16 9v4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">GreenScape</h1>
              <p className="text-green-200/80 text-sm">Admin Panel</p>
            </div>
          </div>

          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-400/20 px-3 py-1 rounded-full text-xs text-green-300 mb-4">
              <Sparkles className="w-3 h-3" /> Password Recovery
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Locked out?<br />
              We&apos;ve got <span className="text-green-400">you.</span>
            </h2>
            <p className="text-green-100/70 text-lg max-w-md">
              Enter your admin email address and we&apos;ll send you a secure link to reset your password.
            </p>
          </div>

          <div className="mt-auto space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-800/40 p-2 rounded-full mt-1">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Bank-Level Security</h3>
                <p className="text-green-100/60 text-sm">Tokens are hashed and expire after 1 hour.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-800/40 p-2 rounded-full mt-1">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Instant Delivery</h3>
                <p className="text-green-100/60 text-sm">Reset links arrive in your inbox within seconds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT: FORM PANEL ===== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/admin/login" className="inline-block">
              <span className="text-3xl font-extrabold text-[#0f5a2e]">Green</span>
              <span className="text-3xl font-extrabold text-gray-800">Scape</span>
            </Link>
            <p className="text-[11px] text-gray-500 mt-1">Admin Panel</p>
          </div>

          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0f5a2e] mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </Link>

          {sent ? (
            // ===== SUCCESS STATE =====
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-[#0f5a2e]" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Check Your Email 📬</h1>
              <p className="text-gray-500 mb-2">
                We&apos;ve sent a password reset link to:
              </p>
              <p className="font-mono text-sm text-[#0f5a2e] bg-green-50 border border-green-200 rounded-lg px-4 py-2 inline-block mb-6">
                {email}
              </p>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">What to do next</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-[#0f5a2e] font-bold">1.</span>
                    <span>Open the email from GreenScape Admin</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-[#0f5a2e] font-bold">2.</span>
                    <span>Click the &quot;Reset Password&quot; button</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-[#0f5a2e] font-bold">3.</span>
                    <span>Create your new password</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-6">
                Didn&apos;t get it? Check your spam folder, or{' '}
                <button
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                  className="text-[#0f5a2e] font-medium hover:underline"
                >
                  try again
                </button>
              </p>

              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 text-sm text-[#0f5a2e] font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          ) : (
            // ===== FORM STATE =====
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-[#0f5a2e]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Mail className="w-7 h-7 text-[#0f5a2e]" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                <p className="text-gray-500">
                  No problem. Enter your email and we&apos;ll send you a link to reset it.
                </p>
              </div>

              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f5a2e] focus:border-transparent transition-all"
                      placeholder="admin@greenscape.com"
                      required
                      disabled={loading}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3.5 bg-[#0f5a2e] text-white rounded-xl font-semibold hover:bg-[#0a4221] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f5a2e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-900/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>The link expires in 1 hour for your security</span>
              </div>
            </>
          )}

          <div className="mt-10 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} GreenScape. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}