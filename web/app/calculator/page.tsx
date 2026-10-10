import type { Metadata } from "next";
import { Calculator } from "@/components/Calculator";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Growth Calculator · Pamo",
  description: "See what your USDC savings could grow to at today's live rate. An estimate, not a promise.",
};

export default function CalculatorPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <SiteNav />
      <main className="space-y-5 py-6">
        <div>
          <h1 className="text-2xl font-bold">Growth Calculator</h1>
          <p className="mt-1">See what your savings could grow to at today's live rate.</p>
        </div>
        <Calculator />
      </main>
    </div>
  );
}
