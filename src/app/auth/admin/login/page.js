'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const { login, logout, loading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      router.push('/admin');
    } else if (isAuthenticated && user?.role !== 'admin') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsAdminVerified(false);

    try {
      const result = await login(email, password);
      
      // Verify the user is an admin
      if (result.user?.role !== 'admin') {
        setError('Access denied. Only admin accounts can login here. Contact your administrator if you believe this is an error.');
        setIsAdminVerified(false);
        // Clear token so user is not logged in via admin portal
        logout();
        // Don't redirect immediately - let user see the error for 3 seconds
        setTimeout(() => {
          router.push('/auth/user/login');
        }, 3000);
        return;
      }

      setIsAdminVerified(true);
      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setIsAdminVerified(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative p-4">
      {/* Prevent indexing by search engines */}
      <head>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      {/* Animated background blobs - using amber gradient for admin */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-40 -left-40 bg-gradient-radial from-amber-600/30 via-amber-600/10 to-transparent blur-3xl opacity-40 rounded-full"></div>
        <div className="absolute w-96 h-96 -bottom-40 -right-40 bg-gradient-radial from-amber-500/30 via-amber-500/10 to-transparent blur-3xl opacity-40 rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/auth" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 mb-6 font-semibold text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v4h8v-4zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Admin Portal</h1>
          </div>
          <p className="text-amber-100/60 text-sm">Secure Administrative Access</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 space-y-6 border-amber-400/20">
          {/* Security Notice */}
          <div className="bg-amber-900/30 border border-amber-400/30 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-amber-200">This portal is restricted to authorized administrators only.</span>
          </div>

          {error && (
            <div className="bg-red-400/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-xl text-sm font-medium">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {isAdminVerified && (
            <div className="bg-emerald-900/30 border border-emerald-400/50 text-emerald-200 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Admin verified. Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="admin@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-white">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
                      <path d="M15.171 13.576l1.414 1.414a10.015 10.015 0 01-15.753-8.464 9.99 9.99 0 012.274-4.039l1.414 1.414a7.986 7.986 0 01-1.206 1.375 8.002 8.002 0 0011.857 8.715zm-5.171-8.576a4 4 0 114.83 6.39l-1.47-1.47a2.003 2.003 0 002.45-2.45l-1.81-1.81z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold py-3 rounded-xl hover:from-amber-300 hover:to-amber-400 disabled:from-gray-500 disabled:to-gray-600 disabled:text-gray-700 transition-all duration-300 neo-press"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying credentials...
                </span>
              ) : (
                'Access Admin Portal'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white/60">or</span>
            </div>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-white/70 text-sm mb-4">Not an admin?</p>
            <Link href="/auth/user/login" className="inline-block w-full">
              <button className="w-full border border-emerald-400/50 text-emerald-400 font-semibold py-3 rounded-xl hover:bg-emerald-400/10 transition-colors">
                Sign In as User
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/50 text-xs">
            If you believe you should have admin access, contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
