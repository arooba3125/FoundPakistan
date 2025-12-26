export default function ReviewSubmitStep({ form, langPack }) {
  // Filter out empty fields and internal fields
  const fieldLabels = {
    case_type: "Case Type",
    name: "Name",
    found_name: "Found Person Name",
    age: "Age",
    age_range: "Age Range",
    gender: "Gender",
    physical_features: "Physical Features",
    clothing: "Clothing Description",
    city: "City",
    area: "Area",
    last_seen_location: "Last Seen Location",
    last_seen_date: "Last Seen Date",
    found_location: "Found Location",
    found_date: "Found Date",
    additional_info: "Additional Information",
    description: "Description",
    phone: "Phone Number",
    email: "Email",
    contact_name: "Contact Name",
    priority: "Priority",
    badge_tags: "Tags",
  };

  const rows = Object.entries(form)
    .filter(([k, v]) => {
      // Exclude internal fields and empty values
      if (["media_local", "is_primary_index", "reporter_type"].includes(k)) return false;
      if (v === "" || v === null || v === undefined) return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    })
    .map(([k, v]) => ({
      label: fieldLabels[k] || k,
      value: typeof v === "string" ? v : Array.isArray(v) ? v.join(", ") : JSON.stringify(v),
    }));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{langPack.review}</h2>
      <p className="text-sm text-emerald-100/80">Please review your submission before submitting.</p>
      <div className="glass-card rounded-2xl border border-white/10 p-4">
        <div className="space-y-3">
          {rows.map((r, idx) => (
            <div key={idx} className="flex flex-col gap-1 pb-3 border-b border-white/5 last:border-0 last:pb-0">
              <span className="text-xs uppercase tracking-wide text-emerald-100/70">{r.label}</span>
              <span className="text-sm text-white">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
      {form.media_local && form.media_local.length > 0 && (
        <div className="glass-card rounded-2xl border border-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-100/70 mb-2">Photos</p>
          <p className="text-sm text-white">{form.media_local.length} photo(s) attached</p>
        </div>
      )}
    </div>
  );
}
