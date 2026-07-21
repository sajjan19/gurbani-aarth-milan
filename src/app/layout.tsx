import type { Metadata } from "next";
import { Noto_Sans_Gurmukhi } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const notoSansGurmukhi = Noto_Sans_Gurmukhi({
  subsets: ["gurmukhi", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-gurmukhi",
});

export const metadata: Metadata = {
  title: "Gurbani Aarth Milan",
  description: "Search the Guru Granth Sahib with translations from multiple researchers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={notoSansGurmukhi.variable}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
