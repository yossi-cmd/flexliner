"use client";

import { Suspense, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("אימייל או סיסמה שגויים");
        setLoading(false);
        return;
      }
      const session = await getSession();
      const role = (session?.user as { role?: string })?.role;
      const target = role === "viewer" ? "/browse" : (callbackUrl || "/");
      router.push(target);
      router.refresh();
    } catch {
      setError("שגיאה בהתחברות");
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
          <h1 className="text-2xl font-bold mb-6 text-center">התחברות</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-red-400 text-sm text-center bg-red-400/10 rounded py-2">
                {error}
              </p>
            )}
            <div>
              <label htmlFor="email" className="block text-sm text-white/70 mb-1">
                אימייל
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
                סיסמה
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-flexliner-red"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-flexliner-red rounded font-medium hover:bg-flexliner-red/90 disabled:opacity-50 transition"
            >
              {loading ? "מתחבר..." : "התחבר"}
            </button>
          </form>
          <p className="mt-6 text-center text-white/60 text-sm">
            אין לך חשבון?{" "}
            <Link href="/register" className="text-flexliner-red hover:underline">
              הרשם
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center">
          <Link href="/register" className="text-white/60 hover:text-white text-sm">
            ← הרשמה
          </Link>
        </p>
      </div>
    </main>
  );
}

function LoginLoading() {
  return (
    <main className="min-h-screen bg-flexliner-black flex items-center justify-center p-6">
      <div className="w-10 h-10 border-2 border-flexliner-red border-t-transparent rounded-full animate-spin" />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}
