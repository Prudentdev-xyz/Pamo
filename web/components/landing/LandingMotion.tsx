"use client";

import { animate, stagger, type JSAnimation } from "animejs";
import { useEffect } from "react";

const all = <T extends Element>(selector: string) => [...document.querySelectorAll<T>(selector)];

/**
 * The landing page's motion (Build Guide §7.3). It draws nothing itself.
 * - Logo intro, anime.js: a white screen where "Pamo" writes in, the tone marks settle and the wordmark travels
 *   up into the nav. On every load of the landing page, at every width.
 * - Hero lines, feature cards and the text of the sections below, GSAP: loaded here with a dynamic import, so GSAP is only ever fetched on `/`.
 * With reduced motion on, none of it runs and everything is in place.
 */
export function LandingMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Arriving from another page: the boot script did not run, so do its job here. The intro is for a fresh load
    // of the landing page only, so it does not play on the way back from another page.
    if (root.dataset.intro === undefined && root.dataset.motion === undefined) {
      if (!reduced) root.dataset.motion = "on";
      root.dataset.intro = "seen";
    }
    root.dataset.ready = "1";
    const moving = root.dataset.motion === "on";
    const playIntro = moving && root.dataset.intro !== "seen";

    let gone = false;
    const running: JSAnimation[] = [];
    const timers: number[] = [];
    let revertGsap = () => {};

    // Hero lines rise one after another with the buttons last; the cards and the sections' text rise as they arrive.
    let heroStarted = false;
    const startHero = () => {
      if (heroStarted || !moving) return;
      heroStarted = true;
      (async () => {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
        if (gone) return;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          gsap.fromTo(
            '[data-rise="hero"]',
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out", clearProps: "transform" },
          );
          gsap.fromTo(
            '[data-rise="card"]',
            { y: 32, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              stagger: 0.08,
              ease: "power3.out",
              clearProps: "transform",
              scrollTrigger: { trigger: "[data-cards]", start: "top 80%", once: true },
            },
          );
          // Titles and text further down: whatever comes into view together rises together, one after another.
          ScrollTrigger.batch('[data-rise="text"]', {
            start: "top 88%",
            once: true,
            onEnter: (seen) =>
              gsap.fromTo(
                seen,
                { y: 24, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", clearProps: "transform" },
              ),
          });
        });
        revertGsap = () => context.revert();
      })().catch(() => {
        // Without GSAP nothing would ever show these, so stop hiding them.
        delete root.dataset.motion;
      });
    };

    const finishIntro = () => {
      running.forEach((animation) => animation.pause());
      timers.forEach((timer) => window.clearTimeout(timer));
      root.dataset.intro = "seen";
      root.style.overflow = "";
      all<SVGElement>("[data-nav-logo] [data-logo], [data-intro-screen] [data-logo]").forEach((path) => path.removeAttribute("style"));
      window.removeEventListener("pointerdown", finishIntro);
      window.removeEventListener("keydown", finishIntro);
      startHero();
    };

    /** Letters write in, then the accent drops and the dot rises into place. Distances are in the logo's own units. */
    const writeIn = (scope: string, gap: number) => {
      running.push(
        animate(`${scope} [data-logo="letter"]`, {
          opacity: [0, 1],
          translateY: [220, 0],
          duration: 180,
          delay: stagger(gap, { start: 100 }),
          ease: "outCubic",
        }),
        animate(`${scope} [data-logo="accent"]`, { opacity: [0, 1], translateY: [-280, 0], duration: 250, delay: 100 + gap * 4 + 20, ease: "outCubic" }),
        animate(`${scope} [data-logo="dot"]`, { opacity: [0, 1], translateY: [280, 0], duration: 250, delay: 100 + gap * 4 + 20, ease: "outCubic" }),
      );
    };

    const screen = document.querySelector<HTMLElement>("[data-intro-screen]");
    const fullScreen = playIntro && !!screen && getComputedStyle(screen).display !== "none";

    if (!playIntro) {
      startHero();
    } else if (fullScreen) {
      // About 1.6 s in all. Any tap or key skips it.
      root.style.overflow = "hidden";
      window.scrollTo(0, 0);
      window.addEventListener("pointerdown", finishIntro);
      window.addEventListener("keydown", finishIntro);
      writeIn("[data-intro-screen]", 150);
      timers.push(
        window.setTimeout(() => {
          const mark = screen.querySelector<HTMLElement>("[data-intro-mark]");
          const wipe = screen.querySelector<HTMLElement>("[data-intro-wipe]");
          const target = document.querySelector<SVGElement>("[data-nav-logo] svg");
          if (!mark || !wipe || !target) return finishIntro();
          const from = mark.getBoundingClientRect();
          const to = target.getBoundingClientRect();
          startHero();
          running.push(
            animate(mark, {
              translateX: to.left - from.left,
              translateY: to.top - from.top,
              scale: to.width / from.width,
              duration: 450,
              ease: "outCubic",
            }),
            animate(wipe, { translateY: -(window.innerHeight + 220), duration: 450, ease: "outCubic", onComplete: finishIntro }),
          );
        }, 1150),
      );
    } else {
      // The intro's screen is not there to play on: the wordmark arrives in the nav while the hero rises.
      writeIn("[data-nav-logo]", 90);
      startHero();
      timers.push(window.setTimeout(finishIntro, 900));
    }

    return () => {
      gone = true;
      running.forEach((animation) => animation.pause());
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("pointerdown", finishIntro);
      window.removeEventListener("keydown", finishIntro);
      root.style.overflow = "";
      revertGsap();
    };
  }, []);

  return null;
}
