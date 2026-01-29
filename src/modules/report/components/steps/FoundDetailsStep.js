import { Input, TextArea } from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";

export default function FoundDetailsStep({ form, setForm, langPack }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{langPack.detailsFound}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input placeholder="Found Person Name (if known)" value={form.found_name || ""} onChange={(e) => setForm({ found_name: e.target.value })} />
        <Input type="number" placeholder="Age (approximate)" value={form.age || ""} onChange={(e) => setForm({ age: e.target.value })} />
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
        <Input placeholder="City" value={form.city || ""} onChange={(e) => setForm({ city: e.target.value })} />
        <Input placeholder="Area" value={form.area || ""} onChange={(e) => setForm({ area: e.target.value })} />
        <Input placeholder={langPack.foundLocation} value={form.found_location || ""} onChange={(e) => setForm({ found_location: e.target.value })} />
        <Input 
          type="date" 
          placeholder={langPack.foundDate} 
          value={form.found_date || ""} 
          max={(() => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          })()}
          onChange={(e) => setForm({ found_date: e.target.value })} 
        />
      </div>
      <TextArea placeholder={langPack.additionalInfo} value={form.additional_info || ""} onChange={(e) => setForm({ additional_info: e.target.value })} />
    </div>
  );
}
