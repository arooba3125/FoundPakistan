"use client";

import Image from "next/image";
import { useCallback } from "react";

export default function CaseCard({ c, lang, copy, onSelect }) {
  const onClick = useCallback(() => onSelect(c.id), [c.id, onSelect]);
  return (
    <article
      className="glass-card neo-press relative overflow-hidden rounded-2xl border border-white/10"
      onClick={onClick}
    >
      <div className="relative h-48 w-full overflow-hidden">
        {c.media?.[0] && (
          <Image
            src={c.media[0].fileUrl}
            alt={c.personName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-3 flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-white">{c.personName}</h3>
          <p className="text-sm text-emerald-100">
            {c.type === "MISSING" ? copy.missing : copy.found} · {c.lastSeenLocation}
          </p>
        </div>
      </div>
      <div className="space-y-3 px-4 py-4">
        <p className="line-clamp-2 text-sm text-emerald-50/90">
          {c.description}
        </p>
        <div className="flex items-center justify-between text-xs text-emerald-100/80">
          <span>
            {copy.reported}: {new Date(c.createdAt).toLocaleDateString()}
          </span>
          <span>{c.status}</span>
        </div>
      </div>
    </article>
  );
}
