"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { mockCases } from "../../data/mockCases";

const translations = {
  en: {
    title: "Operations desk",
    subtitle: "Triage, assign, and resolve cases with your team.",
    filters: "Filters",
    searchPlaceholder: "Search by name, city, or tag",
    status: "Status",
    priority: "Priority",
    type: "Case type",
    city: "City",
    assignee: "Assignee",
    unassigned: "Unassigned",
    queue: "Case queue",
    detail: "Case detail",
    actions: "Actions",
    assign: "Assign",
    resolve: "Mark resolved",
    escalate: "Escalate",
    timeline: "Activity timeline",
    contacts: "Contacts",
    notes: "Notes",
    responders: "Responders",
    sla: "SLA risk",
    open: "Open",
    resolved: "Resolved",
    missing: "Missing",
    found: "Found",
    high: "High",
    medium: "Medium",
    low: "Low",
    urgent: "Urgent",
    child: "Child",
    elderly: "Elderly",
    adult: "Adult",
    metricsOpen: "Open",
    metricsResolved: "Resolved",
    metricsUrgent: "Urgent",
    metricsAwaiting: "Awaiting verification",
    bulk: "Bulk actions",
    selectPrompt: "Select a case to view details",
    backToMap: "Open map",
    langLabel: "Language",
  },
  ur: {
    title: "آپریشنز ڈیسک",
    subtitle: "ٹیم کے ساتھ کیسز کو ترتیب دیں، تفویض کریں اور مکمل کریں۔",
    filters: "فلٹرز",
    searchPlaceholder: "نام، شہر یا ٹیگ سے تلاش کریں",
    status: "حالت",
    priority: "ترجیح",
    type: "کیس کی قسم",
    city: "شہر",
    assignee: "ذمہ دار",
    unassigned: "غیر تفویض شدہ",
    queue: "کیس کی قطار",
    detail: "کیس کی تفصیل",
    actions: "عمل",
    assign: "تفویض کریں",
    resolve: "حل شدہ نشان لگائیں",
    escalate: "بڑھائیں",
    timeline: "سرگرمی ٹائم لائن",
    contacts: "رابطے",
    notes: "نوٹس",
    responders: "جواب دہندگان",
    sla: "ایس ایل اے رسک",
    open: "کھلا",
    resolved: "حل شدہ",
    missing: "گمشدہ",
    found: "ملنے والا",
    high: "زیادہ",
    medium: "درمیانی",
    low: "کم",
    urgent: "ہنگامی",
    child: "بچہ",
    elderly: "معمر",
    adult: "بالغ",
    metricsOpen: "کھلے",
    metricsResolved: "حل شدہ",
    metricsUrgent: "ہنگامی",
    metricsAwaiting: "تصدیق کے منتظر",
    bulk: "اجتماعی عمل",
    selectPrompt: "تفصیل دیکھنے کے لیے کیس منتخب کریں",
    backToMap: "نقشہ کھولیں",
    langLabel: "زبان",
  },
};

function SectionTitle({ text, lang }) {
  return (
    <h2
      className={`text-lg font-semibold text-emerald-100 ${
        lang === "ur" ? "urdu-text" : ""
      }`}
      dir={lang === "ur" ? "rtl" : "ltr"}
    >
      {text}
    </h2>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass-card rounded-2xl border border-white/10 p-4">
      <div className="text-3xl font-semibold text-white">{value}</div>
      <div className="text-sm text-emerald-100">{label}</div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-emerald-50">
      {children}
    </span>
  );
}

function StatusBadge({ status, lang, priority }) {
  const copy = translations[lang];
  const label = status === "open" ? copy.open : copy.resolved;
  const priorityColor =
    priority === "high"
      ? "bg-amber-400/20 text-amber-100"
      : priority === "medium"
        ? "bg-emerald-400/20 text-emerald-100"
        : "bg-slate-400/20 text-slate-100";
  return (
    <span className={`rounded-full px-3 py-1 text-xs ${priorityColor}`}>{label}</span>
  );
}

function Select({ label, value, onChange, options, lang }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className={`text-xs text-emerald-50 ${lang === "ur" ? "urdu-text" : ""}`}
        dir={lang === "ur" ? "rtl" : "ltr"}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-900 text-white">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function AdminDashboard() {
  const [lang, setLang] = useState("en");
  const [statusFilter, setStatusFilter] = useState("any");
  const [priorityFilter, setPriorityFilter] = useState("any");
  const [typeFilter, setTypeFilter] = useState("any");
  const [cityFilter, setCityFilter] = useState("any");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(mockCases[0]?.case_id || "");

  const copy = translations[lang];

  const stats = useMemo(() => {
    const open = mockCases.filter((c) => c.status === "open").length;
    const resolved = mockCases.filter((c) => c.status === "resolved").length;
    const urgent = mockCases.filter((c) => c.priority === "high").length;
    const awaiting = mockCases.filter((c) => c.status === "open" && c.badge_tags?.includes("urgent")).length;
    return { open, resolved, urgent, awaiting };
  }, []);

  const cities = useMemo(() => Array.from(new Set(mockCases.map((c) => c.city))), []);

  const filtered = useMemo(() => {
    return mockCases.filter((c) => {
      const text = (search || "").toLowerCase();
      const haystack = [c.name, c.name_ur, c.city, c.area, c.description, c.description_ur]
        .join(" ")
        .toLowerCase();
      const matchesText = text ? haystack.includes(text) : true;
      const matchesStatus = statusFilter === "any" ? true : c.status === statusFilter;
      const matchesPriority = priorityFilter === "any" ? true : c.priority === priorityFilter;
      const matchesType = typeFilter === "any" ? true : c.case_type === typeFilter;
      const matchesCity = cityFilter === "any" ? true : c.city === cityFilter;
      return matchesText && matchesStatus && matchesPriority && matchesType && matchesCity;
    });
  }, [cityFilter, priorityFilter, search, statusFilter, typeFilter]);

  const selectedCase = useMemo(
    () => filtered.find((c) => c.case_id === selectedId) || filtered[0],
    [filtered, selectedId],
  );

  return (
    <div className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-8 lg:px-16">
      <div className="hero-blob blob-1" />
      <div className="hero-blob blob-2" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Module 3</p>
            <h1 className={`text-3xl font-semibold text-white ${lang === "ur" ? "urdu-text" : ""}`} dir={lang === "ur" ? "rtl" : "ltr"}>
              {copy.title}
            </h1>
            <p className="text-sm text-emerald-100/80" dir={lang === "ur" ? "rtl" : "ltr"}>
              {copy.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-100/80">{copy.langLabel}:</span>
            <button
              onClick={() => setLang("en")}
              className={`glass-card neo-press rounded-full px-4 py-2 text-sm ${
                lang === "en" ? "border border-emerald-400/60 text-white" : "text-emerald-100/80"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ur")}
              className={`glass-card neo-press rounded-full px-4 py-2 text-sm urdu-text ${
                lang === "ur" ? "border border-emerald-400/60 text-white" : "text-emerald-100/80"
              }`}
            >
              اردو
            </button>
            <Link
              href="/map"
              className="glass-card neo-press rounded-full px-4 py-2 text-sm text-white"
            >
              {copy.backToMap}
            </Link>
          </div>
        </header>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={copy.metricsOpen} value={stats.open} />
          <StatCard label={copy.metricsResolved} value={stats.resolved} />
          <StatCard label={copy.metricsUrgent} value={stats.urgent} />
          <StatCard label={copy.metricsAwaiting} value={stats.awaiting} />
        </div>

        {/* Filters */}
        <section className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle text={copy.filters} lang={lang} />
            <div className="flex items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="glass-card w-full rounded-full border border-white/10 px-4 py-3 text-sm text-white placeholder:text-emerald-100/60 sm:w-80"
              />
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs text-emerald-100">{copy.bulk}</span>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label={copy.status}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "any", label: "Any" },
                { value: "open", label: copy.open },
                { value: "resolved", label: copy.resolved },
              ]}
              lang={lang}
            />
            <Select
              label={copy.priority}
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: "any", label: "Any" },
                { value: "high", label: copy.high },
                { value: "medium", label: copy.medium },
                { value: "low", label: copy.low },
              ]}
              lang={lang}
            />
            <Select
              label={copy.type}
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "any", label: "Any" },
                { value: "missing", label: copy.missing },
                { value: "found", label: copy.found },
              ]}
              lang={lang}
            />
            <Select
              label={copy.city}
              value={cityFilter}
              onChange={setCityFilter}
              options={[{ value: "any", label: "Any" }, ...cities.map((c) => ({ value: c, label: c }))]}
              lang={lang}
            />
          </div>
        </section>

        {/* Main grid */}
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card rounded-3xl border border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <SectionTitle text={copy.queue} lang={lang} />
              <span className="text-xs text-emerald-100/80">{filtered.length} items</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((c) => (
                <article
                  key={c.case_id}
                  className={`glass-card neo-press flex flex-col gap-3 rounded-2xl border border-white/10 p-4 ${
                    c.case_id === selectedId ? "ring-2 ring-emerald-400/60" : ""
                  }`}
                  onClick={() => setSelectedId(c.case_id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">{c.case_id}</p>
                      <h3 className={`text-lg font-semibold text-white ${lang === "ur" ? "urdu-text" : ""}`} dir={lang === "ur" ? "rtl" : "ltr"}>
                        {lang === "ur" ? c.name_ur : c.name}
                      </h3>
                      <p className="text-xs text-emerald-100/80">{c.city} · {c.area}</p>
                    </div>
                    <StatusBadge status={c.status} priority={c.priority} lang={lang} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill>{c.case_type === "missing" ? copy.missing : copy.found}</Pill>
                    <Pill>{copy.priority}: {c.priority}</Pill>
                    {c.badge_tags?.slice(0, 2).map((t) => (
                      <Pill key={t}>{t}</Pill>
                    ))}
                  </div>
                  <p className="line-clamp-2 text-sm text-emerald-50/90" dir={lang === "ur" ? "rtl" : "ltr"}>
                    {lang === "ur" ? c.description_ur : c.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-emerald-100/80">
                    <span>{copy.sla}: {c.priority === "high" ? "4h" : c.priority === "medium" ? "12h" : "24h"}</span>
                    <span>{copy.assignee}: {copy.unassigned}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <SectionTitle text={copy.detail} lang={lang} />
              <div className="flex gap-2">
                <button className="glass-card rounded-full px-3 py-2 text-xs text-white">{copy.assign}</button>
                <button className="glass-card rounded-full px-3 py-2 text-xs text-white">{copy.escalate}</button>
                <button className="neo-press rounded-full bg-linear-to-r from-emerald-400 to-amber-300 px-3 py-2 text-xs font-semibold text-black">
                  {copy.resolve}
                </button>
              </div>
            </div>
            {selectedCase ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-xl border border-white/10">
                    {selectedCase.media?.[0] && (
                      <Image
                        src={selectedCase.media[0].thumbnail_url || selectedCase.media[0].file_url}
                        alt={selectedCase.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">{selectedCase.case_id}</p>
                    <h3 className={`text-xl font-semibold text-white ${lang === "ur" ? "urdu-text" : ""}`} dir={lang === "ur" ? "rtl" : "ltr"}>
                      {lang === "ur" ? selectedCase.name_ur : selectedCase.name}
                    </h3>
                    <p className="text-sm text-emerald-100/80">{selectedCase.city} · {selectedCase.area}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill>{selectedCase.case_type === "missing" ? copy.missing : copy.found}</Pill>
                  <Pill>{copy.priority}: {selectedCase.priority}</Pill>
                  {selectedCase.badge_tags?.map((t) => (
                    <Pill key={t}>{t}</Pill>
                  ))}
                </div>
                <p className="text-sm text-emerald-50" dir={lang === "ur" ? "rtl" : "ltr"}>
                  {lang === "ur" ? selectedCase.description_ur : selectedCase.description}
                </p>
                <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-emerald-100">
                  <div className="flex items-center justify-between">
                    <span>{copy.status}</span>
                    <StatusBadge status={selectedCase.status} priority={selectedCase.priority} lang={lang} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{copy.sla}</span>
                    <span className="text-white">{selectedCase.priority === "high" ? "4h target" : selectedCase.priority === "medium" ? "12h target" : "24h target"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{copy.contacts}</span>
                    <span className="text-white">Family, Police</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white">{copy.timeline}</p>
                  <div className="space-y-2 text-sm text-emerald-100">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-white">Verification requested</p>
                      <p className="text-xs text-emerald-100/70">2h ago · Ops</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <p className="text-white">Photo uploaded</p>
                      <p className="text-xs text-emerald-100/70">6h ago · Field</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-emerald-50">{copy.selectPrompt}</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
