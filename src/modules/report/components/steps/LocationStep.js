import { useMemo } from "react";
import { Input } from "../../../shared/ui/Input";

export default function LocationStep({ form, setForm, langPack }) {
  const q = useMemo(() =>
    encodeURIComponent(
      form.case_type === "missing" ? form.last_seen_location || "Pakistan" : form.found_location || "Pakistan"
    ),
  [form.case_type, form.last_seen_location, form.found_location]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{langPack.locationPick}</h2>
      <p className="text-sm text-emerald-100/80">{langPack.mapHint}</p>
      {form.case_type === "missing" ? (
        <Input
          placeholder={langPack.lastSeenLocation}
          value={form.last_seen_location || ""}
          onChange={(e) => setForm({ last_seen_location: e.target.value })}
        />
      ) : (
        <Input
          placeholder={langPack.foundLocation}
          value={form.found_location || ""}
          onChange={(e) => setForm({ found_location: e.target.value })}
        />
      )}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <iframe
          title="Pick map"
          src={`https://www.google.com/maps?q=${q}&output=embed`}
          className="h-64 w-full"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}
