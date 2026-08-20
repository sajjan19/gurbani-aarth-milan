"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER_PX = 400;
// Hidden within this many px of the very bottom of the page, where the
// results end with their own "return to top" button -- no need for the
// floating controls to sit on top of it.
const HIDE_NEAR_BOTTOM_PX = 120;

// True once the page is scrolled past SHOW_AFTER_PX and not yet near the
// bottom. Shared by the floating buttons in the bottom-right corner so they
// appear and disappear together and stay stacked rather than one leaving a
// gap under the other.
export function useScrolledDown(): boolean {
  const [scrolledDown, setScrolledDown] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const pastThreshold = window.scrollY > SHOW_AFTER_PX;
      const distanceFromBottom =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      setScrolledDown(pastThreshold && distanceFromBottom > HIDE_NEAR_BOTTOM_PX);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return scrolledDown;
}
