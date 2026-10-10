import Link from "next/link";

// Placeholder until the landing page is built (Build Guide, Phase 6).
export default function Home() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 aria-label="Pamo" className="text-3xl font-bold">Pamọ́</h1>
      <p className="mt-2">Keep it safe. Your USDC savings earn while they sit.</p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link href="/app" className="inline-block rounded border border-black px-4 py-2 font-semibold">
          Start saving
        </Link>
        <Link href="/portfolios" className="underline">
          Portfolios
        </Link>
        <Link href="/calculator" className="underline">
          Calculator
        </Link>
      </div>
    </main>
  );
}
