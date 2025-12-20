import { Input, TextArea } from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";

export default function FoundDetailsStep({ form, setForm, langPack }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{langPack.detailsFound}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input placeholder={langPack.ageRange} value={form.age_range || ""} onChange={(e) => setForm({ age_range: e.target.value })} />
        <Select
          label={langPack.gender}
          value={form.gender || ""}
          onChange={(v) => setForm({ gender: v })}
          options={[
            { value: "male", label: langPack.male },
            { value: "female", label: langPack.female },
          ]}
        />
        <Input placeholder={langPack.foundLocation} value={form.found_location || ""} onChange={(e) => setForm({ found_location: e.target.value })} />
        <Input type="date" placeholder={langPack.foundDate} value={form.found_date || ""} onChange={(e) => setForm({ found_date: e.target.value })} />
      </div>
      <TextArea placeholder={langPack.additionalInfo} value={form.additional_info || ""} onChange={(e) => setForm({ additional_info: e.target.value })} />
    </div>
  );
}
