"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatApy, formatEstimate } from "@/lib/format";
import { useVaults } from "@/lib/useVaults";
import { Blank } from "../Blank";
import { ArrowRightIcon } from "../Icon";
import { Logo } from "../Logo";
import { LevelMark } from "../TierChip";

const BEATS = [
  {
    stop: "Your wallet",
    title: "Start in your wallet.",
    text: "Your USDC stays in your own wallet until you choose to save. Pamo asks before anything moves.",
    link: { href: "/app", label: "Open the app" },
  },
  {
    stop: "Pamo",
    title: "Make a pot.",
    text: "Name it, pick Anytime or Goal, and choose a portfolio. Only your wallet can take the money out.",
    link: { href: "/portfolios", label: "See the portfolios" },
  },
  {
    stop: "Lending vault",
    title: "It goes to a lending vault.",
    text: "Your USDC is lent through a public lending vault. Borrowers pay interest to the vault.",
    link: { href: "/portfolios", label: "See today's rates" },
  },
  {
    stop: "Interest back",
    title: "Interest comes back to your pot.",
    text: "Your pot's value grows as the vault earns. The rate changes daily.",
    link: { href: "/calculator", label: "Try the calculator" },
  },
];

const row = "flex justify-between gap-2 border-b border-grey-line py-2";

/** One screen of the example phone. A picture of the app with made-up savings, so it is hidden from screen readers. */
function Screen({ beat }: { beat: number }) {
  const steady = useVaults().data?.tiers.steady;
  return (
    <div className="grid content-start gap-3.5 px-4 pt-3 text-caption">
      <div className="flex items-center justify-between">
        <Logo className="h-4.5 w-auto" />
        <span className="rounded-full border border-grey-line px-2 py-1 text-[10px] leading-none font-semibold">Example</span>
      </div>
      {beat === 0 && (
        <>
          <span className="text-grey-text">In your wallet</span>
          <span className="flex items-baseline gap-1.5">
            <b className="text-h1 tracking-[-0.03em] tabular-nums">1,024.00</b>
            <span className="font-semibold text-grey-text">USDC</span>
          </span>
          <div className="grid gap-2.5 rounded-card border border-grey-line p-4">
            <b className="text-label">Connect to Pamo</b>
            <span className="text-grey-text">Pamo asks your wallet before anything moves. It never holds your keys.</span>
            <span className="flex h-10 items-center justify-center rounded-full bg-black font-semibold text-white">Connect wallet</span>
          </div>
        </>
      )}
      {beat === 1 && (
        <>
          <span className="flex flex-wrap items-center gap-1.5">
            <b className="mr-1 text-h3">Rent</b>
            <span className="rounded-sm border border-grey-line px-2 py-0.5 font-semibold">Goal</span>
            <span className="rounded-sm bg-mint px-2 py-0.5 font-semibold">Steady</span>
          </span>
          <span className="flex items-baseline gap-1.5">
            <b className="text-h1 tracking-[-0.03em] tabular-nums">840.00</b>
            <span className="font-semibold text-grey-text">USDC</span>
          </span>
          <span className="flex gap-5">
            <span className="grid">
              <span className="text-grey-text">Put in</span>
              <b className="tabular-nums">827.52</b>
            </span>
            <span className="grid">
              <span className="text-grey-text">Earned</span>
              <b className="text-green tabular-nums">+12.48</b>
            </span>
          </span>
          <span className="grid gap-1.5">
            <span className="flex justify-between">
              <b>70% of goal</b>
              <span className="text-grey-text tabular-nums">of 1,200.00</span>
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-grey-line">
              <span className="block h-full w-[70%] rounded-full bg-green" />
            </span>
          </span>
          <span className="text-grey-text">Unlocks when you reach 1,200.00 USDC or on Mar 1, 2027</span>
        </>
      )}
      {beat === 2 && (
        <>
          <span className="inline-flex items-center gap-2">
            <LevelMark tier={1} />
            <b className="text-h3">Steady</b>
          </span>
          {/* The rate and the cash are the live ones, so this screen never shows a made-up rate. */}
          <span className="grid gap-0.5">
            <b className="text-h1 tracking-[-0.03em] tabular-nums">{steady ? formatApy(steady.apy) : <Blank />}</b>
            <span className="text-grey-text">{steady ? "APY today, changes daily" : "Live rate unavailable"}</span>
          </span>
          <span className="border-t border-grey-line">
            {steady && (
              <span className={row}>
                <span className="text-grey-text">Cash available</span>
                <b className="text-right tabular-nums">{formatEstimate(Number(steady.liquidity))}</b>
              </span>
            )}
            <span className={row}>
              <span className="text-grey-text">From Rent</span>
              <b className="tabular-nums">840.00 USDC</b>
            </span>
          </span>
          <span className="text-grey-text">Lent to borrowers through a public lending vault. Borrowers pay interest to the vault.</span>
        </>
      )}
      {beat === 3 && (
        <>
          <span className="text-grey-text">Rent · earned so far</span>
          <span className="flex items-baseline gap-1.5">
            <b className="text-display tracking-[-0.03em] text-green tabular-nums">+12.48</b>
            <span className="font-semibold text-grey-text">USDC</span>
          </span>
          <span className="border-t border-grey-line">
            <span className={row}>
              <span className="text-grey-text">Put in</span>
              <b className="tabular-nums">827.52 USDC</b>
            </span>
            <span className={row}>
              <span className="text-grey-text">Earned</span>
              <b className="text-green tabular-nums">+12.48 USDC</b>
            </span>
            <span className={row}>
              <span className="text-grey-text">Pot value</span>
              <b className="tabular-nums">840.00 USDC</b>
            </span>
          </span>
          <span className="text-grey-text">The pot grows as the vault earns. The rate changes daily.</span>
        </>
      )}
    </div>
  );
}

function BeatLink({ beat }: { beat: number }) {
  const { href, label } = BEATS[beat]!.link;
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5 text-body font-semibold text-black">
      <span className="flex size-9 items-center justify-center rounded-full border-[1.5px] border-black transition-[background-color,color] duration-150 ease-out group-hover:bg-black group-hover:text-white">
        <ArrowRightIcon size={16} />
      </span>
      {label}
    </Link>
  );
}

const device = "relative shrink-0 overflow-hidden rounded-[2.75rem] border-8 border-black bg-white";
// Every layer sits in the same grid cell, so the block is as tall as its tallest one and nothing jumps on a swap.
const stack = "grid [&>*]:col-start-1 [&>*]:row-start-1";
// The old beat leaves quickly and the new one travels in after it, so the swap reads as a change and the two never sit on top of each other.
// `far` is for the phone's screens, which slide like pages; the text moves a shorter way.
const layer = (active: boolean, before: boolean, far = false) => {
  if (active) return "transition-[opacity,transform] delay-150 duration-500 ease-out";
  const away = far ? (before ? "-translate-y-1/3" : "translate-y-1/3") : before ? "-translate-y-8" : "translate-y-8";
  return `pointer-events-none opacity-0 transition-[opacity,transform] duration-150 ease-out ${away}`;
};

/**
 * Wallet → Pamo → lending vault → interest back. Once GSAP has loaded the section pins for four beats of scroll,
 * and a USDC dot travels along the strip as you go, filling the line behind it. With reduced motion on, or before the script arrives,
 * the four beats are simply stacked.
 */
export function HowItWorks() {
  const section = useRef<HTMLElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLSpanElement>(null);
  const [pinned, setPinned] = useState(false);
  const [beat, setBeat] = useState(0);
  // The last stop the dot has got to. A stop turns black when the dot arrives, not before.
  const [reached, setReached] = useState(0);

  // GSAP is loaded here, on the landing page only, so it never reaches the app's bundle.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let stop = () => {};
    let gone = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (gone) return;
      gsap.registerPlugin(ScrollTrigger);
      setPinned(true);
      // The layout changes on the next paint, so the trigger is measured after it.
      requestAnimationFrame(() => {
        if (gone || !section.current) return;
        const context = gsap.context(() => {
          const trigger = { trigger: section.current, start: "top top", end: "bottom bottom" };
          // The scroll has four equal beats but the strip has three gaps. The dot sits on a stop in the middle of
          // that stop's beat and is halfway to the next one when the beat changes.
          const along = (p: number) => Math.min(1, Math.max(0, (p - 0.125) / 0.75));
          ScrollTrigger.create({
            ...trigger,
            onUpdate: (self) => {
              setBeat(Math.min(3, Math.floor(self.progress * 4)));
              setReached(Math.floor(along(self.progress) * 3 + 0.001));
            },
          });
          gsap.fromTo(dot.current, { xPercent: 0 }, { xPercent: 100, ease: along, scrollTrigger: { ...trigger, scrub: 0.4 } });
          gsap.fromTo(fill.current, { scaleX: 0 }, { scaleX: 1, ease: along, scrollTrigger: { ...trigger, scrub: 0.4 } });
          gsap.to(hint.current, { y: 5, duration: 0.6, ease: "sine.inOut", repeat: -1, yoyo: true });
        }, section);
        ScrollTrigger.refresh();
        // A link to this section landed before the layout changed, so line it up again.
        if (window.location.hash === "#how-it-works") section.current.scrollIntoView();
        stop = () => context.revert();
      });
    })().catch(() => {});
    return () => {
      gone = true;
      stop();
    };
  }, []);

  const strip = (
    <div className="grid gap-2.5">
      <div className="relative mx-1.5 h-3">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-grey-line" />
        {/* The part of the line the dot has already crossed. */}
        {pinned && <span ref={fill} aria-hidden="true" className="absolute inset-x-0 top-1/2 h-0.5 origin-left -translate-y-1/2 scale-x-0 bg-black" />}
        <span className="absolute inset-0 flex items-center justify-between">
          {BEATS.map((b, i) => (
            <span
              key={b.stop}
              className={`size-2 rounded-full transition-[background-color] duration-250 ease-out ${pinned && i > reached ? "bg-grey-line" : "bg-black"}`}
            />
          ))}
        </span>
        {/* The USDC dot. Its carrier is as wide as the strip, so moving the carrier by its own width crosses it. */}
        {pinned && (
          <span ref={dot} aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="absolute top-1/2 left-0 size-3 -translate-1/2 rounded-full bg-green ring-4 ring-mint" />
          </span>
        )}
      </div>
      <ol className="flex justify-between gap-2 text-caption font-semibold text-grey-text">
        {BEATS.map((b, i) => (
          <li
            key={b.stop}
            aria-current={pinned && i === beat ? "step" : undefined}
            className={`transition-[color] duration-250 ease-out ${pinned && i === beat ? "text-black" : ""}`}
          >
            {b.stop}
          </li>
        ))}
      </ol>
    </div>
  );

  if (!pinned) {
    return (
      <section ref={section} id="how-it-works" aria-labelledby="how-title" className="scroll-mt-24 border-t border-grey-line px-5 py-18 lg:px-20 lg:py-24">
        <div className="mx-auto grid max-w-320 gap-14">
          <div className="grid gap-6 lg:max-w-160">
            <h2 id="how-title" className="text-label font-semibold text-grey-text">
              How it works
            </h2>
            {strip}
          </div>
          <ol className="grid gap-16 lg:grid-cols-2 lg:gap-x-12">
            {BEATS.map((b, i) => (
              <li key={b.title} className="grid content-start gap-6">
                <div className="grid gap-3.5">
                  <span className="text-label font-semibold text-grey-text tabular-nums">{i + 1} of 4</span>
                  <h3 className="text-display font-bold tracking-[-0.03em]">{b.title}</h3>
                  <p className="max-w-95 text-body text-grey-text">{b.text}</p>
                  <BeatLink beat={i} />
                </div>
                <div aria-hidden="true" className={`${device} h-105 w-70`}>
                  <Screen beat={i} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={section} id="how-it-works" aria-labelledby="how-title" className="relative h-[360svh] scroll-mt-0 border-t border-grey-line lg:border-t-0">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden px-6 pt-21 lg:justify-center lg:px-20 lg:pt-20">
        <div className="mx-auto grid w-full max-w-320 grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_17.5rem_minmax(0,1fr)] lg:items-center lg:gap-12 xl:gap-20">
          <div className="grid gap-5">
            <h2 id="how-title" className="flex justify-between gap-3 text-label font-semibold text-grey-text tabular-nums">
              How it works <span aria-hidden="true">{beat + 1} of 4</span>
            </h2>
            {strip}
            <div className={stack}>
              {BEATS.map((b, i) => (
                <h3
                  key={b.title}
                  aria-hidden={i !== beat}
                  className={`text-h1 font-bold tracking-[-0.03em] lg:text-display xl:text-balance ${layer(i === beat, i < beat)}`}
                >
                  {b.title}
                </h3>
              ))}
            </div>
            {/* Says the section moves with the scroll. It goes once the first beat has changed. */}
            <p
              aria-hidden="true"
              className={`inline-flex items-center gap-2 text-label font-semibold text-black transition-opacity duration-250 ease-out ${beat === 0 ? "" : "opacity-0"}`}
            >
              <span ref={hint} className="flex size-7 items-center justify-center rounded-full bg-mint text-green">
                <ArrowRightIcon size={14} className="rotate-90" />
              </span>
              Scroll to follow your USDC
            </p>
          </div>
          <div aria-hidden="true" className={`${device} order-3 h-110 w-55 justify-self-center lg:order-none lg:h-145 lg:w-70`}>
            <div className={`${stack} origin-top-left [zoom:0.786] lg:[zoom:1]`}>
              {BEATS.map((b, i) => (
                <div key={b.title} className={layer(i === beat, i < beat, true)}>
                  <Screen beat={i} />
                </div>
              ))}
            </div>
          </div>
          <div className={`${stack} order-2 lg:order-none`}>
            {BEATS.map((b, i) => (
              <div key={b.title} inert={i !== beat ? true : undefined} className={`grid content-start gap-4.5 ${layer(i === beat, i < beat)}`}>
                <p className="max-w-95 text-body text-grey-text">{b.text}</p>
                <span className="hidden lg:block">
                  <BeatLink beat={i} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
