"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { explorerAddress } from "@/lib/chain";
import { shortAddress } from "@/lib/format";
import { duration } from "@/motion/tokens";
import { CopyIcon, DisconnectIcon, ExternalIcon, TickIcon } from "./Icon";

const itemClass =
  "flex w-full items-center gap-2.5 rounded-sm px-3 py-2.5 text-left text-label transition-[background-color] duration-150 ease-out hover:bg-grey-surface";

/** The connected address, with a small menu: copy it, open it on the explorer, disconnect. */
export function WalletChip({ address, onArc, onDisconnect }: { address: string; onArc: boolean; onDisconnect: () => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
    } catch {
      // Clipboard access can be refused; the address is still readable on the explorer.
    }
  };

  return (
    <div ref={root} className="relative">
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Wallet"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: duration.fast }}
            className="absolute bottom-full left-0 z-10 mb-2 grid w-56 origin-bottom-left rounded-card border border-grey-line bg-white p-2 shadow-sheet"
          >
            <button type="button" role="menuitem" onClick={copy} className={itemClass}>
              {copied ? <TickIcon size={18} className="text-green" /> : <CopyIcon size={18} />}
              {copied ? "Copied" : "Copy address"}
            </button>
            <a role="menuitem" href={explorerAddress(address)} target="_blank" rel="noreferrer" className={`${itemClass} text-black`}>
              <ExternalIcon size={18} />
              View on explorer
            </a>
            <button
              type="button"
              role="menuitem"
              onClick={onDisconnect}
              className={`${itemClass} mt-1 rounded-t-none border-t border-grey-line font-semibold`}
            >
              <DisconnectIcon size={18} />
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-caption font-semibold tabular-nums transition-[border-color] duration-150 ease-out hover:border-black ${open ? "border-black" : "border-grey-line"}`}
      >
        <span aria-hidden="true" className={`size-2 rounded-full ${onArc ? "bg-green" : "bg-caution"}`} />
        {shortAddress(address)}
      </button>
    </div>
  );
}
