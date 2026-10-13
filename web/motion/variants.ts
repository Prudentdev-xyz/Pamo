import type { Variants } from "motion/react";
import { duration, ease, stagger } from "./tokens";

// With reduced motion on, MotionConfig in Providers drops the movement and keeps the fade.

/** A route arriving: fade with an 8 px rise. */
export const page: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease } },
};

/** A parent whose children arrive one after another. */
export const list: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: 0.1 } },
};

/** A card or a block arriving: fade with a 12 px rise. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.base, ease } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease } },
};
