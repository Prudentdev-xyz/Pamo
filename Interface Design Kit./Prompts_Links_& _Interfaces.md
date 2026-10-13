# Pamo: Interface Prompts, Links and Designs

Five prompts for turning the Claude Design screens into the real web app in `web/`. Run them one at a time, in order, in Claude Code from the repo root. Check each result in the browser before sending the next.

- **Order:** 1 shell and dashboard → 2 saving journey → 3 pot journey → 4 portfolios and calculator → 5 logo intro and landing. Prompt 1 also sets up the shared pieces (logo, icons, motion tokens) the others use.
- **Before you start:** run `/design-login` once so the `claude_design` MCP can read the project. If the MCP is not available, Claude Code reads the same design from the **Artifacts** link under each prompt, so paste that link along with the prompt.
- **Each prompt points at the rules below**, so the rules are written once and every screen follows the same ones. The rules include the skills to load for each kind of work.

---

## Rules for every screen

These apply to all five prompts.

### 1. How Arc is mentioned

Pamo is a general savings product. Arc is where it runs today, and more chains are planned. The designs mention Arc more often than that, so change the wording as you build.

- **Describe Pamo by what it does**, never by its chain: "a save-and-earn app", not "a save-and-earn app on Arc".
- **Remove Arc** from headlines, hero text, the nav, feature cards, badges, chips, button labels and empty states.
- **Keep Arc only where the user needs it to act or to check something:**
  - Wrong network: "Pamo is currently on Arc" with the **Switch to Arc** button.
  - Not enough USDC: how to get USDC on Arc.
  - Explorer links, labelled plainly: "View on explorer", "View contract". The link says where it goes; the label does not need the chain name.
- **One status line, in the footer only** (landing and app): "Currently on Arc. More chains planned." followed by the contract address linked to the explorer. Read the network name from `web/lib/chain.ts` so the line is right on testnet and on mainnet.
- **Nothing more about the future than that line.** No named chains, no dates, no "coming soon" badges.
- Vault facts stay exact: vault names, curators, live rates and available cash are shown as they are.

### 2. Restyle, do not rewire

- The app already works on Arc testnet. Keep every hook, contract call, API call and state machine as it is (`web/lib/*`, the step logic in `useStep`, `useReview`, `newPot.ts`, `tx.ts`). Change markup, classes and components only.
- The design is the reference for layout and look. Where it shows data the app does not have, leave that part out and tell me; do not invent numbers or fields.
- Where the design's wording disagrees with the copy rules in `Docs/Build_Guide.md` §6, the guide wins: amounts show USDC, rates are "today, changes daily", the calculator is an estimate, "Allow" not "Approve".

### 3. Brand and build

- Colours, type, spacing and radii come from the theme tokens in `web/app/globals.css`. No hex values in components.
- One green button per screen. Green text only for links and earned amounts.
- Icons come from `web/components/Icon.tsx` only (Iconsax, `Linear` by default, `Bold` when selected).
- Motion follows `Docs/Build_Guide.md` §7: Motion for app UI, anime.js for count-ups and the logo, GSAP on the landing page only. Tokens from `web/motion/tokens.ts`. Reduced motion respected in all three.
- Phone first at 390 px, then desktop.
- Every onchain button keeps its own loading and disabled state, and success shows only after the receipt.

### 4. Skills to use

Load the skills that fit the screen before writing code. Use the ones listed for the job; the rules in this file win where a skill disagrees with them.

| Job | Skills |
|---|---|
| Layout, hierarchy, polish, states | `impeccable:impeccable` · `emil-design-eng` · `web-design-guidelines` |
| Wallet and transaction screens | `ethskills:frontend-ux` · `ethskills:frontend-playbook` |
| App motion (Motion) | `animate` · `motion-design` |
| Landing motion (GSAP) | `gsap-skills:gsap-core` · `gsap-skills:gsap-timeline` · `gsap-skills:gsap-scrolltrigger` · `gsap-skills:gsap-react` |
| Next.js and React code | `vercel:nextjs` · `vercel:react-best-practices` |
| Phone feel | `mobile-native` |
| Checking the result | `break-ui` (long names, huge and zero amounts) · `ethskills:qa` |

### 5. Finish

- Run `pnpm typecheck` and `pnpm build` in `web/`, then open the screens at 390 px and at desktop width and fix what looks wrong.
- Testnet only. Do not deploy or send anything on Arc mainnet.
- Tick the matching boxes in `Docs/Build_Guide.md` §8 and list anything you left out or changed from the design.
- Do not commit until I say so.

---

## 1. App shell and dashboard

```
Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
https://claude.ai/design/p/27da69bf-924b-4d87-8291-2ed037d6c31e?file=Pamo+App+1+-+Shell+and+Dashboard.dc.html

Focus on these files (the whole project is readable):
- `Pamo App 1 - Shell and Dashboard.dc.html`

Also read these files the selection imports:
- `support.js`

Implement: `Pamo App 1 - Shell and Dashboard.dc.html`

Before you build, read "Rules for every screen" in `Interface Design Kit./Prompts_Links_& _Interfaces.md` and follow all of it, and read `Docs/Build_Guide.md` §6 and §7. This is Phase 5 of the build guide.

First, the shared pieces every later screen uses:
- Install `motion`, `animejs` and `iconsax-react` in `web/`.
- `web/motion/tokens.ts`, `variants.ts` and `countUp.ts` (Build Guide §7.2).
- `web/components/Icon.tsx`, the one icon wrapper (§7.5).
- An SVG Pamọ́ wordmark with outlined text in `web/public/`, made from the PNG exports in `Brand Kit & Design/Pamo Logos/`.
- The shared components from the design: buttons, cards, tier chip with its 1, 2 or 3 bar level mark, kind badge, banner.

Then the screen:
- App shell: `web/app/app/layout.tsx` and `web/components/SiteNav.tsx`, with the footer status line from the rules.
- Dashboard: `web/app/app/page.tsx`, `PotCard.tsx`, `GoalProgress.tsx`. Total saved, earned so far, live APY per tier, pot cards, the two new-pot buttons.
- States: wallet not connected, wrong network, backend down banner, nothing saved yet.
- Motion: route transition, count-up on total saved and earned, pot cards stagger in, goal progress bar, live APY dot.
```

Canva: https://canva.link/exph2c8cpwptgf4

Artifacts: https://claude.ai/artifact/LoZymknYRbkmcnThCNEpBP

---

## 2. The saving journey

```
Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
https://claude.ai/design/p/27da69bf-924b-4d87-8291-2ed037d6c31e?file=Pamo+App+2+-+Saving+Journey.dc.html

Focus on these files (the whole project is readable):
- `Pamo App 2 - Saving Journey.dc.html`

Implement: `Pamo App 2 - Saving Journey.dc.html`

Before you build, read "Rules for every screen" in `Interface Design Kit./Prompts_Links_& _Interfaces.md` and follow all of it. Use the shared components, icons and motion tokens made in prompt 1; do not make second copies.

The screen:
- New pot flow: `web/app/app/new/page.tsx`, `Stepper.tsx`, `TierPicker.tsx`, `ReviewSheet.tsx`, `SaveSteps.tsx`, `StepButton.tsx`.
- Steps stay as they are in `web/lib/newPot.ts`: kind → goal details (goal only) → tier → amount → review → Allow → Save.
- Review shows every row in Build Guide §6 "Review screens", with warnings above the button.
- States: not enough USDC, wallet rejected ("Cancelled. Nothing was moved."), pending with the explorer link, vault low on cash, gas "available after allowing".
- Motion: steps slide by direction, progress dots fill, the tier outline glides between cards (`layoutId`), the review sheet rises from the bottom on phones and fades in as a modal on desktop, Allow ticks off as Save becomes active, the button keeps its width while pending, a drawn check mark on success and then the new balance counts up.

When it builds, open one Anytime pot and one Goal pot through the new screens on Arc testnet and tell me what happened.
```

Canva: https://canva.link/7rahrylzdp2rggo

Artifacts: https://claude.ai/artifact/Q6qonWsxKmWnzVTxeXPuUf

---

## 3. The pot journey

```
Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
https://claude.ai/design/p/27da69bf-924b-4d87-8291-2ed037d6c31e?file=Pamo+App+3+-+Pot+Journey.dc.html

Focus on these files (the whole project is readable):
- `Pamo App 3 - Pot Journey.dc.html`

Also read these files the selection imports:
- `support.js`

Implement: `Pamo App 3 - Pot Journey.dc.html`

Before you build, read "Rules for every screen" in `Interface Design Kit./Prompts_Links_& _Interfaces.md` and follow all of it. Use the shared components, icons and motion tokens already in `web/`.

The screen:
- Pot detail: `web/app/app/pot/[id]/page.tsx`, `ActivityList.tsx`, `GoalProgress.tsx`, and `ReviewSheet.tsx` for adding money and withdrawing.
- Value, money put in, earned, tier, and the vault name with a "View on explorer" link.
- Add money and Withdraw, each through its review first.
- Goal pots show the lock reason ("Unlocks when you reach 500 USDC or on Oct 30") and a disabled Withdraw until unlocked.
- States: goal locked, vault short on cash (button disabled, reason shown), amount above what the vault can pay now, activity unavailable when the backend is down, no activity yet.
- Motion: value counts from the old number to the new one after a transaction, progress bar springs to its new width, activity rows stagger in.

When it builds, run one withdrawal through the new withdrawal review on Arc testnet (part, then all). That is the task still open in Phase 4; tick it if it works.
```

Canva: https://canva.link/xzmcmsj6zcwgxu5

Artifacts: https://claude.ai/artifact/E6Pj3q3A7CDPfJCfr2Aa9P

---

## 4. Portfolios and the Growth Calculator

```
Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
https://claude.ai/design/p/27da69bf-924b-4d87-8291-2ed037d6c31e?file=Pamo+App+4+-+Portfolios+and+Calculator.dc.html

Focus on these files (the whole project is readable):
- `Pamo App 4 - Portfolios and Calculator.dc.html`

Also read these files the selection imports:
- `support.js`

Implement: `Pamo App 4 - Portfolios and Calculator.dc.html`

Before you build, read "Rules for every screen" in `Interface Design Kit./Prompts_Links_& _Interfaces.md` and follow all of it. Use the shared components, icons and motion tokens already in `web/`.

The screens:
- Portfolios: `web/app/portfolios/page.tsx`, `Portfolios.tsx`, `RateChart.tsx`. Calm, Steady and Bold side by side with live APY, curator, available cash, plain-English risk and the rate-history line. They are USDC lending vaults: never call them stocks or funds.
- Calculator: `web/app/calculator/page.tsx`, `Calculator.tsx`. Starting amount, monthly top-up, months slider, tier; projected balance, total put in, estimated interest and the curve. Keep the maths in `web/lib/growth.ts` untouched. Caption: "Estimate at today's rate. Not a promise."
- Both pages work with no wallet connected.
- States: live rates unavailable, rate history still empty.
- Motion: live APY dot, the result counts to its new value as inputs change (debounced), the curve animates on first draw only.

Check the calculator still gives 717.76 for 100 + 50 a month over 12 months at 4.20%.
```

Canva: https://canva.link/fx2h3iifewityim

Artifacts: https://claude.ai/artifact/VEQqWbyRC9gxtQ5jhx8PQ7

---

## 5. Logo intro and landing page

```
Use the claude_design MCP (https://api.anthropic.com/v1/design/mcp, auth via /design-login) to import this project:
https://claude.ai/design/p/27da69bf-924b-4d87-8291-2ed037d6c31e?file=Pamo+App+5+-+Logo+Intro+and+Landing.dc.html

Focus on these files (the whole project is readable):
- `Pamo App 5 - Logo Intro and Landing.dc.html`

Also read these files the selection imports:
- `support.js`

Implement: `Pamo App 5 - Logo Intro and Landing.dc.html`

Before you build, read "Rules for every screen" in `Interface Design Kit./Prompts_Links_& _Interfaces.md` and follow all of it. This is the first part of Phase 6 of the build guide. The Arc wording rule matters most on this page: the hero and the cards are about saving, and Arc appears once, in the footer status line.

The screen:
- Landing: `web/app/page.tsx`. Hero with the Pamọ́ logo, "Keep it safe. Your USDC savings earn while they sit." and Start saving; the "how it works" strip (wallet → Pamo → lending vault → interest back); the three cards (Anytime, Goal, Portfolios); the calculator teaser with live rates; the one-line Yoruba backstory.
- Footer: the status line from the rules with the contract address linked to the explorer, and the GitHub link.
- Logo intro (anime.js): at phone width a full white screen where "Pamo" writes in, the tone marks settle and the wordmark travels up into the nav, about 1.6 s, once per visit, any tap skips it. At desktop width no full-screen intro: the wordmark fades in in the nav and the tone marks settle.
- GSAP + ScrollTrigger, loaded with a dynamic import on `/` only: hero lines rise one after another with the button last (under 1.2 s), the USDC dot travels along the "how it works" strip on scroll, feature cards rise in with a stagger.
- The calculator teaser counts up when it scrolls into view.
- With reduced motion on, skip the intro and show everything in place.

Check that GSAP is not in the bundle for `/app`, and tell me how the page feels at 390 px.
```

Canva: https://canva.link/bya1hpn0va0m7x4

Artifacts: https://claude.ai/artifact/KGijvswTwZ1qPQnxoors2R
