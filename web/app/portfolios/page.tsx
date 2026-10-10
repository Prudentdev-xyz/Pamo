import type { Metadata } from "next";
import { Portfolios } from "@/components/Portfolios";
import { SiteNav } from "@/components/SiteNav";
import { LENDING_NOTE } from "@/lib/tiers";

export const metadata: Metadata = {
  title: "Portfolios · Pamo",
  description: "Calm, Steady and Bold: three USDC lending vaults, with their live rates side by side.",
};

export default function PortfoliosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <SiteNav />
      <main className="space-y-5 py-6">
        <div>
          <h1 className="text-2xl font-bold">Pamo Portfolios</h1>
          <p className="mt-1">Pick Calm, Steady or Bold. That decides where your savings earn.</p>
          <p className="mt-1 text-sm">{LENDING_NOTE}</p>
        </div>
        <Portfolios />
      </main>
    </div>
  );
}
