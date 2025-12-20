"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Hero from "../modules/home/Hero";

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
    newToday: "آج کے نئے",
    viewCase: "کیس دیکھیں",
    signIn: "سائن ان",
    signUp: "اکاؤنٹ بنائیں",
    reset: "پاس ورڈ ری سیٹ کریں",
    email: "ای میل",
        // Mock numbers for hero stats; detailed browse moved to /cases
        return { active: 12, resolved: 34, total: 120, newToday: 3 };
    worksTitle: "یہ کیسے کام کرتا ہے",
    step3: "کمیونٹی اور حکام مل کر تلاش اور ملاپ کرتے ہیں۔",
    bilingual: "اردو",
  },
};

const badgeCopy = {
            {/* Top bar minimal */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="glass-card glow-ring neo-press flex h-12 w-12 items-center justify-center rounded-2xl">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-amber-300 shadow-lg" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-white">Found Pakistan</div>
                  <div className="text-sm text-emerald-100/80">Reunite with care</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
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
                <Link href="/report" className="glass-card neo-press rounded-full px-4 py-2 text-sm text-white">
                  {copy.ctaPrimary}
                </Link>
              </div>
            </header>

            <Hero copy={copy} stats={stats} />

            {/* How it works only */}
            <section id="how" className="glass-card rounded-3xl border border-white/10 p-6 sm:p-10">
              <div className="flex items-baseline gap-2">
                <h2 className="text-lg font-semibold text-emerald-100">{copy.worksTitle}</h2>
                <span className="urdu-text text-sm text-emerald-50">{translations.ur.worksTitle}</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[copy.step1, copy.step2, copy.step3].map((step, idx) => (
                  <div key={idx} className="glass-card neo-press rounded-2xl border border-white/10 p-4">
                    <p className="text-sm text-white">{step}</p>
                  </div>
                ))}
              </div>
            </section>
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-amber-300 shadow-lg" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">Found Pakistan</div>
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
            <SectionTitle en={copy.filters} ur={translations.ur.filters} />
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
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
                <Link href="/report" className="neo-press block w-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-4 py-3 text-center text-sm font-semibold text-black">
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
          <SectionTitle en={copy.worksTitle} ur={translations.ur.worksTitle} />
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
        <button className="neo-press w-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-4 py-3 text-sm font-semibold text-black">
          {copy.submit}
        </button>
      </form>
    </div>
  );
}
