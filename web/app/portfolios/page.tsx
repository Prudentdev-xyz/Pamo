import type { Metadata } from "next";
import { Portfolios } from "@/components/Portfolios";
import { SitePage } from "@/components/SitePage";

export const metadata: Metadata = {
  title: "Portfolios · Pamo",
  description: "Calm, Steady and Bold: three USDC lending vaults, with their live rates side by side.",
};

export default function PortfoliosPage() {
  return (
    <SitePage
      title="Pamo Portfolios"
      lead="Three USDC lending vaults, never stocks or funds. Pick how much risk you want for the rate you get."
    >
      <Portfolios />
    </SitePage>
  );
}
