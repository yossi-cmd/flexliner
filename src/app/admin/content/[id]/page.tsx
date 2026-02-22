"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ContentForm from "@/components/admin/ContentForm";
import EpisodesEditor from "@/components/admin/EpisodesEditor";

type Content = {
  id: string;
  title: string;
  type: string;
  aiProfile: string | null;
  episodes: { id: string; season: number; number: number; title: string; videoUrl: string; duration: number | null }[];
};

export default function EditContentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "";

  const load = () => {
    fetch(`${base}/api/content/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setContent(null);
        else setContent(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const characterize = () => {
    setAiLoading(true);
    fetch(`${base}/api/ai/characterize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId: id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.aiProfile) load();
        else alert(data.error || "שגיאה");
      })
      .catch(() => alert("שגיאה ב-AI"))
      .finally(() => setAiLoading(false));
  };

  if (loading) {
    return <p className="text-white/60">טוען...</p>;
  }

  if (!content) {
    return (
      <div>
        <p className="text-white/60 mb-4">תוכן לא נמצא.</p>
        <Link href="/admin/content" className="text-flexliner-red hover:underline">
          חזרה לרשימה
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">עריכת: {content.title}</h1>
        <Link
          href="/admin/content"
          className="text-white/70 hover:text-white"
        >
          ← רשימת תוכן
        </Link>
      </div>

      <ContentForm
        contentId={id}
        onSaved={() => load()}
        onCancel={() => router.push("/admin/content")}
      />

      <div className="mt-12 pt-8 border-t border-white/10">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-bold">אפיון AI</h2>
          <button
            onClick={characterize}
            disabled={aiLoading}
            className="px-4 py-2 bg-purple-600 rounded font-medium hover:bg-purple-500 disabled:opacity-50"
          >
            {aiLoading ? "יוצר אפיון..." : "צור אפיון AI"}
          </button>
        </div>
        {content.aiProfile && (
          <p className="text-white/80 bg-white/5 rounded p-4 mb-6 max-w-2xl">
            {content.aiProfile}
          </p>
        )}
      </div>

      {content.type === "series" && (
        <div className="mt-8 pt-8 border-t border-white/10">
          <h2 className="text-xl font-bold mb-4">פרקים</h2>
          <EpisodesEditor contentId={id} episodes={content.episodes} onUpdate={load} />
        </div>
      )}
    </div>
  );
}
