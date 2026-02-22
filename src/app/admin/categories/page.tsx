"use client";

import { useEffect, useState } from "react";

type Category = { id: string; name: string; slug: string; order: number };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "";

  const load = () => {
    fetch(`${base}/api/categories`)
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const create = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    fetch(`${base}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || undefined, order }),
    })
      .then((r) => r.json())
      .then(() => {
        setName("");
        setSlug("");
        setOrder(categories.length);
        load();
      })
      .finally(() => setSaving(false));
  };

  const update = (id: string) => {
    if (!editName.trim()) return;
    fetch(`${base}/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    })
      .then((r) => r.json())
      .then(() => {
        setEditingId(null);
        load();
      });
  };

  const remove = (id: string) => {
    if (!confirm("למחוק קטגוריה?")) return;
    fetch(`${base}/api/categories/${id}`, { method: "DELETE" }).then(load);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">קטגוריות</h1>

      <form onSubmit={create} className="mb-10 p-6 rounded-lg bg-flexliner-dark border border-white/10 max-w-md">
        <h2 className="text-lg font-semibold mb-4">הוסף קטגוריה</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
            }}
            placeholder="שם קטגוריה"
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-flexliner-red"
          />
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug (אופציונלי)"
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-flexliner-red"
          />
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
            placeholder="סדר"
            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-flexliner-red"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="mt-4 px-6 py-2 bg-flexliner-red rounded font-medium hover:bg-flexliner-red/90 disabled:opacity-50"
        >
          {saving ? "שומר..." : "הוסף"}
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-4">רשימת קטגוריות</h2>
      {loading ? (
        <p className="text-white/60">טוען...</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-4 p-4 rounded bg-white/5 border border-white/10"
            >
              {editingId === c.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-white/10 border rounded px-3 py-1 text-white"
                  />
                  <button
                    onClick={() => update(c.id)}
                    className="px-4 py-1 bg-green-600 rounded text-sm"
                  >
                    שמור
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-1 bg-white/20 rounded text-sm"
                  >
                    ביטול
                  </button>
                </>
              ) : (
                <>
                  <span className="font-medium">{c.name}</span>
                  <span className="text-white/50 text-sm">{c.slug}</span>
                  <span className="text-white/40 text-sm">סדר: {c.order}</span>
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditName(c.name);
                    }}
                    className="text-white/70 hover:text-white text-sm"
                  >
                    ערוך
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    מחק
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
