# Pamo: Build Guide

Pamo is a save-and-earn app on Arc. Your USDC savings earn while they sit.

This guide takes v1 from an empty folder to a submitted entry, in order. It is a solo build. The rule throughout is **function first, polish after**: an ugly flow that works end to end on mainnet beats a beautiful one that doesn't. Motion and design come once the money flow works.

- **Deadline:** Arc Microgrants submissions close **Tue Oct 14, 23:59 ET**. Aim to submit by **Oct 14, 12:00 ET**.
- **Hard requirements:** a live **Arc mainnet** deployment and a **public repo**. Testnet-only entries, mockups and slide decks are rejected.
- **Build order:** **testnet first, then mainnet.** Everything is built and proven on Arc testnet with faucet USDC. The mainnet deploy comes once the testnet build works (§8, Phase 6). Until then there is nothing to submit.
- **Companion docs:** [Specification.md](Specification.md) (what we build) · [Architecture.md](Architecture.md) (how it fits together: stack, data flow, app flow, risks) · [Brand_Design.md](Brand_Design.md) (colours, logo, type, tokens). Section numbers like "Arch §5.3" point into Architecture.md.
- **Design files:** `Brand Kit & Design/` holds the brand kit, the design system (components and tokens), the logo exports and the mockups. The file to build from is `Pamo design system-handoff/pamo-brand-kit-and-design-system/project/Pamo Design System (Standalone).dc.html`.

---

## 1. What v1 is

| Feature | What the user does | Where it lives |
|---|---|---|
| **Anytime Vault** | Save USDC and take it out whenever they want | Contract |
| **Goal Vault** | Save toward a target with an unlock date | Contract |
| **Pamo Portfolios** | Pick Calm, Steady or Bold, which decides where savings earn | Contract (tier → vault) + UI |
| **Growth Calculator** | See what savings could grow to at today's live rate | Web app + Express (Earn Kit rates) |
| **Review screens** | See exactly what happens before signing | Web app + Express (quotes) + chain previews |
| **Dashboard, pot detail, activity** | See saved, earned, goal progress, history | Web app + chain + Supabase (indexed events) |

**Roadmap (not v1):** see [Specification.md](Specification.md) §6 and Arch §1.2.

---

## 2. Architecture in one picture

Full detail lives in Architecture.md. The short version:

```
 Browser (Next.js + Tailwind + Motion + GSAP + anime.js + Iconsax)
    │                         │
    │ wagmi/viem              │ REST
    ▼                         ▼
 Arc mainnet             Express (Node.js) ──► Circle Earn Kit (rates, fees, quotes)
 PamoSavings.sol              │
    │ ERC-4626                └──► Supabase (activity, pot names, rate history)
    ▼                              ▲
 Morpho Vault V2 × 3               │ indexer reads PamoSavings events
 (Calm · Steady · Bold)  ──────────┘
```

**The one rule:** the chain is the source of truth. Express and Supabase cache and enrich. If they're down, users can still save and withdraw.

### How Pamo uses the Earn Kit

| Earn Kit part | In Pamo? | How |
|---|---|---|
| `exploreVaults` | ✅ Yes | Express `/api/vaults`: live APY, fees and liquidity for Portfolios, Calculator and Review |
| `getDepositQuote` / `getWithdrawalQuote` | ✅ Yes | Express `/api/quotes/*` for the review screens |
| `deposit` / `withdraw` / `getPosition` | ❌ Not directly | Pamo's contract holds the shares and enforces the rules, so it calls the vault itself (ERC-4626) |

The Earn Kit is Pamo's **window** onto the vaults. The contract is the **hands** that move the money.

### Arc values

| Thing | Value |
|---|---|
| Mainnet | chain ID `5042`, RPC `https://rpc.mainnet.arc.io`, explorer `https://explorer.arc.io` |
| Testnet | chain ID `5042002`, RPC `https://rpc.testnet.arc.io`, explorer `https://explorer.testnet.arc.io` |
| USDC (both networks) | `0x3600000000000000000000000000000000000000`, **6 decimals** via ERC-20 |
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| Testnet faucet | `https://faucet.circle.com` |
| **PamoSavings on testnet** | `0x9952E937378bb093DFA010e94FC81D56EC4cBF17`, verified, deployed at block `66067781` |
| Testnet vault: EarnKit USDC Vault | `0xaabbef1d3971c710276ed41ec791bbe14cdb8e88`, shares have 18 decimals |
| Testnet vault: MockMorphoVault | `0x8f2d33b5d4b9b5f02df635ae308f7b4c9da8d2dc`, shares have **6** decimals |
| Gas | paid in USDC; set `maxFeePerGas` ≥ 20 Gwei or the transaction is silently dropped |

---

## 3. Repo layout and stack

```
Pamo/
├── contracts/                  Foundry project (arc-forge), set up
│   ├── src/PamoSavings.sol
│   ├── test/PamoSavings.t.sol  fork tests against Arc mainnet vaults
│   ├── test/ForkSmoke.t.sol    Arc and vault assumptions, already passing
│   ├── script/Deploy.s.sol
│   ├── foundry.toml            Solidity 0.8.30, both Arc RPCs, `deep` fuzz profile
│   └── lib/                    forge-std and OpenZeppelin (git submodules)
├── server/                     Node.js + Express + TypeScript
│   └── src/  index.ts · config.ts · routes/ (vaults, quotes, activity) · earn.ts · indexer.ts · supabase.ts · chain.ts
├── web/                        Next.js + TypeScript + Tailwind
│   ├── app/                    /  /calculator  /portfolios  /app  /app/new  /app/pot/[id]
│   ├── components/             PotCard, ReviewSheet, TierCard, Stepper, Calculator, Icon, …
│   ├── lib/                    chain.ts · contract.ts · api.ts · format.ts · growth.ts
│   └── motion/                 tokens.ts · variants.ts (Motion) · landing.ts (GSAP) · countUp.ts (anime.js)
├── supabase/schema.sql         tables from Arch §5.3
├── Brand Kit & Design/         brand kit, design system handoff, logos, mockups
├── Docs/
└── README.md
```

| Layer | Choice |
|---|---|
| Contracts | Solidity + **Arc Foundry** (`arc-forge`, `arc-cast`, `arc-anvil`) + OpenZeppelin |
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Motion | **Motion** ([motion.dev](https://motion.dev), npm `motion`) (UI) · **GSAP + ScrollTrigger** (landing) · **anime.js** (npm `animejs`) (number count-ups, logo tone marks) |
| Icons | **Iconsax** (npm `iconsax-react`) |
| Wallet + chain | wagmi + viem + TanStack Query, Arc as a custom chain |
| Charts / validation | Recharts · zod |
| Backend | Node.js + Express + TypeScript, viem for the indexer |
| Yield data | `@circle-fin/earn-kit` on Express only (the API key is rejected in browsers) |
| Database | Supabase (Postgres), server access only |
| Hosting | Vercel (web) · Railway or Render (Express + indexer) · GitHub (public repo) |

---

## 4. The contract: `PamoSavings.sol`

Written and tested: `contracts/src/PamoSavings.sol`. Full pseudocode for every function is in **Arch §4.2**. Summary:

```solidity
enum Kind { Anytime, Goal }
enum Tier { Calm, Steady, Bold }

struct Pot {
    address owner;
    Kind    kind;
    Tier    tier;
    bool    unlocked;   // Goal only: set once the goal first unlocks, never cleared
    uint64  unlockAt;   // Goal only, unix seconds
    address vault;      // fixed when the pot opens
    uint256 shares;     // vault shares held for this pot (the vault's own decimals)
    uint256 principal;  // USDC in minus USDC out (6 dp), for "earned"
    uint256 target;     // Goal only, USDC (6 dp)
}

IERC20 public constant USDC = IERC20(0x3600000000000000000000000000000000000000);
mapping(Tier => address)      public vaultFor;   // admin-set, approved vaults only
mapping(uint256 => Pot)       public pots;
mapping(address => uint256[]) public potsOf;
```

| Function | Who | What it does |
|---|---|---|
| `openPot(kind, tier, target, unlockAt, name, assets)` | user | Creates a pot using `vaultFor[tier]` and makes the first deposit in the same call, so a first save is two signatures (Allow, Save). Emits `PotOpened` (the name lives in the event, capped at 64 bytes; the indexer stores it) |
| `deposit(potId, assets)` | pot owner | `transferFrom` USDC in → `forceApprove` vault → `vault.deposit(assets, this)` → add shares and principal |
| `withdraw(potId, assets)` | pot owner | Anytime: always. Goal: only when unlocked. Redeems the shares that cover `assets` (`previewWithdraw`, then `vault.redeem(shares, owner, this)`) |
| `withdrawAll(potId)` | pot owner | Same rules; `vault.redeem(pot.shares, owner, this)` |
| `potValue` · `isUnlocked` · `getPot` · `getPots` | view | Live value, lock state, one pot, all pots for one owner in one read |
| `setTierVault(tier, vault)` | admin | Requires `asset() == USDC`; affects **new** pots only |
| `pause()` / `unpause()` | admin | Blocks `openPot` and `deposit` only, never withdrawals |

**Events:** `PotOpened`, `Deposited`, `Withdrawn`, `TierVaultSet` (the indexer depends on these; don't rename them after deploy). The first three carry the pot id and the owner as indexed fields.

**Goal unlock rule:** a goal unlocks on its date, or when its value or the money put in reaches the target. Money put in counts because depositing exactly the target is worth one micro-USDC less after the vault's rounding. Once unlocked it stays unlocked, even if a partial withdrawal takes it back under the target.

**Arc rules the contract obeys:** Arch §4.3 (ERC-20 USDC only, shares in the vault's own decimals, ignore `max*`, liquidity reverts, blocklist reverts, repeatable timestamps, 20 Gwei floor).

### Tests (fork Arc mainnet, real Morpho vaults)

Run with `arc-forge test --network arc`. Plain Foundry cannot move USDC on an Arc fork, so these tests fail under it. `test/ForkSmoke.t.sol` already proves the basics: a contract can deposit 1 USDC into five real mainnet vaults and get 0.999999 USDC back.

- Deposit, withdraw part, withdraw all: user ends with ≈ deposit (±1 micro-USDC rounding).
- Goal pot: refused before unlock; allowed after the date **or** once the target is reached; stays unlocked after a partial withdrawal.
- Only the owner can touch a pot.
- `setTierVault` rejects a non-USDC vault; existing pots keep their old vault.
- Pause blocks deposits but **not** withdrawals; admin has no path to user funds.
- A vault that cannot pay reverts the whole withdrawal and leaves the pot unchanged. (The address `0x7099…79C8` is not blocklisted on a mainnet fork, so the blocklist case is tested as a reverting vault.)
- Decimals: deposit `1_000000` (1 USDC); value comes back ≈ `1_000000`. Never assume share decimals: mainnet vaults use 18, one testnet mock uses 6.
- Events carry the fields the indexer needs (Arch §5.3).
- **Fuzz tests** on deposit and withdraw amounts (all the share and pro-rata principal maths).
- The full flow on the two testnet vaults, including the 6-decimal-share one (`test/PamoSavings.testnet.t.sol`).
- **Invariant tests** (stateful contract, so ethskills `testing` requires them): for each vault, the sum of `pot.shares` equals PamoSavings' share balance in that vault; no pot's value can be withdrawn by anyone but its owner; `principal` never goes negative.

**Status (Oct 8):** 44 tests pass under `arc-forge test --network arc`, including the 10,000-run fuzz pass and the invariants.

### Before deploying (ethskills `security` checklist)

- [x] Run **Slither** (`slither . --filter-paths "lib|test|script"`) and fix any reentrancy, unchecked-return or unprotected-function findings. Result: no high or medium findings. Three accepted notes: state is written after `vault.deposit` (the share count comes from its return value; every state-changing function is `nonReentrant`), `getPots` calls the vault in a loop (view only), and unlock dates compare `block.timestamp` (day-scale).
- [x] Fuzz runs at 10,000 (`FOUNDRY_PROFILE=deep arc-forge test --network arc`).
- [ ] Approvals are **exact amounts only**, in the contract (`forceApprove(vault, assets)`, done and tested) and in the frontend (never `type(uint256).max`).
- [x] CEI order + `nonReentrant` on every function that calls the vault (withdrawals update state before calling the vault).
- [ ] **Admin key:** `pause` and `setTierVault` sit with one key. ethskills flags a single key as a censorship risk. Pause only blocks new deposits (withdrawals always work), which limits it; still, move ownership to a multisig (e.g. Safe, if deployed on Arc) or add a timelock on `setTierVault` when possible, and say so in the README.
- [ ] Source verified on the explorer right after deploy.

---

## 5. Backend: Express + Supabase + indexer

Endpoints, schema and indexer pseudocode: **Arch §5**.

| Piece | Build | Done when |
|---|---|---|
| `GET /api/health` | Returns `{ ok, indexedBlock, chainBlock }` | Responds on the hosted URL |
| `GET /api/vaults` | Earn Kit `exploreVaults` → keep the 3 tier vaults (read `vaultFor` from the contract) → cache 60 s | Returns live APY, fees, liquidity, status per tier |
| `POST /api/quotes/deposit` · `/withdraw` | Earn Kit quotes (see risk #4) | Review screens show fees and liquidity warnings |
| `GET /api/owners/:addr/activity` · `GET /api/pots/:id` | Read from Supabase | Pot detail shows names and history |
| Indexer | Every 5 s: `getLogs` on PamoSavings → upsert `pots` / insert `activity`; every 10 min: `vault_snapshots` | New deposits appear in history within seconds |
| Supabase | Run `supabase/schema.sql`; RLS on, no public policies; service key on Express only | Tables exist; anon key can read nothing |
| Safety | zod on every input, IP rate limit, CORS to the Vercel domain only | Bad input returns 400, not a crash |

**Fallback:** if the backend isn't ready, the frontend reads `getPots` / `potValue` straight from the chain and shows "Anytime Vault #12" instead of the pot name.

---

## 6. Interface design

### Brand

- **Name:** plain **Pamo** everywhere. Only the logo carries the tone marks: **Pamọ́**, in plain black text on white with no background block.
- **Tagline:** *Keep it safe.* The Yoruba origin (*fi pamọ́*, "keep it safe") is a one-line backstory on the landing page.
- **Feel:** calm, trustworthy, plain-spoken. Money apps earn trust by being boring in the right places.
- **Colours:** three brand colours, white first. Full rules, helpers and tokens are in [Brand_Design.md](Brand_Design.md).

  | Colour | Hex | Used for |
  |---|---|---|
  | **White** | `#FFFFFF` | Page and card backgrounds (most of every screen) |
  | **Black** | `#0A0A0A` | Text, numbers, the logo, dark sections |
  | **Pamo green** | `#0B7A4B` | Buttons, links, progress, earned amounts |
  | Bright green (helper) | `#3DDC84` | Green text and marks on black only |
  | Mint (helper) | `#E6F4EC` | Soft fills behind green text |

- **Green is rare:** one green button per screen, and green text only for links and earned amounts.
- **Tiers:** Calm, Steady and Bold are not separate colours. Each shows its name plus a level mark with 1, 2 or 3 bars filled in Pamo green.
- **Status:** errors and cautions have their own colours, used only for that (Brand_Design.md §2).
- **Tokens:** every colour is defined once as a Tailwind theme token (Brand_Design.md §8). No screen writes a hex value directly.
- **Type:** **Be Vietnam Pro** for everything, the design system's typeface (regular, semibold, bold); tabular figures for every amount.
- **Components:** the design system draws every component and its states, but not whole screens. The screens below are composed from those components.

### Copy rules

- Amounts always show **USDC**, e.g. "120.50 USDC".
- Rates are **live and labelled**: "4.48% APY today, changes daily". Never a promised number.
- The calculator says **estimate**, never "you will earn".
- Portfolios are **USDC lending vaults**: never stocks or funds.
- Plain words for wallet steps: "**Allow** Pamo to use your USDC", not "Approve".
- Never name other savings apps or their features anywhere in the product.

### Screens

**1. Landing** (`/`)
- Hero: the **Pamọ́** logo, "Keep it safe. Your USDC savings earn while they sit." → **Start saving**.
- "How it works" strip: wallet → Pamo → lending vault → interest back.
- Three cards: Anytime, Goal, Portfolios. Calculator teaser with live rates.
- Footer: "Live on Arc mainnet", contract address linked to the explorer, GitHub link.

**2. Dashboard** (`/app`)
- Top: **Total saved** (big), **Earned so far** (green), live APY per tier.
- Pot cards: name, kind badge, tier chip, value, earned. Goal pots add a progress bar and "unlocks Oct 30".
- Buttons: **New Anytime Vault**, **New Goal**. Empty state: "Nothing saved yet. Start with any amount."

**3. New pot flow** (`/app/new`, a stepper; state machine in Arch §8.2)
1. Choose Anytime or Goal. 2. Goal only: name, target, unlock date. 3. Pick a tier (live APY, risk, liquidity). 4. Amount. 5. Review. 6. **Allow** → **Save**.

**4. Pot detail** (`/app/pot/[id]`)
- Value, principal, earned, tier, vault name with explorer link.
- **Add money** / **Withdraw**; Goal pots show the lock reason ("Unlocks when you reach 500 USDC or on Oct 30").
- Activity list from Supabase.

**5. Portfolios** (`/portfolios`): Calm / Steady / Bold side by side with live APY, curator, available cash, plain-English risk, and a small rate-history line.

**6. Growth Calculator** (`/calculator`), no wallet needed
- Inputs: starting amount, monthly top-up, months (slider), tier.
- Output: projected balance, total put in, estimated interest, curve chart.
- Formula: `r = (1 + apy)^(1/12) − 1`, then `balance = (balance + monthly) × (1 + r)` per month (Arch §7.6).
- Caption: "Estimate at today's rate. Not a promise."

### Review screens

Every save and withdrawal shows a review **before** the wallet opens (flows in Arch §7.2 and §7.3).

| Shown to user | Source |
|---|---|
| Shares received / redeemed, value | Chain: `vault.previewDeposit` / `previewRedeem` |
| Share price, APY today, vault fees | Express `/api/vaults` or `/api/quotes/*` |
| Withdrawal fee, max withdrawable, liquidity warnings | Express `/api/quotes/withdraw` |
| Network fee in USDC | viem `estimateGas` on Pamo's own calls |
| 1-year estimate | Calculator formula at today's APY |

```
Review your saving
────────────────────────────────────────
You save            50.00 USDC
Into                Steady · Keyrock Prime USDC
APY today           0.62%   (changes daily)
Vault fees          performance 0% · management 0%
You receive         49.97 shares  (1 share = 1.0006 USDC)
Network fee         ~0.002 USDC
In 1 year (est.)    ~50.31 USDC   (estimate, not a promise)
────────────────────────────────────────
⚠ This vault is low on available cash. Withdrawals may have to wait.
────────────────────────────────────────
Step 1 of 2  [ Allow USDC ]   →   Step 2 of 2  [ Save ]
```

```
Review your withdrawal
────────────────────────────────────────
You withdraw        20.00 USDC
Shares redeemed     19.99
Withdrawal fee      0.00 USDC
Available now       up to 3,110,527 USDC in this vault
Left in this pot    30.31 USDC
────────────────────────────────────────
[ Withdraw ]
```

- First save: deposit gas may be unknown until "Allow" is done → show "available after allowing", never an error.
- Warnings appear **before** the button. If the amount exceeds what the vault can pay now, disable the button and say why.
- Refresh quotes when the amount changes and right before signing.
- Every onchain button has its **own** loading and disabled state (no shared `isLoading`), and only one step button is active at a time: Switch to Arc → Allow → Save (ethskills `frontend-ux`).
- With raw wagmi, a write resolves when the transaction is **sent**, not confirmed. Always wait for the receipt (`waitForTransactionReceipt`) before showing success or enabling the next step.

### States to design for

- Wrong network → "Pamo runs on Arc" + **Switch to Arc**.
- Not enough USDC → show the balance and how to get USDC on Arc.
- Pending transaction → button spinner + explorer link (Arc finalises in under a second).
- Vault short on cash → "The vault is short on cash right now. Try a smaller amount or try again later."
- Goal locked → withdraw disabled with the reason shown.
- Backend down → small banner "Live rates unavailable"; saving and withdrawing still work.
- Wallet rejected → "Cancelled. Nothing was moved."

---

## 7. Motion design

Motion in a money app should feel **calm and certain**, never flashy. It explains what just happened (money moved, a step changed) and makes numbers feel alive. It never delays the user.

### 7.1 One job per library

| Library | Its only job | Loaded where |
|---|---|---|
| **Motion** ([motion.dev](https://motion.dev)) | Everything inside the app UI: page transitions, stepper, review sheet, cards, progress bars, buttons, success state, icon transitions | App-wide, imported from `motion/react` |
| **GSAP + ScrollTrigger** | Landing page only: hero timeline and scroll storytelling | Dynamic import on `/` only, so it never weighs on `/app` |
| **anime.js** | Number count-ups (total saved, earned, calculator result) and the logo tone-mark animation | Small helper in `web/motion/countUp.ts` |

Never animate one element with two libraries. If phones struggle (risk #10), drop anime.js first: Motion can do the count-ups.

Motion is the library that used to be called Framer Motion. Install the `motion` package and import from `motion/react`, not the old `framer-motion` package.

### 7.2 Motion tokens (`web/motion/tokens.ts`)

| Token | Value | Used for |
|---|---|---|
| `fast` | 150 ms | Hover, press, chip selection |
| `base` | 250 ms | Page transitions, stepper steps, sheet open |
| `slow` | 600 ms | Progress bars, count-ups |
| `hero` | up to 1.2 s total | Landing hero timeline only |
| `ease` | `[0.22, 1, 0.36, 1]` (ease-out) | Default for everything |
| `spring` | stiffness 260, damping 30 | Sheets, cards, layout changes |
| `stagger` | 60 ms | Lists of cards |

### 7.3 Motion catalogue

| Where | Element | Library | What happens |
|---|---|---|---|
| Landing | Logo | anime.js | "Pamo" fades in, then the tone marks (the accent and the dot) settle into place |
| Landing | Hero text + button | GSAP | Headline lines rise and fade in one after another; button appears last |
| Landing | How it works | GSAP ScrollTrigger | As you scroll, a USDC dot travels wallet → Pamo → vault → back with interest |
| Landing | Feature cards | GSAP ScrollTrigger | Cards rise in with a short stagger |
| Landing | Calculator teaser | anime.js | Example balance counts up when it scrolls into view |
| All pages | Route change | Motion (`AnimatePresence`) | Fade + 8 px rise, `base` |
| Dashboard | Total saved, earned | anime.js | Count up from 0 on first load; from old to new value after a transaction |
| Dashboard | Pot cards | Motion | Stagger in on load; gentle lift on hover; new pot slides in highlighted |
| Dashboard / pot | Goal progress bar | Motion | Width springs to the new percentage, `slow` |
| Dashboard / portfolios | Live APY dot | Motion | Slow, subtle pulse to show the rate is live |
| New pot | Stepper | Motion | Steps slide left / right by direction; progress dots fill |
| New pot | Tier cards | Motion (`layoutId`) | The selection outline glides from card to card |
| Review | Review sheet | Motion | Slides up as a bottom sheet on phones, fades in as a modal on desktop, `spring` |
| Review | Warnings | Motion | Fade in above the button before it becomes active |
| Review | Allow → Save | Motion | Step 1 ticks off, step 2 becomes active |
| Any button | Pending transaction | Motion | Label swaps to a small spinner; width doesn't jump |
| Success | Confirmation | Motion | A check mark draws itself (SVG path), then the new balance counts up (anime.js) |
| Calculator | Result number | anime.js | Counts to the new value as inputs change (debounced) |
| Calculator | Curve | Recharts | Built-in line animation on first draw; instant updates after that |
| Errors | Error message | Motion | Short fade in with a small shake on the field, `fast` |
| Any screen | Icons that change state | Motion | Old icon fades out as the new one fades in (copy → tick, eye → eye-slash), `fast` |

### 7.4 Rules

- **Reduced motion is respected everywhere:** Motion `useReducedMotion`, GSAP `matchMedia("(prefers-reduced-motion: reduce)")`, and anime.js jumps straight to the final value. With reduced motion on, nothing moves except opacity.
- **Animate `transform` and `opacity` only** (no width/height/top/left), except the progress bar, which uses `scaleX`.
- **Never block input:** the user can click through any animation; count-ups never hide the real number from screen readers (put the final value in `aria-label`).

### 7.5 Icons

All icons come from **Iconsax** (`iconsax-react`), so the whole app shares one drawing style.

- **One wrapper:** `web/components/Icon.tsx` re-exports the icons Pamo uses and sets the defaults (size 20, `currentColor`). Screens import from the wrapper, never from `iconsax-react` directly.
- **Two variants only:** `Linear` by default, `Bold` for the selected or active state (current tab, chosen tier). Don't mix in the other Iconsax variants.
- **Icons don't animate themselves:** Iconsax ships static SVGs. When an icon needs to move, wrap it in a Motion element (§7.3) and follow the same tokens and reduced-motion rules.
- **Meaning never rests on an icon alone:** pair it with a text label, or give icon-only buttons an `aria-label`.
- **Money truth first:** an animated number always ends on the exact value read from the chain.
- **Budget:** landing hero under 1.2 s; in-app transitions at or under 250 ms.

---

## 8. Ordered task list

Re-dated on **Oct 8**: Phase 0 is done and the contract is next. Tasks are ordered so a real end-to-end flow exists early, **on testnet first**. The move to mainnet is in Phase 6, once every flow works on testnet. Each phase ends at a checkpoint you could fall back to. Risk numbers (#1 to #10) refer to **Arch §11**.

### Phase 0: Setup and de-risk (done Oct 8)

- [x] Get testnet USDC from the faucet (`https://faucet.circle.com`) onto the deployer wallet; send 0.01 USDC to yourself
- [x] **#3** Install Arc Foundry (`github.com/circlefin/arc-foundry/releases`) → `arc-forge --version` (v0.8.0-2)
- [x] **#2** With `arc-cast` on testnet: deposit 1 USDC into a mock vault from your wallet, then withdraw it. Repeat against a real vault in a mainnet fork test (free). Both returned 0.999999 USDC
- [x] Create the repo layout (§3), `git init`, public GitHub repo
- [x] Deployer wallet, key in `contracts/.env`, never committed
- [x] Find the testnet mock vaults (§2, Arc values). Proposed mapping: Calm and Bold → EarnKit USDC Vault, Steady → MockMorphoVault (Arch §9)
- [x] Re-run `exploreVaults({ chain: "Arc" })`; shortlist the mainnet Calm / Steady / Bold vaults (**#8**, results in §10). Final pick is re-checked before the mainnet deploy. The Earn Kit answers from a server without an API key
- [x] Create the Supabase project
- [x] Create the Railway or Render account (Render)

### Phase 1: Contract (Oct 8–9)

- [x] Settle the open contract decisions (§10), then write `PamoSavings.sol` (§4, Arch §4.2)
- [x] Fork tests against mainnet Morpho vaults (`arc-forge test --network arc`), all of §4's list. This is a local fork, so no real money
- [x] Deploy script with the three tier vaults, taking the network and vault addresses from env (`script/Deploy.s.sol`; dry run on testnet estimates about 0.12 USDC)
- [x] Verify a dummy contract on the testnet explorer (done: `0x9D34a71C39350Bf8AAc8bfA2ACfcfD525A995C14`, verified through Blockscout at `https://explorer.testnet.arc.io/api/`)

### Phase 2: Go live on testnet, ugly (Oct 9)

- [x] **Deploy to Arc testnet** and verify the source: [`0x9952E937378bb093DFA010e94FC81D56EC4cBF17`](https://explorer.testnet.arc.io/address/0x9952E937378bb093DFA010e94FC81D56EC4cBF17)
- [x] With `arc-cast`: open a pot, deposit 1 USDC, withdraw it (part, then all). A locked goal pot refused an early withdrawal
- [x] Express skeleton: `/api/health` + `/api/vaults` with the Earn Kit and 60 s cache (runs locally with `pnpm dev` in `server/`)
- [x] **#4** Test Earn Kit quotes from Express. Deposit quotes work from the server for a wallet that holds the amount. Withdrawal quotes do not work for Pamo, because the Earn Kit only sees positions opened through it (Arch §11; decision in §10)
- [x] **#9** Deploy Express to Render (`https://pamo-ttyk.onrender.com`); a cold request took 38.9 s on the free plan, warm ones under 1 s (Arch §11; decision in §10)
- [x] **#6** Measure Arc RPC `getLogs` range limits: at most 10,000 blocks per call on both networks, so the indexer reads 9,000 at a time (Arch §11)

> ✅ **Checkpoint 1: "Contract live on testnet."** A deposit and a withdrawal work on the testnet explorer, and `/api/vaults` returns rates. Not a valid submission yet: that needs the mainnet deploy in Phase 6.

### Phase 3: Core flow in the browser (Oct 10)

- [x] Next.js + Tailwind + TypeScript app; Arc as a custom chain in wagmi/viem; connect wallet
- [ ] **#7** Test adding Arc in MetaMask on desktop and phone (desktop works; phone still to do, once the web app has a public URL)
- [x] `/app` guards: wallet, network, backend-down banner (Arch §8.3)
- [x] Dashboard reads `getPots(user)` and USDC `balanceOf`
- [x] Open an Anytime pot → Allow → Save → see the value
- [x] Withdraw part and withdraw all
- [x] Raw styling, **no animation yet**

> ✅ **Checkpoint 2: "Core flow working."** Connect → save → see balance → withdraw, on testnet, in the browser. **Deployed to mainnet, this is the fallback demo.**

### Phase 4: Backend data + the rest of v1 (Oct 10–11)

- [ ] Supabase: run `schema.sql`, RLS on, service key on Express
- [ ] Indexer: `pots`, `activity`, `indexer_state`; then `vault_snapshots` every 10 min
- [ ] Routes: `/api/quotes/*`, `/api/owners/:addr/activity`, `/api/pots/:id`, `/api/vaults/history`; zod + rate limit + CORS
- [ ] Goal pots: create flow, progress bar, lock rules in the UI
- [ ] New pot stepper (state machine from Arch §8.2)
- [ ] Review screens for save and withdraw (§6)
- [ ] Portfolios page with live tier data and rate history
- [ ] Growth Calculator with the Recharts curve
- [ ] Pot detail with activity from Supabase

> ✅ **Checkpoint 3: "All v1 features working."** Ugly but complete, backend included.

### Phase 5: Design system + motion (Oct 11–12)

- [ ] Tailwind theme tokens: copy the `@theme` block from Brand_Design.md §8 (colours, font, spacing, radii, shadow, type scale)
- [ ] Load Be Vietnam Pro (400, 600, 700) with `next/font`
- [ ] Logo: the exports in `Brand Kit & Design/Pamo Logos/` are PNG only. Make an SVG wordmark with outlined text for the web app's public folder
- [ ] Build the components from the design system file, then apply them to every screen: logo, tier chips, cards, sheet
- [ ] Install `motion`, `animejs`, `iconsax-react` in `web/`
- [ ] `web/motion/`: `tokens.ts`, Motion `variants.ts`, anime.js `countUp.ts`
- [ ] Motion: route transitions, stepper, tier `layoutId`, review sheet, pot cards, progress bars, button pending state, success check (§7.3)
- [ ] anime.js: total saved / earned count-ups, calculator result
- [ ] Iconsax: `web/components/Icon.tsx` wrapper, icons applied across screens (§7.5)
- [ ] Reduced-motion support in all three libraries (§7.4)
- [ ] All error and empty states (§6)

> ✅ **Checkpoint 4: "UI applied."**

### Phase 6: Landing + ship (Oct 12)

- [ ] Landing page (§6 screen 1)
- [ ] GSAP hero timeline + ScrollTrigger "how it works" and feature cards; anime.js logo tone marks (§7.3); GSAP loaded only on `/`
- [ ] **#10** Test motion on a mid-range phone; trim or drop anime.js if janky
- [ ] **Move to mainnet.** **#1** Get real USDC onto an Arc mainnet wallet (about 20–50 USDC); send 0.01 USDC to yourself
- [ ] Re-check liquidity and confirm the three mainnet tier vaults (**#8**)
- [ ] **#5** Find the mainnet verifier URL; **deploy `PamoSavings` to Arc mainnet** and verify the source
- [ ] With `arc-cast` on mainnet: open a pot, deposit 1 USDC, withdraw it
- [ ] Switch the env vars to mainnet (Arch §9): chain ID, RPC URL, contract address, Circle mainnet key
- [ ] Deploy web to Vercel (env vars from Arch §9), pointing at mainnet and the hosted Express
- [ ] Production Supabase + indexer running; `/api/health` shows the indexer caught up
- [ ] Phone-width check of every screen

### Phase 7: Story (Oct 13)

- [ ] README: what Pamo is, live URL, contract address + explorer link, architecture diagram (from Arch §2), how to run, roadmap
- [ ] Redraw `pamo-pseudocode.png` first (it shows an older design: tier per user, `apy / 12`), then add it to the README
- [ ] Record a 2–3 minute demo video: problem → save → goal → calculator → explorer proof
- [ ] Draft the DoraHacks submission; attach `Brand Kit & Design/Pamo_Spec_Arc.pdf`

> ✅ **Checkpoint 5: "Polish done."**

### Phase 8: Submit (Oct 14)

- [ ] Final run on mainnet with a fresh wallet; check every success criterion in Specification.md §8
- [ ] **Submit by 12:00 ET.** The rest of the day is buffer.

---

## 9. Daily fallback rule

At the end of each day, ask: *if I had to submit right now, what would I show?* If the answer is worse than yesterday's checkpoint, stop adding features and fix that first. Motion is the first thing to cut, never the money flow.

---

## 10. Open decisions

| Decision | Recommendation | Status |
|---|---|---|
| How tiers map to vaults | One vault per tier, showing the honest live rate | Recommended, not confirmed |
| Which three vaults | Oct 1 picks were Calm = Gauntlet USDC Prime, Steady = Keyrock Prime USDC, Bold = Bitwise Premium RWA USDC. Oct 8 check: Gauntlet has **0 USDC** available to withdraw, so it is a poor Calm; Steakhouse Prime USDC (`0xbeef0016…7298`, 1.69%, 139,354 USDC available) is the better candidate. Keyrock 1.69% with 138,648 available; Bitwise 4.37% with 41,967 available. Calm and Steady would show the same rate today. Re-check before the mainnet deploy | Open |
| Where review-screen quotes come from | Deposit: Earn Kit `getDepositQuote` when the wallet holds the amount, else the same fields from `/api/vaults`. Withdrawal: the Earn Kit cannot quote it (test #4), so Express builds it from the chain (`potValue`, `previewWithdraw`) and the vault's `liquidity` from `exploreVaults`; a direct ERC-4626 redeem carries no Circle withdrawal fee | Recommended, not confirmed |
| Early withdrawal from a Goal pot | Not in v1: the lock is the point | Open |
| Backend host | Render is live. Its free plan sleeps when idle (38.9 s cold start in test #9), which would also stop the indexer. A GitHub Actions job pings `/api/health` every 10 minutes to keep it awake (`.github/workflows/keep-awake.yml`). GitHub can run scheduled jobs late, so move to a paid instance if the server still sleeps; Railway was not timed | Chosen for the build, re-check before mainnet |
| Keep anime.js | Keep unless phone test #10 shows jank | Open |
| Logo tone-mark spelling | Pamọ́, plain black on white | ✅ Confirmed |
| Brand colours | White first, black, Pamo green `#0B7A4B` (Brand_Design.md) | ✅ Confirmed |
| Typeface | Be Vietnam Pro, from the design system | Chosen in the design system |
| Testnet tier mapping | Only two vaults exist: Calm and Bold → EarnKit USDC Vault, Steady → MockMorphoVault | Recommended, not confirmed |
| First save in two signatures | `openPot` takes the first deposit, so a first save is Allow, then Save | ✅ Confirmed, built |
| Goal re-locking | A stored "unlocked" flag: once a goal unlocks it stays unlocked | ✅ Confirmed, built |
| Owner in events | `Deposited` and `Withdrawn` carry the owner, indexed | ✅ Confirmed, built |
| Pot name length | Capped at 64 bytes. Names are public onchain | ✅ Confirmed, built |
| Target reached by money put in | A goal also unlocks when the money put in reaches the target, not only its current value, so depositing exactly the target unlocks it | Built, not confirmed |

---

## 11. Reading list (in order)

1. https://docs.arc.io/arc-chain · https://docs.arc.io/arc/concepts/stablecoin-native-model
2. https://docs.arc.io/arc/references/evm-differences · https://docs.arc.io/arc/tutorials/porting-contracts-to-arc · https://docs.arc.io/arc/references/gas-and-fees · https://docs.arc.io/arc/references/contract-addresses
3. https://docs.arc.io/arc/tutorials/install-arc-foundry · https://docs.arc.io/arc/tutorials/deploy-on-arc · https://docs.arc.io/arc/references/connect-to-arc
4. https://docs.arc.io/app-kit/earn · https://docs.arc.io/app-kit/quickstarts/earn-deposit · https://docs.arc.io/app-kit/concepts/earn-fees · https://docs.arc.io/app-kit/tutorials/earn/preview-operations
5. https://docs.arc.io/arc/tools/data-indexers (for the indexer)
6. Reference code: https://github.com/circlefin/arc-fintech
7. Full page index: https://docs.arc.io/llms.txt
