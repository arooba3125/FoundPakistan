import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export default function SiteFooter() {
  const { isAuthenticated, user } = useAuth();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16">
      <div className="glass-card relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-amber-200/10 to-transparent" />
        <div className="relative mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="glass-card glow-ring neo-press flex h-10 w-10 items-center justify-center rounded-2xl">
                <div className="h-5 w-5 rounded-full bg-gradient-to-br from-emerald-400 to-amber-300" />
              </div>
              <div>
                <p className="text-white">Found Pakistan</p>
                <p className="text-xs text-emerald-100/80">Reunite with care</p>
                <p className="urdu-text text-xs text-emerald-100/80">محبت کے ساتھ ملائیں</p>
              </div>
            </div>
            <p className="text-sm text-emerald-50/90 max-w-sm">
              A compassionate network for reporting, searching, and resolving missing and found cases.
            </p>
            {isAuthenticated && user && user.role !== "admin" && (
              <Link href="/report" className="neo-press glow-ring inline-block rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-5 py-2 text-sm font-semibold text-black">
                Report a Case
              </Link>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-white mb-3">Explore</p>
            <ul className="space-y-2 text-sm text-emerald-100">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/">Cases</Link></li>
              <li><Link href="/map">Map</Link></li>
              <li><Link href="/admin">Admin</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white mb-3">Resources</p>
            <ul className="space-y-2 text-sm text-emerald-100">
              <li><a href="#how">How it works</a></li>
              <li><a href="#" aria-disabled>Help Center</a></li>
              <li><a href="#" aria-disabled>Volunteer Signup</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-white mb-3">Legal</p>
            <ul className="space-y-2 text-sm text-emerald-100">
              <li><a href="#" aria-disabled>Privacy</a></li>
              <li><a href="#" aria-disabled>Terms</a></li>
            </ul>
            <p className="mt-4 text-sm font-semibold text-white">Contact</p>
            <ul className="space-y-2 text-sm text-emerald-100">
              <li><a href="mailto:hello@foundpakistan.org">hello@foundpakistan.org</a></li>
              <li><a href="#" aria-disabled>WhatsApp</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-16">
        <div className="mt-4 flex flex-col-reverse items-center justify-between gap-2 border-t border-white/10 py-4 sm:flex-row">
          <p className="text-xs text-emerald-100/80">© {year} Found Pakistan · Built with compassion</p>
          <div className="flex items-center gap-3">
            <a href="#" aria-disabled className="text-xs text-emerald-100/80">Twitter</a>
            <a href="#" aria-disabled className="text-xs text-emerald-100/80">Facebook</a>
            <a href="#" aria-disabled className="text-xs text-emerald-100/80">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
