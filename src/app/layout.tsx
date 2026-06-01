import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "RentMyAI — Crée et loue ton IA experte",
    template: "%s · RentMyAI",
  },
  description:
    "Transforme tes connaissances en IA spécialisée et monétise-la. Coach, expert, formateur : crée ton IA en quelques minutes et loue-la.",
  keywords: ["IA", "GPT", "marketplace IA", "coach IA", "monétiser IA", "RAG"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "RentMyAI",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${serif.variable} font-sans`}>
        {/* Fond global : aurora animé + grain */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="aurora" />
          <div className="noise" />
        </div>
        {children}
        <Toaster position="top-center" theme="dark" richColors />
      </body>
    </html>
  );
}
