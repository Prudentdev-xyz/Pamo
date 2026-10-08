# Pamo: Brand Kit Prompts

Prompts for getting Pamo's brand kit, design system and core screens out of Claude Design. Everything already decided is written into the prompts, so the tool fills in what is open and does not reinvent what is settled.

- **Companion docs:** [Brand_Design.md](Brand_Design.md) (the decisions these prompts carry) · [Build_Guide.md](Build_Guide.md) §6 and §7 (screens, copy rules, motion)
- **If a value changes** in Brand_Design.md, change it in the brief below too. The brief is a copy, not the source.

---

## How to use this

1. Start a new project and paste **the brief** (§1) as the first message. Attach `Docs/Brand_Design.md` as well if the tool accepts files.
2. Run the **step prompts** (§2) one at a time, in order. Each step builds on the one before it.
3. Do not move on until the current step looks right. Use the **fix-up prompts** (§3) to correct it.
4. After steps 1 and 2 you will have picked a typeface and a logo. Record both in Brand_Design.md before you carry on.

Why steps and not one giant request: asking for a logo, a design system and nine screens at once gives thin results on all three. One step at a time lets you approve the typeface before forty components are built on it.

---

## 1. The brief (paste first, every new project)

````text
You are the brand and product designer for Pamo. I will ask for the work in steps. Read this brief first and follow it in every step. Do not design anything yet; reply with a short summary of the brief and any questions.

# WHAT PAMO IS

Pamo is a save-and-earn web app on Arc, a blockchain built for stablecoins. People save USDC (a digital dollar) into "pots". Each pot's money is lent out through a lending vault, so it earns interest while it sits. Only the owner of a pot can withdraw from it.

- Name: plain "Pamo" everywhere. Only the logo carries the tone marks: "Pamọ́".
- The name comes from the Yoruba "fi pamọ́", meaning "keep it safe".
- Tagline: "Keep it safe."
- One-line pitch: "Your USDC savings earn while they sit."
- Audience: ordinary people who hold USDC and find DeFi confusing. Many are in Nigeria and across Africa. Most will use a phone.
- Also seen by: grant judges who must understand the product in seconds.

# FEEL

Calm, trustworthy, plain-spoken. A money app earns trust by being boring in the right places. It should feel like a careful savings product, not a trading app and not a crypto project.

# WHAT V1 DOES

- Anytime Vault: save USDC, take it out whenever you want.
- Goal Vault: save toward a target amount with an unlock date. Locked until the target or the date is reached.
- Pamo Portfolios: pick Calm, Steady or Bold. The tier decides which USDC lending vault the savings earn in.
- Growth Calculator: see what savings could grow to at today's live rate. No wallet needed.
- Review screens: see exactly what will happen before signing anything.
- Dashboard and activity: total saved, earned so far, goal progress, history.

# COLOURS (decided, do not change or add to)

White comes first. It is the colour you see most. Green is the colour you remember.

Brand colours
- White #FFFFFF: page and card backgrounds, about 60 to 70% of any screen
- Black #0A0A0A: text, numbers, the logo, dark sections, about 20 to 30%
- Pamo green #0B7A4B: buttons, links, progress, earned amounts, about 10%

Helpers (not extra brand colours)
- Bright green #3DDC84: green text and marks on black only, never on white
- Mint #E6F4EC: soft fills behind green text (chips, success notes, selected rows)
- Green pressed #096640: hover and pressed state of a green button
- Grey text #5A655E: secondary text and captions on white
- Grey text on black #A3ADA6: secondary text in dark sections
- Grey muted #8A948D: placeholder and disabled text only
- Grey line #DCE2DD: borders, dividers, the empty part of a progress bar
- Grey surface #F5F7F5: page background behind white cards

Status colours (only to report a problem or a caution)
- Error: text #B3261E on fill #FCEBE9
- Caution: text #8A5A00 on fill #FFF4DC
- Success needs no extra colour: Pamo green on mint.

# COLOUR RULES

1. White is the default background.
2. Text is black. Green text is only for links and earned amounts.
3. One green button per screen: the main action. Other buttons are black outline or plain text.
4. Green means "act" or "gain". Never use it for headings or decoration.
5. No large green backgrounds. The one exception is the success screen after a save.
6. Black backgrounds are moments, not a mode: a dark footer or one dark landing section. There is no dark mode.
7. On black, buttons stay Pamo green with white labels; green text and marks use bright green.
8. Never rely on colour alone. Every state also has a word or an icon.
9. Text contrast must be at least 4.5 to 1.

# LOGO (partly decided)

- The logo is the wordmark "Pamọ́" in plain black on white, with no background block. On black it is white.
- The "ọ́" is a Latin o with a dot below and an acute accent above, both on the same letter. It must be drawn correctly and sit comfortably, not look bolted on.
- Never green, never in a coloured box, never on a photo.

# TYPE (open: you will propose it in step 1)

- One sans-serif family for everything.
- It must draw "ọ́" correctly, have tabular figures, and be free on Google Fonts.
- Weights: regular for body, semibold for buttons and labels, bold for headings and big balances.

# TIERS

Calm, Steady and Bold are not three colours. Each shows its name plus a level mark: three small bars with 1, 2 or 3 filled in Pamo green and the rest in grey line. A tier chip is the name and the mark on a mint fill.

# ICONS

Iconsax style: thin, even outline icons for the default state, the solid version for the selected or active state. Every icon is paired with a text label.

# COPY RULES

- Amounts always show the unit: "120.50 USDC". Use tabular figures.
- Rates are live and labelled: "4.48% APY today, changes daily". Never a promised number.
- The calculator says "estimate", never "you will earn".
- Portfolios are "USDC lending vaults", never stocks or funds.
- Plain words for wallet steps: "Allow Pamo to use your USDC", not "Approve".
- Never name any other savings or finance app.
- Never say "guaranteed", "risk-free" or "safe returns".

# SAMPLE CONTENT (use this, not lorem ipsum)

- Pots: "Rent" (Goal Vault, Steady, 840.00 of 1,200.00 USDC, unlocks Mar 1, 2027, earned 12.48 USDC), "Emergency fund" (Anytime Vault, Calm, 2,310.75 USDC, earned 31.02 USDC), "New laptop" (Goal Vault, Bold, 150.00 of 900.00 USDC, unlocks Dec 20, 2026, earned 0.94 USDC)
- Total saved: 3,300.75 USDC. Earned so far: 44.44 USDC.
- Tiers: Calm 3.12% APY today, Steady 4.48% APY today, Bold 6.05% APY today
- Wallet address chip: 0x71C4…9A3f
- These are example figures. Do not present any rate as fixed.

# NEVER

- No colours outside the list above. No gradients, no glows, no glass effects.
- No purple or blue.
- No crypto clichés: coins, rockets, charts going up, robots, neon.
- No stock illustrations of people, no 3D blobs, no emoji.
- No dark mode.
- No decoration that does not help someone understand their money.
````

---

## 2. Step prompts

### Step 1: Typeface

```text
Step 1: propose the typeface.

Show three sans-serif options from Google Fonts. For each one, on a white background in black, show:
- the wordmark "Pamọ́" at large size, so I can judge how the ọ́ is drawn
- a balance: "3,300.75 USDC" in bold with tabular figures
- "+12.48 USDC earned" in Pamo green
- a heading, a paragraph of body text and a small caption, using the sample content
- a green button labelled "Start saving"

Avoid the most overused choices unless one is clearly the best fit; say why you picked each. Tell me which one you recommend and what its weak point is. Confirm for each that the font file really contains ọ (U+1ECD) and the combining acute accent, so nothing falls back to another font.
```

### Step 2: Logo

```text
Step 2: the logo. Use the typeface I chose in step 1.

1. Wordmark: show four refinements of "Pamọ́" in black on white. Vary only letter spacing, weight and how the dot and the accent sit on the "o". Keep it plain text; no symbol beside it.
2. Compact mark: the app needs a square icon for the browser tab and the phone home screen. Show four options built from the wordmark itself, for example the "ọ́" on its own or the "P" on its own. Black on white, and white on black.
3. For the option you recommend, show: black on white, white on black, the minimum size where the tone marks are still readable, the clear space around it, and a row of "do not" examples (green wordmark, coloured box, stretched, on a photo).
4. Show the favicon at 16, 32 and 180 pixels.

The tone marks are the identity. If they disappear or blur at small sizes, say so and suggest the smallest size the full wordmark may be used at.
```

### Step 3: Brand kit sheet

```text
Step 3: the brand kit, as one page I can hand to anyone.

Sections, in this order:
1. The logo: wordmark, compact mark, clear space, minimum size, do and do not
2. Colour: the three brand colours shown at their real proportions (white most, black next, green least), then helpers and status colours, each with its hex value and its job
3. Colour in use: the pairs that are allowed (for example white text on Pamo green, Pamo green text on mint) and the pairs that are not (Pamo green text on black, bright green on white)
4. Type: the family, the weights, and a type scale from caption to big balance, with sizes and line heights
5. Tiers: the Calm, Steady and Bold chips with the level mark
6. Icons: a sample row in the default and the selected state
7. Voice: six example lines of Pamo copy next to the version we would never write (for example "4.48% APY today, changes daily" versus "Earn 4.48% guaranteed")

White page, plenty of space, no decoration. It should look like the product it describes.
```

### Step 4: Design system

```text
Step 4: the design system. Use the brand kit from step 3.

Foundations: propose and document
- a spacing scale based on 4 pixels
- corner radii (one for small things like chips, one for cards, one for sheets, fully round for buttons if that suits the typeface)
- border and shadow rules. Prefer thin grey-line borders over shadows; allow one soft shadow for sheets and modals only
- breakpoints for phone (390 wide) and desktop (1440 wide)

Components, each drawn in every state it has:
- Buttons: primary (green), secondary (black outline), text. States: default, hover, pressed, disabled, loading. The loading state swaps the label for a small spinner without changing the button's width
- Amount input with a "USDC" suffix and a "Max" action; text input; date picker field. States: empty, filled, focused, error with message
- Tier chip (Calm, Steady, Bold) and kind badge (Anytime, Goal)
- Selectable tier card: name, level mark, APY today, a one-line plain-English risk note. Default and selected
- Pot card: name, kind badge, tier chip, value, earned. The Goal version adds a progress bar and "Unlocks Mar 1, 2027"
- Stat block: "Total saved" (large) and "Earned so far" (green)
- Progress bar; live-rate dot with label
- Stepper for the new pot flow, with progress dots
- Review list: label and value rows with dividers, and a total row
- Banners: error, caution, and a quiet info banner ("Live rates unavailable")
- Top bar: wordmark, navigation, "Connect wallet" button, and the connected state with the address chip
- Bottom sheet (phone) and modal (desktop)
- Activity row: what happened, the pot, the amount, the date
- Slider and a line chart style for the calculator
- Empty state, loading skeleton, footer

Lay it out as a reference: each component with its name, its states side by side, and a one-line rule for when to use it.
```

### Step 5: Core screens

```text
Step 5: the core screens, built only from the step 4 components. Design each at phone width (390) first, then desktop (1440). Use the sample content.

1. Landing: the Pamọ́ wordmark, the headline "Keep it safe. Your USDC savings earn while they sit.", a "Start saving" button, a four-step "how it works" strip (wallet, Pamo, lending vault, interest back), three cards (Anytime, Goal, Portfolios), a calculator teaser, and a dark footer with "Live on Arc mainnet"
2. Dashboard: Total saved, Earned so far, live APY per tier, the three sample pot cards, "New Anytime Vault" and "New Goal" buttons. Also the empty state: "Nothing saved yet. Start with any amount."
3. New pot flow: choose Anytime or Goal; (Goal only) name, target, unlock date; pick a tier; enter the amount
4. Review your saving: You save, Into, APY today, Vault fees, You receive, Network fee, In 1 year (est.), then the two steps "Allow USDC" and "Save". Include the version with the caution "This vault is low on available cash. Withdrawals may have to wait."
5. Success: the one screen allowed a green background. A check mark and the new balance
6. Pot detail: value, amount put in, earned, tier, vault name, "Add money" and "Withdraw", then the activity list. Show the locked Goal version with withdraw disabled and the reason: "Unlocks when you reach 1,200.00 USDC or on Mar 1, 2027"
7. Review your withdrawal: You withdraw, Shares redeemed, Withdrawal fee, Available now, Left in this pot, then "Withdraw"
8. Portfolios: Calm, Steady and Bold side by side with APY today, a plain-English risk note and a small rate-history line
9. Growth Calculator: starting amount, monthly top-up, months slider, tier; then projected balance, total put in, estimated interest and a curve. Caption: "Estimate at today's rate. Not a promise."

Check every screen against the colour rules before showing it: one green button, text in black, green only for actions and gains.
```

### Step 6: Problem states

```text
Step 6: the states where something is wrong. Show each on the screen where it happens.

- Wrong network: "Pamo runs on Arc" with a "Switch to Arc" button
- Not enough USDC: show the balance and how to get USDC on Arc
- Pending transaction: button spinner and a link to the explorer
- Vault short on cash: "The vault is short on cash right now. Try a smaller amount or try again later."
- Goal locked: withdraw disabled with the reason shown
- Live rates unavailable: a small banner; saving and withdrawing still work
- Wallet request cancelled: "Cancelled. Nothing was moved."

Errors use the error colour, cautions use the caution colour, and every one has words, not only colour.
```

### Step 7: Handoff

```text
Step 7: package it for the build.

1. Design tokens as a Tailwind v4 @theme block: colours with the names below, plus the type scale, spacing, radii and shadow from step 4.
   --color-white, --color-black, --color-green, --color-green-pressed, --color-green-bright, --color-mint, --color-grey-text, --color-grey-text-dark, --color-grey-muted, --color-grey-line, --color-grey-surface, --color-error, --color-error-fill, --color-caution, --color-caution-fill
2. Logo files as SVG: wordmark in black, wordmark in white, compact mark in black, compact mark in white. Convert the text to outlines so the ọ́ cannot break if a font fails to load.
3. Favicon and app icon sizes, and a social share image at 1200 by 630: white background, the wordmark, the tagline "Keep it safe."
4. A one-page summary listing every component, its states and the tokens it uses.

The web app is Next.js with Tailwind CSS and Iconsax icons, so name things the way a developer would import them.
```

---

## 3. Fix-up prompts

Short corrections for the mistakes design tools make most often.

| Problem | Prompt |
|---|---|
| Extra colours appeared | `You used colours outside the brief. Redo this using only the listed colours. List every hex value on the page so I can check.` |
| Too much green | `Green covers too much of this screen. Keep it to the one main button, links and earned amounts. Everything else is black on white.` |
| Looks like a crypto app | `This reads as a crypto trading product. Make it calmer: more white space, fewer boxes, no charts unless the screen is about a chart. It is a savings app.` |
| The ọ́ is wrong | `The wordmark must be "Pamọ́": one letter o carrying both a dot below and an acute accent above. Redraw it and show it large so I can check.` |
| Tiers became colours | `Calm, Steady and Bold must not have their own colours. Use the name plus the three-bar level mark in Pamo green.` |
| Promised returns in the copy | `Remove any wording that promises a return. Rates are "APY today, changes daily" and projections are "estimate, not a promise".` |
| Lorem ipsum or invented data | `Replace all placeholder text with the sample content from the brief.` |
| Too decorated | `Remove every element that does not help someone understand their money: illustrations, background shapes, gradients, shadows on cards.` |
| Dark mode appeared | `There is no dark mode. Only the landing footer may be black. Redo this on white.` |
| Phone layout is cramped | `Redo this at 390 pixels wide first. One column, full-width buttons, amounts large enough to read at arm's length.` |

---

## 4. After each step

| After step | Record it in |
|---|---|
| 1. Typeface chosen | Brand_Design.md §7 and its open-decisions table |
| 2. Logo chosen | Brand_Design.md §6; save the SVGs into the web app's public folder |
| 4. Spacing, radii, type scale | Brand_Design.md §8 token block |
| 7. Handoff | Build Guide checklist: "Tailwind theme tokens" and "Apply the brand to every screen" |
