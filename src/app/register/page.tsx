"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "שגיאה בהרשמה");
        setLoading(false);
        return;
      }
      router.push("/login?registered=1");
      router.refresh();
    } catch {
      setError("שגיאה בהרשמה");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-flexliner-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center text-3xl font-bold text-flexliner-red mb-8">
          פלקסליינר
        </Link>
        <div className="bg-flexliner-dark rounded-lg border border-white/10 p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">הרשמה</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 rounded py-2">
                {error}
              </p>
            )}
            <div>
              <label htmlFor="name" className="block text-sm text-white/70 mb-1">
                שם (אופציונלי)
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-flexliner-red"
                placeholder="השם שלך"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-white/70 mb-1">
                אימייל *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-flexliner-red"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-white/70 mb-1">
                סיסמה * (לפחות 6 תווים)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-flexliner-red"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-flexliner-red rounded font-medium hover:bg-flexliner-red/90 disabled:opacity-50 transition"
            >
              {loading ? "נרשם..." : "הרשם"}
            </button>
          </form>
          <p className="mt-6 text-center text-white/60 text-sm">
            כבר יש לך חשבון?{" "}
            <Link href="/login" className="text-flexliner-red hover:underline">
              התחבר
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center">
          <Link href="/" className="text-white/60 hover:text-white text-sm">
            ← חזרה לדף הבית
          </Link>
        </p>
      </div>
    </main>
  );
}
