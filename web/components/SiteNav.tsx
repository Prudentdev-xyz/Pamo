import Link from "next/link";

/** The header on the pages that need no wallet. */
export function SiteNav() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-black pb-3">
      <Link href="/" aria-label="Pamo" className="text-xl font-bold">
        Pamọ́
      </Link>
      <nav className="flex flex-wrap items-center gap-4 text-sm">
        <Link href="/portfolios" className="underline">
          Portfolios
        </Link>
        <Link href="/calculator" className="underline">
          Calculator
        </Link>
        <Link href="/app" className="rounded border border-black bg-black px-3 py-1 font-semibold text-white">
          Start saving
        </Link>
      </nav>
    </header>
  );
}
