// Motion tokens (Build Guide §7.2). Motion takes seconds; anime.js takes milliseconds.

export const duration = { fast: 0.15, base: 0.25, slow: 0.6 } as const;
export const durationMs = { fast: 150, base: 250, slow: 600 } as const;

/** Ease-out, the default for everything. */
export const ease = [0.22, 1, 0.36, 1] as const;

/** Sheets, cards and layout changes. */
export const spring = { type: "spring", stiffness: 260, damping: 30 } as const;

/** Seconds between items in a list of cards. */
export const stagger = 0.06;
