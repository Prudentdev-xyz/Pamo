import Link from "next/link";
import { buttonClass } from "./Button";
import { Logo } from "./Logo";

/** The header on the pages that need no wallet. */
export function SiteNav() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-grey-line pb-4">
      <Link href="/" className="text-black">
        <Logo className="h-7 w-auto" />
      </Link>
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-label font-semibold">
        <Link href="/portfolios" className="text-black hover:text-green">
          Portfolios
        </Link>
        <Link href="/calculator" className="text-black hover:text-green">
          Calculator
        </Link>
        <Link href="/app" className={buttonClass("primary", "md", "h-10 px-5")}>
          Start saving
        </Link>
      </nav>
    </header>
  );
}
