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
      <p className="prose">{t.about.sourcesIntro}</p>

      {/* The citations themselves aren't translated -- a Punjabi commentary
          keeps its Gurmukhi title in either language, the way a citation is
          written anywhere else. */}
      <ol className="source-list">
        {RESEARCHER_SOURCES.map((source) => (
          <li key={source.number}>
            <span className="source-number" aria-hidden="true">
              {n(source.number)}.
            </span>
            <div className="source-body">
              <p className="source-name">{source.name}</p>
              <p className="source-detail">
                {source.author && <span className="source-author">{source.author}</span>}
                {source.author && ", "}
                <cite>{source.title}</cite>
                {source.volumes && `, ${source.volumes}`}
                {`, ${source.years}`}
                {` (${source.publisher})`}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
