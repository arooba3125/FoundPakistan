"use client";

import MapView from "../../modules/map/MapView";

export default function MapPage() {
  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-8 lg:px-16">
      <div className="hero-blob blob-1" />
      <div className="hero-blob blob-2" />
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="glass-card glow-ring neo-press flex h-12 w-12 items-center justify-center rounded-2xl">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-amber-300 shadow-lg" />
          </div>
          <div>
            <div className="text-lg font-semibold text-white">Case Map</div>
            <div className="text-sm text-emerald-100/80">Pakistan-wide overview</div>
          </div>
        </div>
      </header>
      <MapView />
    </div>
  );
}
