export default function ReviewSubmitStep({ form, langPack }) {
  const rows = Object.entries(form)
    .filter(([k]) => !["media_local"].includes(k))
    .map(([k, v]) => ({ k, v: typeof v === "string" ? v : JSON.stringify(v) }));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{langPack.review}</h2>
      <div className="glass-card rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((r) => (
              <tr key={r.k} className="border-b border-white/5">
                <td className="p-3 text-emerald-100/90">{r.k}</td>
                <td className="p-3 text-white">{r.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-emerald-100/80">Note: This is a mock submit. Backend integration (NestJS + Postgres) can consume this payload later.</p>
    </div>
  );
}
