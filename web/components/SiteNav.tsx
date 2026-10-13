"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "./Button";
import { MenuIcon } from "./Icon";
import { Logo } from "./Logo";
import { MobileMenu, type MenuItem } from "./MobileMenu";

export const SITE_LINKS: MenuItem[] = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/portfolios", label: "Portfolios" },
  { href: "/calculator", label: "Calculator" },
];

export const SITE_MENU: MenuItem[] = [...SITE_LINKS, { href: "/app", label: "Start saving" }];

/** The floating header on the pages that need no wallet. */
export function SiteNav({
  cta = "primary",
}: {
  /** One green button per screen: a page with its own green action asks for the outline here. */
  cta?: "primary" | "outline";
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-3 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] pb-2 lg:px-10 lg:pt-5 lg:pb-5">
      <div className="mx-auto flex h-15 max-w-280 items-center justify-between gap-4 rounded-full border border-grey-line bg-white pr-2 pl-4 min-[360px]:pl-6 lg:h-17">
        <Link href="/" className="shrink-0 text-black">
          <Logo className="h-6.5 w-auto" />
        </Link>
        <nav aria-label="Main" className="hidden gap-1 text-label font-semibold lg:flex">
          {SITE_LINKS.map((link) => {
            const here = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={here ? "page" : undefined}
                className={`flex h-11 items-center rounded-full px-4.5 transition-[background-color] duration-150 ease-out ${
                  here ? "bg-mint text-black" : "text-grey-text hover:bg-grey-surface"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/app" className={buttonClass(cta, "md", "h-11 px-4 min-[360px]:px-5")}>
            Start saving
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="flex size-11 items-center justify-center rounded-full border border-grey-line transition-[background-color] duration-150 ease-out hover:bg-grey-surface lg:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname} items={SITE_MENU} />
    </header>
  );
}
