"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import LanguageToggle from "./LanguageToggle";
import type { Translation } from "@/lib/i18n";

const NAV_LINKS: { href: string; key: keyof Translation["nav"] }[] = [
  { href: "/", key: "search" },
  { href: "/hukamnama", key: "hukamnama" },
  { href: "/about", key: "about" },
  { href: "/feedback", key: "feedback" },
  { href: "/contact", key: "contact" },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      {open ? (
        <path
          d="M6 6 L18 18 M18 6 L6 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M4 7 H20 M4 12 H20 M4 17 H20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { t } = useLanguage();
  // Stores which route the menu was opened on rather than a plain boolean,
  // so any navigation (including back/forward) closes it for free instead
  // of needing an effect to watch the pathname. Clicking the link for the
  // page you're already on doesn't change the route, so the links also
  // close it explicitly below.
  const [openedAtPath, setOpenedAtPath] = useState<string | null>(null);
  const menuOpen = openedAtPath === pathname;
  const setMenuOpen = (open: boolean) => setOpenedAtPath(open ? pathname : null);

  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenedAtPath(null);
    }
    // The toggle is excluded so its own click can close the menu, rather
    // than this closing it first and the click reopening it.
    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (navRef.current?.contains(target)) return;
      if (toggleRef.current?.contains(target)) return;
      setOpenedAtPath(null);
    }

    // The open menu covers the viewport, so stop the page behind it from
    // scrolling underneath.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <Link href="/" className="site-brand">
        <img src="/logo-full.png" alt="Gurbani Aarth Milan" className="site-logo-full" />
      </Link>

      <nav id="site-nav" ref={navRef} className={menuOpen ? "site-nav open" : "site-nav"}>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {t.nav[link.key]}
          </Link>
        ))}
      </nav>

      {/* Deliberately outside the nav so it stays visible on mobile instead of
          hiding behind the hamburger -- a reader who can't read the English
          labels shouldn't have to find a menu first to switch language. */}
      <LanguageToggle />

      <button
        ref={toggleRef}
        type="button"
        className="site-nav-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
        aria-expanded={menuOpen}
        aria-controls="site-nav"
      >
        <MenuIcon open={menuOpen} />
      </button>
    </header>
  );
}
