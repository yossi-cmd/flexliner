"use client";

import { useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accept?: string;
  className?: string;
  id?: string;
};

export default function UrlOrUploadInput({
  value,
  onChange,
  placeholder = "קישור או העלה קובץ",
  accept,
  className = "",
  id,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "";
      const res = await fetch(`${base}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.url) onChange(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "שגיאה בהעלאה");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 min-w-0 ${className}`}
      />
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded font-medium text-sm whitespace-nowrap disabled:opacity-50"
      >
        {uploading ? "מעלה..." : "העלה קובץ"}
      </button>
    </div>
  );
}
