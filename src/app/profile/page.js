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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="space-y-4">
          <div>
            <p className="text-gray-600 text-sm">User ID</p>
            <p className="text-lg font-semibold">{user.id}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="text-lg font-semibold">{user.email}</p>
          </div>
          {user.name && (
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="text-lg font-semibold">{user.name}</p>
            </div>
          )}
        </div>
        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="block text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Back Home
          </Link>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
