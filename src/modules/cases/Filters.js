"use client";

export default function Filters({ copy, state, setState, cities }) {
  const update = (patch) => setState((s) => ({ ...s, ...patch }));
  return (
    <section className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-lg font-semibold text-emerald-100">{copy.filters}</h2>
          <span className="urdu-text text-sm text-emerald-50">{copy.bilingual}</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={state.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder={copy.searchPlaceholder}
            className="glass-card w-full rounded-full border border-white/10 px-4 py-3 text-sm text-white placeholder:text-emerald-100/60 sm:w-80"
          />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {renderSelect(copy.caseType, state.caseType, (v) => update({ caseType: v }), [
          { value: "any", label: copy.any },
          { value: "missing", label: copy.missing },
          { value: "found", label: copy.found },
        ])}
        {renderSelect(copy.status, state.status, (v) => update({ status: v }), [
          { value: "any", label: copy.any },
          { value: "open", label: copy.open },
          { value: "resolved", label: copy.resolved },
        ])}
        {renderSelect(copy.city, state.city, (v) => update({ city: v }), [
          { value: "any", label: copy.any },
          ...cities.map((c) => ({ value: c, label: c })),
        ])}
        {renderSelect(copy.gender, state.gender, (v) => update({ gender: v }), [
          { value: "any", label: copy.any },
          { value: "male", label: copy.male },
          { value: "female", label: copy.female },
        ])}
        {renderSelect(copy.priority, state.priority, (v) => update({ priority: v }), [
          { value: "any", label: copy.any },
          { value: "high", label: copy.high },
          { value: "medium", label: copy.medium },
          { value: "low", label: copy.low },
        ])}
        {renderSelect(copy.badge, state.badge, (v) => update({ badge: v }), [
          { value: "any", label: copy.any },
          { value: "urgent", label: copy.urgent },
          { value: "child", label: copy.child },
          { value: "elderly", label: copy.elderly },
          { value: "adult", label: copy.adult },
        ])}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-emerald-50">{copy.date}</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={state.dateFrom}
              onChange={(e) => update({ dateFrom: e.target.value })}
              className="glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
            />
            <input
              type="date"
              value={state.dateTo}
              onChange={(e) => update({ dateTo: e.target.value })}
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
              value={state.ageMin}
              onChange={(e) => update({ ageMin: Number(e.target.value) })}
              className="glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
            />
            <input
              type="number"
              min={0}
              max={90}
              value={state.ageMax}
              onChange={(e) => update({ ageMax: Number(e.target.value) })}
              className="glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function renderSelect(label, value, onChange, options) {
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
