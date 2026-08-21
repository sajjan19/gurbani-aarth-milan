"use client";

import { LANGUAGES } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

export default function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="lang-toggle" role="group" aria-label={t.nav.language}>
      {LANGUAGES.map((option) => (
        <button
          key={option.code}
          type="button"
          className={`lang-option lang-option-${option.code}${
            lang === option.code ? " active" : ""
          }`}
          // The pressed state is what tells a screen reader which language is
          // live; the visual highlight alone wouldn't.
          aria-pressed={lang === option.code}
          onClick={() => setLang(option.code)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
