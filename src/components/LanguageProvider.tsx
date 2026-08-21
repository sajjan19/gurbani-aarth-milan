"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import { formatNumber, translations, type Lang, type Translation } from "@/lib/i18n";

const STORAGE_KEY = "gam-lang";

// A tiny store outside React so useSyncExternalStore can read localStorage
// directly. Using an effect to load the saved choice instead would render
// English first and then swap, which flashes on every page load.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keeps tabs in step when the choice is changed in another one.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "pa" ? "pa" : "en";
  } catch {
    // Private browsing can throw on access rather than returning null.
    return "en";
  }
}

// The server has no way to know the reader's choice, so it always renders
// English and the client corrects it during hydration.
function getServerSnapshot(): Lang {
  return "en";
}

function store(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not being able to persist shouldn't stop the toggle from working.
  }
  listeners.forEach((listener) => listener());
}

type LanguageValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translation;
  /** Renders a number in Gurmukhi numerals when Punjabi is selected. */
  n: (value: number | string) => string;
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLang = useCallback((next: Lang) => {
    store(next);
    // Screen readers and browser translation prompts key off this.
    document.documentElement.lang = next === "pa" ? "pa" : "en";
  }, []);

  // The dictionaries are declared `as const`, which makes each branch a
  // distinct literal type; the shared shape is the English one.
  const t = translations[lang] as unknown as Translation;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, n: (v) => formatNumber(v, lang) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used inside a LanguageProvider");
  }
  return value;
}
