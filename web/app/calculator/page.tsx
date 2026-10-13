import type { Metadata } from "next";
import { Calculator } from "@/components/Calculator";
import { SitePage } from "@/components/SitePage";

export const metadata: Metadata = {
  title: "Growth Calculator · Pamo",
  description: "See what your USDC savings could grow to at today's live rate. An estimate, not a promise.",
};

export default function CalculatorPage() {
  return (
    <SitePage title="Growth Calculator" lead="See what a pot could grow to at today's rate. No wallet needed." cta="outline">
      <Calculator />
    </SitePage>
  );
}
