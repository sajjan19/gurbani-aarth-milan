import type { Metadata } from "next";
import FeedbackForm from "./FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback | Gurbani Aarth Milan",
};

// The heading moved into the form component so it can follow the reader's
// language choice; this shell stays a server component to keep the metadata.
export default function FeedbackPage() {
  return <FeedbackForm />;
}
