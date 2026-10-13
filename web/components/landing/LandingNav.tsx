"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useIsDesktop } from "@/lib/useIsDesktop";
import { buttonClass } from "../Button";
import { MenuIcon } from "../Icon";
import { Logo } from "../Logo";
import { MobileMenu } from "../MobileMenu";
import { SITE_LINKS, SITE_MENU } from "../SiteNav";

const pill = "pointer-events-auto flex items-center rounded-full border border-grey-line bg-white transition-[opacity,transform] duration-250 ease-out";
const menuButton =
  "flex size-11 items-center justify-center rounded-full border border-grey-line transition-[background-color] duration-150 ease-out hover:bg-grey-surface lg:hidden";

/**
 * The landing page's floating header. While the hero is in view its button is an outline, because the hero holds
 * the green one. Once the hero has scrolled away the button turns green, and on a phone the bar shrinks to it.
 */
export function LandingNav() {
  const [past, setPast] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Only a phone swaps to the short bar.
  const isDesktop = useIsDesktop();
  const short = past && !isDesktop;

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setPast(!entry!.isIntersecting), { rootMargin: "-80px 0px 0px 0px" });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const menu = (
    <button type="button" aria-label="Open menu" onClick={() => setMenuOpen(true)} className={menuButton}>
      <MenuIcon />
    </button>
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-[calc(0.5rem+env(safe-area-inset-top,0px))] lg:px-10 lg:pt-5">
      <div className="relative mx-auto h-15 max-w-280 lg:h-17">
        {/* The full bar. On a phone it gives way to the short one below once the hero is gone. */}
        <div
          inert={short ? true : undefined}
          className={`${pill} absolute inset-0 justify-between gap-4 pr-2 pl-5 lg:pl-6 ${
            past ? "max-lg:pointer-events-none max-lg:-translate-y-2 max-lg:opacity-0 motion-reduce:max-lg:translate-y-0" : ""
          }`}
        >
          <Link href="/" data-nav-logo className="shrink-0 text-black">
            <Logo className="h-6.5 w-auto" />
          </Link>
          <nav aria-label="Main" className="hidden gap-1 text-label font-semibold lg:flex">
            {SITE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex h-11 items-center rounded-full px-4.5 text-grey-text transition-[background-color] duration-150 ease-out hover:bg-grey-surface"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/app" className={buttonClass(past ? "primary" : "outline", "md", "h-11 px-5 max-lg:hidden")}>
              Start saving
            </Link>
            {menu}
          </div>
        </div>
        {/* The short bar: phones only. */}
        <div
          inert={short ? undefined : true}
          className={`${pill} absolute inset-y-0 right-0 gap-2 px-2 lg:hidden ${
            past ? "" : "pointer-events-none -translate-y-2 opacity-0 motion-reduce:translate-y-0"
          }`}
        >
          <Link href="/app" className={buttonClass("primary", "md", "h-11 px-5")}>
            Start saving
          </Link>
          {menu}
        </div>
      </div>
      <div className="pointer-events-auto">
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} pathname="/" items={SITE_MENU} />
      </div>
    </header>
  );
}
