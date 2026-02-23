import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "פלקסליינר - סרטים וסדרות",
  description: "האתר לצפייה ישירה המוביל בישראל",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased min-h-screen bg-flexliner-black">
        <Providers>{children}</Providers>
        <footer>
          <p className="text-center text-white/50 text-sm">נבנה על ידי יוסי ביטון, למטרות בידור בלבד, ולא על מנת לזלזל ברב מנחם אדרי צדיק יסוד עולם ח״ו.</p>
        </footer>
      </body>
    </html>
  );
}
