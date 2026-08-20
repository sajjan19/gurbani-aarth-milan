"use client";

import { useScrolledDown } from "./useScrolledDown";

// Appears once the page has scrolled down a way, since search results can
// run to dozens of verses -- lets the user jump back to the search
// bar/filters without hand-scrolling all the way up.
export default function ScrollToTopButton() {
  const visible = useScrolledDown();

  return (
    // No aria-hidden/tabIndex toggling here: the CSS `visibility: hidden`
    // on the base class already takes this out of tab order and hit-testing
    // when not visible. Toggling aria-hidden on an element that still has
    // focus (e.g. right after a click) makes some browsers abort whatever
    // that element triggered -- it was cutting the smooth-scroll animation
    // short as `visible` flipped false partway through.
    <button
      type="button"
      className={visible ? "scroll-to-top visible" : "scroll-to-top"}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          d="M12 5 L12 19 M12 5 L6 11 M12 5 L18 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
