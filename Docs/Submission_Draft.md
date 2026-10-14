# Pamo: DoraHacks submission draft

A draft to edit. Lines marked **[fill in]** wait on you. The form's own field names may differ; move the text to wherever it fits.

---

## Project name

Pamo

## One line

Savings pots for USDC: your money earns in a lending vault while it sits, and only you can take it out.

## Short description

Pamo is a save-and-earn app on Arc. You save USDC into pots, pick how each pot earns, and withdraw when the rules you set allow it. An Anytime Vault has no lock. A Goal Vault stays locked until you reach your target or your date. Each pot earns in a USDC lending vault chosen by its portfolio: Calm, Steady or Bold. Nobody else can move your money, including Pamo.

The name comes from the Yoruba *fi pamọ́*, "keep it safe".

## The problem

Most people who hold USDC let it sit idle. Earning yield onchain today means finding vaults, reading contract addresses and understanding DeFi jargon. That is too much for someone who just wants to save.

## What Pamo does

- **Anytime Vault.** Save USDC and take it out whenever you want.
- **Goal Vault.** Save toward a target amount with an unlock date. The contract refuses a withdrawal until the target or the date is reached.
- **Pamo Portfolios.** Calm, Steady or Bold. Each one is a USDC lending vault, shown with its live rate, fees and available cash.
- **Growth Calculator.** See what savings could grow to at today's rate, with no wallet needed. Always labelled an estimate.
- **Review screens.** Every save and withdrawal shows what will happen before you sign.
- **Dashboard and activity.** Total saved, earned so far, goal progress and history.

## How it is built

- **Contract:** `PamoSavings.sol` (Solidity, OpenZeppelin, Arc Foundry). Each pot belongs to one owner and holds shares of one ERC-4626 vault. Withdrawals pay the pot's owner and nobody else. The admin can set which vault a tier uses for new pots and pause new deposits; it cannot withdraw, move or freeze user funds, and withdrawals work while paused.
- **Tests:** 44 tests, run against real Morpho vaults on a fork of Arc mainnet: unit, fuzz and invariant tests, including "the admin has no path to user funds" and "pause does not block withdrawals".
- **Web app:** Next.js, TypeScript, Tailwind, wagmi and viem.
- **Backend:** Node.js and Express with the Circle Earn Kit for live rates, fees, liquidity and quotes, plus an indexer that reads contract events into Supabase for activity history.
- **The chain is the source of truth.** The backend only caches and enriches. If it is down, saving and withdrawing still work.

## How it uses Arc and Circle

- USDC is the only asset, used through its ERC-20 interface on Arc.
- Savings earn in Morpho USDC vaults on Arc through the ERC-4626 standard.
- The Circle Earn Kit supplies vault discovery, live APY, fees, liquidity and deposit quotes.
- Network fees are paid in USDC, so a saver never needs a second token.
- Fast finality means a save or a withdrawal is confirmed in about a second.

## Links

- **Live app (Arc mainnet):** https://pamosafe.vercel.app
- **Contract on Arc mainnet:** `0x72e63Db13C6b2c1e2c3C52216B4EBb88BCACB8eC`, source verified: https://explorer.arc.io/address/0x72e63Db13C6b2c1e2c3C52216B4EBb88BCACB8eC
- **Contract on Arc testnet:** https://explorer.testnet.arc.io/address/0x9952E937378bb093DFA010e94FC81D56EC4cBF17
- **Repository:** https://github.com/Prudentdev-xyz/Pamo
- **Demo video:** **[fill in]**
- **Product spec (PDF):** attach `Brand Kit & Design/Pamo_Spec_Arc.pdf`

## What is honest about it

- Rates are live and labelled as today's rate, even at 0%.
- The savings are lent out through third-party vaults. A vault can be short on cash, which can delay a withdrawal. The review screen warns first.
- The contract has not been audited.
- The admin is one key today. Ownership moves in two steps, so it can go to a Safe multisig on Arc without a contract change.

## What comes next

Recurring auto-save, blended portfolios across several vaults, crosschain deposits and a fiat onramp, passkey and email sign-in, gasless saving, a sharia-compliant savings option, team treasuries, more chains and a native mobile app.

## Team

**[fill in: your name, role and contact]**
