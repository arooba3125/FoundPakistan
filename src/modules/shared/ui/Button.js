export default function Button({ children, className = "", variant = "primary", ...props }) {
  const base = "neo-press rounded-full px-5 py-3 text-sm font-semibold";
  const styles = {
    primary: "bg-gradient-to-r from-emerald-400 to-amber-300 text-black",
    glass: "glass-card border border-white/10 text-white",
    subtle: "bg-white/10 text-white",
  };
  return (
    <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
