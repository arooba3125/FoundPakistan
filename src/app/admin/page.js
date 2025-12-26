"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { caseApi } from "@/lib/caseApi";

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
  const lower = (status || "").toLowerCase();
  const label =
    lower === "pending" ? copy.metricsAwaiting :
    lower === "verified" ? copy.metricsOpen :
    lower === "found" ? copy.metricsResolved :
    lower === "rejected" ? "Rejected" : copy.metricsOpen;
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
  const router = useRouter();
  const { user, token, isAuthenticated, loading } = useAuth();
  const [lang, setLang] = useState("en");
  const [statusFilter, setStatusFilter] = useState("any");
  const [priorityFilter, setPriorityFilter] = useState("any");
  const [typeFilter, setTypeFilter] = useState("any");
  const [cityFilter, setCityFilter] = useState("any");
  const [search, setSearch] = useState("");
  const [cases, setCases] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // auth guard
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, loading, router, user]);

  // load cases
  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoadingCases(true);
      try {
        const data = await caseApi.getCases({}, token);
        setCases(data || []);
        if (data && data[0]) setSelectedId(data[0].case_id || data[0].id);
      } catch (err) {
        console.error("Failed to load cases:", err);
        setCases([]);
      } finally {
        setLoadingCases(false);
      }
    };
    load();
  }, [token]);

  const copy = translations[lang];

  const stats = useMemo(() => {
    const open = cases.filter((c) => (c.status || "").toLowerCase() === "verified").length;
    const resolved = cases.filter((c) => (c.status || "").toLowerCase() === "found").length;
    const urgent = cases.filter((c) => (c.priority || "").toLowerCase() === "high").length;
    const awaiting = cases.filter((c) => (c.status || "").toLowerCase() === "pending").length;
    return { open, resolved, urgent, awaiting };
  }, [cases]);

  const cities = useMemo(() => Array.from(new Set(cases.map((c) => c.city).filter(Boolean))), [cases]);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      const text = (search || "").toLowerCase();
      const haystack = [c.name, c.name_ur, c.city, c.area, c.description, c.description_ur]
        .join(" ")
        .toLowerCase();
      const matchesText = text ? haystack.includes(text) : true;
      const matchesStatus = statusFilter === "any" ? true : (c.status || "").toLowerCase() === statusFilter;
      const matchesPriority = priorityFilter === "any" ? true : (c.priority || "").toLowerCase() === priorityFilter;
      const matchesType = typeFilter === "any" ? true : c.case_type === typeFilter;
      const matchesCity = cityFilter === "any" ? true : c.city === cityFilter;
      return matchesText && matchesStatus && matchesPriority && matchesType && matchesCity;
    });
  }, [cases, cityFilter, priorityFilter, search, statusFilter, typeFilter]);

  const selectedCase = useMemo(
    () => filtered.find((c) => c.case_id === selectedId || c.id === selectedId) || filtered[0],
    [filtered, selectedId],
  );

  const updateCaseInState = (updated) => {
    setCases((prev) => prev.map((c) => {
      const cid = c.case_id || c.id;
      const uid = updated.case_id || updated.id;
      return cid === uid ? { ...c, ...updated } : c;
    }));
  };

  const verifySelected = async () => {
    if (!selectedCase) return;
    const caseId = selectedCase.case_id || selectedCase.id;
    if (!caseId) return;
    setActionLoading(true);
    try {
      const updated = await caseApi.verifyCase(caseId, token);
      updateCaseInState(updated);
      alert("Case verified successfully!");
    } catch (err) {
      console.error("Verify error:", err);
      alert(err.message || "Failed to verify case");
    } finally {
      setActionLoading(false);
    }
  };

  const markFound = async () => {
    if (!selectedCase) return;
    const caseId = selectedCase.case_id || selectedCase.id;
    if (!caseId) return;
    setActionLoading(true);
    try {
      const updated = await caseApi.markFound(caseId, token);
      updateCaseInState(updated);
      alert("Case marked as found successfully!");
    } catch (err) {
      console.error("Mark found error:", err);
      alert(err.message || "Failed to mark case as found");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectCase = async () => {
    if (!selectedCase) return;
    const caseId = selectedCase.case_id || selectedCase.id;
    if (!caseId) return;
    const reason = prompt("Enter rejection reason:");
    if (!reason || reason.trim() === "") {
      alert("Rejection reason is required");
      return;
    }
    setActionLoading(true);
    try {
      const updated = await caseApi.rejectCase(caseId, reason, token);
      updateCaseInState(updated);
      alert("Case rejected successfully!");
    } catch (err) {
      console.error("Reject error:", err);
      alert(err.message || "Failed to reject case");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>;
  }

  if (user?.role !== "admin") {
    return <div className="flex min-h-screen items-center justify-center text-white">Access denied. Admin only.</div>;
  }

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
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label={copy.status}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "any", label: "Any" },
                { value: "pending", label: "Pending" },
                { value: "verified", label: "Verified" },
                { value: "found", label: "Found" },
                { value: "rejected", label: "Rejected" },
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
                  key={c.case_id || c.id}
                  className={`glass-card neo-press flex flex-col gap-3 rounded-2xl border border-white/10 p-4 ${
                    (c.case_id || c.id) === selectedId ? "ring-2 ring-emerald-400/60" : ""
                  }`}
                  onClick={() => setSelectedId(c.case_id || c.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">{c.case_id || c.id}</p>
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
                <button
                  onClick={verifySelected}
                  disabled={actionLoading || !selectedCase || (selectedCase.status && ['rejected', 'found', 'verified'].includes(selectedCase.status.toLowerCase()))}
                  className="glass-card rounded-full px-3 py-2 text-xs text-white disabled:opacity-60"
                >
                  Verify
                </button>
                <button
                  onClick={rejectCase}
                  disabled={actionLoading || !selectedCase || (selectedCase.status && ['rejected', 'found', 'verified'].includes(selectedCase.status.toLowerCase()))}
                  className="glass-card rounded-full px-3 py-2 text-xs text-white disabled:opacity-60"
                >
                  Reject
                </button>
                <button
                  onClick={markFound}
                  disabled={actionLoading || !selectedCase || (selectedCase.status && ['rejected', 'found'].includes(selectedCase.status.toLowerCase()))}
                  className="neo-press rounded-full bg-linear-to-r from-emerald-400 to-amber-300 px-3 py-2 text-xs font-semibold text-black disabled:opacity-60"
                >
                  Mark Found
                </button>
              </div>
            </div>
            {selectedCase ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => selectedCase.media?.[0] && setSelectedImageIndex(0)}
                    className="h-16 w-16 overflow-hidden rounded-xl border border-white/10 cursor-pointer hover:border-emerald-400/60 transition-colors"
                  >
                    {selectedCase.media?.[0] && (
                      <Image
                        src={selectedCase.media[0].thumbnail_url || selectedCase.media[0].file_url || selectedCase.media[0].url}
                        alt={selectedCase.name}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">{selectedCase.case_id || selectedCase.id}</p>
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
                {selectedCase.media && selectedCase.media.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-white">Media Gallery</p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedCase.media.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className="h-16 w-16 overflow-hidden rounded-lg border border-white/10 hover:border-emerald-400/60 transition-colors"
                        >
                          <Image
                            src={img.thumbnail_url || img.file_url || img.url}
                            alt={`Case photo ${idx + 1}`}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-emerald-50">{copy.selectPrompt}</p>
            )}
          </div>
        </section>

        {/* Image Modal */}
        {selectedImageIndex !== null && selectedCase?.media?.[selectedImageIndex] && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImageIndex(null)}
          >
            <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative w-full bg-black rounded-2xl overflow-hidden">
                <Image
                  src={selectedCase.media[selectedImageIndex].file_url || selectedCase.media[selectedImageIndex].url}
                  alt={`${selectedCase.name} - Photo ${selectedImageIndex + 1}`}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain max-h-[80vh]"
                  priority
                />
              </div>
              {selectedCase.media.length > 1 && (
                <div className="mt-4 flex gap-2 justify-center">
                  <button
                    onClick={() => setSelectedImageIndex((idx) => Math.max(0, idx - 1))}
                    disabled={selectedImageIndex === 0}
                    className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-50 transition-colors"
                  >
                    ← Previous
                  </button>
                  <span className="px-4 py-2 text-emerald-100 text-sm">
                    {selectedImageIndex + 1} / {selectedCase.media.length}
                  </span>
                  <button
                    onClick={() => setSelectedImageIndex((idx) => Math.min(selectedCase.media.length - 1, idx + 1))}
                    disabled={selectedImageIndex === selectedCase.media.length - 1}
                    className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-50 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
