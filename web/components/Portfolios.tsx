"use client";

import { explorerAddress } from "@/lib/chain";
import { formatApy, formatEstimate } from "@/lib/format";
import { TIER_INFO } from "@/lib/tiers";
import { useVaults } from "@/lib/useVaults";
import { warningMessage } from "@/lib/warnings";
import { RateChart } from "./RateChart";

const feePercent = (fee: number | null) => (fee === null ? "not reported" : `${(fee * 100).toFixed(2)}%`);

/** Calm, Steady and Bold side by side, with live data for each. */
export function Portfolios() {
  const vaults = useVaults();

  if (vaults.isPending) return <p>Loading today's rates…</p>;

  return (
    <>
      {vaults.isError && <p role="status">Live rates unavailable. Saving and withdrawing still work.</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {TIER_INFO.map((tier) => {
          const vault = vaults.data?.tiers[tier.key];
          return (
            <section key={tier.key} className="space-y-3 rounded border border-black px-4 py-3">
              <div>
                <h2 className="text-xl font-bold">{tier.label}</h2>
                <p className="text-sm">Level {tier.level} of 3</p>
              </div>
              <p>{tier.risk}</p>
              {vault ? (
                <>
                  <div>
                    <p className="text-3xl font-bold tabular-nums">{formatApy(vault.apy)}</p>
                    <p className="text-sm">APY today, changes daily</p>
                  </div>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt>Vault</dt>
                      <dd className="text-right">
                        <a href={explorerAddress(vault.vaultAddress)} target="_blank" rel="noreferrer" className="underline">
                          {vault.name}
                        </a>
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Curator</dt>
                      <dd className="text-right">{vault.curator ?? "not reported"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Available to withdraw</dt>
                      <dd className="text-right tabular-nums">{formatEstimate(Number(vault.liquidity))}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Vault fees</dt>
                      <dd className="text-right">
                        performance {feePercent(vault.fees.performance)} · management {feePercent(vault.fees.management)}
                      </dd>
                    </div>
                  </dl>
                  {vault.warnings.length > 0 && (
                    <ul className="space-y-1 text-sm">
                      {vault.warnings.map((code) => (
                        <li key={code}>⚠ {warningMessage(code)}</li>
                      ))}
                    </ul>
                  )}
                  <div>
                    <p className="text-sm">APY, last 7 days</p>
                    <RateChart tier={tier.key} />
                  </div>
                </>
              ) : (
                <p className="text-sm">Live data for this portfolio is unavailable right now.</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
