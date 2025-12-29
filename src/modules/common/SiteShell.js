"use client";

import SiteFooter from "./Footer";
import SiteHeader from "./SiteHeader";

export default function SiteShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main className="pt-6">{children}</main>
      <SiteFooter />
    </div>
  );
}
