"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { caseApi } from "@/lib/caseApi";

export default function ReportPage() {
  const { isAuthenticated, loading, token, user } = useAuth();
  const router = useRouter();
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
    city: "",
    area: "",
    last_seen_location: "",
    last_seen_date: "",
    // found details
    found_name: "",
    age_range: "",
    found_location: "",
    found_date: "",
    additional_info: "",
    // contact
    phone: "",
    email: "",
    contact_name: "",
    priority: "medium",
    badge_tags: [],
    media_local: [],
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
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
      return;
    }
    // Admins cannot report cases
    if (!loading && isAuthenticated && user?.role === "admin") {
      router.push("/admin");
      return;
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading || !isAuthenticated) {
    return <div className="flex min-h-screen items-center justify-center text-white">Loading...</div>;
  }

  if (user?.role === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-card rounded-2xl p-8 max-w-md">
          <svg className="w-16 h-16 text-amber-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2m0-2a9 9 0 110-18 9 9 0 0110 18z" />
          </svg>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Account</h1>
          <p className="text-emerald-100/70 mb-6">Admins cannot report cases. Please use the admin panel to manage cases.</p>
          <Link href="/admin" className="inline-block w-full">
            <button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold py-3 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all">
              Go to Admin Panel
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (payload) => {
    setResult({ state: "pending" });
    
    // Verify we have a token
    if (!token) {
      setResult({ state: "error", ok: false, message: "Authentication token missing. Please sign in again." });
      router.push("/auth");
      return;
    }
    
    try {
      // Convert local files to base64
      let mediaArray = [];
      if (payload.media_local && payload.media_local.length > 0) {
        for (const file of payload.media_local) {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          mediaArray.push({
            type: file.type || 'image/jpeg',
            url: base64,
            filename: file.name,
          });
        }
      }
      
      const body = {
        case_type: payload.case_type,
        name: payload.name || payload.found_name || "Unknown",
        description: payload.additional_info || payload.description || 
          `${payload.physical_features ? 'Physical features: ' + payload.physical_features + '. ' : ''}` +
          `${payload.clothing ? 'Clothing: ' + payload.clothing + '. ' : ''}` +
          `${payload.age_range ? 'Age range: ' + payload.age_range + '.' : ''}`,
        city: payload.city || "",
        area: payload.area || "",
        priority: payload.priority || "medium",
        gender: payload.gender || "other", // Ensure gender is always one of: 'male', 'female', 'other'
        age: payload.age ? Number(payload.age) : undefined,
        last_seen_location: payload.last_seen_location || payload.found_location || "",
        last_seen_date: payload.last_seen_date || payload.found_date || null,
        media: mediaArray,
        contact_name: payload.contact_name || payload.name || payload.found_name || "",
        contact_phone: payload.phone || "",
        contact_email: payload.email || "",
        badge_tags: payload.badge_tags || [],
      };

      const res = await caseApi.createCase(body, token);
      setResult({ state: "ok", ok: true, case_id: res.case_id || res.id });
    } catch (err) {
      console.error("Case submission error:", err);
      
      // Check if it's an auth error
      if (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized")) {
        setResult({ state: "error", ok: false, message: "Authentication failed. Please sign in again." });
        setTimeout(() => router.push("/auth"), 2000);
      } else {
        setResult({ state: "error", ok: false, message: err.message || "Submission failed" });
      }
    }
  };

  return (
    <ReportLayout lang={lang} setLang={setLang} title={`${copy.reportTitle} / ${t.ur.reportTitle}`}>
      <Wizard steps={steps} initialForm={initialForm} onSubmit={handleSubmit} langPack={copy} />
      {result && (
        <div className="mt-6">
          {result.state === "pending" ? (
            <div className="glass-card rounded-2xl border border-white/10 p-4 text-sm text-emerald-100">Submitting…</div>
          ) : result.ok ? (
            <div className="glass-card rounded-2xl border border-emerald-400/30 bg-emerald-900/20 p-6">
              <div className="flex items-start gap-3 mb-4">
                <svg className="w-6 h-6 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-white mb-2">✓ Case Submitted Successfully!</p>
                  <p className="text-sm text-emerald-100 mb-1">Reference ID: <span className="font-mono font-semibold">{result.case_id}</span></p>
                </div>
              </div>
              
              <div className="bg-emerald-800/30 border border-emerald-400/30 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-emerald-100 mb-1">📧 Email Notification</p>
                    <p className="text-xs text-emerald-200 leading-relaxed">
                      Your request has been submitted! You will receive an email notification when your case is reviewed and approved or rejected. Stay tuned!
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-emerald-200/80 mb-4">Your case will be reviewed by our team shortly. Please check your email for updates.</p>
              
              <div className="flex gap-3">
                <Link href="/" className="glass-card neo-press rounded-full px-4 py-2 text-sm text-white hover:border-emerald-400/60">
                  View All Cases
                </Link>
                <button onClick={() => { setResult(null); window.location.reload(); }} className="neo-press rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-4 py-2 text-sm font-semibold text-black">
                  Report Another
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-amber-400/30 bg-amber-900/20 p-4">
              <p className="text-sm text-amber-200 font-semibold">⚠ Submission failed</p>
              <p className="text-xs text-amber-300 mt-1">{result.message || "Please try again"}</p>
            </div>
          )}
        </div>
      )}
    </ReportLayout>
  );
}
