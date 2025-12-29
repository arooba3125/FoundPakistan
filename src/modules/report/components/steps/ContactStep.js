import { Input } from "../../../shared/ui/Input";
import Select from "../../../shared/ui/Select";

export default function ContactStep({ form, setForm, langPack }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{langPack.contactInfo}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input type="tel" placeholder={langPack.phone} value={form.phone || ""} onChange={(e) => setForm({ phone: e.target.value })} />
        <Input type="email" placeholder={langPack.email} value={form.email || ""} onChange={(e) => setForm({ email: e.target.value })} />
        <Select
          label={langPack.priority}
          value={form.priority || "medium"}
          onChange={(v) => setForm({ priority: v })}
          options={[
            { value: "high", label: langPack.high },
            { value: "medium", label: langPack.medium },
            { value: "low", label: langPack.low },
          ]}
        />
      </div>
    </div>
  );
}
