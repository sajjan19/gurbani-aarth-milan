import type { Metadata } from "next";
import AboutContent from "./AboutContent";

export const metadata: Metadata = {
  title: "About | Gurbani Aarth Milan",
};

// The visible copy lives in a client component so it can follow the reader's
// language choice; this shell stays a server component to keep the metadata.
export default function AboutPage() {
  return <AboutContent />;
}
