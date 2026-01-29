"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { caseApi } from "@/lib/caseApi";
import ContactRequestModal from "@/modules/shared/ui/ContactRequestModal";

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
    rejected: "Rejected",
    canceled: "Canceled",
    pending: "Pending",
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
    caseId: "Case ID",
    contactInfo: "Contact Information",
    contactName: "Contact Name",
    contactEmail: "Contact Email",
    contactPhone: "Contact Phone",
    age: "Age",
    gender: "Gender",
    cityArea: "City/Area",
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
    rejected: "مسترد",
    canceled: "منسوخ",
    pending: "زیر التواء",
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
    caseId: "کیس آئی ڈی",
    contactInfo: "رابطے کی معلومات",
    contactName: "رابطے کا نام",
    contactEmail: "رابطے کی ای میل",
    contactPhone: "رابطے کا فون",
    age: "عمر",
    gender: "جنس",
    cityArea: "شہر/علاقہ",
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

function HomeContent() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [cases, setCases] = useState([]);
  const [allCases, setAllCases] = useState([]); // Store all cases for stats
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCaseData, setSelectedCaseData] = useState(null); // Store case data fetched individually
  const [loadingCases, setLoadingCases] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showContactRequestModal, setShowContactRequestModal] = useState(false);
  const [contactRequestLoading, setContactRequestLoading] = useState(false);
  const [contactRequestSuccess, setContactRequestSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingCases(true);
      try {
        // Load all cases for accurate statistics
        const allData = await caseApi.getCases({});
        setAllCases(allData || []);
        
        // Filter to show only verified cases that are not cancelled
        const verifiedData = (allData || []).filter(c => 
          (c.status || "").toLowerCase() === "verified" && !c.cancelled_at
        );
        setCases(verifiedData);
        
        // Check if caseId is in URL query params
        const caseIdFromUrl = searchParams.get('caseId');
        if (caseIdFromUrl) {
          // Set the selectedCaseId from URL
          setSelectedCaseId(caseIdFromUrl);
          // Check if the case exists in allData (the loaded cases) and is not cancelled
          const caseInAll = (allData || []).find(c => 
            (c.case_id || c.id) === caseIdFromUrl && !c.cancelled_at
          );
          if (!caseInAll) {
            // Case not in the list or is cancelled, fetch it individually to check status
            // Clear any previous selectedCaseData first
            setSelectedCaseData(null);
            try {
              const singleCase = await caseApi.getCase(caseIdFromUrl);
              // Only set if not cancelled
              if (!singleCase.cancelled_at) {
                setSelectedCaseData(singleCase);
              } else {
                // Case is cancelled, clear selection
                setSelectedCaseData(null);
              }
            } catch (err) {
              console.error('Failed to load individual case:', err);
              setSelectedCaseData(null);
            }
          } else {
            // Case found in loaded cases, clear individually fetched data
            setSelectedCaseData(null);
          }
        } else {
          // No caseId in URL, clear individually fetched data and select first case
          setSelectedCaseData(null);
          if (verifiedData && verifiedData[0]) {
            setSelectedCaseId(verifiedData[0].case_id || verifiedData[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load cases:", err);
        setCases([]);
        setAllCases([]);
      } finally {
        setLoadingCases(false);
      }
    };
    load();
  }, [searchParams]);

  const goReport = () => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    router.push("/report");
  };

  const copy = translations[lang];

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Exclude cancelled cases from filtered results
      if (c.cancelled_at) return false;
      
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
      const matchesStatus = status === "any" ? true : (c.status || "").toLowerCase() === status.toLowerCase();
      const matchesGender = gender === "any" ? true : c.gender === gender;
      const matchesPriority =
        priority === "any" ? true : (c.priority || "").toLowerCase() === priority.toLowerCase();
      const matchesBadge =
        badge === "any" ? true : (c.badge_tags || []).includes(badge);
      const matchesCity = city === "any" ? true : c.city === city;

      const created = new Date(c.createdAt || c.created_at || Date.now());
      const fromOk = dateFrom ? created >= new Date(dateFrom) : true;
      const toOk = dateTo ? created <= new Date(dateTo) : true;

      const ageValue = c.age || 0;
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
    cases,
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
    // If we have individually fetched case data, use it (for cases not in the main list)
    // But only if it matches the currently selected case ID and is not cancelled
    if (selectedCaseData && (selectedCaseData.case_id === selectedCaseId || selectedCaseData.id === selectedCaseId)) {
      // Don't show cancelled cases even if accessed via URL
      if (selectedCaseData.cancelled_at) {
        return null;
      }
      return selectedCaseData;
    }
    
    // First, try to find the case in filteredCases
    let foundCase = filteredCases.find((c) => c.case_id === selectedCaseId || c.id === selectedCaseId);
    
    // If not found in filteredCases but we have a selectedCaseId, check allCases
    // This allows viewing cases that might not be verified or filtered out
    // But exclude cancelled cases
    if (!foundCase && selectedCaseId && allCases.length > 0) {
      foundCase = allCases.find((c) => 
        (c.case_id === selectedCaseId || c.id === selectedCaseId) && !c.cancelled_at
      );
    }
    
    // If still no case selected and we have filtered cases, select the first one
    if (!foundCase && !selectedCaseId && filteredCases[0]) {
      setSelectedCaseId(filteredCases[0].case_id || filteredCases[0].id);
      return filteredCases[0];
    }
    
    // Return the found case, or the first filtered case as fallback, or null
    return foundCase || filteredCases[0] || null;
  }, [filteredCases, selectedCaseId, allCases, selectedCaseData]);

  const stats = useMemo(() => {
    // Filter out cancelled cases from all stats
    const activeCases = allCases.filter((c) => !c.cancelled_at);
    
    // Calculate active cases (excluding found, rejected, and cancelled)
    const active = activeCases.filter((c) => {
      const s = (c.status || "").toLowerCase();
      return !["found", "rejected"].includes(s);
    }).length;
    
    // Count resolved cases (found status, excluding cancelled)
    const resolved = activeCases.filter((c) => (c.status || "").toLowerCase() === "found").length;
    
    // Count cases created today (excluding cancelled)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = activeCases.filter((c) => {
      const created = new Date(c.createdAt || c.created_at || Date.now());
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    }).length;
    
    return { 
      active, 
      resolved, 
      total: activeCases.length, 
      newToday 
    };
  }, [allCases]);

  const cities = Array.from(new Set(allCases.map((c) => c.city).filter(Boolean)));

  return (
    <div className="relative overflow-hidden px-4 pb-24 pt-10 sm:px-8 lg:px-16">
      <div className="hero-blob blob-1" />
      <div className="hero-blob blob-2" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        {/* Hero */}
        <section className="glass-card relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-400/10 via-amber-200/10 to-transparent" />
          <div className="relative mb-4 flex justify-end gap-2">
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
          </div>
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
                <Link
                  href="/report"
                  onClick={(e) => {
                    e.preventDefault();
                    goReport();
                  }}
                  className="neo-press glow-ring rounded-full bg-linear-to-r from-emerald-400 to-amber-300 px-6 py-3 text-sm font-semibold text-black"
                >
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
            <div className="grid w-full gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="glass-card w-full rounded-full border border-white/10 px-4 py-3 text-sm text-white placeholder:text-emerald-100/60"
              />
              <button className="neo-press rounded-full bg-white/10 px-4 py-3 text-sm text-white w-full sm:w-auto">
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
              { value: "verified", label: copy.open },
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          <div className="glass-card rounded-3xl border border-white/10 p-5">
            <div className="mb-4 flex items-center justify-between">
              <SectionTitle text={copy.cases} lang={lang} />
              <span className="text-xs text-emerald-100/80">{filteredCases.length} {filteredCases.length === 1 ? 'case' : 'cases'}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {loadingCases && (
                <div className="col-span-2 text-sm text-emerald-100 p-4 text-center">Loading latest cases…</div>
              )}
              {!loadingCases && filteredCases.length === 0 && (
                <div className="col-span-2 glass-card rounded-2xl border border-white/10 p-8 text-center">
                  <p className="text-emerald-100">No cases match your filters. Try adjusting them.</p>
                </div>
              )}
              {filteredCases.map((c) => (
              <article
                key={c.case_id || c.id}
                className={`glass-card neo-press flex flex-col gap-3 rounded-2xl border border-white/10 p-4 ${
                  (c.case_id || c.id) === selectedCaseId ? "ring-2 ring-emerald-400/60" : ""
                }`}
                onClick={() => setSelectedCaseId(c.case_id || c.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {c.media?.[0] && (
                      <div className="mb-2 h-32 w-full overflow-hidden rounded-xl border border-white/10">
                        <Image
                          src={c.media[0].file_url || c.media[0].url}
                          alt={c.name}
                          width={300}
                          height={128}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-100 truncate">{c.case_id || c.id}</p>
                    <h3 className={`text-lg font-semibold text-white mt-1 ${lang === "ur" ? "urdu-text" : ""}`} dir={lang === "ur" ? "rtl" : "ltr"}>
                      {lang === "ur" ? c.name_ur : c.name}
                    </h3>
                    <p className="text-xs text-emerald-100/80 mt-1">{c.city}{c.area ? ` · ${c.area}` : ''}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`rounded-full px-3 py-1 text-xs ${
                      c.cancelled_at
                        ? "bg-gray-400/20 text-gray-100"
                        : (c.status || "").toLowerCase() === "found" 
                        ? "bg-blue-400/20 text-blue-100"
                        : (c.status || "").toLowerCase() === "rejected"
                        ? "bg-red-400/20 text-red-100"
                        : (c.status || "").toLowerCase() === "pending"
                        ? "bg-yellow-400/20 text-yellow-100"
                        : "bg-emerald-400/20 text-emerald-100"
                    }`}>
                      {c.cancelled_at
                        ? copy.canceled
                        : (c.status || "").toLowerCase() === 'found' 
                        ? copy.resolved 
                        : (c.status || "").toLowerCase() === 'rejected'
                        ? copy.rejected
                        : (c.status || "").toLowerCase() === 'pending'
                        ? copy.pending
                        : copy.open}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TagPill>{c.case_type === "missing" ? copy.missing : copy.found}</TagPill>
                  <TagPill>{copy.priority}: {c.priority}</TagPill>
                  {c.badge_tags?.slice(0, 2).map((t) => (
                    <TagPill key={t}>{t}</TagPill>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-emerald-100/80">
                  {c.age && <span>Age: {c.age}</span>}
                  {c.gender && <span>· Gender: {c.gender === 'male' ? copy.male : c.gender === 'female' ? copy.female : c.gender}</span>}
                  {c.last_seen_date && <span>· {c.case_type === 'missing' ? copy.lastSeen : copy.foundAt}: {new Date(c.last_seen_date).toLocaleDateString()}</span>}
                </div>
                <p className="line-clamp-2 text-sm text-emerald-50/90" dir={lang === "ur" ? "rtl" : "ltr"}>
                  {lang === "ur" ? c.description_ur : c.description}
                </p>
                <div className="flex items-center justify-between text-xs text-emerald-100/80 pt-1 border-t border-white/10">
                  <span>{copy.reported}: {c.createdAt || c.created_at ? new Date(c.createdAt || c.created_at).toLocaleDateString() : 'N/A'}</span>
                  {c.contact_phone && (
                    <span className="text-emerald-300">📞 Contact Available</span>
                  )}
                </div>
              </article>
              ))}
            </div>
          </div>

          {/* Case detail side panel */}
          <aside className="glass-card sticky top-6 h-fit rounded-3xl border border-white/10 p-6">
            {selectedCase ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => selectedCase.media?.[0] && setSelectedImageIndex(0)}
                    className="h-12 w-12 overflow-hidden rounded-xl border border-white/10 cursor-pointer hover:border-emerald-400/60 transition-colors"
                  >
                    {selectedCase.media?.[0] && (
                      <Image
                        src={selectedCase.media[0].file_url || selectedCase.media[0].url}
                        alt={selectedCase.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                   <div>
                     <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">{copy.statusLabel}</p>
                     <p className="text-lg font-semibold text-white">
                       {selectedCase.cancelled_at
                         ? copy.canceled
                         : (selectedCase.status || "").toLowerCase() === 'found' 
                         ? copy.resolved 
                         : (selectedCase.status || "").toLowerCase() === 'rejected'
                         ? copy.rejected
                         : (selectedCase.status || "").toLowerCase() === 'pending'
                         ? copy.pending
                         : copy.open}
                     </p>
                   </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">
                    {lang === "ur" ? selectedCase.name_ur : selectedCase.name}
                  </h3>
                  <p className="text-xs text-emerald-100/70 mt-1 font-mono">
                    {copy.caseId}: {selectedCase.case_id || selectedCase.id}
                  </p>
                  <p className="urdu-text text-sm text-emerald-50/90 mt-2">
                    {lang === "ur" ? selectedCase.description_ur : selectedCase.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.badge_tags?.map((t) => (
                    <CaseBadge key={t} tag={t} lang={lang} />
                  ))}
                </div>
                
                {/* Important Case Details */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-100">{copy.priorityLabel}</span>
                    <span className="text-white font-semibold capitalize">{selectedCase.priority}</span>
                  </div>
                  {(selectedCase.age || selectedCase.gender) && (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-100">{copy.age}/{copy.gender}</span>
                      <span className="text-white">
                        {selectedCase.age && <>{selectedCase.age} {selectedCase.gender ? `· ${selectedCase.gender === 'male' ? copy.male : selectedCase.gender === 'female' ? copy.female : selectedCase.gender}` : ''}</>}
                        {!selectedCase.age && selectedCase.gender && (selectedCase.gender === 'male' ? copy.male : selectedCase.gender === 'female' ? copy.female : selectedCase.gender)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-100">{copy.cityArea}</span>
                    <span className="text-white">{selectedCase.city}{selectedCase.area ? `, ${selectedCase.area}` : ''}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-100">{copy.reported}</span>
                    <span className="text-white text-xs">
                      {selectedCase.createdAt || selectedCase.created_at 
                        ? new Date(selectedCase.createdAt || selectedCase.created_at).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  {selectedCase.last_seen_location && (
                    <div className="flex items-start justify-between">
                      <span className="text-emerald-100">{copy.location}</span>
                      <span className="text-white text-right max-w-[60%]">{selectedCase.last_seen_location}</span>
                    </div>
                  )}
                  {selectedCase.last_seen_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-100">{selectedCase.case_type === "missing" ? copy.lastSeen : copy.foundAt}</span>
                      <span className="text-white text-xs">
                        {new Date(selectedCase.last_seen_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Request Contact Information */}
                {selectedCase.status?.toLowerCase() !== 'found' && selectedCase.status?.toLowerCase() !== 'rejected' && !selectedCase.cancelled_at && (
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-900/10 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-emerald-100 mb-1">Have Information?</p>
                        <p className="text-xs text-emerald-100/80 mb-3">
                          If you have information about this case, you can request to contact the case reporter.
                        </p>
                        <button
                          onClick={() => {
                            const caseId = selectedCase.case_id || selectedCase.id;
                            if (caseId) {
                              setShowContactRequestModal(true);
                            }
                          }}
                          className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-semibold py-2.5 rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-all text-sm"
                        >
                          📧 Request Contact Information
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm text-emerald-100">{copy.gallery}</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {selectedCase.media?.map((m, idx) => (
                      <button
                        key={m.media_id || idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className="h-20 w-24 overflow-hidden rounded-lg border border-white/10 cursor-pointer hover:border-emerald-400/60 transition-colors"
                      >
                        <Image
                          src={m.thumbnail_url || m.file_url || m.url}
                          alt={selectedCase.name}
                          width={96}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-emerald-100">{copy.map}</p>
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    <iframe
                      title="Case location"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        selectedCase.last_seen_location || "Pakistan"
                      )}&output=embed`}
                      className="h-48 w-full"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                </div>
                <Link
                  href="/report"
                  onClick={(e) => {
                    e.preventDefault();
                    goReport();
                  }}
                  className="neo-press block w-full rounded-full bg-linear-to-r from-emerald-400 to-amber-300 px-4 py-3 text-center text-sm font-semibold text-black"
                >
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

      {/* Contact Request Modal */}
      <ContactRequestModal
        isOpen={showContactRequestModal}
        onClose={() => {
          setShowContactRequestModal(false);
          setContactRequestSuccess(false);
        }}
        onSubmit={async (email, message) => {
          if (!selectedCase) return;
          setContactRequestLoading(true);
          try {
            const caseId = selectedCase.case_id || selectedCase.id;
            await caseApi.requestContact(caseId, email, message);
            setContactRequestSuccess(true);
            setTimeout(() => {
              setShowContactRequestModal(false);
              setContactRequestSuccess(false);
            }, 2000);
          } catch (err) {
            alert(err.message || 'Failed to send contact request');
          } finally {
            setContactRequestLoading(false);
          }
        }}
        caseName={selectedCase?.name || 'this case'}
        isLoading={contactRequestLoading}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
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

