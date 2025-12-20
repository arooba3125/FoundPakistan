export default function Select({ label, value, onChange, options, className = "" }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="text-xs text-emerald-50">{label}</label>}
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
