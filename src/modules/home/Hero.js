import Link from "next/link";

export default function Hero({ copy, stats }) {
  return (
    <section className="glass-card relative overflow-hidden rounded-3xl border border-white/10 p-8 sm:p-12">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-amber-200/10 to-transparent" />
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
            <Link href="/report" className="neo-press glow-ring rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-6 py-3 text-sm font-semibold text-black">
              {copy.ctaPrimary}
            </Link>
            <Link href="/cases" className="glass-card neo-press rounded-full px-6 py-3 text-sm text-white">
              Browse cases
            </Link>
            <Link href="/map" className="glass-card neo-press rounded-full px-6 py-3 text-sm text-white">
              Open map
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label={copy.activeCases} value={stats.active} />
            <StatCard label={copy.resolvedCases} value={stats.resolved} />
            <StatCard label={copy.cases} value={stats.total} />
            <StatCard label={copy.newToday} value={stats.newToday} />
          </div>
        </div>
        <div className="glass-card neo-press relative h-[320px] w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-900/40 via-slate-900/50 to-amber-800/20 p-4">
          <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -right-8 -bottom-6 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Live safety net</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Map pulse</h3>
              <p className="text-sm text-emerald-50/90">Geo-tagged cases and verified updates help responders move faster.</p>
            </div>
            <div className="aspect-video overflow-hidden rounded-xl border border-white/10">
              <iframe
                title="Pakistan Map"
                src="https://www.google.com/maps?q=Pakistan&output=embed"
                allowFullScreen
                loading="lazy"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
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
