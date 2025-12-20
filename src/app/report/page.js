"use client";

import { useState } from "react";
import ReportLayout from "../../modules/report/components/ReportLayout";
import Wizard from "../../modules/report/components/Wizard";
import CaseTypeStep from "../../modules/report/components/steps/CaseTypeStep";
import MissingDetailsStep from "../../modules/report/components/steps/MissingDetailsStep";
import FoundDetailsStep from "../../modules/report/components/steps/FoundDetailsStep";
import LocationStep from "../../modules/report/components/steps/LocationStep";
import MediaUploadStep from "../../modules/report/components/steps/MediaUploadStep";
import ContactStep from "../../modules/report/components/steps/ContactStep";
import ReviewSubmitStep from "../../modules/report/components/steps/ReviewSubmitStep";
import Button from "../../modules/shared/ui/Button";
import { t } from "../../lib/i18n";
import { mockSubmitCase } from "../../data/mockSubmit";

export default function ReportPage() {
  const [lang, setLang] = useState("en");
  const copy = t[lang];

  const initialForm = {
    case_type: "missing",
    reporter_type: "family",
    // missing details
    name: "",
    age: "",
    gender: "",
    physical_features: "",
    clothing: "",
    last_seen_location: "",
    last_seen_date: "",
    // found details
    age_range: "",
    found_location: "",
    found_date: "",
    additional_info: "",
    // contact
    phone: "",
    email: "",
    priority: "medium",
  };

  const steps = [
    CaseTypeStep,
    (props) => (props.form.case_type === "missing" ? <MissingDetailsStep {...props} /> : <FoundDetailsStep {...props} />),
    LocationStep,
    MediaUploadStep,
    ContactStep,
    ReviewSubmitStep,
  ];

  const [result, setResult] = useState(null);
  const handleSubmit = async (payload) => {
    setResult({ state: "pending" });
    const res = await mockSubmitCase(payload);
    setResult(res);
  };

  return (
    <ReportLayout lang={lang} setLang={setLang} title={`${copy.reportTitle} / ${t.ur.reportTitle}`}>
      <Wizard steps={steps} initialForm={initialForm} onSubmit={handleSubmit} langPack={copy} />
      {result && (
        <div className="mt-6">
          {result.state === "pending" ? (
            <div className="glass-card rounded-2xl border border-white/10 p-4 text-sm text-emerald-100">Submitting…</div>
          ) : result.ok ? (
            <div className="glass-card rounded-2xl border border-white/10 p-4">
              <p className="text-sm text-white">Submitted. Reference ID: <span className="font-semibold">{result.case_id}</span></p>
              <div className="mt-3 flex gap-2">
                <Button variant="glass">View Case</Button>
                <Button>Report Another</Button>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-white/10 p-4 text-sm text-amber-200">Submission failed.</div>
          )}
        </div>
      )}
    </ReportLayout>
  );
}
