"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function UserHeader() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent transition-all">
      <Link href="/browse" className="text-2xl font-bold text-flexliner-red">
        פלקסליינר
      </Link>
      <div className="flex items-center gap-4">
        {searchOpen ? (
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש סדרות וסרטים..."
              className="bg-white/10 border border-white/20 rounded px-4 py-2 w-64 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-flexliner-red"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 py-2 bg-flexliner-red rounded font-medium hover:bg-flexliner-red/90"
            >
              חפש
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-white/70 hover:text-white"
            >
              סגור
            </button>
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-white/90 hover:text-white"
            aria-label="חיפוש"
          >
            <Search size={24} />
          </button>
        )}
        {isAdmin && (
          <Link
            href="/"
            className="text-white/80 hover:text-white text-sm"
          >
            דף הבית
          </Link>
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-white/70 hover:text-white text-sm"
        >
          התנתק
        </button>
      </div>
    </header>
  );
}
