"use client";

import Image from "next/image";
import { useCallback } from "react";

export default function CaseCard({ c, lang, copy, onSelect }) {
  const onClick = useCallback(() => onSelect(c.case_id), [c.case_id, onSelect]);
  return (
    <article
      className="glass-card neo-press relative overflow-hidden rounded-2xl border border-white/10"
      onClick={onClick}
    >
      <div className="relative h-48 w-full overflow-hidden">
        {c.media?.[0] && (
          <Image
            src={c.media[0].file_url}
            alt={c.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-3 flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-white">{lang === "ur" ? c.name_ur : c.name}</h3>
          <p className="text-sm text-emerald-100">
            {c.case_type === "missing" ? copy.missing : copy.found} · {c.city}
          </p>
        </div>
      </div>
      <div className="space-y-3 px-4 py-4">
        <p className="line-clamp-2 text-sm text-emerald-50/90">
          {lang === "ur" ? c.description_ur : c.description}
        </p>
        <div className="flex items-center justify-between text-xs text-emerald-100/80">
          <span>
            {copy.reported}: {c.created_at}
          </span>
          <span>{c.area}</span>
        </div>
      </div>
    </article>
  );
}
