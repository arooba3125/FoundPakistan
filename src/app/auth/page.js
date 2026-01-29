'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function AuthPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      {/* Animated background blobs */}
      <div className="hero-blob blob-1"></div>
      <div className="hero-blob blob-2"></div>
      
      <div className="relative z-10 w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Found Pakistan</h1>
            <p className="text-lg text-emerald-100/80">Choose how you'd like to access the platform</p>
          </div>

          {/* Access options */}
          <div className="flex justify-center">
            {/* User Login Card */}
            <Link href="/auth/user/login">
              <div className="glass-card rounded-3xl p-6 sm:p-8 cursor-pointer group hover:border-emerald-400/50 transition-all duration-300 flex flex-col justify-between w-full max-w-sm sm:max-w-md">
                <div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-400/20 mb-5 group-hover:bg-emerald-400/30 transition-colors">
                    <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">User Access</h2>
                  <p className="text-emerald-100/70 text-sm leading-relaxed">
                    Report missing or found persons. View case details, upload media, and help reunite families with their loved ones.
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <button className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-semibold py-2.5 rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-all duration-300 flex items-center justify-center gap-2 text-sm">
                    Sign In as User
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </Link>

            {/* Admin login intentionally not linked publicly for security */}
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/10 text-center">
            <p className="text-emerald-100/70 text-sm">
              Looking for something else?{' '}
              <Link href="/" className="text-emerald-400 hover:text-emerald-300 font-semibold">
                Return to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
