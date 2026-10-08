# Pamo

> *Keep it safe.* Your USDC savings earn while they sit.

Pamo is a save-and-earn app on [Arc](https://docs.arc.io/arc-chain). You save USDC into pots, pick how it earns, and withdraw when the rules you set allow it. Nobody else can move your money.

The name comes from the Yoruba *fi pamọ́*, "keep it safe".

## Status

**Early build.** The product spec and architecture are written; the contract, backend and web app are being built now for Arc Microgrants (deadline Oct 14, 2026).

**Testnet first.** The whole build runs on Arc testnet (chain ID `5042002`) until every flow works. Pamo then deploys to Arc mainnet (chain ID `5042`) for the release.

| Piece | State |
|---|---|
| Product spec and architecture | Done |
| `PamoSavings` contract | Not started |
| Backend (Express + indexer) | Not started |
| Web app | Not started |
| Arc testnet deployment | Not deployed yet |
| Arc mainnet deployment | After the testnet build works |

The live URL, contract address and explorer link will be added here once they exist.

## The problem

Most people who hold USDC let it sit idle. Earning yield onchain today means finding vaults, reading contract addresses and understanding DeFi jargon. That is too much for someone who just wants to save.

Pamo makes it simple: save any amount, set goals, and earn live lending yield on Arc.

## What v1 does

| Feature | What the user does |
|---|---|
| **Anytime Vault** | Save USDC and take it out whenever they want |
| **Goal Vault** | Save toward a target amount with an unlock date. Locked until the target or the date is reached |
| **Pamo Portfolios** | Pick Calm, Steady or Bold, which decides which USDC lending vault the savings earn in |
| **Growth Calculator** | See what savings could grow to at today's live rate, no wallet needed |
| **Review screens** | See exactly what will happen before signing anything |
| **Dashboard and activity** | See total saved, earned so far, goal progress and history |

## How it works

```
 Browser (Next.js)
    │                         │
    │ wagmi/viem              │ REST
    ▼                         ▼
 Arc mainnet             Express (Node.js) ──► Circle Earn Kit (rates, fees, quotes)
 PamoSavings.sol              │
    │ ERC-4626                └──► Supabase (activity, pot names, rate history)
    ▼                              ▲
 Morpho vaults × 3                 │ indexer reads PamoSavings events
 (Calm · Steady · Bold)  ──────────┘
```

- Each pot belongs to one user. Its USDC goes into a Morpho lending vault on Arc, chosen by the pot's tier, and the pot holds the vault shares.
- The chain is the source of truth. The backend only caches and enriches, so saving and withdrawing still work if it is down.

## Product rules

1. **Non-custodial.** Only the pot owner can withdraw. The admin can set which vault a tier uses for new pots and pause new deposits, but cannot withdraw, move or freeze user funds. Withdrawals work even when paused.
2. **Honest numbers.** Rates are live and labelled as today's rate. The calculator is always an estimate, never a promise.
3. **No surprises.** Every save and withdrawal goes through a review screen first.
4. **Plain language.** "Lending vault", "earned", "unlocks on". No jargon without an explanation.

## Stack

| Layer | Choice |
|---|---|
| Contracts | Solidity, Arc Foundry, OpenZeppelin |
| Web | Next.js (App Router), TypeScript, Tailwind CSS, wagmi, viem |
| Backend | Node.js, Express, TypeScript, Circle Earn Kit |
| Database | Supabase (Postgres) |
| Network | Arc testnet (chain ID `5042002`) during the build, Arc mainnet (chain ID `5042`) for the release. USDC with 6 decimals |

## Planned repo layout

```
contracts/    Foundry project: PamoSavings.sol, fork tests, deploy script
server/       Express API and event indexer
web/          Next.js app
supabase/     Database schema
```

## Roadmap (after v1)

Recurring auto-save, blended portfolios, crosschain deposits, passkey and email sign-in, gasless saving, a sharia-compliant savings option, team treasuries, more chains, and a native mobile app.

## Risk

Savings earn yield by being lent out through third-party lending vaults. Rates change daily and can be zero, and a vault can be short on cash at times, which may delay a withdrawal. Pamo is unaudited software in early development. Do not save more than you can afford to lose.
