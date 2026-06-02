import type { Metadata } from "next";
import { Inter, Instrument_Serif, Geist_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AtestatApp.ro — Atestatul tău profesional, gata în 3 minute",
  description:
    "Generează atestatul profesional pentru liceu economic în 3 minute. 10 EUR, document Word complet de 55-60 pagini, contabilitate reală și anexe oficiale. Banii înapoi dacă nu ești mulțumit.",
  keywords: [
    "atestat profesional",
    "atestat liceu",
    "atestat economic",
    "proiect atestat",
    "atestat Word",
    "atestat app",
    "atestat 2026",
  ],
  openGraph: {
    title: "AtestatApp.ro — Atestatul tău profesional, gata în 3 minute",
    description:
      "10 EUR · Document Word complet · 55-60 pagini · Contabilitate reală · Gata în 3 minute",
    locale: "ro_RO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${inter.variable} ${instrumentSerif.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)]">
        <MotionConfig
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          reducedMotion="user"
        >
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
