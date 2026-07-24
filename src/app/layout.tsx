import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import "./globals.css";

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
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <ScrollToTopButton />
      </body>
    </html>
  );
}
