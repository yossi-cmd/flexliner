import Link from "next/link";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 bg-flexliner-black">
      <h1 className="text-5xl font-bold text-flexliner-red">פלקסליינר</h1>
      <p className="text-xl text-white/80">מסך ניהול</p>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <Link
          href="/browse"
          className="px-8 py-3 bg-flexliner-red hover:bg-flexliner-red/90 rounded text-lg font-medium transition"
        >
          צפייה
        </Link>
        <Link
          href="/admin"
          className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded text-lg font-medium transition"
        >
          ניהול
        </Link>
        <HomeClient />
      </div>
    </main>
  );
}
