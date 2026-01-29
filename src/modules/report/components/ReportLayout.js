"use client";

import ToggleLang from "../../shared/ui/ToggleLang";

export default function ReportLayout({ lang, setLang, title, children }) {
  return (
    <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-8 lg:px-12">
      <div className="hero-blob blob-1" />
      <div className="hero-blob blob-2" />
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="glass-card glow-ring neo-press flex h-12 w-12 items-center justify-center rounded-2xl">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-amber-300 shadow-lg" />
          </div>
          <div>
            <div className="text-lg font-semibold text-white">{title}</div>
            <div className="text-sm text-emerald-100/80">Step-by-step guided</div>
          </div>
        </div>
        <ToggleLang lang={lang} setLang={setLang} />
      </header>
      <div className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
}
