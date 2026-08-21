"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function AboutContent() {
  const { t } = useLanguage();

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
    </main>
  );
}
