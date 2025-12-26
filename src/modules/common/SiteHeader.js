"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function SiteHeader() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleReport = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    router.push("/report");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="glass-card glow-ring neo-press flex h-12 w-12 items-center justify-center rounded-2xl">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-amber-300 shadow-lg" />
          </div>
          <div>
            <Link href="/" className="text-lg font-semibold text-white">
              Found Pakistan
            </Link>
            <p className="text-xs text-emerald-100/80">Reunite with care</p>
          </div>
        </div>

        <nav className="flex items-center gap-3 text-sm text-emerald-100/80">
          <Link href="/" className="hover:text-white">Cases</Link>
          <Link href="/map" className="hover:text-white">Map</Link>
          <Link href="/report" className="hover:text-white" onClick={(e) => { e.preventDefault(); handleReport(); }}>
            Report
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="hover:text-white">Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="glass-card neo-press rounded-full px-4 py-2 text-sm text-emerald-100/80 hover:text-white hover:border-emerald-400/60"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="neo-press glow-ring rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-4 py-2 text-sm font-semibold text-black"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                className="glass-card neo-press rounded-full px-4 py-2 text-sm text-emerald-100/80 hover:text-white hover:border-emerald-400/60"
              >
                {user?.name || user?.email}
              </Link>
              <button
                onClick={handleReport}
                className="neo-press glow-ring rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-4 py-2 text-sm font-semibold text-black"
              >
                Report a Case
              </button>
              <button
                onClick={handleLogout}
                className="glass-card neo-press rounded-full px-4 py-2 text-sm text-emerald-100/80 hover:text-white hover:border-emerald-400/60"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
