"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { mockCases } from "../data/mockCases";

const translations = {
  en: {
    heroTitle: "Found Pakistan",
    heroSubtitle:
      "Report, search, and reunite loved ones. Built for families, volunteers, and authorities working together.",
    searchPlaceholder: "Search by name, area, or detail",
    filters: "Filters",
    caseType: "Case Type",
    status: "Status",
    city: "City/Area",
    gender: "Gender",
    priority: "Priority",
    badge: "Badge",
    date: "Date range",
    age: "Age range",
    missing: "Missing",
    found: "Found",
    open: "Open",
    resolved: "Resolved",
    male: "Male",
    female: "Female",
    any: "Any",
    high: "High",
    medium: "Medium",
    low: "Low",
    urgent: "Urgent",
    child: "Child",
    elderly: "Elderly",
    adult: "Adult",
    cases: "Cases",
    activeCases: "Active cases",
    resolvedCases: "Resolved",
    newToday: "New today",
    viewCase: "View case",
    reported: "Reported",
    lastSeen: "Last seen",
    foundAt: "Found at",
    statusLabel: "Status",
    priorityLabel: "Priority",
    badgesLabel: "Badges",
    location: "Location",
    map: "Location Map",
    gallery: "Media",
    ctaPrimary: "Report a Case",
    ctaSecondary: "See how it works",
    authTitle: "Access your space",
    signIn: "Sign in",
    signUp: "Create account",
    reset: "Reset password",
    email: "Email",
    password: "Password",
    name: "Full name",
    submit: "Submit",
    worksTitle: "How it works",
    step1: "Submit a missing or found report with photos and key details.",
    step2: "Our team and partners verify and surface urgent cases first.",
    step3: "Community and authorities collaborate to locate and reunite.",
    bilingual: "English",
  },
  ur: {
    heroTitle: "فاؤنڈ پاکستان",
    heroSubtitle:
      "گمشدہ یا ملنے والے افراد کی اطلاع دیں، تلاش کریں اور ملائیں۔ خاندان، رضاکار اور حکام ایک ساتھ۔",
    searchPlaceholder: "نام، علاقے یا تفصیل سے تلاش کریں",
    filters: "فلٹرز",
    caseType: "کیس کی قسم",
    status: "حالت",
    city: "شہر/علاقہ",
    gender: "جنس",
    priority: "ترجیح",
    badge: "بیج",
    date: "تاریخ",
    age: "عمر",
    missing: "گمشدہ",
    found: "ملنے والا",
    open: "کھلا",
    resolved: "حل شدہ",
    male: "مرد",
    female: "خاتون",
    any: "کوئی بھی",
    high: "زیادہ",
    medium: "درمیانی",
    low: "کم",
    urgent: "ہنگامی",
    child: "بچہ",
    elderly: "معمر",
    adult: "بالغ",
    cases: "کیسز",
    activeCases: "فعال کیسز",
    resolvedCases: "حل شدہ",
    newToday: "آج کے نئے",
    viewCase: "کیس دیکھیں",
    reported: "درج شدہ",
    lastSeen: "آخری جگہ",
    foundAt: "جہاں ملا",
    statusLabel: "حالت",
    priorityLabel: "ترجیح",
    badgesLabel: "بیجز",
    location: "مقام",
    map: "نقشہ",
    gallery: "میڈیا",
    ctaPrimary: "نیا کیس درج کریں",
    ctaSecondary: "طریقہ کار دیکھیں",
    authTitle: "اپنا اکاؤنٹ کھولیں",
    signIn: "سائن ان",
    signUp: "اکاؤنٹ بنائیں",
    reset: "پاس ورڈ ری سیٹ کریں",
    email: "ای میل",
    password: "پاس ورڈ",
    name: "مکمل نام",
    submit: "جمع کریں",
    worksTitle: "یہ کیسے کام کرتا ہے",
    step1: "گمشدہ یا ملنے والے کی اطلاع تصاویر اور تفصیلات کے ساتھ دیں۔",
    step2: "ہماری ٹیم اور پارٹنرز تصدیق کر کے اہم کیسز کو نمایاں کرتے ہیں۔",
    step3: "کمیونٹی اور حکام مل کر تلاش اور ملاپ کرتے ہیں۔",
    bilingual: "اردو",
  },
};

const badgeCopy = {
  urgent: { en: "Urgent", ur: "ہنگامی" },
  child: { en: "Child", ur: "بچہ" },
  elderly: { en: "Elderly", ur: "معمر" },
  adult: { en: "Adult", ur: "بالغ" },
};

function CaseBadge({ tag, lang }) {
  const label = badgeCopy[tag]?.[lang] || tag;
  return (
    <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-emerald-100">
      {label}
    </span>
  );
}

function TagPill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-emerald-50">
      {children}
    </span>
  );
}

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

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [search, setSearch] = useState("");
  const [caseType, setCaseType] = useState("any");
  const [status, setStatus] = useState("any");
  const [city, setCity] = useState("any");
  const [gender, setGender] = useState("any");
  const [priority, setPriority] = useState("any");
  const [badge, setBadge] = useState("any");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [ageMin, setAgeMin] = useState(0);
  const [ageMax, setAgeMax] = useState(80);
  const [selectedCaseId, setSelectedCaseId] = useState(mockCases[0].case_id);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const copy = translations[lang];

  const filteredCases = useMemo(() => {
    return mockCases.filter((c) => {
      const textMatch = (search || "").toLowerCase();
      const haystack = [
        c.name,
        c.name_ur,
        c.city,
        c.area,
        c.description,
        c.description_ur,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = textMatch ? haystack.includes(textMatch) : true;
      const matchesType = caseType === "any" ? true : c.case_type === caseType;
      const matchesStatus = status === "any" ? true : c.status === status;
      const matchesGender = gender === "any" ? true : c.gender === gender;
      const matchesPriority =
        priority === "any" ? true : c.priority === priority;
      const matchesBadge =
        badge === "any" ? true : (c.badge_tags || []).includes(badge);
      const matchesCity = city === "any" ? true : c.city === city;

      const created = new Date(c.created_at);
      const fromOk = dateFrom ? created >= new Date(dateFrom) : true;
      const toOk = dateTo ? created <= new Date(dateTo) : true;

      const ageValue = c.age || (c.age_range ? parseInt(c.age_range) : 0);
      const matchesAge = ageValue >= ageMin && ageValue <= ageMax;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesGender &&
        matchesPriority &&
        matchesBadge &&
        matchesCity &&
        fromOk &&
        toOk &&
        matchesAge
      );
    });
  }, [
    search,
    caseType,
    status,
    gender,
    priority,
    badge,
    city,
    dateFrom,
    dateTo,
    ageMin,
    ageMax,
  ]);

  const selectedCase = useMemo(() => {
    return (
      filteredCases.find((c) => c.case_id === selectedCaseId) || filteredCases[0]
    );
  }, [filteredCases, selectedCaseId]);

  const stats = useMemo(() => {
    const active = mockCases.filter((c) => c.status === "open").length;
    const resolved = mockCases.filter((c) => c.status === "resolved").length;
    return { active, resolved, total: mockCases.length, newToday: 3 };
  }, []);

  const cities = Array.from(new Set(mockCases.map((c) => c.city)));

  return (
    <div className="relative overflow-hidden px-4 pb-24 pt-10 sm:px-8 lg:px-16">
      <div className="hero-blob blob-1" />
      <div className="hero-blob blob-2" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        {/* Top bar */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="glass-card glow-ring neo-press flex h-12 w-12 items-center justify-center rounded-2xl">
              <div className="h-6 w-6 rounded-full bg-linear-to-br from-emerald-400 to-amber-300 shadow-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">Found Pakistan</div>
              <div className="text-sm text-emerald-100/80">Reunite with care</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="glass-card neo-press rounded-full px-4 py-2 text-sm text-emerald-100/80 hover:text-white hover:border-emerald-400/60"
            >
              Profile
            </Link>
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
            <button className="glass-card neo-press rounded-full px-4 py-2 text-sm text-white">
              {copy.ctaPrimary}
            </button>
          </div>
        </header>

        {/* Hero */}
        <section className="glass-card relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-400/10 via-amber-200/10 to-transparent" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="flex-1 space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-50">
                Public + Authorities + Compassion
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                {copy.heroTitle}
              </h1>
              <p className="max-w-2xl text-lg text-emerald-50">{copy.heroSubtitle}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/report" className="neo-press glow-ring rounded-full bg-linear-to-r from-emerald-400 to-amber-300 px-6 py-3 text-sm font-semibold text-black">
                  {copy.ctaPrimary}
                </Link>
                <a href="#how" className="glass-card neo-press rounded-full px-6 py-3 text-sm text-white">
                  {copy.ctaSecondary}
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label={copy.activeCases} value={stats.active} />
                <StatCard label={copy.resolvedCases} value={stats.resolved} />
                <StatCard label={copy.cases} value={stats.total} />
                <StatCard label={copy.newToday} value={stats.newToday} />
              </div>
            </div>
            <div className="glass-card neo-press relative h-80 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-emerald-900/40 via-slate-900/50 to-amber-800/20 p-4">
              <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="absolute -right-8 -bottom-6 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Live safety net</p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">Map pulse</h3>
                  <p className="text-sm text-emerald-50/90">
                    Geo-tagged cases and verified updates help responders move faster.
                  </p>
                </div>
                <div className="aspect-video overflow-hidden rounded-xl border border-white/10">
                  <iframe
                    title="Lahore Map"
                    src="https://www.google.com/maps?q=Lahore&output=embed"
                    allowFullScreen
                    loading="lazy"
                    className="h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & filters */}
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
              <button className="neo-press rounded-full bg-white/10 px-4 py-3 text-sm text-white">
                {copy.viewCase}
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select label={copy.caseType} value={caseType} onChange={setCaseType} options={[
              { value: "any", label: copy.any },
              { value: "missing", label: copy.missing },
              { value: "found", label: copy.found },
            ]} />
            <Select label={copy.status} value={status} onChange={setStatus} options={[
              { value: "any", label: copy.any },
              { value: "open", label: copy.open },
              { value: "resolved", label: copy.resolved },
            ]} />
            <Select label={copy.city} value={city} onChange={setCity} options={[{ value: "any", label: copy.any }, ...cities.map((c) => ({ value: c, label: c }))]} />
            <Select label={copy.gender} value={gender} onChange={setGender} options={[
              { value: "any", label: copy.any },
              { value: "male", label: copy.male },
              { value: "female", label: copy.female },
            ]} />
            <Select label={copy.priority} value={priority} onChange={setPriority} options={[
              { value: "any", label: copy.any },
              { value: "high", label: copy.high },
              { value: "medium", label: copy.medium },
              { value: "low", label: copy.low },
            ]} />
            <Select label={copy.badge} value={badge} onChange={setBadge} options={[
              { value: "any", label: copy.any },
              { value: "urgent", label: copy.urgent },
              { value: "child", label: copy.child },
              { value: "elderly", label: copy.elderly },
              { value: "adult", label: copy.adult },
            ]} />
            <div className="flex flex-col gap-2">
              <label className="text-xs text-emerald-50">{copy.date}</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-emerald-50">{copy.age}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={90}
                  value={ageMin}
                  onChange={(e) => setAgeMin(Number(e.target.value))}
                  className="glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
                />
                <input
                  type="number"
                  min={0}
                  max={90}
                  value={ageMax}
                  onChange={(e) => setAgeMax(Number(e.target.value))}
                  className="glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Cases grid */}
        <section className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="card-grid">
            {filteredCases.map((c) => (
              <article
                key={c.case_id}
                className="glass-card neo-press relative overflow-hidden rounded-2xl border border-white/10"
                onClick={() => setSelectedCaseId(c.case_id)}
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
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
                  <div className="absolute left-3 top-3 flex gap-2">
                    <CaseBadge tag={c.priority === "high" ? "urgent" : c.badge_tags?.[0] || "urgent"} lang={lang} />
                  </div>
                  <div className="absolute bottom-3 left-3 flex flex-col gap-1">
                    <h3 className="text-lg font-semibold text-white">{lang === "ur" ? c.name_ur : c.name}</h3>
                    <p className="text-sm text-emerald-100">
                      {c.case_type === "missing" ? copy.missing : copy.found} · {c.city}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <TagPill>{c.case_type === "missing" ? copy.missing : copy.found}</TagPill>
                    <TagPill>{c.status === "open" ? copy.open : copy.resolved}</TagPill>
                    <TagPill>{copy.priority}: {c.priority}</TagPill>
                  </div>
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
            ))}
          </div>

          {/* Case detail side panel */}
          <aside className="glass-card sticky top-6 h-fit rounded-3xl border border-white/10 p-6">
            {selectedCase ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-xl border border-white/10">
                    {selectedCase.media?.[0] && (
                      <Image
                        src={selectedCase.media[0].file_url}
                        alt={selectedCase.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">{copy.statusLabel}</p>
                    <p className="text-lg font-semibold text-white">
                      {selectedCase.status === "open" ? copy.open : copy.resolved}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    {lang === "ur" ? selectedCase.name_ur : selectedCase.name}
                  </h3>
                  <p className="urdu-text text-sm text-emerald-50/90">
                    {lang === "ur" ? selectedCase.description_ur : selectedCase.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.badge_tags?.map((t) => (
                    <CaseBadge key={t} tag={t} lang={lang} />
                  ))}
                </div>
                <div className="space-y-2 text-sm text-emerald-100">
                  <p>
                    <strong className="text-white">{copy.priorityLabel}:</strong> {selectedCase.priority}
                  </p>
                  <p>
                    <strong className="text-white">{copy.location}:</strong> {selectedCase.last_seen_location || selectedCase.found_location}
                  </p>
                  <p>
                    <strong className="text-white">{selectedCase.case_type === "missing" ? copy.lastSeen : copy.foundAt}:</strong> {selectedCase.last_seen_date || selectedCase.found_date}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-emerald-100">{copy.gallery}</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {selectedCase.media?.map((m) => (
                      <div key={m.media_id} className="h-20 w-24 overflow-hidden rounded-lg border border-white/10">
                        <Image
                          src={m.thumbnail_url || m.file_url}
                          alt={selectedCase.name}
                          width={96}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-emerald-100">{copy.map}</p>
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <iframe
                      title="Case location"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        selectedCase.last_seen_location || selectedCase.found_location || "Pakistan"
                      )}&output=embed`}
                      className="h-48 w-full"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                </div>
                <Link href="/report" className="neo-press block w-full rounded-full bg-linear-to-r from-emerald-400 to-amber-300 px-4 py-3 text-center text-sm font-semibold text-black">
                  {copy.ctaPrimary}
                </Link>
              </div>
            ) : (
              <p className="text-sm text-emerald-50">No case selected.</p>
            )}
          </aside>
        </section>

        {/* How it works */}
        <section id="how" className="glass-card rounded-3xl border border-white/10 p-6 sm:p-10">
          <SectionTitle text={copy.worksTitle} lang={lang} />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[copy.step1, copy.step2, copy.step3].map((step, idx) => (
              <div key={idx} className="glass-card neo-press rounded-2xl border border-white/10 p-4">
                <p className="text-sm text-white">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Auth stubs */}
        <section className="grid gap-6 lg:grid-cols-3">
          <AuthCard title={copy.signIn} copy={copy} />
          <AuthCard title={copy.signUp} copy={copy} />
          <AuthCard title={copy.reset} copy={copy} />
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass-card rounded-2xl border border-white/10 p-4 text-center">
      <div className="text-3xl font-semibold text-white">{value}</div>
      <div className="text-sm text-emerald-100">{label}</div>
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-emerald-50">{label}</label>
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

function AuthCard({ title, copy }) {
  return (
    <div className="glass-card neo-press rounded-2xl border border-white/10 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <form className="mt-4 space-y-3">
        {title === copy.signUp && (
          <input
            placeholder={copy.name}
            className="glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-emerald-100/60"
          />
        )}
        <input
          type="email"
          placeholder={copy.email}
          className="glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-emerald-100/60"
        />
        {title !== copy.reset && (
          <input
            type="password"
            placeholder={copy.password}
            className="glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-emerald-100/60"
          />
        )}
        <button className="neo-press w-full rounded-full bg-linear-to-r from-emerald-400 to-amber-300 px-4 py-3 text-sm font-semibold text-black">
          {copy.submit}
        </button>
      </form>
    </div>
  );
}
