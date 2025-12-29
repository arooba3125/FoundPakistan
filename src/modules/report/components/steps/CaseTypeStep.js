import Select from "../../../shared/ui/Select";

export default function CaseTypeStep({ form, setForm, langPack }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{langPack.caseType}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={langPack.caseType}
          value={form.case_type}
          onChange={(v) => setForm({ case_type: v })}
          options={[
            { value: "missing", label: langPack.missing },
            { value: "found", label: langPack.found },
          ]}
        />
        <Select
          label={langPack.whoReporting}
          value={form.reporter_type}
          onChange={(v) => setForm({ reporter_type: v })}
          options={[
            { value: "family", label: langPack.family },
            { value: "volunteer", label: langPack.volunteer },
            { value: "police", label: langPack.police },
          ]}
        />
      </div>
    </div>
  );
}
