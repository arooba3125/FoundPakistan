"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { usersApi } from "@/lib/usersApi";
import Button from "@/modules/shared/ui/Button";
import { Input } from "@/modules/shared/ui/Input";

const translations = {
  en: {
    emailLabel: "User email",
    emailPlaceholder: "Enter email to lookup",
    lookup: "Lookup",
    userHeader: "User",
    id: "ID",
    role: "Role",
    promote: "Promote to Admin",
    demote: "Demote Admin",
    notFound: "No user found for this email.",
    successPromote: "User promoted to admin.",
    successDemote: "Admin demoted to user.",
    error: "Operation failed",
  },
  ur: {
    emailLabel: "صارف کا ای میل",
    emailPlaceholder: "ای میل درج کریں",
    lookup: "تلاش",
    userHeader: "صارف",
    id: "آئی ڈی",
    role: "کردار",
    promote: "ایڈمن بنائیں",
    demote: "ایڈمن ہٹائیں",
    notFound: "اس ای میل کے لیے کوئی صارف نہیں ملا۔",
    successPromote: "صارف کو ایڈمن بنا دیا گیا۔",
    successDemote: "ایڈمن کو صارف بنا دیا گیا۔",
    error: "عمل ناکام",
  },
};

export default function AdminTools({ lang = "en" }) {
  const { token } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);

  const copy = translations[lang] || translations.en;

  const lookup = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    setUser(null);
    try {
      const found = await usersApi.getUserByEmail(email.trim(), token);
      setUser(found);
      if (!found || !found.id) {
        setError(copy.notFound);
      }
    } catch (e) {
      const msg = e?.message || copy.error;
      // If forbidden, show admin-only guidance
      if (msg.includes('Status: 403')) {
        setError(lang === 'ur' ? 'یہ فیچر صرف ایڈمن کے لیے ہے۔ براہ کرم ایڈمن اکاؤنٹ سے لاگ ان کریں۔' : 'Admin-only feature. Please log in with an admin account.');
      } else {
        setError(copy.notFound);
      }
    } finally {
      setLoading(false);
    }
  };

  const promote = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await usersApi.promoteToAdmin(user.id, token);
      setUser(updated);
      setMessage(copy.successPromote);
    } catch (e) {
      const msg = e?.message || '';
      if (msg.includes('Status: 403')) {
        setError(lang === 'ur' ? 'صرف ایڈمن اس عمل کو انجام دے سکتے ہیں۔' : 'Only admins can perform this action.');
      } else {
        setError(`${copy.error}: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const demote = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await usersApi.demoteFromAdmin(user.id, token);
      setUser(updated);
      setMessage(copy.successDemote);
    } catch (e) {
      const msg = e?.message || '';
      if (msg.includes('Status: 403')) {
        setError(lang === 'ur' ? 'صرف ایڈمن اس عمل کو انجام دے سکتے ہیں۔' : 'Only admins can perform this action.');
      } else {
        setError(`${copy.error}: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    setAdminsLoading(true);
    try {
      const list = await usersApi.listAdmins(token);
      setAdmins(Array.isArray(list) ? list : []);
    } catch (e) {
      // surface error but don't block other actions
      setError(`${copy.error}: ${e.message || ""}`);
    } finally {
      setAdminsLoading(false);
    }
  };

  useEffect(() => {
    // Load admins when component mounts
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div className={`flex flex-col gap-2 ${lang === "ur" ? "urdu-text" : ""}`} dir={lang === "ur" ? "rtl" : "ltr"}>
        <label className="text-xs text-emerald-50">{copy.emailLabel}</label>
        <div className="flex gap-3 max-w-xl">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={copy.emailPlaceholder}
            type="email"
          />
          <Button onClick={lookup} disabled={loading || !email.trim()} variant="glass">
            {loading ? "…" : copy.lookup}
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
          {message}
        </div>
      )}

      {error && (
        <div className="space-y-2">
          <div className="rounded-xl border border-amber-400/60 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {error}
          </div>
          {String(error).toLowerCase().includes('admin') && (
            <div className="flex gap-2">
              <Button variant="glass" onClick={() => (window.location.href = '/auth/admin/login')}>
                {lang === 'ur' ? 'ایڈمن لاگ ان' : 'Go to Admin Login'}
              </Button>
            </div>
          )}
        </div>
      )}

      {user && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className={`text-sm font-semibold text-white ${lang === "ur" ? "urdu-text" : ""}`} dir={lang === "ur" ? "rtl" : "ltr"}>
            {copy.userHeader}
          </p>
          <div className="mt-2 grid gap-2 text-sm text-emerald-100">
            <div className="flex items-center justify-between"><span>{copy.id}</span><span className="text-white">{user.id}</span></div>
            <div className="flex items-center justify-between"><span>Email</span><span className="text-white">{user.email}</span></div>
            <div className="flex items-center justify-between"><span>{copy.role}</span><span className="text-white">{user.role}</span></div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button onClick={promote} disabled={loading || user.role === "admin"}>
              {copy.promote}
            </Button>
            <Button onClick={demote} disabled={loading || user.role !== "admin"} variant="glass">
              {copy.demote}
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className={`text-sm font-semibold text-white ${lang === "ur" ? "urdu-text" : ""}`} dir={lang === "ur" ? "rtl" : "ltr"}>
            {lang === "ur" ? "موجودہ ایڈمنز" : "Current Admins"}
          </p>
          <Button onClick={loadAdmins} variant="glass" disabled={adminsLoading}>{adminsLoading ? "…" : (lang === "ur" ? "تازہ کریں" : "Refresh")}</Button>
        </div>
        {adminsLoading ? (
          <p className="text-sm text-emerald-100">{lang === "ur" ? "لوڈ ہو رہا ہے…" : "Loading…"}</p>
        ) : admins.length === 0 ? (
          <p className="text-sm text-emerald-100">{lang === "ur" ? "کوئی ایڈمن موجود نہیں" : "No admins found"}</p>
        ) : (
          <div className="space-y-2">
            {admins.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm text-emerald-100">
                  <span className="text-white">{a.email}</span>
                  <span className="ml-2">· {copy.id}: {a.id}</span>
                </div>
                <Button onClick={async () => {
                  setLoading(true);
                  setError(null);
                  setMessage(null);
                  try {
                    await usersApi.demoteFromAdmin(a.id, token);
                    setMessage(copy.successDemote);
                    await loadAdmins();
                  } catch (e) {
                    setError(`${copy.error}: ${e.message || ""}`);
                  } finally {
                    setLoading(false);
                  }
                }} variant="glass">
                  {copy.demote}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
