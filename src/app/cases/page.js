"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Filters from "../../modules/cases/Filters";
import CaseCard from "../../modules/cases/CaseCard";
import CaseDetailPanel from "../../modules/cases/CaseDetailPanel";
import { casesAPI } from "../../lib/api";

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
  const router = useRouter();

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
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState(null);

  useEffect(() => {
    async function fetchCases() {
      try {
        setLoading(true);
        const filters = {};
        if (state.caseType !== "any") filters.type = state.caseType;
        if (state.status !== "any") filters.status = state.status;
        if (state.search) filters.q = state.search;
        
        const data = await casesAPI.getAll(filters);
        setCases(data);
        if (data.length > 0 && !selectedCaseId) {
          setSelectedCaseId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch cases:", error);
        setCases([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, [state.caseType, state.status, state.search]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const textMatch = (state.search || "").toLowerCase();
      const haystack = [c.personName, c.lastSeenLocation, c.description].join(" ").toLowerCase();
      const matchesSearch = textMatch ? haystack.includes(textMatch) : true;
      const matchesGender = state.gender === "any" ? true : c.gender === state.gender;
      const matchesCity = state.city === "any" ? true : c.lastSeenLocation?.includes(state.city);
      const created = new Date(c.createdAt);
      const fromOk = state.dateFrom ? created >= new Date(state.dateFrom) : true;
      const toOk = state.dateTo ? created <= new Date(state.dateTo) : true;
      const ageValue = c.age || 0;
      const matchesAge = ageValue >= state.ageMin && ageValue <= state.ageMax;
      return (
        matchesSearch &&
        matchesGender &&
        matchesCity &&
        fromOk &&
        toOk &&
        matchesAge
      );
    });
  }, [cases, state]);

  const selectedCase = useMemo(() => filteredCases.find((c) => c.id === selectedCaseId) || filteredCases[0], [filteredCases, selectedCaseId]);
  const cities = Array.from(new Set(cases.map((c) => c.lastSeenLocation).filter(Boolean)));

  if (loading) {
    return (
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-8 lg:px-16">
        <div className="text-center text-white">Loading cases...</div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-8 lg:px-16">
      <div className="hero-blob blob-1" />
      <div className="hero-blob blob-2" />
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="glass-card glow-ring neo-press flex h-12 w-12 items-center justify-center rounded-2xl">
            <div className="h-6 w-6 rounded-full bg-linear-to-br from-emerald-400 to-amber-300 shadow-lg" />
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
            <CaseCard key={c.id} c={c} lang={lang} copy={copy} onSelect={setSelectedCaseId} />
          ))}
        </div>
        <CaseDetailPanel c={selectedCase} copy={copy} />
      </section>
    </div>
  );
}
