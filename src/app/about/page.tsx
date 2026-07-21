import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Gurbani Aarth Milan",
};

export default function AboutPage() {
  return (
    <main className="page">
      <h1>About Gurbani Aarth Milan</h1>
      <p className="subtitle">A project of Guru Nanak Institute of Global Studies</p>

      <div className="prose">
        <p>
          Gurbani Aarth Milan is a search tool for the Guru Granth Sahib. Rather than
          showing a single translation for each verse, it brings together interpretations
          from 15 researchers — 8 in Punjabi and 7 in English — side by side, so readers can
          compare how different scholars have understood the same line.
        </p>
        <p>
          You can search by phrase or word (in Gurmukhi or in translation), by page (Ang)
          number, or by typing just the first letter of each word. Results can be filtered
          to show only the researchers you're interested in.
        </p>
        <p>
          This is an early version of the project, and it will keep growing. If you have
          feedback, corrections, or questions, reach out on the{" "}
          <a href="/contact">contact page</a>.
        </p>
      </div>
    </main>
  );
}
