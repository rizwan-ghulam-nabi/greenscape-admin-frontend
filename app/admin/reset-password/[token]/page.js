// app/admin/reset-password/[token]/page.jsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff,
  ArrowLeft, ShieldCheck, Sparkles, KeyRound,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ==========================================
// PASSWORD STRENGTH METER
// ==========================================
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score === 3) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
  if (score === 4) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
  return { score: 4, label: 'Strong', color: 'bg-green-500' };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const requirements = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains a number', met: /\d/.test(password) },
  ], [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Missing reset token. Please request a new reset link.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/admin/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
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
              <Sparkles className="w-3 h-3" /> Secure Reset
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Choose a strong<br />
              new <span className="text-green-400">password.</span>
            </h2>
            <p className="text-green-100/70 text-lg max-w-md">
              Your new password will be encrypted and stored securely. Pick something strong that you&apos;ll remember.
            </p>
          </div>

          <div className="mt-auto space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-800/40 p-2 rounded-full mt-1">
                <ShieldCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">End-to-End Encrypted</h3>
                <p className="text-green-100/60 text-sm">bcrypt hashing with salt for maximum security.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-green-800/40 p-2 rounded-full mt-1">
                <KeyRound className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Single-Use Token</h3>
                <p className="text-green-100/60 text-sm">This reset link can only be used once.</p>
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

          {!success && (
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0f5a2e] mb-8 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          )}

          {success ? (
            // ===== SUCCESS STATE =====
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6 relative">
                <CheckCircle className="w-10 h-10 text-[#0f5a2e]" />
                <span className="absolute inset-0 rounded-full bg-green-400/30 animate-ping"></span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Password Updated! 🎉</h1>
              <p className="text-gray-500 mb-8">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#0f5a2e] flex-shrink-0" />
                  <p className="text-sm text-green-800 text-left">
                    Redirecting you to login in a few seconds...
                  </p>
                </div>
              </div>

              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-[#0f5a2e] text-white rounded-xl font-semibold hover:bg-[#0a4221] transition-colors shadow-lg shadow-green-900/10"
              >
                Go to Login Now
              </Link>
            </div>
          ) : (
            // ===== FORM STATE =====
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-[#0f5a2e]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 text-[#0f5a2e]" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h1>
                <p className="text-gray-500">
                  Choose a strong password to secure your admin account.
                </p>
              </div>

              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f5a2e] focus:border-transparent transition-all"
                      placeholder="Enter new password"
                      required
                      disabled={loading}
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500">Password strength</span>
                        <span className={`text-xs font-semibold ${
                          strength.score === 1 ? 'text-red-500' :
                          strength.score === 2 ? 'text-orange-500' :
                          strength.score === 3 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength.score ? strength.color : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full pl-12 pr-12 py-3.5 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f5a2e] focus:border-transparent transition-all ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-red-300 bg-red-50/50'
                          : 'border-gray-300'
                      }`}
                      placeholder="Confirm new password"
                      required
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Passwords don&apos;t match
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && password.length >= 8 && (
                    <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>

                {/* Requirements checklist */}
                {password && (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                      Password Requirements
                    </p>
                    <div className="space-y-1.5">
                      {requirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                            req.met ? 'bg-green-100' : 'bg-gray-200'
                          }`}>
                            {req.met ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <span className="w-1 h-1 rounded-full bg-gray-400" />
                            )}
                          </div>
                          <span className={req.met ? 'text-gray-700' : 'text-gray-400'}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || password !== confirmPassword || password.length < 8}
                  className="w-full py-3.5 bg-[#0f5a2e] text-white rounded-xl font-semibold hover:bg-[#0a4221] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0f5a2e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-900/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Reset Password
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Your password is encrypted with bcrypt</span>
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