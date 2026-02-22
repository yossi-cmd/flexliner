"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminSidebar() {
  return (
    <aside className="w-56 bg-flexliner-dark border-l border-white/10 flex flex-col p-4 gap-2">
      <Link
        href="/admin"
        className="text-xl font-bold text-flexliner-red py-2"
      >
        פלקסליינר – ניהול
      </Link>
      <nav className="flex flex-col gap-1">
        <Link
          href="/admin"
          className="px-4 py-2 rounded text-white/90 hover:bg-white/10"
        >
          דשבורד
        </Link>
        <Link
          href="/admin/content"
          className="px-4 py-2 rounded text-white/90 hover:bg-white/10"
        >
          תוכן (סרטים/סדרות)
        </Link>
        <Link
          href="/admin/categories"
          className="px-4 py-2 rounded text-white/90 hover:bg-white/10"
        >
          קטגוריות
        </Link>
      </nav>
      <Link
        href="/"
        className="mt-auto text-white/60 hover:text-white text-sm"
      >
        ← חזרה לאתר
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-right px-4 py-2 rounded text-white/60 hover:text-white hover:bg-white/10 text-sm"
      >
        התנתק
      </button>
    </aside>
  );
}
