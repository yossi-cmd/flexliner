"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

export default function HomeClient() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-white/50 text-sm">טוען...</span>;
  }

  if (!session?.user) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <span className="text-white/70 text-sm">מחובר כ־{session.user.email}</span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="px-6 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded text-lg transition"
      >
        התנתק
      </button>
    </div>
  );
}
