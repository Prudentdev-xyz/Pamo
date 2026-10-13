"use client";

import { motion, useDragControls } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useIsDesktop } from "@/lib/useIsDesktop";
import type { ReviewRow } from "@/lib/useReview";
import { duration, ease, spring } from "@/motion/tokens";
import { Banner } from "./Banner";
import { CloseIcon } from "./Icon";

// The review row carries this note inline; the sheet sets it on its own line under the figure.
const ESTIMATE_NOTE = " (estimate, not a promise)";

/**
 * What is about to happen, shown before the wallet opens. Warnings sit above the buttons, never after them.
 * With `onClose` it opens over the page: a sheet from the bottom on phones, a panel in the middle on desktop.
 * Render it inside <AnimatePresence> so it can leave the way it arrived.
 */
export function ReviewSheet({
  title,
  rows,
  warnings = [],
  onClose,
  children,
}: {
  title: string;
  rows: ReviewRow[];
  warnings?: string[];
  onClose?: () => void;
  children?: ReactNode;
}) {
  const body = (
    <>
      <dl>
        {rows.map((row) => {
          // The last line is an estimate, so it is set apart from the facts above it.
          const estimate = row.label.startsWith("In 1 year");
          return (
            <div
              key={row.label}
              className={`flex justify-between gap-4 ${
                estimate ? "-mt-px border-t border-black pt-3 text-body font-bold" : "border-b border-grey-line py-2.5 text-label"
              }`}
            >
              <dt className={`shrink-0 ${estimate ? "" : "text-grey-text"}`}>{row.label}</dt>
              <dd
                className={`text-right tabular-nums ${estimate ? "" : "font-semibold"} ${
                  row.value === "Available after allowing" ? "font-normal text-grey-text" : ""
                }`}
              >
                {estimate ? row.value.replace(ESTIMATE_NOTE, "") : row.value}
              </dd>
            </div>
          );
        })}
      </dl>
      {rows.some((row) => row.label.startsWith("In 1 year")) && (
        <p className="-mt-3 text-caption text-grey-text">Estimate at today’s rate, not a promise.</p>
      )}
      {warnings.length > 0 && (
        <ul className="grid gap-2">
          {warnings.map((warning) => (
            <motion.li key={warning} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: duration.base, ease }}>
              <Banner tone="caution">{warning}</Banner>
            </motion.li>
          ))}
        </ul>
      )}
      {children}
    </>
  );

  if (!onClose) {
    return (
      <section className="grid gap-4 rounded-card border border-grey-line p-5">
        <h3 className="text-h3 font-bold">{title}</h3>
        {body}
      </section>
    );
  }
  return (
    <Sheet title={title} onClose={onClose}>
      {body}
    </Sheet>
  );
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const desktop = useIsDesktop();
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const drag = useDragControls();
  useFocusTrap(panel);

  useEffect(() => {
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
  }, [onClose]);

  // Rendered on the body, so no moving ancestor can shift a fixed panel.
  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center lg:items-center lg:p-10">
      <motion.div
        aria-hidden="true"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration.base, ease }}
        className="absolute inset-0 bg-black/40"
      />
      <motion.section
        ref={panel}
        // On phones the sheet can be pulled down by its handle to close it. Only the handle starts the drag,
        // so the sheet's own content still scrolls.
        drag={desktop ? false : "y"}
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 500) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={desktop ? { opacity: 0, y: 16 } : { y: "100%" }}
        animate={desktop ? { opacity: 1, y: 0 } : { y: 0 }}
        exit={desktop ? { opacity: 0, y: 16 } : { y: "100%" }}
        transition={desktop ? { duration: duration.base, ease } : spring}
        className="relative grid max-h-[94dvh] w-full gap-4 overflow-y-auto overscroll-contain rounded-t-sheet bg-white px-5 pt-2 pb-[calc(1.75rem+env(safe-area-inset-bottom,0px))] shadow-sheet lg:max-h-full lg:max-w-130 lg:rounded-sheet lg:p-7"
      >
        <div
          aria-hidden="true"
          onPointerDown={(event) => drag.start(event)}
          className="-mb-2 flex h-6 cursor-grab touch-none items-center justify-center active:cursor-grabbing lg:hidden"
        >
          <span className="h-1 w-10 rounded-full bg-grey-line" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-h2 font-bold tracking-[-0.02em]">{title}</h2>
          <button
            ref={closeButton}
            type="button"
            aria-label="Close the review"
            onClick={onClose}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-grey-line transition-[background-color] duration-150 ease-out hover:bg-grey-surface"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </motion.section>
    </div>,
    document.body,
  );
}
