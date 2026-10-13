import { animate } from "animejs";
import { durationMs } from "./tokens";

/**
 * Counts a number on screen from one value to another (anime.js), then writes `final`:
 * an animated amount always ends on the exact value read from the chain.
 * With reduced motion on it writes `final` straight away. Returns a function that stops it.
 */
export function countUp(
  el: HTMLElement,
  { from, to, format, final }: { from: number; to: number; format: (n: number) => string; final: string },
): () => void {
  if (from === to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = final;
    return () => {};
  }
  const state = { n: from };
  el.textContent = format(from);
  const animation = animate(state, {
    n: to,
    duration: durationMs.slow,
    ease: "outQuart",
    onUpdate: () => {
      el.textContent = format(state.n);
    },
    onComplete: () => {
      el.textContent = final;
    },
  });
  return () => {
    animation.pause();
    el.textContent = final;
  };
}
