'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Profile</h1>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 text-sm">User ID</p>
            <p className="text-lg font-semibold text-gray-900">{user.id}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="text-lg font-semibold text-gray-900">{user.email}</p>
          </div>
          {user.name && (
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="text-lg font-semibold text-gray-900">{user.name}</p>
            </div>
          )}
        </div>
        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="block text-center bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 font-semibold"
          >
            Back Home
          </Link>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
