"use client";

import { useEffect, useMemo, useState } from "react";
import type { Researcher, VerseResult } from "@/lib/search";
import FilterFab from "@/components/FilterFab";

export default function HukamnamaResults({
  verses,
  researchers,
}: {
  verses: VerseResult[];
  researchers: Researcher[];
}) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(researchers.map((r) => r.id))
  );
  const [showFilterModal, setShowFilterModal] = useState(false);
  // Verse ids whose translations are expanded -- the reading lists only the
  // Gurmukhi lines by default, same as search results. Each line toggles
  // independently so several can be compared at once.
  const [expandedVerseIds, setExpandedVerseIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!showFilterModal) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowFilterModal(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFilterModal]);

  const punjabiResearchers = useMemo(() => researchers.filter((r) => r.language === "pa"), [researchers]);
  const englishResearchers = useMemo(() => researchers.filter((r) => r.language === "en"), [researchers]);

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

  return (
    <>
      <button type="button" className="filters-trigger" onClick={() => setShowFilterModal(true)}>
        Filter by researcher{" "}
        <span className={selectedIds.size === 0 ? "filter-count filter-count-zero" : "filter-count"}>
          ({selectedIds.size} of {researchers.length} selected)
        </span>
      </button>

      {verses.length > 0 && (
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

      <div className="results">
        {verses.map((v) => {
          const visibleTranslations = v.translations.filter((t) => selectedIds.has(t.researcherId));
          const expanded = expandedVerseIds.has(v.id);
          return (
            <article key={v.id} className="verse-card accordion">
              <button
                type="button"
                className="verse-toggle"
                onClick={() => toggleVerseExpanded(v.id)}
                aria-expanded={expanded}
                aria-controls={`hukamnama-translations-${v.id}`}
              >
                <span className="verse-toggle-text">
                  <span className="verse-phrase">{v.phrase}</span>
                </span>
                <span className={expanded ? "verse-chevron open" : "verse-chevron"} aria-hidden="true">
                  ⌄
                </span>
              </button>

              {expanded && (
                <div id={`hukamnama-translations-${v.id}`} className="verse-translations">
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

      {verses.length > 0 && (
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
    </>
  );
}
