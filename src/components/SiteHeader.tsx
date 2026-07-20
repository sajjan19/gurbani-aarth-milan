import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="site-brand">
        <img src="/logo-icon.png" alt="" className="site-logo" width={36} height={36} />
        <span>Gurbani Aarth Milaan</span>
      </Link>
      <nav className="site-nav">
        <Link href="/">Search</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}
