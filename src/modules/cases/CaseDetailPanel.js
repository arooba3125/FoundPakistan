"use client";

import Image from "next/image";

export default function CaseDetailPanel({ c, copy }) {
  if (!c) return <p className="text-sm text-emerald-50">No case selected.</p>;
  return (
    <aside className="glass-card sticky top-6 h-fit rounded-3xl border border-white/10 p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-xl border border-white/10">
            {c.media?.[0] && (
              <Image src={c.media[0].fileUrl} alt={c.personName} width={48} height={48} className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">{copy.statusLabel}</p>
            <p className="text-lg font-semibold text-white">{c.status === "OPEN" ? copy.open : copy.resolved}</p>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-white">{c.personName}</h3>
          <p className="text-sm text-emerald-50/90">{c.description}</p>
        </div>
        <div className="space-y-2 text-sm text-emerald-100">
          <p>
            <strong className="text-white">{copy.age}:</strong> {c.age}
          </p>
          <p>
            <strong className="text-white">{copy.gender}:</strong> {c.gender}
          </p>
          <p>
            <strong className="text-white">{copy.location}:</strong> {c.lastSeenLocation}
          </p>
          <p>
            <strong className="text-white">{c.type === "MISSING" ? copy.lastSeen : copy.foundAt}:</strong> {new Date(c.lastSeenAt).toLocaleDateString()}
          </p>
          <p>
            <strong className="text-white">{copy.contact}:</strong> {c.reporterContact}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-emerald-100">{copy.map}</p>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <iframe
              title="Case location"
              src={`https://www.google.com/maps?q=${encodeURIComponent(c.lastSeenLocation || "Pakistan")}&output=embed`}
              className="h-48 w-full"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
