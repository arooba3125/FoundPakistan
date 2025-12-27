export default function Select({ label, value, onChange, options, className = "", required = false }) {
  const selectValue = value !== undefined && value !== null && value !== "" ? value : "";
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="text-xs text-emerald-50">{label} {required && <span className="text-red-400">*</span>}</label>}
      <select
        value={selectValue}
        onChange={(e) => onChange(e.target.value || null)}
        required={required}
        className="glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white"
      >
        {!selectValue && <option value="" className="bg-slate-900 text-white">-- Select --</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-900 text-white">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
