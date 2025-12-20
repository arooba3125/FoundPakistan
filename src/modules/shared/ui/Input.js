export function Input({ className = "", ...props }) {
  return (
    <input
      className={`glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-emerald-100/60 ${className}`}
      {...props}
    />
  );
}

export function TextArea({ className = "", rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`glass-card w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-emerald-100/60 ${className}`}
      {...props}
    />
  );
}
