import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "פלקסליינר - סרטים וסדרות",
  description: "הזרמת תוכן סרטים וסדרות",
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
      </body>
    </html>
  );
}
