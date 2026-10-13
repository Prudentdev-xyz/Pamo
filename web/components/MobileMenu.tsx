"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatUsdc, shortAddress } from "@/lib/format";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { duration, ease } from "@/motion/tokens";
import { ChainStatus } from "./ChainStatus";
import { ChevronRightIcon, CloseIcon } from "./Icon";
import { Logo } from "./Logo";

export interface MenuItem {
  href: string;
  label: string;
}

const APP_ITEMS: MenuItem[] = [
  { href: "/app", label: "Dashboard" },
  { href: "/portfolios", label: "Portfolios" },
  { href: "/calculator", label: "Calculator" },
  { href: "/app/new", label: "New pot" },
];

/** The full-screen menu at phone width. Black is a moment here, not a mode. */
export function MobileMenu({
  open,
  onClose,
  pathname,
  address,
  balance,
  onDisconnect,
  items = APP_ITEMS,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  address?: string;
  /** The wallet's USDC, when it is known. */
  balance?: bigint;
  onDisconnect?: () => void;
  /** The links to list. The app's own by default; the public pages pass theirs. */
  items?: MenuItem[];
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, open);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration.base, ease }}
          className="fixed inset-0 z-50 flex flex-col overscroll-contain bg-black pt-[env(safe-area-inset-top)] text-white lg:hidden"
        >
          <div className="flex h-15 shrink-0 items-center justify-between px-4">
            <Logo className="h-7 w-auto" />
            <button
              ref={closeButton}
              type="button"
              aria-label="Close menu"
              onClick={onClose}
              className="flex size-11 items-center justify-center rounded-full border border-grey-text"
            >
              <CloseIcon size={22} />
            </button>
          </div>
          <nav aria-label="Main" className="grid flex-1 content-start overflow-y-auto overscroll-contain px-4 pt-8">
            {items.map((item, i) => {
              const here = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.base, ease, delay: 0.06 + i * 0.04 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={here ? "page" : undefined}
                    className="flex items-center justify-between border-b border-grey-text py-4.5 text-white"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-display font-bold tracking-[-0.03em]">{item.label}</span>
                      {here && <span className="text-caption font-semibold text-green-bright">You are here</span>}
                    </span>
                    <ChevronRightIcon />
                  </Link>
                </motion.div>
              );
            })}
          </nav>
          <div className="grid gap-4 px-4 pt-5 pb-[calc(2.25rem+env(safe-area-inset-bottom,0px))]">
            {address && (
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-grey-text px-3.5 py-2.5 text-label font-semibold tabular-nums">
                  <span aria-hidden="true" className="size-2 rounded-full bg-green-bright" />
                  {shortAddress(address)}
                </span>
                <button type="button" onClick={onDisconnect} className="text-label font-semibold underline underline-offset-[3px]">
                  Disconnect
                </button>
              </div>
            )}
            {address && balance !== undefined && (
              <p className="flex justify-between gap-3 text-label">
                <span className="text-grey-text-dark">In wallet</span>
                <span className="font-semibold tabular-nums">{formatUsdc(balance)}</span>
              </p>
            )}
            <ChainStatus onDark />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
