# Pamo: Product Specification (v1)

> *Keep it safe.* Your USDC savings earn while they sit.

| | |
|---|---|
| **Product** | Pamo, a save-and-earn app on Arc |
| **Version** | v1 (MVP for Arc Microgrants) |
| **Network** | Arc mainnet (chain ID `5042`). Currently live on Arc; multichain support is on the roadmap. |
| **Platform** | Web app (works in phone browsers). Mobile app is on the roadmap. |
| **Deadline** | Oct 14, 23:59 ET |
| **Companion doc** | [Build_Guide.md](Build_Guide.md): how and in what order it gets built |

---

## 1. Problem statement

Most people who hold USDC let it sit idle, earning nothing. Earning yield onchain today means finding vaults, reading contract addresses and understanding DeFi jargon, which is too much for someone who just wants to save.

**Pamo makes saving in USDC simple and rewarding:** save any amount, set goals, and earn live lending yield on Arc, without ever giving up control of your money.

---

## 2. Core user and use case

**Core user:** someone who holds USDC (or wants dollar savings) and wants it to grow, but isn't a DeFi expert. They know how to use a wallet; they don't want to compare vault addresses.

**Core use case:**
> "I have 200 USDC. I want to put some aside I can reach any time, and save toward a 1,000 USDC goal by December, with both earning while I wait."

**What they need from Pamo:**
1. Save in a few taps, with no jargon.
2. See what they saved, what they earned, and how close they are to a goal.
3. Understand the risk and rate before committing.
4. Get their money back when the rules say they can, with nobody else able to move it.

---

## 3. Key concepts

| Term | Meaning |
|---|---|
| **Pot** | One savings bucket owned by one user. Every Anytime Vault and Goal Vault is a pot. |
| **Anytime Vault** | A pot with no lock: add or withdraw whenever. |
| **Goal Vault** | A pot with a target amount and an unlock date. Locked until either is reached. |
| **Tier** | Calm, Steady or Bold. Decides which lending vault a pot's money goes into. |
| **Lending vault** | A Morpho vault on Arc (ERC-4626) that lends USDC to borrowers and earns interest. Run by a curator firm, not by Pamo. |
| **Shares** | What a pot holds in a lending vault. The share count stays fixed; each share's value grows as interest comes in. |
| **APY** | The vault's yearly rate **today**, after vault fees. Live, changes daily. |
| **Principal** | USDC the user put in minus USDC they took out. "Earned" = value − principal. |

---

## 4. App flow

### 4.1 Site map

```
/                    Landing
/calculator          Growth Calculator      (no wallet needed)
/portfolios          Pamo Portfolios        (no wallet needed)
/app                 Dashboard              (wallet required)
/app/new             New pot flow
/app/pot/[id]        Pot detail
```

### 4.2 First-time user

```
Landing
  │  "Start saving"
  ▼
Connect wallet ──► wrong network? ──► "Switch to Arc" (one click)
  │
  ▼
Dashboard (empty) ──► "Nothing saved yet. Start with any amount."
  │  "New Anytime Vault" or "New Goal"
  ▼
New pot flow
  1. Choose type ........ Anytime | Goal
  2. Goal only .......... name, target, unlock date
  3. Choose tier ........ Calm | Steady | Bold  (live APY + risk note each)
  4. Amount ............. shows wallet USDC balance
  5. Review screen ...... shares, APY, fees, network fee, 1-year estimate, warnings
  6. Allow USDC ......... wallet signature 1 of 2
  7. Save ............... wallet signature 2 of 2
  ▼
Success ──► Dashboard shows the new pot with its value
```

### 4.3 Returning user

```
Connect ──► Dashboard
              ├─ Total saved · Earned so far · live APY per tier
              ├─ Pot cards (value, earned, tier, Goal progress)
              └─ tap a pot ──► Pot detail
                                 ├─ Add money ──► Review ──► (Allow) ──► Save
                                 ├─ Withdraw ───► Review ──► Withdraw
                                 └─ Activity (deposits and withdrawals)
```

### 4.4 Goal lifecycle

```
Goal opened (target 1,000 USDC, unlock Dec 31)
   │ user adds money over time; progress bar fills
   ▼
LOCKED ── withdraw button disabled:
          "Unlocks when you reach 1,000 USDC or on Dec 31"
   │
   ├─ value ≥ target ─────┐
   └─ date reached ───────┤
                          ▼
                     UNLOCKED ── withdraw part or all, any time
```

### 4.5 Visitor without a wallet

```
Landing ──► Growth Calculator ──► play with amount, monthly, months, tier
        └─► Portfolios ──► compare Calm / Steady / Bold live
                 └─ "Start saving" ──► Connect wallet ──► first-time flow
```

### 4.6 Failure paths

| Situation | What the user sees |
|---|---|
| Wallet on the wrong network | Banner: "Pamo runs on Arc." + **Switch to Arc** |
| Not enough USDC | Amount field error with the balance shown + how to get USDC on Arc |
| User rejects in wallet | "Cancelled. Nothing was moved." Back to review. |
| Vault short on cash | Review screen warns first; if the amount exceeds what's available: "The vault is short on cash right now. Try a smaller amount or try again later." |
| Goal still locked | Withdraw disabled, with the unlock condition shown |
| Transaction failed onchain | "That didn't go through. Your funds are safe." + explorer link |
| Earn Kit API down | Rates show "unavailable right now"; saving and withdrawing still work (they don't depend on it) |

---

## 5. Features in scope (MVP)

Each feature lists what it does, its rules and its **acceptance criteria**: how we know it works.

### F1. Wallet connection and network

- Connect with an injected wallet (MetaMask or similar).
- Detect the network; offer one-click switch or add for Arc mainnet.
- Show the address (shortened) and USDC balance via the ERC-20 interface (6 decimals).

**Accept when:** a fresh wallet connects, switches to Arc, and sees the right USDC balance.

### F2. Anytime Vault

- Open with a tier and a first deposit.
- Add money any time; withdraw part or all any time.
- Withdrawals go only to the pot owner.

**Accept when:** save 1 USDC → value shows ≈ 1 USDC → withdraw all → the wallet gets ≈ 1 USDC back (±1 micro-USDC rounding), on mainnet.

### F3. Goal Vault

- Open with a name, target (USDC), unlock date, tier and first deposit.
- Add money any time.
- Withdraw only when **value ≥ target** OR **now ≥ unlock date**.
- No early break in v1.

**Accept when:** withdrawing a locked goal is refused (in the UI and in the contract); a goal with a small target unlocks as soon as the target is reached.

### F4. Pamo Portfolios (Calm / Steady / Bold)

- Each tier maps to one approved lending vault, set by the admin.
- The tier is chosen when a pot opens; the pot keeps that vault for life.
- A portfolios page compares the tiers: live APY, curator, available liquidity, plain-English risk.
- Described as **USDC lending vaults**, never stocks or funds.

**Accept when:** three tiers show live data from three real Arc mainnet vaults; a pot opened in each tier deposits into the right vault (visible on the explorer).

### F5. Growth Calculator

- Works without a wallet.
- Inputs: starting amount, monthly top-up, months, tier.
- Uses the tier's live APY after fees. Monthly rate `r = (1 + APY)^(1/12) − 1`.
- Shows the projected balance, total put in, estimated interest, and a curve chart.
- Labelled "Estimate at today's rate. Not a promise."

**Accept when:** the numbers match a spreadsheet check; the rate shown matches the Portfolios page.

### F6. Review screens

- Shown before every save and withdrawal, before the wallet opens.
- Save: amount, tier + vault, APY today, vault fees, shares received, network fee, 1-year estimate, warnings.
- Withdraw: amount, shares redeemed, withdrawal fee, available now, left in pot, warnings.
- Data: onchain previews (exact shares and value), Earn Kit quotes (fees, liquidity warnings), gas estimate on Pamo's own calls.
- First save: two clear steps, **Allow** then **Save**.

**Accept when:** every save and withdraw path passes through review, and the shown amount matches what the wallet actually receives or sends.

### F7. Dashboard

- Total saved, earned so far, live APY per tier.
- Pot cards: name, type, tier, value, earned; Goal cards add a progress bar and the unlock date.
- Empty state for new users.

**Accept when:** the totals equal the sum of pot values read from the contract.

### F8. Pot detail and activity

- Value, principal, earned, tier, vault name with an explorer link.
- Add money and Withdraw actions.
- Activity list from contract events (deposit and withdraw, with amount, date and transaction link).

**Accept when:** every transaction made in the demo appears in the activity list.

### F9. Landing page

- Hero, tagline, three feature cards, calculator teaser.
- Footer: "Live on Arc mainnet", the contract address (explorer link), the GitHub repo.

**Accept when:** a judge can understand Pamo and reach the live contract in under 30 seconds.

### F10. Admin (contract owner only)

- Set the approved vault per tier (`asset()` must be USDC). Affects **new** pots only.
- Pause **new deposits** in an emergency.
- Admin **cannot** withdraw, move or freeze user funds; withdrawals work even when paused.

**Accept when:** tests prove the admin can't touch user funds and that pause doesn't block withdrawals.

---

## 6. Out of scope for v1 (roadmap)

These go in the pitch as "what's next".

| Feature | What it would do | Why not now |
|---|---|---|
| **Pamo AI** | Risk quiz → tier suggestion; plain-English goal → savings plan; the AI suggests, the user signs, and the AI never holds keys | Core saving must be solid first |
| **Pamo Business** | Team treasury with roles, approvals and a cash reserve | Needs a multi-user permissions design |
| **Pamo Halal** | Sharia-compliant savings: no interest, profit-sharing returns from certified halal sources | v1 yield comes from interest-based lending, which isn't sharia-compliant; needs a compliant yield source and review by a sharia advisory board |
| **Auto-save** | Recurring monthly deposits | Needs a scheduler (keeper) to trigger the deposits |
| **Blended portfolios** | Each tier spread across several vaults with rebalancing | Rebalancing logic is risky to rush |
| **Break a goal early** | Withdraw a locked goal with a confirmation step | Product decision pending |
| **Crosschain deposits** | Save from other chains straight into Pamo | Supported by the Earn Kit, but adds bridge fees and flows |
| **Fiat onramp** | Buy USDC inside Pamo | The Onramp kit covers only some regions |
| **EURC savings** | Save in euros | USDC first |
| **Gasless saving** | Pamo pays the user's gas | Needs a paymaster |
| **Notifications** | "Goal reached", "rate changed" | Needs a backend |
| **Multichain** | Run Pamo on more blockchains beyond Arc | Arc first, to get one chain right |
| **Mobile app** | Native iOS and Android apps with all of Pamo's features | Web app first; v1 already works in phone browsers |

### Easier onboarding for people new to crypto

Also roadmap. These make Pamo feel like a normal app for people who have never used a crypto wallet. Gasless saving and the fiat onramp above belong to the same goal.

| Feature | What it would do | Why not now |
|---|---|---|
| **Passkey sign-in** | Sign up with Face ID or a fingerprint. No wallet app, no seed phrase | Needs a smart-wallet provider (e.g. Circle Modular Wallets, ERC-4337) confirmed on Arc mainnet |
| **Email or social login** | Sign in with email, Google or a one-time code, like any normal app | Needs an embedded-wallet provider (e.g. Circle user-controlled wallets) |
| **One-tap saving** | One confirmation instead of two ("Allow", then "Save") | Needs a smart wallet to batch the two steps |
| **Account recovery** | Lost phone? Get the account back without a seed phrase | Comes with passkey or email sign-in |
| **Cash out to bank** | Turn savings back into money in a bank account | Needs an offramp provider and differs by region |
| **Your own currency** | See balances as "≈ €110" next to USDC, so the numbers feel real (savings stay in USDC) | Needs a reliable price feed |
| **Guided first save** | A short walkthrough: what a pot is, what a tier means, then a first small deposit | Core flow first (just UI work, so it could move into v1 if time allows) |
| **In-app help** | Tap any term ("APY", "vault") for a one-line plain explanation | Core flow first (just UI work, so it could move into v1 if time allows) |

---

## 7. Product rules (non-negotiable)

1. **Non-custodial.** Only the pot owner can withdraw. No admin path to user funds.
2. **Honest numbers.** Show live APY, even 0%. The calculator is always labelled an estimate. No made-up rates.
3. **No surprises.** Every money movement goes through a review screen with warnings shown first.
4. **Plain language.** "Lending vault", "earned", "unlocks on", never DeFi jargon without explanation.
5. **USDC done right.** ERC-20 interface only, 6 decimals; never mix in native 18-decimal values.
6. **Brand.** Plain "Pamo" everywhere; the tone marks appear only in the logo. Never name other savings apps or their features.

---

## 8. Success criteria (demo day)

"It works" means all of these are true:

- [ ] `PamoSavings` is **deployed and verified on Arc mainnet**; the repo is public.
- [ ] A **fresh wallet** can connect → open an Anytime Vault → save 1 USDC → see its value → withdraw, all on mainnet, in **under 2 minutes**.
- [ ] A **Goal Vault** refuses an early withdrawal and unlocks when its target is reached.
- [ ] **Portfolios** show live APY for three real vaults; each tier deposits into its own vault.
- [ ] The **Growth Calculator** works without a wallet and matches a spreadsheet check.
- [ ] **Every** save and withdrawal shows a review screen whose numbers match the result.
- [ ] Fork tests pass, including: admin can't move funds, and pause doesn't block withdrawals.
- [ ] The web app is live at a public URL, works at phone width, and has no console errors on the main flow.
- [ ] A 2–3 minute demo video and a README with the live links, contract address and architecture.

---

## 9. Open decisions

| Decision | Recommendation | Status |
|---|---|---|
| Tier → vault mapping | One vault per tier, honest live rate | Recommended, not confirmed |
| The three vaults | Re-check before deploy (Oct 1 snapshot: Calm = Gauntlet USDC Prime, Steady = Keyrock Prime USDC, Bold = Bitwise Premium RWA USDC) | Open |
| Early goal break | Not in v1 | Open |
| Logo tone marks | Pamọ́, plain black text on white, no background block | ✅ Confirmed |
