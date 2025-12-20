"use client";

import { useMemo, useState } from "react";
import Filters from "../../modules/cases/Filters";
import CaseCard from "../../modules/cases/CaseCard";
import CaseDetailPanel from "../../modules/cases/CaseDetailPanel";
import { mockCases } from "../../data/mockCases";

const translations = {
  en: {
    filters: "Filters",
    searchPlaceholder: "Search by name, area, or detail",
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
    reported: "Reported",
    lastSeen: "Last seen",
    foundAt: "Found at",
    statusLabel: "Status",
    priorityLabel: "Priority",
    badgesLabel: "Badges",
    location: "Location",
    map: "Location Map",
    bilingual: "English",
  },
};

export default function CasesPage() {
  const [lang] = useState("en");
  const copy = translations[lang];

  const [state, setState] = useState({
    search: "",
    caseType: "any",
    status: "any",
    city: "any",
    gender: "any",
    priority: "any",
    badge: "any",
    dateFrom: "",
    dateTo: "",
    ageMin: 0,
    ageMax: 80,
  });
  const [selectedCaseId, setSelectedCaseId] = useState(mockCases[0].case_id);

  const filteredCases = useMemo(() => {
    return mockCases.filter((c) => {
      const textMatch = (state.search || "").toLowerCase();
      const haystack = [c.name, c.city, c.area, c.description].join(" ").toLowerCase();
      const matchesSearch = textMatch ? haystack.includes(textMatch) : true;
      const matchesType = state.caseType === "any" ? true : c.case_type === state.caseType;
      const matchesStatus = state.status === "any" ? true : c.status === state.status;
      const matchesGender = state.gender === "any" ? true : c.gender === state.gender;
      const matchesPriority = state.priority === "any" ? true : c.priority === state.priority;
      const matchesBadge = state.badge === "any" ? true : (c.badge_tags || []).includes(state.badge);
      const matchesCity = state.city === "any" ? true : c.city === state.city;
      const created = new Date(c.created_at);
      const fromOk = state.dateFrom ? created >= new Date(state.dateFrom) : true;
      const toOk = state.dateTo ? created <= new Date(state.dateTo) : true;
      const ageValue = c.age || (c.age_range ? parseInt(c.age_range) : 0);
      const matchesAge = ageValue >= state.ageMin && ageValue <= state.ageMax;
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
  }, [state]);

  const selectedCase = useMemo(() => filteredCases.find((c) => c.case_id === selectedCaseId) || filteredCases[0], [filteredCases, selectedCaseId]);
  const cities = Array.from(new Set(mockCases.map((c) => c.city)));

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
            <div className="text-lg font-semibold text-white">Browse Cases</div>
            <div className="text-sm text-emerald-100/80">Search and filter</div>
          </div>
        </div>
      </header>
      <Filters copy={copy} state={state} setState={setState} cities={cities} />
      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="card-grid">
          {filteredCases.map((c) => (
            <CaseCard key={c.case_id} c={c} lang={lang} copy={copy} onSelect={setSelectedCaseId} />
          ))}
        </div>
        <CaseDetailPanel c={selectedCase} copy={copy} />
      </section>
    </div>
  );
}
