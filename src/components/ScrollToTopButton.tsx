"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 400;
// Hidden within this many px of the very bottom of the page, since the
// page-number search results end with their own "return to top" button
// there (see the page-nav-bottom middle button) -- no need for this
// floating one to sit on top of it.
const HIDE_NEAR_BOTTOM_PX = 120;

// Appears once the page has scrolled past SHOW_AFTER_PX, since search
// results can run to dozens of verses -- lets the user jump back to the
// search bar/filters without hand-scrolling all the way up.
export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const pastThreshold = window.scrollY > SHOW_AFTER_PX;
      const distanceFromBottom =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      setVisible(pastThreshold && distanceFromBottom > HIDE_NEAR_BOTTOM_PX);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

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
