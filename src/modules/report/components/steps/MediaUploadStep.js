import { useEffect, useState } from "react";

export default function MediaUploadStep({ form, setForm, langPack }) {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const onFiles = (files) => {
    const arr = Array.from(files || []);
    const newPreviews = arr.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setForm({ media_local: [...(form.media_local || []), ...arr] });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">{langPack.mediaUpload}</h2>
      <p className="text-sm text-emerald-100/80">{langPack.addPhotos}</p>
      <label className="neo-press glow-ring inline-block cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-400 to-amber-300 px-5 py-3 text-sm font-semibold text-black">
        Upload
        <input type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </label>
      <div className="card-grid">
        {previews.map((p, i) => (
          <div key={i} className="glass-card overflow-hidden rounded-2xl border border-white/10">
            {/* Using native img for blob previews to avoid next/image remote restrictions */}
            <img src={p.url} alt={p.name} className="h-40 w-full object-cover" />
            <div className="flex items-center justify-between px-3 py-2 text-xs text-emerald-100">
              <span className="truncate">{p.name}</span>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="primary"
                  onChange={() => setForm({ is_primary_index: i })}
                />
                {langPack.primaryPhoto}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
