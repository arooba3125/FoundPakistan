export default function ToggleLang({ lang, setLang }) {
  return (
    <div className="flex items-center gap-2">
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
  );
}
