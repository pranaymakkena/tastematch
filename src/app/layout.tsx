import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TasteMatch: Find the cultural overlap between two people",
  description:
    "Tell us what you both love. Our cultural intelligence agent finds the unexpected things you might love together, powered by Qloo Taste AI.",
  openGraph: {
    title: "TasteMatch: Cultural Compatibility Agent",
    description: "Find the cultural overlap between two people.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body
        className="min-h-full"
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
          fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
