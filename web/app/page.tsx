import Link from "next/link";

// Placeholder until the landing page is built (Build Guide, Phase 6).
export default function Home() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-bold">Pamo</h1>
      <p className="mt-2">Keep it safe. Your USDC savings earn while they sit.</p>
      <Link href="/app" className="mt-6 inline-block rounded border border-black px-4 py-2 font-semibold">
        Start saving
      </Link>
    </main>
  );
}
