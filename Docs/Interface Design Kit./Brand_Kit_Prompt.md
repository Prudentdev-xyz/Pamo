# Pamo: Brand Kit Prompts

Prompts for getting Pamo's brand kit, design system and core screens out of Claude Design. Everything already decided is written into the prompts, so the tool fills in what is open and does not reinvent what is settled.

- **Companion docs:** [Brand_Design.md](Brand_Design.md) (the decisions these prompts carry) · [Build_Guide.md](Build_Guide.md) §6 and §7 (screens, copy rules, motion)
- **If a value changes** in Brand_Design.md, change it in the brief below too. The brief is a copy, not the source.
- **Full screens:** §5 has the prompts for the app screens, the logo intro and the landing page. They build on the brief (§1) and the design system from step 4.

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

---

## 5. UI screen prompts

Prompts for the full screens: the app shell, every journey, the logo intro and the landing page. They were written against Brand_Design.md, Build Guide §6 and §7, and the new-pot flow in Architecture §8.2.

### 5.1 References

Five websites and two screenshots were studied for layout and motion. The prompts describe these patterns in words and never name the sites, so the tool builds Pamo's own version and not a copy.

| Reference | What is worth borrowing | What stays out |
|---|---|---|
| arcle.xyz | A phone pinned in the centre while you scroll, with its screen changing per section; headline left, short text and button right; big rounded cards with one huge number each | The lime colour blocks and the chat product |
| ihejierejeremiah.com | A short intro screen before the site, then the page revealed with a curved wipe; smooth scrolling | The percentage counter and the typewriter headline |
| fredyomoke.xyz | Very large, tight headings; the circle-arrow button; the full-screen phone menu with big words (from the screenshot) | The dark page mode |
| rugged-hawk-cxt.modulify.website | A floating pill-shaped nav; the product shown inside a phone, large | Glows, gradients and the wordmark hidden behind the phone |
| jitter.video | Lots of white, one bold headline, one button; a nav that shrinks to two buttons once you scroll | The purple and the template gallery |
| The Orbit dashboard (screenshot) | Sidebar, greeting, small stat cards, one chart card with one highlighted bar, a short list under the nav | Dark theme and the orange |

### 5.2 How to use these

- Work in the same Claude Design project that holds the design system. In a new project, paste the brief from §1 first.
- Paste the UI brief (§5.3), then prompt 1. Approve prompt 1 before sending the rest, because it fixes the navigation and the overall feel.
- Run prompts 2 to 5 one at a time. Each one is a complete journey, so the user flow stays intact.
- The fix-up prompts in §3 still apply.

Why five prompts and not one: one request for every screen gives shallow screens and skipped states, and a wrong direction cannot be corrected early. One prompt per screen lets the screens drift apart and loses the flow between them.

### 5.3 UI brief (paste first)

````text
We are now designing Pamo's full screens. Keep following the brand brief and the design system already in this project: same colours, Be Vietnam Pro, same components, same copy rules, same sample content. Do not design yet; reply with a short summary and any questions.

# WHAT THIS IS
Pamo is a responsive website, opened in a browser on a laptop or in a phone browser. It is not a native iOS or Android app. So: no status bar with a clock and battery, no home indicator, no app-store framing, and no device frame drawn around the screens. Show each screen as a plain browser page at the stated width.

# WHAT I WANT
Screens that feel finished and alive: confident type, generous white space, and motion that explains what just happened. Calm and certain, never flashy.

# ORIGINALITY
I will describe layout and motion patterns I like. Use them as principles only. Do not reproduce any existing website or app: no borrowed layouts pixel for pixel, no borrowed copy, illustrations, icons or colours. Everything must come from Pamo's own design system.

# PATTERNS I LIKE (in words)
- Type: very large, tight headings beside small calm body text. One idea per section.
- Navigation on desktop: a floating pill-shaped bar on the public pages; a left sidebar inside the app.
- Navigation on phones: a full-screen menu on black, white words at heading size stacked down the left, a small plus mark at the right of each row, a close button top right.
- A phone frame pinned in the middle of the page while the visitor scrolls; the screen inside the phone changes to match each section. Heading on the left, two lines of text and one button on the right.
- Big rounded cards that each carry one very large figure and one short line.
- A circle-with-arrow mark inside secondary buttons.
- The nav shrinks to its two main buttons once the page is scrolled.

# LAYOUT
- Two widths of the same website: a phone browser at 390 wide and a desktop browser at 1440. Design the 390 width first. Show both for every screen.
- White backgrounds. Black is for moments only: the phone menu, one landing section, the footer. No dark mode.
- One green button per screen.

# USER FLOW (do not change the order)
Landing -> Connect wallet -> Dashboard -> New pot (choose Anytime or Goal -> Goal only: name, target, unlock date -> pick a tier -> amount -> review -> Allow -> Save -> success) -> Pot detail -> Add money or Withdraw (review first) -> back to Dashboard.
Portfolios and the Growth Calculator are open without a wallet.
Every screen shows where the person is, what the one next action is, and a way back. Going back keeps what was typed.

# MOTION (design room for it and annotate it)
- Timings: 150 ms for hover and press, 250 ms for page and step changes, 600 ms for progress bars and number count-ups.
- Movement uses position and opacity only. Nothing blocks a click. Numbers always end on the exact value.
- With reduced motion on, only opacity changes.
- For each screen, add a short "Motion notes" list: what moves, when, and for how long.

# HONEST DATA
Charts and figures may only show what Pamo really has: pot values, money put in, earned amounts, activity (saves and withdrawals with dates), each tier's live rate, each tier's rate history, and a vault's available cash. No invented history.
````

### 5.4 Prompt 1: app shell and dashboard

````text
Prompt 1: the app shell and the dashboard.

APP SHELL
- Desktop: a left sidebar about 260 wide on white with a grey-line border. Top: the Pamọ́ wordmark. Then nav rows with icon and label: Dashboard, Portfolios, Calculator. Below, a section titled "Your pots" listing each pot by name with its tier level mark; the current pot is highlighted in mint. At the bottom: the wallet address chip with a Disconnect option, and "Arc" as the network.
- Phone: a top bar with the wordmark and a menu button. The menu opens full screen on black with large white words (Dashboard, Portfolios, Calculator, New pot) and the wallet chip at the bottom.
- Show the three guard states inside the shell: wallet not connected ("Connect wallet"), wrong network ("Pamo runs on Arc" with a "Switch to Arc" button), and a slim banner "Live rates unavailable. Saving and withdrawing still work."

DASHBOARD
- A greeting line ("Good morning") with the date beside it. No names; the wallet chip identifies the person.
- Row of three stat cards: Total saved (the biggest figure on the screen), Earned so far (green), and Pots (count, with how many are goals). Each card has one small caption line under the figure.
- A second row of three slim cards: Calm, Steady and Bold with today's APY and "changes daily".
- One chart card: "Put in by month" as bars built from the activity history, the current month in Pamo green and the rest in grey line, with a small value label on the highlighted bar.
- Pot cards: name, kind badge, tier chip, value, earned. Goal pots add the progress bar and "unlocks Mar 1, 2027".
- Recent activity list, five rows, with "See all".
- Actions: "New Anytime Vault" (green) and "New Goal" (outline).
- Empty state for a new wallet: "Nothing saved yet. Start with any amount." with the same two actions.

Deliver: dashboard with pots, dashboard empty, the three guard states, the open phone menu. Phone and desktop for each. Motion notes: stat figures count up, pot cards arrive one after another, progress bars fill.
````

### 5.5 Prompt 2: the saving journey

````text
Prompt 2: creating a pot and saving, as one continuous flow. Use the shell from prompt 1.

Steps, in this order, with a progress indicator and a Back that keeps the values:
1. Choose the kind: Anytime Vault ("Take it out whenever you want") or Goal Vault ("Locked until you reach your target or your date").
2. Goal only: name (up to 64 characters, note that names are public), target amount in USDC, unlock date.
3. Pick a tier: Calm, Steady, Bold as three cards with the level mark, today's APY, one plain line on risk, and the cash available in that vault.
4. Amount: a large amount field with "USDC", the wallet balance and a Max link. Not enough USDC shows the balance and how to get USDC on Arc.
5. Review your saving: rows for You save, Into (tier and vault name), APY today (changes daily), Vault fees, You receive (shares and share price), Network fee, In 1 year (estimate, not a promise). Any warning sits above the button.
6. Two signing steps shown as "Step 1 of 2: Allow Pamo to use your USDC" then "Step 2 of 2: Save". Only one is active at a time. Each has its own pending state with a link to the explorer.
7. Success: the one screen allowed a large green area. A check mark, "Saved", the amount, and "View pot".

Also show: wallet rejected ("Cancelled. Nothing was moved."), deposits paused, and the review while the network fee reads "Available after allowing".

At the phone width the review is a sheet that rises from the bottom of the page; on desktop it is a centred panel. Phone and desktop for every step. Motion notes: steps slide in the direction of travel, the selection outline glides between tier cards, the sheet rises, step 1 ticks off before step 2 wakes, the check mark draws itself and the balance counts up.
````

### 5.6 Prompt 3: the pot journey

````text
Prompt 3: living with a pot. Use the shell from prompt 1.

POT DETAIL
- Header: pot name, kind badge, tier chip. The value as the biggest figure, then "Put in" and "Earned" (green).
- Goal pots: progress bar, "70% of goal", and the lock line "Unlocks when you reach 1,200.00 USDC or on Mar 1, 2027".
- A details block: tier, vault name with an explorer link, APY today (changes daily).
- A small line chart of this tier's rate history, labelled as the rate, not as earnings.
- Activity for this pot: Saved and Withdrew rows with date, amount and an explorer link.
- Actions: "Add money" (green) and "Withdraw" (outline).

ADD MONEY: the amount step and review from prompt 2, reused.

WITHDRAW
- Amount field with "Available now" and Max.
- Review your withdrawal: You withdraw, Shares redeemed, Withdrawal fee, Available now in this vault, Left in this pot, Network fee. One "Withdraw" button.
- Success state with the new pot value.

Also show: a locked goal (Withdraw disabled with the reason beside it), the vault short on cash ("The vault is short on cash right now. Try up to 500.00 USDC." with the button disabled), an empty pot after withdrawing everything, and the backend-down version where activity cannot load.

Phone and desktop for each. Motion notes: value counts from old to new after a transaction, the progress bar springs to the new percentage, errors fade in.
````

### 5.7 Prompt 4: Portfolios and the Growth Calculator

````text
Prompt 4: the two pages that work without a wallet. They use the public floating nav, not the app sidebar, with a "Start saving" button.

PORTFOLIOS
- A short heading and one line: these are USDC lending vaults, never stocks or funds.
- Calm, Steady and Bold side by side on desktop, stacked on phones. Each card: level mark, today's APY with "changes daily", who runs the vault, cash available now, one plain line on risk, a small rate-history line, and "Save in Calm".
- States: rates loading, and "Live rates unavailable right now".

GROWTH CALCULATOR
- Inputs: starting amount, monthly top-up, months as a slider from 1 to 36, and a tier picker.
- Result: projected balance as the biggest figure, then total put in and estimated interest (green), and a growth curve.
- Caption under the result: "Estimate at today's rate. Not a promise."
- One action: "Start this pot".

Phone and desktop for each. Motion notes: the result counts to its new value as inputs change, the curve draws once on first view, a slow pulse on the live-rate dot.
````

### 5.8 Prompt 5: logo intro and landing page

````text
Prompt 5: the logo intro and the landing page.

LOGO INTRO (when the website first loads; it differs by width)

At the phone width (390): a short full-screen intro.
- A full white screen with nothing on it but the wordmark, centred, in black.
- "Pamo" writes in letter by letter, then the dot below and the accent above the last letter settle into place to complete "Pamọ́". A short hold.
- The wordmark then travels up into its place in the nav while the page is revealed beneath with a soft curved wipe.
- About 1.6 seconds in all.
- Deliver it as a storyboard of five frames with timings, plus a playable version.

At the desktop width (1440): no full-screen intro. Nothing covers the page.
- The wordmark animates where it already sits in the nav: "Pamo" appears, then the dot and the accent settle.
- The hero heading rises at the same time. Everything is finished within 1.2 seconds.
- Deliver it as three frames with timings, plus a playable version.

At both widths: it plays once per visit, any tap or key skips it, and with reduced motion on it is a simple fade.

LANDING PAGE
1. Nav: a floating pill bar with the wordmark, How it works, Tiers, Calculator, and "Start saving". After scrolling it shrinks to "Start saving" and a menu button.
2. Hero on white: heading "Keep it safe." at the largest size, the line "Your USDC savings earn while they sit.", a green "Start saving" and an outline "See the tiers", and under them today's live rate, labelled "changes daily".
3. How it works: a phone frame pinned in the centre while the visitor scrolls through four beats. The heading sits left, two lines and one link sit right, and the phone screen changes with each beat: your wallet -> a pot in Pamo -> the lending vault -> interest back in your pot. Use real Pamo screens inside the phone. This is the one place a phone outline is drawn, as an illustration of the site in a phone browser; keep it a plain outline with no status bar.
4. What you can do: three big rounded cards, each with one very large figure or mark and one short line: Anytime Vault, Goal Vault, Pamo Portfolios. This is the one section on black; use bright green for figures there.
5. Calculator teaser on white: an example balance with "Estimate at today's rate. Not a promise." and "Try the calculator".
6. Why trust it: three short facts in plain words. Only you can withdraw. Withdrawals work even when new savings are paused. The contract is public on Arc.
7. The name: one line on the Yoruba "fi pamọ́", "keep it safe".
8. Footer on black: "Live on Arc", the contract address linked to the explorer, a GitHub link.

Phone and desktop. At the phone width the pinned phone becomes four stacked beats. Motion notes: hero lines rise one after another with the button last, the pinned-phone timing per beat, cards rising with a short stagger, the teaser balance counting up when it enters view.
````

### 5.9 Where these prompts differ from the other docs

Each of these is a choice made in the prompts and not yet carried into the other docs. Confirm or change it before the screens are built.

| Difference | In the prompts | In the other docs |
|---|---|---|
| Mockup framing | Plain browser pages, no device frame or status bar | `Pamo Mockups/01-app-screens.png` draws the screens inside a phone with a status bar |
| Dashboard chart | "Put in by month", drawn from the activity the indexer already stores | Not in the v1 dashboard (Build Guide §6, screen 2). Drop that line from prompt 1 to stay on spec |
| Chart on the pot screen | The tier's rate history | The mockup shows "Earned in this pot" over time, which Pamo does not store |
| Dashboard and landing content | A greeting, a pot-count card and a "Why trust it" landing section; buttons "New Anytime Vault" and "New Goal" | The mockup has "Add money" and "New pot"; the guide has no greeting, pot count or trust section |
| Black areas | The phone menu, one landing section and the footer | Brand_Design.md §3 names a dark footer or one dark landing section; the fix-up prompt in §3 says only the footer |
