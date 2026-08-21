import type { Metadata } from "next";
import FeedbackForm from "./FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback | Gurbani Aarth Milan",
};

export default function FeedbackPage() {
  return (
    <main className="page">
      <h1>Feedback</h1>
      <p className="subtitle">
        Help us improve Gurbani Aarth Milan — tell us what you found.
      </p>

      <FeedbackForm />
    </main>
  );
}
