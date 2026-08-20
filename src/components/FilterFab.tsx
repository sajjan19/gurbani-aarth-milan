"use client";

import { useScrolledDown } from "./useScrolledDown";

// Floating researcher-filter button, stacked directly above the
// scroll-to-top control. Once you are deep into a long list of results the
// filter at the top of the page is far out of reach, and scrolling up just
// to change it loses your place.
export default function FilterFab({
  selectedCount,
  totalCount,
  onClick,
}: {
  selectedCount: number;
  totalCount: number;
  onClick: () => void;
}) {
  const visible = useScrolledDown();
  // A count is only worth showing when a filter is actually narrowing
  // things -- "15 of 15" on every screen is just noise.
  const filtering = totalCount > 0 && selectedCount < totalCount;

  return (
    <button
      type="button"
      className={visible ? "filter-fab visible" : "filter-fab"}
      onClick={onClick}
      aria-label={`Filter by researcher (${selectedCount} of ${totalCount} selected)`}
      title={`Filter by researcher (${selectedCount} of ${totalCount} selected)`}
    >
      Researchers
      {filtering && <span className="filter-fab-count">{selectedCount}</span>}
    </button>
  );
}
