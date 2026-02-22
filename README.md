# פלקסליינר (Flexliner)

אתר הזרמת תוכן – סרטים וסדרות בסגנון נטפליקס.

## תכונות

- **צד משתמש**: דף צפייה עם קטגוריות, חיפוש חופשי, נגן וידאו, והמלצות AI לפי תיאור (ללא הרשמה).
- **צד מנהל**: העלאת סרטים וסדרות, הגדרת קטגוריות, הוספת פרקים לסדרות, ואפיון תוכן אוטומטי באמצעות AI.

## דרישות

- Node.js 18+
- מפתח OpenAI (להמלצות ולאפיון AI)

## התקנה

```bash
npm install
cp .env.example .env
# ערוך .env: DATABASE_URL (Postgres מ-Neon), OPENAI_API_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL
npx prisma generate
npx prisma db push
npm run dev
```

פתח בדפדפן: [http://localhost:3000](http://localhost:3000)

- **דף הבית**: בחירה בין צפייה לניהול.
- **צפייה** (`/browse`): גלילה לפי קטגוריות, חיפוש, "המלצות לפי AI" (תאר מה בא לך לראות), לחיצה על פריט לפרטים וצפייה.
- **ניהול** (`/admin`): קטגוריות, תוכן (סרט/סדרה), פרקים לסדרה, כפתור "צור אפיון AI" לכל תוכן.

## משתני סביבה

| משתנה | תיאור |
|--------|--------|
| `DATABASE_URL` | קישור ל-Postgres (למשל מ-[Neon](https://neon.tech)) |
| `OPENAI_API_KEY` | מפתח API של OpenAI להמלצות ולאפיון תוכן |
| `NEXTAUTH_SECRET` | מחרוזת אקראית לסימון sessions (בפרודקשן חובה) |
| `NEXTAUTH_URL` | כתובת האתר, למשל `https://הדומיין.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | (אופציונלי) כתובת בסיס של האתר לשימוש ב-API מהלקוח |

## פריסה ל-Vercel (עם מסד נתונים)

1. **מסד נתונים בענן** – הפרויקט משתמש ב-Postgres. צור מסד חינמי ב-[Neon](https://neon.tech):
   - צור פרויקט והעתק את ה-Connection string.
   - מקומית: שים ב-`.env` את `DATABASE_URL=postgresql://...` והרץ `npx prisma db push`.
   - ב-Vercel: Settings → Environment Variables → הוסף `DATABASE_URL` עם אותו connection string.

2. **NextAuth** – ב-Vercel הוסף:
   - `NEXTAUTH_SECRET` – מחרוזת אקראית (למשל `openssl rand -base64 32`).
   - `NEXTAUTH_URL` – כתובת האתר בפרודקשן (למשל `https://xxx.vercel.app`).

3. **Redeploy** – אחרי שמירת המשתנים, בצע Redeploy ל-deployment האחרון.

## מבנה קצר

- `src/app/page.tsx` – דף כניסה (צפייה / ניהול)
- `src/app/browse/` – צד משתמש (רשימה, סדרה, סרט, נגן)
- `src/app/admin/` – צד מנהל (תוכן, קטגוריות)
- `src/app/api/` – API: content, categories, episodes, search, ai/recommend, ai/characterize
- `prisma/schema.prisma` – מודלים: Category, Content, Episode

## הערות

- השימוש באתר ללא הרשמה: היסטוריית צפייה ו"אהבתי" נשמרות ב-`localStorage` לשיפור ההמלצות.
- העלאת תוכן: כרגע מזינים **קישורים** לתמונות ולוידאו (URLs). לא מועלים קבצים לשרת.
