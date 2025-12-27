import { Input, TextArea } from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";

export default function MissingDetailsStep({ form, setForm, langPack }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{langPack.detailsMissing}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input placeholder={langPack.name} value={form.name || ""} onChange={(e) => setForm({ name: e.target.value })} />
        <Input type="number" placeholder={langPack.age} value={form.age || ""} onChange={(e) => setForm({ age: Number(e.target.value) })} />
        <Select
          label={langPack.gender}
          value={form.gender || ""}
          onChange={(v) => setForm({ gender: v })}
          required={true}
          options={[
            { value: "male", label: langPack.male },
            { value: "female", label: langPack.female },
            { value: "other", label: langPack.other },
          ]}
        />
        <Input placeholder={langPack.clothing} value={form.clothing || ""} onChange={(e) => setForm({ clothing: e.target.value })} />
      </div>
      <TextArea placeholder={langPack.physicalFeatures} value={form.physical_features || ""} onChange={(e) => setForm({ physical_features: e.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input placeholder="City" value={form.city || ""} onChange={(e) => setForm({ city: e.target.value })} />
        <Input placeholder="Area" value={form.area || ""} onChange={(e) => setForm({ area: e.target.value })} />
        <Input placeholder={langPack.lastSeenLocation} value={form.last_seen_location || ""} onChange={(e) => setForm({ last_seen_location: e.target.value })} />
        <Input type="date" placeholder={langPack.lastSeenDate} value={form.last_seen_date || ""} onChange={(e) => setForm({ last_seen_date: e.target.value })} />
      </div>
      <TextArea placeholder={langPack.additionalInfo} value={form.additional_info || ""} onChange={(e) => setForm({ additional_info: e.target.value })} />
    </div>
  );
}
