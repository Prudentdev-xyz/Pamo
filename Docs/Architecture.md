# Pamo: Architecture

How Pamo is put together: the stack, the system parts, how data moves, how the app moves, and the risky pieces to de-risk first.

| | |
|---|---|
| **Companion docs** | [Specification.md](Specification.md) (what we build) · [Build_Guide.md](Build_Guide.md) (in what order) |
| **Network** | Arc mainnet, chain ID `5042`, RPC `https://rpc.mainnet.arc.io` |
| **Build network** | Arc testnet first, chain ID `5042002`, RPC `https://rpc.testnet.arc.io`. Mainnet comes once the testnet build works (§9) |
| **Money** | USDC at `0x3600000000000000000000000000000000000000` (ERC-20 interface, 6 decimals) |

**The one rule behind everything:** the blockchain is the source of truth. Balances, pots and lock rules live in the contract. The backend and database only cache, index and enrich. If the backend goes down, users can still save and withdraw.

---

## 1. Stack

### 1.1 In build (v1)

| Layer | Tool | What it does in Pamo |
|---|---|---|
| **Language** | TypeScript | Everywhere outside Solidity: frontend and backend |
| **Frontend framework** | Next.js (App Router) | Pages, routing, server rendering for the landing page |
| **Styling** | Tailwind CSS | Design tokens (colours, type, spacing), responsive layout |
| **UI motion** | Motion ([motion.dev](https://motion.dev), npm `motion`) | Component transitions: modals, review sheet, pot cards, page changes, icon state changes |
| **Scroll / hero motion** | GSAP (+ ScrollTrigger) | Landing page hero and scroll storytelling only |
| **Micro-animation** | anime.js (npm `animejs`) | Number count-ups (balances, "earned"), small SVG touches, the logo tone marks |
| **Icons** | Iconsax (npm `iconsax-react`) | One icon set for the whole app: `Linear` by default, `Bold` for active states |
| **Wallet + chain** | wagmi + viem | Wallet connection, Arc as a custom chain, contract reads and writes, gas estimates |
| **Data fetching** | TanStack Query (comes with wagmi) | Caching and refreshing chain and API data |
| **Charts** | Recharts | Growth Calculator curve |
| **Validation** | zod | Validating API inputs and outputs on both sides |
| **Backend runtime** | Node.js | Runs the API and the indexer |
| **Backend framework** | Express | REST API: vaults, quotes, activity, health |
| **Yield data** | Circle Earn Kit (`@circle-fin/earn-kit`) | Vault discovery, live APY, fees, liquidity, quotes. Server-side only (the API key is rejected in browsers) |
| **Chain reads (backend)** | viem | Indexer reads contract events from the Arc RPC |
| **Database** | Supabase (Postgres) | Indexed activity, pot names, vault rate snapshots. A cache, never the source of truth |
| **Smart contracts** | Solidity | `PamoSavings.sol`: pots, deposits, withdrawals, goal locks, tier → vault map |
| **Contract tooling** | Arc Foundry (`arc-forge`, `arc-cast`, `arc-anvil`) | Build, test (fork Arc mainnet), deploy, verify |
| **Contract libraries** | OpenZeppelin | `SafeERC20`, `IERC4626`, `Ownable2Step`, `ReentrancyGuard`, `Pausable` |
| **Yield source** | Morpho Vault V2 on Arc (ERC-4626) | Where the USDC actually earns |
| **Frontend hosting** | Vercel | Next.js app |
| **Backend hosting** | Railway or Render (pick one on day 1) | Express API + indexer worker |
| **Repo** | GitHub (public) | Required by the Microgrants rules |

**Motion libraries, one job each.** Three animation libraries overlap a lot, and each adds weight on phones. Give each a single job (above) and never use two for the same element. If time gets tight, anime.js is the first to drop, since Motion can do count-ups too. Motion is the library formerly called Framer Motion: install `motion` and import from `motion/react`. Iconsax icons are static SVGs, so any icon movement is done by wrapping the icon in a Motion element.

### 1.2 Roadmap (after v1)

| Roadmap feature | Extra stack | Where it plugs in |
|---|---|---|
| **Pamo AI** | Claude API (Anthropic SDK) on the Express backend | New `/api/ai/*` routes. The AI returns a suggested plan; the user signs every transaction. No keys on the server |
| **Pamo Business** | New `PamoTreasury.sol` (roles, approvals, reserve) + Supabase tables for orgs and members | New contract beside `PamoSavings`; new `/business` pages |
| **Pamo Halal** | Separate contract + a sharia-compliant return source (not yet identified on Arc) + sharia board review | Fully separate from the lending vaults |
| **Auto-save** | Keeper (scheduled job on the backend, or an automation network if one exists on Arc) + a capped allowance | New contract function `autoDeposit(potId)` callable only within the user's limit |
| **Blended portfolios** | `PamoSavings` v2 with allocation weights + a rebalancer job | Tier maps to several vaults |
| **Break a goal early** | One new contract function with a confirmation step in the UI | `PamoSavings` v2 |
| **Crosschain deposits** | Earn Kit crosschain deposit / App Kit Bridge (CCTP) | Deposit flow gets a "from another chain" option |
| **Fiat onramp** | Circle Onramp Kit (App Kit) | Embedded widget; covers EU, UK, US today |
| **Cash out to bank** | An offramp provider (to be chosen) | Withdraw flow gets a "to my bank" option |
| **EURC savings** | Same contract pattern with EURC (`0xbEf5…21c1`) and EURC Earn vaults | Tier → vault map per asset |
| **Gasless saving** | ERC-4337 paymaster (Arc docs have a deploy guide) or Circle's paymaster | Wraps user transactions |
| **Passkey sign-in** | Circle Modular Wallets (ERC-4337 smart accounts) | A second wallet option next to "Connect wallet" |
| **Email or social login** | Circle user-controlled wallets | A third sign-in option |
| **One-tap saving** | Smart-account batching (allow + save in one call) | Comes with passkey or email wallets |
| **Account recovery** | Built into the passkey or email wallet | Comes with the wallets above |
| **Your own currency** | Oracle or FX feed (Pyth, Chainlink, RedStone and others are listed for Arc) | Display only; savings stay in USDC |
| **Notifications** | Supabase + an email or web-push service | Indexer triggers "goal reached", "rate changed" |
| **Guided first save / in-app help** | No new stack (UI only) | Could move into v1 if time allows |
| **Mobile app** | React Native (Expo) sharing the TypeScript logic | Talks to the same Express API and contract |
| **Multichain** (general version only, not in the Arc pitch) | Deploy `PamoSavings` on other EVM chains + chain switcher | Same contract, more networks |

---

## 2. System overview

```
                         ┌──────────────────────────────────────┐
                         │               USER                   │
                         │  browser (desktop or phone) + wallet │
                         └───────────────┬──────────────────────┘
                                         │ HTTPS
                                         ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND  ·  Next.js + TypeScript + Tailwind  ·  hosted on Vercel          │
│                                                                            │
│  Pages: /  /calculator  /portfolios  /app  /app/new  /app/pot/[id]         │
│  Motion: Motion (UI) · GSAP (landing) · anime.js (numbers)                 │
│  Icons: Iconsax                                                            │
│  wagmi + viem: wallet, reads, writes, gas estimates                        │
└──────────┬───────────────────────────────────────────┬─────────────────────┘
           │ REST (JSON)                               │ JSON-RPC (reads + signed txs)
           ▼                                           ▼
┌──────────────────────────────┐          ┌───────────────────────────────────┐
│ BACKEND · Node.js + Express  │          │ ARC MAINNET  (chain 5042)         │
│ hosted on Railway / Render   │          │                                   │
│                              │  RPC     │  ┌─────────────────────────────┐  │
│  /api/vaults   ───────────┐  │ ───────► │  │ PamoSavings.sol (ours)      │  │
│  /api/quotes/*            │  │ (events) │  │ pots · deposit · withdraw   │  │
│  /api/pots/:id/activity   │  │          │  │ goal locks · tier → vault   │  │
│  /api/health              │  │          │  └──────────────┬──────────────┘  │
│                           │  │          │                 │ ERC-4626        │
│  Indexer worker ──────────┼──┼────────► │                 ▼                 │
│  (polls PamoSavings logs) │  │          │  ┌─────────────────────────────┐  │
└───────────┬───────────────┼──┘          │  │ Morpho Vault V2 × 3         │  │
            │               │             │  │ Calm · Steady · Bold        │  │
            │ SQL           │ HTTPS       │  └──────────────┬──────────────┘  │
            ▼               ▼             │                 │ lends USDC      │
┌────────────────────┐ ┌──────────────┐   │                 ▼                 │
│ SUPABASE (Postgres)│ │ CIRCLE       │   │            Borrowers              │
│ activity · pots    │ │ EARN KIT API │   │                                   │
│ vault snapshots    │ │ vaults · APY │   │  USDC 0x3600…0000 (ERC-20, 6 dp)  │
│ indexer cursor     │ │ fees · quotes│   └───────────────────────────────────┘
└────────────────────┘ └──────────────┘
```

**Who talks to whom**

| From | To | Why | Trust |
|---|---|---|---|
| Frontend | Arc RPC | Read pots and values, send signed transactions | Source of truth |
| Frontend | Express | Vault data, quotes, activity history | Helpful cache; app degrades gracefully without it |
| Express | Earn Kit | Live APY, fees, liquidity, quotes | Third party; cache it, never block saving on it |
| Express | Arc RPC | Read contract events for the indexer | Source of truth |
| Express | Supabase | Store and read indexed data | Our cache |
| Wallet | Arc | Signs and sends transactions | Only the user holds keys |

---

## 3. Repo layout

```
Pamo/
├── contracts/                     Foundry project (arc-forge)
│   ├── src/PamoSavings.sol
│   ├── test/PamoSavings.t.sol     fork tests against Arc mainnet vaults
│   ├── test/ForkSmoke.t.sol       Arc and vault assumptions (passing)
│   ├── script/Deploy.s.sol
│   ├── foundry.toml
│   └── lib/                       forge-std, OpenZeppelin (git submodules)
├── server/                        Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts               Express app, routes, CORS, rate limit
│   │   ├── routes/vaults.ts       /api/vaults
│   │   ├── routes/quotes.ts       /api/quotes/deposit, /api/quotes/withdraw
│   │   ├── routes/activity.ts     /api/pots/:id/activity, /api/owners/:addr/activity
│   │   ├── earn.ts                Earn Kit client + 60 s cache
│   │   ├── indexer.ts             polls PamoSavings events → Supabase
│   │   ├── supabase.ts            server-side Supabase client (service key)
│   │   └── chain.ts               viem public client for Arc, ABI, address
│   └── .env                       never committed
├── web/                           Next.js + TypeScript + Tailwind
│   ├── app/                       routes (see §6)
│   ├── components/                PotCard, ReviewSheet, TierCard, Calculator, Icon, …
│   ├── lib/
│   │   ├── chain.ts               Arc custom chain for wagmi/viem
│   │   ├── contract.ts            ABI + address
│   │   ├── api.ts                 typed calls to Express
│   │   ├── format.ts              USDC 6-dp formatting, APY, dates
│   │   └── growth.ts              calculator maths
│   └── motion/                    Motion variants, GSAP timelines, anime.js helpers
├── supabase/
│   └── schema.sql                 tables in §5.3
├── Brand Kit & Design/            brand kit, design system handoff, logos, mockups
├── Docs/
└── README.md
```

---

## 4. Smart contract layer

### 4.1 `PamoSavings.sol` at a glance

```
┌─────────────────────────────── PamoSavings ───────────────────────────────┐
│ constants   USDC = 0x3600…0000                                            │
│ storage     vaultFor[Tier] → address        (admin-set, approved only)    │
│             pots[id] → Pot                  (owner, kind, tier, vault,    │
│             potsOf[owner] → id[]             shares, principal, target,   │
│             nextId                           unlockAt, unlocked)          │
│                                                                           │
│ user        openPot(kind, tier, target, unlockAt, name, assets) → id      │
│             deposit(id, assets)                                           │
│             withdraw(id, assets)        Anytime: always · Goal: unlocked  │
│             withdrawAll(id)                                               │
│ views       potValue(id) · isUnlocked(id) · getPot(id) · getPots(owner)   │
│ admin       setTierVault(tier, vault) · pause() · unpause()               │
│             (cannot move user funds · pause blocks deposits only)         │
│ events      PotOpened · Deposited · Withdrawn · TierVaultSet              │
└───────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Contract pseudocode

```text
openPot(kind, tier, target, unlockAt, name, assets):   // nonReentrant
    require not paused
    require name is at most 64 bytes
    vault = vaultFor[tier]
    require vault != 0
    if kind == Goal:
        require target > 0 AND unlockAt > now
    id = nextId++
    pots[id] = { owner: msg.sender, kind, tier, vault, shares: 0, principal: 0, target, unlockAt, unlocked: false }
    potsOf[msg.sender].push(id)
    emit PotOpened(id, msg.sender, kind, tier, vault, target, unlockAt, name)
    if assets > 0: same steps as deposit(id, assets)       // first save in one call

deposit(id, assets):                       // nonReentrant
    require not paused
    pot = pots[id];  require pot.owner == msg.sender;  require assets > 0
    USDC.safeTransferFrom(msg.sender → this, assets)
    USDC.forceApprove(pot.vault, assets)
    shares = IERC4626(pot.vault).deposit(assets, receiver = this)
    pot.shares    += shares
    pot.principal += assets
    if pot.kind == Goal and target reached: pot.unlocked = true
    emit Deposited(id, msg.sender, assets, shares)

withdraw(id, assets):                      // nonReentrant, works even when paused
    pot = pots[id];  require pot.owner == msg.sender
    if pot.kind == Goal: require isUnlocked(id);  pot.unlocked = true
    shares = IERC4626(pot.vault).previewWithdraw(assets)  // shares that cover `assets`, rounded up
    require 0 < shares <= pot.shares
    pot.principal -= pot.principal × shares / pot.shares  // pro rata, state first
    pot.shares    -= shares
    out = IERC4626(pot.vault).redeem(shares, receiver = pot.owner, owner = this)
    emit Withdrawn(id, pot.owner, out, shares)

withdrawAll(id):                           // same rules, shares = pot.shares
    pot.shares = 0;  pot.principal = 0
    out = IERC4626(pot.vault).redeem(shares, receiver = pot.owner, owner = this)
    emit Withdrawn(id, pot.owner, out, shares)

potValue(id)   = IERC4626(pot.vault).previewRedeem(pot.shares)
isUnlocked(id) = pot.unlocked  OR  now >= pot.unlockAt
                 OR  potValue(id) >= pot.target  OR  pot.principal >= pot.target
                 // once unlocked, a goal stays unlocked

setTierVault(tier, vault):                 // onlyOwner
    require IERC4626(vault).asset() == USDC
    vaultFor[tier] = vault                 // new pots only; old pots keep their vault
    emit TierVaultSet(tier, vault)
```

### 4.3 Arc rules the contract obeys

1. USDC only through the ERC-20 interface (6 dp); never `msg.value` or `address(this).balance` (18 dp).
2. Vault shares use the vault's own decimals (18 on the mainnet vaults, 6 on one testnet mock); never hard-code them. Convert with `previewRedeem` / `convertToAssets`, and read `decimals()` to display shares.
3. Never gate on `maxDeposit` / `maxWithdraw` (return 0 on Morpho Vault V2).
4. Withdrawals can revert when a vault is short on cash; surface it, don't hide it.
5. USDC to blocklisted or zero addresses reverts; funds always go back to `pot.owner`.
6. Timestamps can repeat between blocks; fine for day-scale unlocks, never for ordering.
7. Set `maxFeePerGas` ≥ 20 Gwei on every transaction.

---

## 5. Backend layer (Node.js + Express + Supabase)

### 5.1 What the backend does and doesn't do

| Does | Doesn't |
|---|---|
| Fetches vault data from the Earn Kit and caches it | Hold any user keys or sign anything |
| Returns quotes for the review screens | Decide balances (the contract does) |
| Indexes contract events into Supabase for history and pot names | Store personal data (v1 has no accounts) |
| Serves activity history fast | Gate saving or withdrawing (those go wallet → chain directly) |

### 5.2 API endpoints

| Method + path | Input | Output | Source |
|---|---|---|---|
| `GET /api/health` | | `{ ok, indexedBlock, chainBlock }` | Supabase + RPC |
| `GET /api/vaults` | | `{ asOf, tiers: { calm, steady, bold }: { vaultAddress, name, curator, apy, apy7d, fees: { performance, management }, liquidity, totalDeposits, status, warnings[] } }` | Earn Kit, filtered to the three tier vaults read from `vaultFor` |
| `GET /api/vaults/history?tier=` | tier | `[{ at, apy, liquidity }]` | Supabase `vault_snapshots` |
| `POST /api/quotes/deposit` | `{ owner, tier, amount }` | `{ sharePrice, apy, fees[], warnings[] }` | Earn Kit `getDepositQuote` |
| `POST /api/quotes/withdraw` | `{ owner, potId, amount }` | `{ withdrawalFee, maxWithdrawable, warnings[] }` | Earn Kit `getWithdrawalQuote` |
| `GET /api/owners/:address/activity` | address | `[{ potId, type, assets, shares, txHash, block, at }]` | Supabase `activity` |
| `GET /api/pots/:id` | pot id | `{ id, name, kind, tier, target, unlockAt }` | Supabase `pots` (names come from events) |

All inputs are validated with zod. Rate limit by IP. CORS allows only the Vercel domain.

### 5.3 Supabase schema

```sql
-- Pots as seen in PotOpened events (names live only in events, so we index them)
create table pots (
  id            bigint primary key,          -- pot id from the contract
  owner         text not null,               -- lowercase 0x address
  kind          text not null check (kind in ('anytime','goal')),
  tier          text not null check (tier in ('calm','steady','bold')),
  vault         text not null,
  name          text,
  target        numeric,                     -- USDC, 6 dp as integer units
  unlock_at     timestamptz,
  opened_tx     text not null,
  opened_block  bigint not null
);
create index on pots (owner);

-- Every Deposited / Withdrawn event
create table activity (
  tx_hash    text not null,
  log_index  int  not null,
  pot_id     bigint not null references pots(id),
  owner      text not null,
  type       text not null check (type in ('deposit','withdraw')),
  assets     numeric not null,               -- USDC integer units (6 dp)
  shares     numeric not null,               -- vault share units (18 dp)
  block      bigint not null,
  at         timestamptz not null,
  primary key (tx_hash, log_index)           -- makes re-indexing safe
);
create index on activity (owner, block desc);

-- Rate history for the Portfolios page and calculator context
create table vault_snapshots (
  at             timestamptz not null default now(),
  tier           text not null,
  vault          text not null,
  apy            numeric not null,
  liquidity      numeric,
  total_deposits numeric,
  status         text,
  primary key (at, tier)
);

-- Where the indexer left off
create table indexer_state (
  id          int primary key default 1,
  last_block  bigint not null
);
```

**Access:** the browser never talks to Supabase directly in v1. Only Express uses the service key. Row Level Security is enabled with no public policies, so a leaked anon key exposes nothing.

### 5.4 Indexer pseudocode

```text
every 5 seconds:
    from = indexer_state.last_block + 1
    to   = min(latest_block, from + BATCH)          // BATCH = 9,000: the RPC refuses ranges over 9,999 (§11, #6)
    logs = rpc.getLogs(PamoSavings, events = [PotOpened, Deposited, Withdrawn], from, to)
    for log in logs (ordered by block, then log_index):
        PotOpened → upsert into pots
        Deposited → insert into activity (type 'deposit') on conflict do nothing
        Withdrawn → insert into activity (type 'withdraw') on conflict do nothing
    indexer_state.last_block = to                   // Arc finality is instant: no reorg handling

every 10 minutes:
    data = earnKit.exploreVaults({ chain: "Arc" })
    for tier in [calm, steady, bold]:
        v = data.find(vaultFor[tier])
        insert into vault_snapshots (tier, vault, apy, liquidity, total_deposits, status)
```

---

## 6. Frontend layer (Next.js)

### 6.1 Routes

```
web/app/
├── page.tsx                    /                 Landing            (GSAP hero)
├── calculator/page.tsx         /calculator       Growth Calculator  (no wallet)
├── portfolios/page.tsx         /portfolios       Calm · Steady · Bold (no wallet)
└── app/
    ├── layout.tsx              wallet guard + network guard
    ├── page.tsx                /app              Dashboard
    ├── new/page.tsx            /app/new          New pot flow (stepper)
    └── pot/[id]/page.tsx       /app/pot/:id      Pot detail
```

### 6.2 Where each screen gets its data

| Screen | From the chain (wagmi/viem) | From Express |
|---|---|---|
| Landing | | `/api/vaults` (teaser rates) |
| Calculator | | `/api/vaults` |
| Portfolios | | `/api/vaults`, `/api/vaults/history` |
| Dashboard | `getPots(owner)`, USDC `balanceOf` | `/api/vaults` (APY per tier) |
| New pot / review | `previewDeposit`, `allowance`, `estimateGas` | `/api/vaults`, `/api/quotes/deposit` |
| Pot detail | `pots(id)`, `potValue(id)`, `isUnlocked(id)` | `/api/pots/:id`, `/api/owners/:a/activity`, `/api/quotes/withdraw` |

### 6.3 Arc as a custom chain

```ts
// web/lib/chain.ts
export const arc = defineChain({
  id: 5042,
  name: "Arc",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 }, // native gas view is 18 dp
  rpcUrls: { default: { http: ["https://rpc.mainnet.arc.io"] } },
  blockExplorers: { default: { name: "Arc Explorer", url: "https://explorer.arc.io" } },
});
// Balances shown to users always come from the ERC-20 USDC contract (6 dp), never the native balance.
```

An `arcTestnet` chain (id `5042002`, RPC `https://rpc.testnet.arc.io`, explorer `https://explorer.testnet.arc.io`) is defined beside it. The app uses the chain named in `NEXT_PUBLIC_CHAIN_ID` (§9): testnet during the build, mainnet for the release.

---

## 7. Data flow

### 7.1 The big picture: what comes in, what gets processed, what goes out

```
 IN                                 PROCESSED                                OUT
 ──                                 ─────────                                ───
 User input                         Frontend validates amounts (6 dp)        Review screen
 (amount, tier, goal, date)  ─────► and builds the transaction        ─────► Wallet prompt
                                                                             Signed tx → Arc

 Signed transactions         ─────► PamoSavings moves USDC to/from    ─────► Events on chain
                                    Morpho vaults, updates pots              (PotOpened,
                                                                              Deposited, Withdrawn)

 Contract events             ─────► Indexer writes to Supabase        ─────► Activity history,
                                                                             pot names

 Earn Kit vault data         ─────► Express filters to 3 tier vaults, ─────► Live APY, fees,
                                    caches 60 s, snapshots every 10 min      liquidity, warnings

 Chain state                 ─────► viem reads previewRedeem etc.     ─────► Pot values, earned,
                                                                             goal progress
```

### 7.2 Save money (open a pot + first deposit)

```
 User          Frontend                Express        Earn Kit      Arc RPC / PamoSavings      Morpho vault
  │ fill form     │                       │              │                   │                     │
  ├──────────────►│ validate input        │              │                   │                     │
  │               ├── GET /api/vaults ───►│── explore ──►│                   │                     │
  │               │◄── tier APY, fees ────┤◄─────────────┤                   │                     │
  │               ├── POST quotes/deposit►│── quote ────►│                   │                     │
  │               │◄── fees, warnings ────┤◄─────────────┤                   │                     │
  │               ├── read previewDeposit, allowance, estimateGas ──────────►│                     │
  │               │◄──────────────────────────────────── shares, gas ────────┤                     │
  │◄── REVIEW ────┤                       │              │                   │                     │
  │ "Allow"       │                       │              │                   │                     │
  ├──────────────►├── USDC.approve(PamoSavings, amount) ────────────────────►│                     │
  │ "Save"        │                       │              │                   │                     │
  ├──────────────►├── openPot(..., amount)   (one call: opens and deposits) ─►│                     │
  │               │                       │              │                   ├─ transferFrom ─────►│
  │               │                       │              │                   ├─ vault.deposit ────►│
  │               │                       │              │                   │◄──── shares ────────┤
  │               │◄──────────────── receipt (final in < 1 s) ──────────────┤ emit events         │
  │◄── SUCCESS ───┤                       │              │                   │                     │
  │               │                       │◄── indexer picks up events ──────┤                     │
  │               │                       │   (writes Supabase)              │                     │
```

```text
saveFlow(input):
    validate input.amount (> 0, ≤ 6 decimals, ≤ wallet USDC balance)
    tierData = GET /api/vaults → tiers[input.tier]
    quote    = POST /api/quotes/deposit { owner, tier, amount }      // may fail → show "rates unavailable", still allow
    preview  = read vault.previewDeposit(amount)
    gas      = estimateGas(approve) + estimateGas(openPot with the amount)
    show ReviewSheet(amount, tierData, quote, preview, gas, warnings)

    on "Allow":   if allowance < amount → send USDC.approve(PamoSavings, amount)
    on "Save":    if new pot → send openPot(kind, tier, target, unlockAt, name, amount) → read id from event
                  else       → send deposit(id, amount)
                  wait for receipt (status 1) → show success, refetch getPots
                  on revert → show plain-English error + explorer link
```

### 7.3 Withdraw money

```
 User        Frontend                         Express / Earn Kit          PamoSavings            Morpho vault
  │ amount      │                                    │                         │                      │
  ├────────────►│ read isUnlocked(id), potValue(id) ─┼────────────────────────►│                      │
  │             ├── POST quotes/withdraw ───────────►│ fee, maxWithdrawable,   │                      │
  │             │◄────────────────────────────────── │ liquidity warnings      │                      │
  │◄─ REVIEW ───┤                                    │                         │                      │
  │ "Withdraw"  │                                    │                         │                      │
  ├────────────►├── withdraw(id, amount) ────────────┼────────────────────────►│── vault.withdraw ───►│
  │             │                                    │                         │◄──── USDC to owner ──┤
  │             │◄────────────────────────── receipt + Withdrawn event ────────┤                      │
  │◄─ SUCCESS ──┤                                    │                         │                      │
```

```text
withdrawFlow(potId, amount):
    pot = read pots(potId);  value = read potValue(potId)
    if pot.kind == Goal and not read isUnlocked(potId):
        disable button: "Unlocks when you reach {target} USDC or on {unlockAt}"; stop
    quote = POST /api/quotes/withdraw { owner, potId, amount }
    if amount > quote.maxWithdrawable:
        disable button: "The vault is short on cash right now. Try up to {max} USDC."; stop
    show ReviewSheet(amount, sharesToBurn, fee, leftInPot = value − amount, warnings)
    on "Withdraw": send withdraw(potId, amount)  (or withdrawAll if amount == value)
                   wait for receipt → success, refetch
```

### 7.4 Dashboard read

```text
dashboard(owner):
    pots      = read PamoSavings.getPots(owner)              // source of truth: ids, kinds, tiers, values, principal
    wallet    = read USDC.balanceOf(owner)                   // 6 dp
    rates     = GET /api/vaults                              // APY per tier
    names     = GET /api/pots/:id for each pot               // falls back to "Anytime Vault #12" if backend is down
    totals    = sum(pots.value), sum(pots.value − pots.principal)
    render header(totals, rates) + PotCard for each pot (Goal: progress = value / target)
    animate numbers with anime.js count-up
```

### 7.5 Vault data (rates)

```
 Earn Kit ──(exploreVaults, every 60 s on demand)──► Express cache ──► /api/vaults ──► Portfolios, Calculator, Review
     │
     └──(every 10 min)──► vault_snapshots (Supabase) ──► /api/vaults/history ──► Portfolios rate chart
```

### 7.6 Growth Calculator (pure frontend maths)

```text
growth(start, monthly, months, apy):
    r = (1 + apy) ^ (1 / 12) − 1                 // APY is already compounded
    balance = start;  points = []
    repeat months times:
        balance = (balance + monthly) × (1 + r)
        points.push(balance)
    return { final: balance, putIn: start + monthly × months, interest: balance − putIn, points }
```

---

## 8. App flow

### 8.1 Screen map

```
                    ┌───────────────┐
                    │   Landing  /  │
                    └──┬─────┬────┬─┘
        "See growth"   │     │    │  "Start saving"
            ┌──────────┘     │    └───────────────┐
            ▼                ▼                    ▼
   ┌────────────────┐ ┌──────────────┐   ┌──────────────────┐
   │  Calculator    │ │  Portfolios  │   │  Connect wallet  │
   │  (no wallet)   │ │  (no wallet) │   └────────┬─────────┘
   └───────┬────────┘ └──────┬───────┘            │ wrong network?
           └──"Start saving"─┴────────────────────┤──► "Switch to Arc"
                                                  ▼
                                        ┌──────────────────┐
                              ┌────────►│   Dashboard /app │◄─────────────┐
                              │         └───┬──────────┬───┘              │
                              │  "New pot"  │          │ tap a pot        │
                              │             ▼          ▼                  │
                              │  ┌──────────────┐  ┌───────────────────┐  │
                              │  │ New pot flow │  │ Pot detail        │  │
                              │  │ type → goal? │  │ add · withdraw ·  │  │
                              │  │ → tier →     │  │ activity          │  │
                              │  │ amount →     │  └────────┬──────────┘  │
                              │  │ REVIEW       │           │ REVIEW      │
                              │  └──────┬───────┘           ▼             │
                              │         ▼            Allow? → Withdraw ───┘
                              └── Allow → Save → Success
```

### 8.2 New pot flow as a state machine

```
 ┌──────────┐  Anytime   ┌──────────┐          ┌──────────┐          ┌──────────┐
 │ ChooseType├──────────►│ ChooseTier├────────►│  Amount  ├─────────►│  Review  │
 └────┬─────┘            └─────▲────┘          └──────────┘          └────┬─────┘
      │ Goal                   │                                          │
      ▼                        │                                          ▼
 ┌──────────┐                  │                         allowance ok? ──┬── no ──► ┌──────────┐
 │GoalDetails├─────────────────┘                                         │          │ Allowing │
 │name,target│                                                           │          └────┬─────┘
 │,unlock    │                                                           │ yes           │ receipt
 └──────────┘                                                            ▼               ▼
                                                                    ┌──────────┐◄────────┘
                                                                    │  Saving  │
                                                                    └────┬─────┘
                                                        receipt ok ┌─────┴─────┐ revert / rejected
                                                                   ▼           ▼
                                                             ┌─────────┐ ┌─────────┐
                                                             │ Success │ │  Error  │──► back to Review
                                                             └─────────┘ └─────────┘
```

```text
state = ChooseType
on choose(type):        state = (type == Goal) ? GoalDetails : ChooseTier
on goalDetails(valid):  state = ChooseTier
on chooseTier(tier):    state = Amount
on amount(valid):       state = Review            // loads quotes + previews
on confirm:             state = needsAllowance ? Allowing : Saving
on allowReceipt:        state = Saving
on saveReceipt(ok):     state = Success → go to /app with new pot highlighted
on revert or reject:    state = Error  → show reason → back to Review
on back:                state = previous state    // form values kept
```

### 8.3 Guards that wrap every `/app` route

```text
appLayout():
    if not walletConnected:      show ConnectWallet
    else if chainId != 5042:     show "Pamo runs on Arc" + Switch to Arc
    else if backend unreachable: show small banner "Live rates unavailable", keep everything else working
    else:                        render page
```

---

## 9. Environments and config

| Variable | Where | Purpose |
|---|---|---|
| `PRIVATE_KEY` | `contracts/.env` | Deployer key. Never committed. Only used for deploy and admin calls |
| `ARC_RPC_URL` | contracts, server | `https://rpc.testnet.arc.io` during the build, `https://rpc.mainnet.arc.io` for the release |
| `CHAIN_ID`, `NEXT_PUBLIC_CHAIN_ID` | server, web | `5042002` during the build, `5042` for the release |
| `PAMO_SAVINGS_ADDRESS` | server, web | Deployed contract |
| `CIRCLE_API_KEY` | server only | Earn Kit rate limit. Mainnet and testnet keys differ |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | server only | Database access |
| `NEXT_PUBLIC_API_URL` | web | Express base URL |
| `NEXT_PUBLIC_PAMO_SAVINGS_ADDRESS` | web | Contract address for wagmi |
| `ALLOWED_ORIGIN` | server | CORS: the Vercel domain |

| Environment | Chain | Vaults | Use |
|---|---|---|---|
| Local | `arc-anvil` forking Arc mainnet | Real mainnet vaults (forked) | Contract tests |
| Testnet | Arc Testnet `5042002` | Two mock vaults only | **The whole build.** Contract, backend and web app all run here first |
| Production | Arc mainnet `5042` | Three real tier vaults | The release and the submission, deployed once the testnet build works |

**Testnet first, then mainnet.** Everything is built and proven on testnet with faucet USDC. Moving to mainnet is a fresh deploy of `PamoSavings` plus a config change: the chain ID, RPC URL, contract address, tier vaults and Circle API key all come from the variables above, so no code changes.

- Testnet has only two vaults: EarnKit USDC Vault (`0xaabbef1d3971c710276ed41ec791bbe14cdb8e88`, 18-decimal shares) and MockMorphoVault (`0x8f2d33b5d4b9b5f02df635ae308f7b4c9da8d2dc`, 6-decimal shares). Two tiers share one there: Calm and Bold on the first, Steady on the second.
- Mock vaults don't behave exactly like the real ones, so the fork tests still run against real mainnet vaults on a local fork. That costs nothing.
- Testnet rates and liquidity are not real. Honest live numbers only appear on mainnet.

---

## 10. Security and trust boundaries

```
 ┌────────────── user controls ──────────────┐   ┌──────────── Pamo controls ────────────┐
 │ wallet keys · every signature · when to   │   │ tier → vault map (new pots only)      │
 │ save · when to withdraw (within lock)     │   │ pause new deposits                     │
 └───────────────────────────────────────────┘   │ backend + database (cache only)        │
                                                 └────────────────────────────────────────┘
 ┌──────────── third parties ────────────────┐
 │ Morpho vault curators (where USDC lends)  │   Nobody, including Pamo, can withdraw
 │ Circle (USDC, Earn Kit data, Arc chain)   │   a user's pot except the user.
 └───────────────────────────────────────────┘
```

- Contract: `ReentrancyGuard` on every money function, `SafeERC20`, `Ownable2Step` for admin, `Pausable` scoped to deposits only.
- No secret ever reaches the browser: the Circle API key and the Supabase service key live on Express only.
- The frontend trusts the chain over the backend: if they disagree, the chain wins.
- Inputs validated with zod on the server, and amount parsing done with `parseUnits(x, 6)` everywhere.

---

## 11. Risky or unknown pieces: de-risk these first

Ordered by how badly they could block the build. Each has a quick test to run **before** building on top of it.

| # | Risk | Why it matters | De-risk test (do it early) | By |
|---|---|---|---|---|
| 1 | **Mainnet USDC for gas and demo** | Nothing ships without it. The build itself uses testnet USDC from the faucet | Get 20–50 USDC onto an Arc mainnet wallet; send 0.01 USDC to yourself | Before the mainnet deploy |
| 2 | **Morpho Vault V2 from a contract** | The whole product depends on it | With `arc-cast`, deposit 1 USDC into the Calm vault from your wallet, then `withdraw` it. Then the same in a fork test from a contract | Oct 5 |
| 3 | **Arc Foundry install + fork tests** | Standard Foundry can't reproduce Arc behaviour | Install, run `arc-forge test --network arc` on a fork of mainnet | Oct 5 |
| 4 | **Earn Kit quotes from the server** | Quotes take `from: { adapter, chain }`; may need the user's wallet | Call `getDepositQuote` in Express with a read-only viem adapter for an arbitrary address. If it fails, move quotes client-side (no API key in the browser) | Oct 6 |
| 5 | **Mainnet contract verification** | Judges should see verified source | Find the mainnet Blockscout verifier URL (docs only show testnet's) and verify a dummy contract | Oct 6 |
| 6 | **Arc RPC `getLogs` limits** | Indexer could fail on large ranges | Query PamoSavings logs over 10k, 50k, 100k blocks and note the limit | Oct 7 |
| 7 | **Wallets adding Arc** | Users stuck on the wrong network | Test `wallet_addEthereumChain` with MetaMask on desktop and phone | Oct 7 |
| 8 | **Low-liquidity withdrawals** | "Anytime" breaks if the vault has no cash | Re-check `liquidity` for the three tier vaults on deploy day; pick liquid ones for Calm | Oct 6 |
| 9 | **Backend hosting cold starts** | Free tiers sleep, first request slow | Deploy a hello-world Express to Railway/Render and time a cold request | Oct 7 |
| 10 | **Motion performance on phones** | Three animation libs can make it janky | Test the landing hero and count-ups on a mid-range phone; drop anime.js first if needed | Oct 11 |

**Results so far (Oct 9)**

- **#2 done.** A 1 USDC deposit and redeem returned 0.999999 USDC from a wallet on testnet, and from a contract on a mainnet fork across five real vaults (`contracts/test/ForkSmoke.t.sol`).
- **#3 done.** Arc Foundry v0.8.0-2 is installed and fork tests pass. Under plain Foundry the same USDC transfer reverts, so `arc-forge` is required.
- **#4 done.** `exploreVaults` works from a server with no API key, on testnet and mainnet. Quotes tested from a server on testnet (Oct 9) with a read-only adapter that only reports an address:
  - `getDepositQuote` works (0.7 to 2.2 s) and returns the share price, APY, fees and expected shares, but only when the quoted wallet holds the amount. Otherwise it fails with "The wallet does not hold enough tokens for this deposit". Its gas estimate is for the Earn Kit's own approve and deposit, not Pamo's calls.
  - `getWithdrawalQuote` does **not** work for Pamo. It answers "The wallet holds no withdrawable position in this vault" for the user's wallet and also for the PamoSavings address, which held 998310 shares of that vault at the time. The Earn Kit only counts positions opened through the Earn Kit. Moving quotes client-side would not change this, so the withdrawal review needs another source (Build Guide §10).
- **#6 done.** `eth_getLogs` on the public RPC accepts at most 10,000 blocks per call (`toBlock − fromBlock` ≤ 9,999) on testnet and mainnet; anything larger fails with `-32012 requested range too large`. Blocks come about every 0.5 s, so 10,000 blocks is about 84 minutes and a day of backlog is about 17 calls. The indexer uses `BATCH = 9,000` and starts at the deploy block.
- **#8 checked.** Gauntlet USDC Prime had 0 USDC available on mainnet, so the Calm pick needs changing (Build Guide §10).
- New finding: `maxDeposit` and `maxWithdraw` return 0 on the real vaults even when deposits and withdrawals work, as §4.3 rule 3 says.

**Fallback if the backend is late or broken:** the frontend can read everything essential straight from the chain (`getPots`, `potValue`), and the Earn Kit can be called without a key for rates. Saving and withdrawing never depend on Express or Supabase.
