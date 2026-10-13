"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 64rem)"; // Tailwind's `lg`

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

/** True at desktop width. For motion that differs by layout: a sheet rises on phones and fades in on desktop. */
export const useIsDesktop = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
