"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FilterFab from "@/components/FilterFab";

function KeyboardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="6" cy="9.5" r="0.9" fill="currentColor" />
      <circle cx="10" cy="9.5" r="0.9" fill="currentColor" />
      <circle cx="14" cy="9.5" r="0.9" fill="currentColor" />
      <circle cx="18" cy="9.5" r="0.9" fill="currentColor" />
      <circle cx="6" cy="13" r="0.9" fill="currentColor" />
      <circle cx="10" cy="13" r="0.9" fill="currentColor" />
      <circle cx="14" cy="13" r="0.9" fill="currentColor" />
      <circle cx="18" cy="13" r="0.9" fill="currentColor" />
      <line x1="6" y1="16" x2="18" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <line
        x1="21"
        y1="21"
        x2="16.65"
        y2="16.65"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
// vowel signs/diacritics, then symbols and numerals) rendered as a
// fixed-width grid, so every row holds the same number of keys.
const GURMUKHI_KEYS: KeyboardKey[] = [
  ...letterKeys([
    "ੳ", "ਅ", "ੲ", "ਸ", "ਹ", "ਕ", "ਖ", "ਗ", "ਘ", "ਙ",
    "ਚ", "ਛ", "ਜ", "ਝ", "ਞ", "ਟ", "ਠ", "ਡ", "ਢ", "ਣ",
    "ਤ", "ਥ", "ਦ", "ਧ", "ਨ", "ਪ", "ਫ", "ਬ", "ਭ", "ਮ",
    "ਯ", "ਰ", "ਲ", "ਵ", "ੜ", "ਲ਼", "ਸ਼", "ਖ਼", "ਗ਼", "ਜ਼", "ਫ਼",
  ]),
  ...matraKeys(["ਾ", "ਿ", "ੀ", "ੁ", "ੂ", "ੇ", "ੈ", "ੋ", "ੌ", "ਂ", "ਃ", "ੰ", "ੱ", "਼", "੍"]),
  ...letterKeys([
    "॥", "ੴ",
    "੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯",
  ]),
];

const KEYBOARD_COLUMNS = 10;
const KEYBOARD_PADDING =
  (KEYBOARD_COLUMNS - (GURMUKHI_KEYS.length % KEYBOARD_COLUMNS)) % KEYBOARD_COLUMNS;

// The Guru Granth Sahib has 1430 pages (Angs).
const MAX_PAGE = 1430;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Wraps every occurrence of the searched term(s) in the verse text so the
// match is visible at a glance. Plain substring matching is enough here:
// the search itself is a prefix match on whole words, so the term always
// shows up verbatim at the start of some word -- and matching a substring
// also nicely highlights just the "ਗੋਬਿੰਦ" part of a longer "ਗੋਬਿੰਦੁ".
function highlightMatches(text: string, terms: string[]): React.ReactNode {
  const usable = terms.filter((t) => t.trim().length > 0);
  if (usable.length === 0) return text;

  // Longest first so a longer term wins wherever two candidates overlap.
  const pattern = [...usable]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  // One capture group means split() interleaves the matches at odd indices.
  const parts = text.split(new RegExp(`(${pattern})`, "g"));
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="verse-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function Home() {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [mode, setMode] = useState<Mode>("phrase");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VerseResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Which page (Ang) is currently shown, only set after a successful
  // page-number search -- drives the "Page N" heading and Prev/Next nav.
  const [viewedPage, setViewedPage] = useState<number | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  // The Gurmukhi phonetic guess for the last search, shown under the search
  // bar so the user can see how their roman typing was interpreted -- set
  // only when the submitted query actually got transliterated (see
  // performSearch). `suggestionExact` is false when the guess required
  // fuzzy correction rather than matching a real word outright, in which
  // case `alternateQuery` (if any) is offered as a "did you mean" pick.
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestionExact, setSuggestionExact] = useState(true);
  const [alternateQuery, setAlternateQuery] = useState<string | null>(null);
  // Verse ids whose translations are expanded. Results list only the
  // phrase by default; clicking one opens its translations. Each card
  // toggles independently rather than closing the others, since comparing
  // two verses' translations side by side is the point of the tool.
  const [expandedVerseIds, setExpandedVerseIds] = useState<Set<number>>(new Set());
  // The Gurmukhi term(s) actually searched for, kept so matches can be
  // highlighted in the results. Captured at search time rather than read
  // from `query`, which keeps changing as the user types afterwards.
  const [highlightTerms, setHighlightTerms] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const keyboardPanelRef = useRef<HTMLDivElement>(null);
  const keyboardToggleRef = useRef<HTMLButtonElement>(null);

  // Clicking anywhere outside the virtual keyboard closes it -- the panel
  // itself and its own toggle button are the only exceptions (otherwise
  // clicking the toggle to close it would immediately reopen it, since
  // this fires on mousedown, before the toggle's own click handler runs).
  useEffect(() => {
    if (!showKeyboard) return;
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (keyboardPanelRef.current?.contains(target)) return;
      if (keyboardToggleRef.current?.contains(target)) return;
      setShowKeyboard(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showKeyboard]);

  useEffect(() => {
    fetch("/api/researchers")
      .then((res) => res.json())
      .then((data: { researchers: Researcher[] }) => {
        setResearchers(data.researchers);
        setSelectedIds(new Set(data.researchers.map((r) => r.id)));
      });
  }, []);

  useEffect(() => {
    if (!showFilterModal) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowFilterModal(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFilterModal]);

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

  function toggleVerseExpanded(id: number) {
    setExpandedVerseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Setting the query to empty (typing it away, Backspace, or the keyboard
  // panel's Clear button) should clear whatever's on screen too, rather
  // than leaving the previous search's results up until the next submit.
  function setQueryAndSync(next: string) {
    setQuery(next);
    if (!next.trim()) {
      setResults(null);
      setError(null);
      setViewedPage(null);
      setSuggestion(null);
      setAlternateQuery(null);
      setExpandedVerseIds(new Set());
      setHighlightTerms([]);
    }
  }

  function insertAtCursor(char: string) {
    const input = searchInputRef.current;
    const start = input?.selectionStart ?? query.length;
    const end = input?.selectionEnd ?? query.length;
    const cursor = start + char.length;
    const next = query.slice(0, start) + char + query.slice(end);
    setQueryAndSync(next);
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
    setQueryAndSync(next);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(cursor, cursor);
    });
  }

  async function performSearch(searchMode: Mode, rawQuery: string) {
    // Whatever was open belonged to the previous result set -- start the
    // new one collapsed, and drop the old search's highlights.
    setExpandedVerseIds(new Set());
    setHighlightTerms([]);
    const trimmed = rawQuery.trim();
    if (!trimmed) {
      setResults(null);
      setError(null);
      setViewedPage(null);
      setSuggestion(null);
      setAlternateQuery(null);
      return;
    }
    if (searchMode === "page") {
      const page = Number(trimmed);
      if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) {
        setResults(null);
        setError(`Please enter a page number between 1 and ${MAX_PAGE}.`);
        setViewedPage(null);
        setSuggestion(null);
        setAlternateQuery(null);
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch every researcher's translation for the matched verses; which
      // ones are shown is then a pure client-side filter (see the render
      // below), so toggling a checkbox updates instantly with no refetch.
      // The roman-to-Gurmukhi guessing (and, for phrase mode, snapping each
      // word to the closest real word in the text, searching close
      // alternates alongside it) happens server-side -- see /api/search --
      // since it needs the full word vocabulary built from the phrase
      // column.
      const params = new URLSearchParams({ mode: searchMode, q: trimmed });
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Search failed");
        setResults(null);
        setViewedPage(null);
        setSuggestion(null);
        setAlternateQuery(null);
      } else {
        setResults(data.results);
        setViewedPage(searchMode === "page" ? parseInt(trimmed, 10) : null);
        setSuggestion(data.interpretedQuery ?? null);
        setSuggestionExact(data.exact ?? true);
        setAlternateQuery(data.alternateQuery ?? null);
        // Highlight what was actually searched: the Gurmukhi interpretation
        // of roman input (or the raw query when it was already Gurmukhi),
        // plus the alternate reading, since both were searched for.
        // Skipped for the other modes -- a page number never appears in the
        // verse text, and first-letter queries match across word initials
        // rather than as a contiguous run.
        setHighlightTerms(
          searchMode === "phrase"
            ? [data.interpretedQuery ?? trimmed, data.alternateQuery].filter(
                (t): t is string => typeof t === "string" && t.length > 0
              )
            : []
        );
      }
    } catch {
      setError("Search failed. Please try again.");
      setViewedPage(null);
      setSuggestion(null);
      setAlternateQuery(null);
    } finally {
      setLoading(false);
    }
  }

  function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    setShowKeyboard(false);
    performSearch(mode, query);
  }

  function goToPage(page: number) {
    const clamped = Math.min(Math.max(page, 1), MAX_PAGE);
    const q = String(clamped);
    setQuery(q);
    return performSearch("page", q);
  }

  // Used by the bottom nav's Previous/Next -- without this the page loads
  // new verses while the user is still scrolled to the bottom of the old
  // ones, well below the new content. Waits for the new results to finish
  // rendering before starting the scroll: swapping in the new (differently
  // sized) results while a smooth scroll is still animating makes the
  // browser cancel the animation partway, leaving the page stranded well
  // above the top.
  async function goToPageAndScrollTop(page: number) {
    await goToPage(page);
    // One more frame so the browser has actually painted the new (shorter
    // or taller) results layout before the scroll animation starts --
    // awaiting the state update doesn't guarantee React has committed it.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  return (
    <main className="page">
      <div className="search-hero">
        <div className="page-title">
          <h1>Gurbani Aarth Milan</h1>
          <p className="title-gurmukhi">ਗੁਰਬਾਣੀ ਅਰਥ ਮਿਲਾਨ</p>
        </div>

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
          <div className="search-bar">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQueryAndSync(e.target.value)}
              placeholder={MODE_PLACEHOLDERS[mode]}
              className="search-input"
              autoComplete="off"
              // Case is meaningful here -- the transliteration reads "t" as
              // ਤ but "T" as ਟ, "n" as ਨ but "N" as ਣ -- so a phone
              // capitalising the first letter silently changes the word
              // being searched for ("nanak" becomes ਣਨਕ rather than ਨਾਨਕ).
              // Autocorrect does the same kind of damage to romanised
              // Punjabi, which it reads as misspelt English.
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              ref={keyboardToggleRef}
              type="button"
              className={showKeyboard ? "keyboard-toggle active" : "keyboard-toggle"}
              onClick={() => setShowKeyboard((v) => !v)}
              aria-label="Toggle Gurmukhi keyboard"
              title="Toggle Gurmukhi keyboard"
            >
              <KeyboardIcon />
            </button>
            <button
              type="submit"
              className="search-button"
              disabled={loading}
              aria-label="Search"
              title="Search"
            >
              <SearchIcon />
            </button>
          </div>
        </form>

        {suggestion && (
          <p className="search-suggestion">
            Showing results for <span className="search-suggestion-gurmukhi">{suggestion}</span>
            {!suggestionExact && alternateQuery && (
              <>
                {" — Did you mean "}
                <button
                  type="button"
                  className="search-suggestion-alt"
                  onClick={() => {
                    setQuery(alternateQuery);
                    performSearch(mode, alternateQuery);
                  }}
                >
                  {alternateQuery}
                </button>
                {"?"}
              </>
            )}
          </p>
        )}
      </div>

      {showKeyboard && (
        <div className="gurmukhi-keyboard" ref={keyboardPanelRef}>
          <div className="keyboard-controls">
            <button type="button" className="keyboard-key special" onClick={backspaceAtCursor}>
              ⌫ Backspace
            </button>
            <button type="button" className="keyboard-key special" onClick={() => setQueryAndSync("")}>
              Clear
            </button>
          </div>
          <div className="keyboard-grid" style={{ gridTemplateColumns: `repeat(${KEYBOARD_COLUMNS}, 1fr)` }}>
            {GURMUKHI_KEYS.map((key) => (
              <button
                key={key.value}
                type="button"
                className="keyboard-key"
                onClick={() => insertAtCursor(key.value)}
              >
                <span className="keyboard-key-glyph">{key.label}</span>
              </button>
            ))}
            {Array.from({ length: KEYBOARD_PADDING }).map((_, i) => (
              <span key={`pad-${i}`} className="keyboard-key-spacer" aria-hidden="true" />
            ))}
          </div>
          <button type="button" className="keyboard-key wide" onClick={() => insertAtCursor(" ")}>
            Space
          </button>
        </div>
      )}

      <button type="button" className="filters-trigger" onClick={() => setShowFilterModal(true)}>
        Filter by researcher{" "}
        <span className={selectedIds.size === 0 ? "filter-count filter-count-zero" : "filter-count"}>
          ({selectedIds.size} of {researchers.length} selected)
        </span>
      </button>

      {/* Only worth floating once there are results to filter. */}
      {results !== null && results.length > 0 && (
        <FilterFab
          selectedCount={selectedIds.size}
          totalCount={researchers.length}
          onClick={() => setShowFilterModal(true)}
        />
      )}

      {showFilterModal && (
        <div className="modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div
            className="modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Filter by researcher"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Filter by researcher</h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowFilterModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {selectedIds.size === 0 && (
              <p className="filter-warning">No researchers selected — results won&apos;t show any translations.</p>
            )}

            <div className="filter-toolbar">
              <button
                type="button"
                className="filter-toolbar-action"
                onClick={() => toggleGroup(researchers.map((r) => r.id), true)}
              >
                Select all
              </button>
              <span className="filter-toolbar-divider" aria-hidden="true">
                ·
              </span>
              <button
                type="button"
                className="filter-toolbar-action"
                onClick={() => toggleGroup(researchers.map((r) => r.id), false)}
              >
                Clear all
              </button>
            </div>

            <div className="filter-groups">
              <fieldset>
                <legend>Punjabi</legend>
                <div className="filter-group-actions">
                  <button type="button" onClick={() => toggleGroup(punjabiResearchers.map((r) => r.id), true)}>
                    All
                  </button>
                  <button type="button" onClick={() => toggleGroup(punjabiResearchers.map((r) => r.id), false)}>
                    None
                  </button>
                </div>
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
                <legend>English</legend>
                <div className="filter-group-actions">
                  <button type="button" onClick={() => toggleGroup(englishResearchers.map((r) => r.id), true)}>
                    All
                  </button>
                  <button type="button" onClick={() => toggleGroup(englishResearchers.map((r) => r.id), false)}>
                    None
                  </button>
                </div>
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

            <button type="button" className="modal-done" onClick={() => setShowFilterModal(false)}>
              Done
            </button>
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {viewedPage !== null && (
        <div className="page-nav">
          <button
            type="button"
            onClick={() => goToPage(viewedPage - 1)}
            disabled={loading || viewedPage <= 1}
          >
            ← Previous
          </button>
          <span className="page-nav-current">Page {viewedPage}</span>
          <button
            type="button"
            onClick={() => goToPage(viewedPage + 1)}
            disabled={loading || viewedPage >= MAX_PAGE}
          >
            Next →
          </button>
        </div>
      )}

      <div className="results">
        {results !== null && results.length === 0 && !loading && <p>No matches found.</p>}
        {results?.map((v) => {
          const visibleTranslations = v.translations.filter((t) => selectedIds.has(t.researcherId));
          const expanded = expandedVerseIds.has(v.id);
          return (
            <article key={v.id} className="verse-card accordion">
              <button
                type="button"
                className="verse-toggle"
                onClick={() => toggleVerseExpanded(v.id)}
                aria-expanded={expanded}
                aria-controls={`verse-translations-${v.id}`}
              >
                <span className="verse-toggle-text">
                  <span className="verse-meta">
                    Page {v.page}, Verse {v.verse}
                  </span>
                  <span className="verse-phrase">{highlightMatches(v.phrase, highlightTerms)}</span>
                </span>
                <span className={expanded ? "verse-chevron open" : "verse-chevron"} aria-hidden="true">
                  ⌄
                </span>
              </button>

              {expanded && (
                <div id={`verse-translations-${v.id}`} className="verse-translations">
                  {visibleTranslations.length === 0 ? (
                    <p className="no-translations">No translations selected for this verse.</p>
                  ) : (
                    <ul className="translation-list">
                      {visibleTranslations.map((t) => (
                        <li key={t.researcherId}>
                          <span className="translation-source">{t.displayName}:</span> {t.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {viewedPage !== null && (
        <div className="page-nav page-nav-bottom">
          <button
            type="button"
            onClick={() => goToPageAndScrollTop(viewedPage - 1)}
            disabled={loading || viewedPage <= 1}
          >
            ← Page {viewedPage - 1}
          </button>
          <button
            type="button"
            className="page-nav-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑ Page {viewedPage}
          </button>
          <button
            type="button"
            onClick={() => goToPageAndScrollTop(viewedPage + 1)}
            disabled={loading || viewedPage >= MAX_PAGE}
          >
            Page {viewedPage + 1} →
          </button>
        </div>
      )}

      {viewedPage === null && results !== null && results.length > 0 && (
        <div className="page-nav page-nav-bottom">
          <button
            type="button"
            className="page-nav-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑ Return to top
          </button>
        </div>
      )}
    </main>
  );
}
