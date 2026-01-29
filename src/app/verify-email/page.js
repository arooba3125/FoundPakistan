'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home since email verification is no longer needed
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50">
      <p className="text-gray-600">Redirecting...</p>
    </div>
  );
}
