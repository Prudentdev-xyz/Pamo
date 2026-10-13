import Link from "next/link";
import { buttonClass } from "@/components/Button";
import { ArrowRightIcon, ExternalIcon } from "@/components/Icon";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { LandingNav } from "@/components/landing/LandingNav";
import { CardFigure, HeroRate, TeaserBalance } from "@/components/landing/LiveBits";
import { explorerAddress } from "@/lib/chain";
import { PAMO_SAVINGS } from "@/lib/contract";

// Each figure counts to its value when its card is seen: days locked fall to 0, the others rise from 0.
const CARDS = [
  { figure: 0, from: 30, title: "Anytime Vault", line: "Days locked. Take it out whenever you want." },
  { figure: 2, from: 0, title: "Goal Vault", line: "Ways to unlock: reach your target, or reach your date." },
  { figure: 3, from: 0, title: "Pamo Portfolios", line: "Levels of risk: Calm, Steady and Bold. USDC lending vaults only." },
];

const FACTS = [
  { title: "Only you can withdraw.", line: "Money in a pot can only go back to the wallet that saved it." },
  { title: "Withdrawals keep working.", line: "Even when new savings are paused, you can still take your money out." },
  { title: "The contract is public.", line: "Anyone can read the code and check every saving and withdrawal." },
];

const arrowLink =
  "group inline-flex h-13 items-center justify-between gap-4 rounded-full border-[1.5px] border-black bg-white pr-1.5 pl-6 text-body font-semibold transition-[background-color,transform] duration-150 ease-out hover:bg-grey-surface active:scale-[0.97] active:bg-mint";
const arrowDisc = "flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-white";

const sectionTitle = "text-display font-bold tracking-[-0.03em] lg:text-balance";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-black px-5 py-3 text-label font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <LandingNav />

      <main id="main" className="flex-1">
        <section id="hero" aria-labelledby="hero-title" className="px-5 pt-31 pb-18 lg:px-20 lg:pt-44 lg:pb-28">
          <div className="mx-auto grid max-w-320 gap-7 lg:gap-10">
            <h1 id="hero-title" data-rise="hero" className="text-hero font-bold tracking-[-0.05em]">
              Keep it safe.
            </h1>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <p data-rise="hero" className="max-w-130 text-h3 tracking-[-0.01em] lg:text-h2">
                Your USDC savings earn while they sit.
              </p>
              <div className="grid gap-4.5 lg:justify-items-end">
                <div data-rise="hero" className="order-2">
                  <HeroRate />
                </div>
                <div data-rise="hero" className="flex flex-wrap gap-3">
                  <Link href="/app" className={buttonClass("primary", "lg", "h-14 flex-[1_1_100%] px-8 lg:flex-none")}>
                    Start saving
                  </Link>
                  <Link href="/portfolios" className={`${arrowLink} h-14 flex-[1_1_100%] lg:flex-none`}>
                    See the portfolios
                    <span className={`${arrowDisc} size-11`}>
                      <ArrowRightIcon size={18} />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HowItWorks />

        <section aria-labelledby="do-title" className="bg-black px-5 py-18 text-white lg:px-20 lg:py-32">
          <div className="mx-auto grid max-w-320 gap-8 lg:gap-14">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <h2 id="do-title" data-rise="text" className={sectionTitle}>
                What you can do
              </h2>
              <p data-rise="text" className="max-w-95 text-body text-grey-text-dark">Two kinds of pot and three portfolios. All of it in USDC.</p>
            </div>
            <ul data-cards className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
              {CARDS.map((card) => (
                <li
                  key={card.title}
                  data-rise="card"
                  className="relative flex min-h-60 flex-col justify-between gap-10 rounded-sheet border border-white/15 bg-white/5 p-7 lg:min-h-80 lg:p-10"
                >
                  <CardFigure value={card.figure} from={card.from} />
                  <span className="grid gap-2">
                    <b className="text-h2 font-bold tracking-[-0.01em]">{card.title}</b>
                    <span className="text-body text-grey-text-dark">
                      <span className="sr-only">{card.figure} </span>
                      {card.line}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="grow-title" className="px-5 py-18 lg:px-20 lg:py-32">
          <div className="mx-auto grid max-w-320 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
            <div className="grid gap-4">
              <h2 id="grow-title" data-rise="text" className={sectionTitle}>
                See it grow.
              </h2>
              <p data-rise="text" className="max-w-105 text-body text-grey-text">
                Put in a starting amount and a monthly top-up, pick a portfolio, and see an estimate.
              </p>
            </div>
            <div data-rise="text" className="grid gap-5 rounded-sheet border border-grey-line p-7 lg:p-10">
              <TeaserBalance />
              <Link href="/calculator" className={`${arrowLink} justify-self-start`}>
                Try the calculator
                <span className={arrowDisc}>
                  <ArrowRightIcon size={18} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="trust-title" className="px-5 pb-18 lg:px-20 lg:pb-32">
          <div className="mx-auto grid max-w-320 gap-8 border-t border-grey-line pt-14 lg:gap-14 lg:pt-24">
            <h2 id="trust-title" data-rise="text" className={sectionTitle}>
              Why trust it
            </h2>
            <ol className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-3 lg:gap-12">
              {FACTS.map((fact, i) => (
                <li key={fact.title} data-rise="text" className="grid content-start gap-2.5">
                  <span aria-hidden="true" className="text-label font-bold text-grey-text tabular-nums">
                    0{i + 1}
                  </span>
                  <b className="text-h2 font-bold tracking-[-0.01em]">{fact.title}</b>
                  <span className="text-body text-grey-text">{fact.line}</span>
                </li>
              ))}
            </ol>
            <a
              href={explorerAddress(PAMO_SAVINGS)}
              target="_blank"
              rel="noreferrer"
              data-rise="text"
              className="inline-flex items-center gap-1.5 justify-self-start text-label font-semibold text-green underline hover:text-green-pressed"
            >
              View contract on explorer
              <ExternalIcon size={16} />
            </a>
          </div>
        </section>

        <section aria-label="The name" className="px-5 pt-6 pb-22 lg:px-20 lg:pt-10 lg:pb-36">
          <p data-rise="text" className="mx-auto max-w-275 text-h2 tracking-[-0.02em] lg:text-display">
            Pamo comes from the Yoruba <i lang="yo">fi pamọ́</i>: <b className="font-bold">keep it safe.</b>
          </p>
        </section>
      </main>

      <SiteFooter />

      {/* The logo intro's screen, once per visit. LandingMotion plays it. */}
      <div data-intro-screen aria-hidden="true" className="fixed inset-0 z-50 motion-reduce:hidden">
        <div data-intro-wipe className="absolute inset-x-0 top-0 h-[calc(100%+200px)] rounded-b-[50%_200px] bg-white" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div data-intro-mark className="origin-top-left text-black">
            <Logo className="h-16 w-auto lg:h-24 [&_[data-logo]]:opacity-0" />
          </div>
        </div>
      </div>
      <LandingMotion />
    </div>
  );
}
