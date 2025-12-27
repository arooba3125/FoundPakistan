'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OtpModal from '@/modules/shared/ui/OtpModal';

export default function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const { login, verifyOtpAndLogin, resendOtp, logout, loading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // On the user login page, only redirect if authenticated as a regular user.
    if (isAuthenticated && user?.role !== 'admin') {
      router.push('/');
    }
    // If authenticated as admin, do not auto-redirect here.
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(email, password, 'user'); // Pass 'user' as expected role
      // Login now requires OTP verification
      if (result.requiresOtp) {
        setShowOtpModal(true);
      } else {
        // Fallback (shouldn't happen with new flow)
        router.push('/');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleOtpVerify = async (otp) => {
    setOtpLoading(true);
    setError('');
    try {
      const result = await verifyOtpAndLogin(email, otp);
      if (result.user?.role === 'admin') {
        setError('Admin accounts cannot login here. Use the admin portal instead.');
        logout();
        setShowOtpModal(false);
        return;
      }
      setShowOtpModal(false);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      throw err; // Re-throw so modal can handle it
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpResend = async () => {
    try {
      await resendOtp(email);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative p-4">
      {/* Animated background blobs */}
      <div className="hero-blob blob-1"></div>
      <div className="hero-blob blob-2"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/auth" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 font-semibold text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Sign In</h1>
          <p className="text-emerald-100/60">User Account</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 space-y-6">
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30 transition-colors"
                placeholder="you@example.com"
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
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/30 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
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
              className="w-full mt-8 bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-bold py-3 rounded-xl hover:from-emerald-300 hover:to-emerald-400 disabled:from-gray-500 disabled:to-gray-600 disabled:text-gray-700 transition-all duration-300 neo-press"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-emerald-950 to-emerald-900 text-white/60">Or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-white/70 text-sm mb-4">Don't have an account?</p>
            <Link href="/auth/user/signup" className="inline-block w-full">
              <button className="w-full border border-emerald-400/50 text-emerald-400 font-semibold py-3 rounded-xl hover:bg-emerald-400/10 transition-colors">
                Create Account
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/50 text-xs">
            This is for regular users. <Link href="/auth" className="text-emerald-400 hover:text-emerald-300">Go back</Link> if you need admin access.
          </p>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          setError('');
        }}
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        email={email}
        isLoading={otpLoading}
      />
    </div>
  );
}
