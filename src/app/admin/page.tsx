import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">דשבורד</h1>
      <p className="text-white/70 mb-8">
        ניהול תוכן פלקסליינר. הוסף סרטים וסדרות, הגדר קטגוריות, וצור אפיון AI לתוכן.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        <Link
          href="/admin/content"
          className="block p-6 rounded-lg bg-flexliner-dark border border-white/10 hover:border-flexliner-red/50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">תוכן</h2>
          <p className="text-white/60 text-sm">
            העלאת סרטים וסדרות, עריכת פרטים, הוספת פרקים ואפיון AI.
          </p>
        </Link>
        <Link
          href="/admin/categories"
          className="block p-6 rounded-lg bg-flexliner-dark border border-white/10 hover:border-flexliner-red/50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">קטגוריות</h2>
          <p className="text-white/60 text-sm">
            ניהול קטגוריות להצגה בדף הצפייה.
          </p>
        </Link>
      </div>
    </div>
  );
}
