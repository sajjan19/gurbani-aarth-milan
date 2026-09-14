"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { RESEARCHER_SOURCES } from "@/lib/researcherSources";

export default function AboutContent() {
  const { t, n } = useLanguage();

  return (
    <main className="page">
      <h1>{t.about.title}</h1>
      <p className="subtitle">{t.about.subtitle}</p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/about.png" alt={t.about.imageAlt} className="about-image" />

      <div className="prose">
        <p>{t.about.p1}</p>
        <p>{t.about.p2}</p>
        <p>
          {t.about.p3Before}
          <a href="/contact">{t.about.p3Link}</a>
          {t.about.p3After}
        </p>
      </div>

      <h2 className="sources-heading">{t.about.sourcesHeading}</h2>

      {/* Each citation runs as one line, exactly as the institute's own
          reference list writes it -- so the entries aren't translated, and
          aren't rearranged into a uniform shape either. */}
      <ol className="source-list">
        {RESEARCHER_SOURCES.map((source) => (
          <li key={source.number}>
            <span className="source-number" aria-hidden="true">
              {n(source.number)}.
            </span>
            <p className="source-detail">
              <span className="source-name">{source.name}</span>:
              {/* One entry reads "ਸਟੀਕ:," in the source -- colon then comma
                  -- so the space is dropped where the line already opens
                  with its own punctuation. */}
              {source.citation.startsWith(",") ? "" : " "}
              {source.citation}
            </p>
          </li>
        ))}
      </ol>
    </main>
  );
}
