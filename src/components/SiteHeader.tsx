import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="site-brand">
        <img src="/logo-full.png" alt="Gurbani Aarth Milan" className="site-logo-full" />
      </Link>
      <nav className="site-nav">
        <Link href="/">Search</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}
