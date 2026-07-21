"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { romanLabelFor, transliterateRoman } from "@/lib/transliterate";

type Researcher = {
  id: number;
  key: string;
  displayName: string;
  language: "pa" | "en";
  sortOrder: number;
};

type VerseTranslation = {
  researcherId: number;
  displayName: string;
  language: "pa" | "en";
  text: string;
};

type VerseResult = {
  id: number;
  page: number;
  verse: number;
  line: number | null;
  phrase: string;
  translations: VerseTranslation[];
};

type Mode = "phrase" | "page" | "initials";

const MODE_LABELS: Record<Mode, string> = {
  phrase: "Word / Phrase",
  page: "Page Number",
  initials: "First Letters",
};

const MODE_PLACEHOLDERS: Record<Mode, string> = {
  phrase: "Search a word or phrase in Gurmukhi...",
  page: "Enter a page (Ang) number, 1-1430",
  initials: "Type the first letter of each word, e.g. ਸਸਅ (spaces optional)",
};

type KeyboardKey = { value: string; label: string };

const DOTTED_CIRCLE = "◌";

function letterKeys(chars: string[]): KeyboardKey[] {
  return chars.map((value) => ({ value, label: value }));
}

// Vowel signs (matras) are combining marks with no letterform of their own,
// so they're prefixed with a dotted circle for display only.
function matraKeys(chars: string[]): KeyboardKey[] {
  return chars.map((value) => ({ value, label: DOTTED_CIRCLE + value }));
}

// One flat, ordered list (vowel bearers + consonants + nukta letters, then
// vowel signs/diacritics, then numerals/symbols) rendered as a fixed-width
// grid, so every row holds the same number of keys.
const GURMUKHI_KEYS: KeyboardKey[] = [
  ...letterKeys([
    "ੳ", "ਅ", "ੲ", "ਸ", "ਹ", "ਕ", "ਖ", "ਗ", "ਘ", "ਙ",
    "ਚ", "ਛ", "ਜ", "ਝ", "ਞ", "ਟ", "ਠ", "ਡ", "ਢ", "ਣ",
    "ਤ", "ਥ", "ਦ", "ਧ", "ਨ", "ਪ", "ਫ", "ਬ", "ਭ", "ਮ",
    "ਯ", "ਰ", "ਲ", "ਵ", "ੜ", "ਲ਼", "ਸ਼", "ਖ਼", "ਗ਼", "ਜ਼", "ਫ਼",
  ]),
  ...matraKeys(["ਾ", "ਿ", "ੀ", "ੁ", "ੂ", "ੇ", "ੈ", "ੋ", "ੌ", "ਂ", "ਃ", "ੰ", "ੱ", "਼", "੍"]),
  ...letterKeys(["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯", "ੴ", "॥"]),
];

const KEYBOARD_COLUMNS = 10;
const KEYBOARD_PADDING =
  (KEYBOARD_COLUMNS - (GURMUKHI_KEYS.length % KEYBOARD_COLUMNS)) % KEYBOARD_COLUMNS;

export default function Home() {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<Mode>("phrase");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VerseResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Tracks live roman-to-Gurmukhi transliteration while typing on a Latin
  // keyboard: romanBuffer is the raw letters typed in the current unbroken
  // typing streak, queryBase is what `query` held right before that streak
  // began. query is always romanBase + transliterate(romanBuffer) while a
  // streak is active. Any non-typing change to query (virtual keyboard,
  // paste, clear) resets both, so the next streak starts from scratch.
  const romanBufferRef = useRef("");
  const queryBaseRef = useRef("");

  useEffect(() => {
    fetch("/api/researchers")
      .then((res) => res.json())
      .then((data: { researchers: Researcher[] }) => {
        setResearchers(data.researchers);
        setSelectedIds(new Set(data.researchers.map((r) => r.id)));
      });
  }, []);

  const punjabiResearchers = useMemo(
    () => researchers.filter((r) => r.language === "pa"),
    [researchers]
  );
  const englishResearchers = useMemo(
    () => researchers.filter((r) => r.language === "en"),
    [researchers]
  );

  function toggleResearcher(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleGroup(ids: number[], selectAll: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (selectAll) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function resetRomanStreak(newQuery: string) {
    romanBufferRef.current = "";
    queryBaseRef.current = newQuery;
  }

  // Reads/writes `query` via closure rather than a functional setState update:
  // each call corresponds to one real click event, so `query` is always fresh
  // by the time the handler runs. A functional update here would be re-invoked
  // twice under React Strict Mode (dev only) and double-insert the character,
  // since reading `input.selectionStart` as a side effect isn't idempotent.
  function insertAtCursor(char: string) {
    const input = searchInputRef.current;
    const start = input?.selectionStart ?? query.length;
    const end = input?.selectionEnd ?? query.length;
    const cursor = start + char.length;
    const next = query.slice(0, start) + char + query.slice(end);
    setQuery(next);
    resetRomanStreak(next);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(cursor, cursor);
    });
  }

  function backspaceAtCursor() {
    const input = searchInputRef.current;
    const start = input?.selectionStart ?? query.length;
    const end = input?.selectionEnd ?? query.length;
    const cursor = start === end ? Math.max(0, start - 1) : start;
    const next =
      start === end
        ? query.slice(0, Math.max(0, start - 1)) + query.slice(end)
        : query.slice(0, start) + query.slice(end);
    setQuery(next);
    resetRomanStreak(next);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(cursor, cursor);
    });
  }

  // Intercepts plain letter/digit/space/backspace keys to transliterate as
  // the user types (e.g. "satnam" -> "ਸਤਨਾਮ"), while leaving shortcuts
  // (Ctrl/Cmd combos), arrow keys, paste, etc. to behave normally. Native
  // Gurmukhi keyboard input still works too: transliterateRoman() passes
  // through any character it doesn't recognize as a roman letter unchanged.
  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === "Backspace") {
      if (romanBufferRef.current.length > 0) {
        e.preventDefault();
        romanBufferRef.current = romanBufferRef.current.slice(0, -1);
        setQuery(queryBaseRef.current + transliterateRoman(romanBufferRef.current));
      } else {
        backspaceAtCursor();
      }
      return;
    }

    if (e.key.length === 1) {
      e.preventDefault();
      if (romanBufferRef.current === "") queryBaseRef.current = query;
      romanBufferRef.current += e.key;
      setQuery(queryBaseRef.current + transliterateRoman(romanBufferRef.current));
    }
  }

  async function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) {
      setResults(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        mode,
        q: query.trim(),
        researchers: Array.from(selectedIds).join(","),
      });
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Search failed");
        setResults(null);
      } else {
        setResults(data.results);
      }
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <h1>Gurbani Aarth Milaan</h1>
      <p className="subtitle">
        Search the Guru Granth Sahib with translations from {researchers.length || "…"} researchers.
      </p>

      <div className="mode-tabs">
        {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            className={m === mode ? "mode-tab active" : "mode-tab"}
            onClick={() => setMode(m)}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <form className="search-form" onSubmit={runSearch}>
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            resetRomanStreak(e.target.value);
          }}
          onKeyDown={handleSearchKeyDown}
          placeholder={MODE_PLACEHOLDERS[mode]}
          className="search-input"
        />
        <button
          type="button"
          className={showKeyboard ? "keyboard-toggle active" : "keyboard-toggle"}
          onClick={() => setShowKeyboard((v) => !v)}
          aria-label="Toggle Gurmukhi keyboard"
          title="Toggle Gurmukhi keyboard"
        >
          ⌨
        </button>
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {showKeyboard && (
        <div className="gurmukhi-keyboard">
          <div className="keyboard-controls">
            <button type="button" className="keyboard-key special" onClick={backspaceAtCursor}>
              ⌫ Backspace
            </button>
            <button
              type="button"
              className="keyboard-key special"
              onClick={() => {
                setQuery("");
                resetRomanStreak("");
              }}
            >
              Clear
            </button>
          </div>
          <div className="keyboard-grid" style={{ gridTemplateColumns: `repeat(${KEYBOARD_COLUMNS}, 1fr)` }}>
            {GURMUKHI_KEYS.map((key) => {
              const romanLabel = romanLabelFor(key.value);
              return (
                <button
                  key={key.value}
                  type="button"
                  className="keyboard-key"
                  onClick={() => insertAtCursor(key.value)}
                >
                  <span className="keyboard-key-glyph">{key.label}</span>
                  {romanLabel && <span className="keyboard-key-roman">{romanLabel}</span>}
                </button>
              );
            })}
            {Array.from({ length: KEYBOARD_PADDING }).map((_, i) => (
              <span key={`pad-${i}`} className="keyboard-key-spacer" aria-hidden="true" />
            ))}
          </div>
          <button type="button" className="keyboard-key wide" onClick={() => insertAtCursor(" ")}>
            Space
          </button>
        </div>
      )}

      <details className="filters">
        <summary>Filter by researcher ({selectedIds.size} of {researchers.length} selected)</summary>
        <div className="filter-groups">
          <fieldset>
            <legend>
              Punjabi
              <button type="button" onClick={() => toggleGroup(punjabiResearchers.map((r) => r.id), true)}>
                All
              </button>
              <button type="button" onClick={() => toggleGroup(punjabiResearchers.map((r) => r.id), false)}>
                None
              </button>
            </legend>
            {punjabiResearchers.map((r) => (
              <label key={r.id} className="researcher-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.has(r.id)}
                  onChange={() => toggleResearcher(r.id)}
                />
                {r.displayName}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>
              English
              <button type="button" onClick={() => toggleGroup(englishResearchers.map((r) => r.id), true)}>
                All
              </button>
              <button type="button" onClick={() => toggleGroup(englishResearchers.map((r) => r.id), false)}>
                None
              </button>
            </legend>
            {englishResearchers.map((r) => (
              <label key={r.id} className="researcher-checkbox">
                <input
                  type="checkbox"
                  checked={selectedIds.has(r.id)}
                  onChange={() => toggleResearcher(r.id)}
                />
                {r.displayName}
              </label>
            ))}
          </fieldset>
        </div>
      </details>

      {error && <p className="error">{error}</p>}

      <div className="results">
        {results !== null && results.length === 0 && !loading && <p>No matches found.</p>}
        {results?.map((v) => (
          <article key={v.id} className="verse-card">
            <div className="verse-meta">
              Page {v.page}, Verse {v.verse}
            </div>
            <p className="verse-phrase">{v.phrase}</p>
            {v.translations.length === 0 ? (
              <p className="no-translations">No translations selected for this verse.</p>
            ) : (
              <ul className="translation-list">
                {v.translations.map((t) => (
                  <li key={t.researcherId}>
                    <span className="translation-source">{t.displayName}:</span> {t.text}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
