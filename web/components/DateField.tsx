"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { formatDate } from "@/lib/format";
import { duration } from "@/motion/tokens";
import { CalendarIcon, ChevronRightIcon } from "./Icon";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/** "2027-03-01" as a date in the user's own time zone, or null. */
function parse(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year!, month! - 1, day!);
  return Number.isNaN(date.getTime()) ? null : date;
}

const toValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/**
 * A date picked from a small calendar. The value is "yyyy-mm-dd", the same as a date input gives,
 * so the form around it does not change. Days before `min` cannot be picked.
 */
export function DateField({
  label,
  value,
  min,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  /** The earliest day allowed, as "yyyy-mm-dd". */
  min: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const selected = parse(value);
  const earliest = parse(min) ?? new Date();
  const [open, setOpen] = useState(false);
  // The day the keyboard is on. The calendar shows the month this day is in.
  const [cursor, setCursor] = useState<Date>(selected ?? earliest);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // Bring the whole calendar into view when it opens, clear of the button bar at the bottom of the screen.
  useEffect(() => {
    if (open) grid.current?.parentElement?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open]);

  // Keep the keyboard's day focused as it moves, including across months.
  useEffect(() => {
    if (open) grid.current?.querySelector<HTMLButtonElement>(`[data-day="${toValue(cursor)}"]`)?.focus({ preventScroll: true });
  }, [open, cursor]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  const move = (to: Date) => setCursor(to < earliest ? earliest : to);

  const onKey = (event: KeyboardEvent) => {
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in steps) {
      event.preventDefault();
      move(addDays(cursor, steps[event.key]!));
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      move(new Date(cursor.getFullYear(), cursor.getMonth() + (event.key === "PageUp" ? -1 : 1), cursor.getDate()));
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  // Weeks start on Monday.
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const canGoBack = new Date(year, month, 0) >= earliest;

  return (
    <div ref={root} className="relative grid gap-2">
      <label htmlFor={id} className="text-label font-semibold">
        {label}
      </label>
      <button
        ref={trigger}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onClick={() => {
          setCursor(selected ?? earliest);
          setOpen((was) => !was);
        }}
        className={`flex h-14 items-center justify-between gap-2 rounded-sm border bg-white px-4 text-left text-body transition-[border-color] duration-150 ease-out hover:border-black ${
          selected || open ? "border-black" : "border-grey-line"
        }`}
      >
        <span className={selected ? "tabular-nums" : "text-grey-muted"}>{selected ? formatDate(selected) : "Pick a date"}</span>
        <CalendarIcon className="shrink-0" />
      </button>
      {hint && (
        <p id={`${id}-hint`} className="text-caption text-grey-text">
          {hint}
        </p>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={`${label}: choose a day`}
            onKeyDown={onKey}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: duration.fast }}
            className="absolute top-23 left-0 z-20 grid w-full origin-top-left scroll-mb-28 gap-3 rounded-card border border-grey-line bg-white p-4 shadow-sheet lg:max-w-80"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                disabled={!canGoBack}
                onClick={() => move(new Date(year, month - 1, 1))}
                className="flex size-10 items-center justify-center rounded-full border border-grey-line transition-[background-color] duration-150 ease-out hover:bg-grey-surface disabled:invisible"
              >
                <ChevronRightIcon size={18} className="rotate-180" />
              </button>
              <p aria-live="polite" className="text-label font-semibold">
                {first.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => move(new Date(year, month + 1, 1))}
                className="flex size-10 items-center justify-center rounded-full border border-grey-line transition-[background-color] duration-150 ease-out hover:bg-grey-surface"
              >
                <ChevronRightIcon size={18} />
              </button>
            </div>
            <div aria-hidden="true" className="grid grid-cols-7 text-center text-caption text-grey-text">
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div ref={grid} className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: lead }, (_, i) => (
                <span key={`gap-${i}`} />
              ))}
              {Array.from({ length: days }, (_, i) => {
                const day = new Date(year, month, i + 1);
                const dayValue = toValue(day);
                const isSelected = value === dayValue;
                return (
                  <button
                    key={dayValue}
                    type="button"
                    data-day={dayValue}
                    disabled={day < earliest}
                    tabIndex={dayValue === toValue(cursor) ? 0 : -1}
                    aria-label={formatDate(day)}
                    aria-pressed={isSelected}
                    onClick={() => {
                      onChange(dayValue);
                      close();
                    }}
                    className={`mx-auto flex size-10 items-center justify-center rounded-full text-label tabular-nums transition-[background-color] duration-150 ease-out disabled:text-grey-muted disabled:line-through ${
                      isSelected ? "bg-black font-semibold text-white" : "enabled:hover:bg-grey-surface"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
