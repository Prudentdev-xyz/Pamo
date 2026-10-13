# Pamo: PR Graphics Prompts

Prompts for making Pamo's PR graphics: carousels, single fliers, story and banner sizes. Two routes are covered. **Claude Design** builds the finished graphic with the real brand and exact text. An **image generator** makes the photo-style visuals that sit inside or beside it.

- **Companion docs:** [Brand_Design.md](Brand_Design.md) (colours, logo, type) · [Brand_Kit_Prompt.md](Brand_Kit_Prompt.md) (the product brief these prompts build on) · [Specification.md](Specification.md) §7 (product rules the copy must keep)
- **If a value changes** in Brand_Design.md, change it in the PR brief below too. The brief is a copy, not the source.

---

## How to use this

1. **Text-led graphics (most of them): use Claude Design.** Open the existing Pamo project, so the brand kit and design system are already there. Paste **the PR brief** (§2) first, then one piece prompt at a time from §3 or §4.
2. **Photo-style visuals: use an image generator.** Paste **the style block** (§6.1) plus one subject from §6.2. Bring the image into Claude Design or Canva and add the text and the logo there.
3. **Never ask an image generator to draw the logo.** It will get the "ọ́" wrong. Leave a clear white area and place the real file from `Brand Kit & Design/Pamo Logos/export/brand-assets/logo/` (black on white, or white on black).
4. Run the **check before posting** (§8) on every piece.

Which route for which job:

| Job | Route |
|---|---|
| Carousel, quote card, flier with more than a few words | Claude Design |
| A picture of an object (a pot, a key) for a cover or a background | Image generator, then add text in Claude Design |
| A whole flier in one go, to try ideas fast | Image generator with the full-flier prompts (§6.3), then swap in the real logo |

---

## 1. What PR copy can and cannot say

Every line in the prompts below comes from this list. Keep new copy inside it.

**True today, say it plainly**

- Only the owner of a pot can withdraw from it. Money leaves a pot one way: to the wallet that owns it.
- Pamo's admin cannot withdraw, move or freeze anyone's savings.
- If new deposits are ever paused, withdrawals still work.
- Nothing moves until the user approves it in their own wallet, after a review screen showing the amount, the rate today and the fees.
- Savings earn because they are lent out through a USDC lending vault. The vaults are run by curator firms, not by Pamo.
- Rates are live and change daily.
- A Goal pot stays locked until its target or its date is reached. There is no early break.

**Say with care**

- **Risk.** Self-custody decides who can move the money. It does not remove lending risk, and a vault can be short on cash for a while. At least one piece in every batch should say this.
- **Rates.** A rate in a picture goes stale. Leave rates out of evergreen graphics. If one is shown, write it as "4.48% APY today, changes daily" and replace the sample figure with the live one on the day of posting.
- **Arc.** Describe Pamo by what it does. Arc appears once, small, on the last slide or the footer line: "Currently on Arc." Nothing about other chains beyond "More chains planned."

**Never**

- "Guaranteed", "risk-free", "safe returns", "you will earn".
- Stocks, funds or "investing": the tiers are USDC lending vaults.
- The name of any other savings or finance app.
- "Now live", a contract link or "verified" before that is true. Use the `[STATUS]` and `[LINK]` slots and fill them on the day.

---

## 2. The PR brief (paste first, every new Claude Design chat)

````text
You are the brand designer for Pamo, making social and PR graphics. I will ask for one piece at a time. Read this brief first and follow it in every piece. Do not design anything yet; reply with a short summary and any questions.

# WHAT PAMO IS

Pamo is a save-and-earn app. People save USDC (a digital dollar) into "pots". Each pot's money is lent out through a USDC lending vault, so it earns interest while it sits. Only the owner of a pot can withdraw from it.

- Name: plain "Pamo" in all text. Only the logo carries the tone marks: "Pamọ́".
- From the Yoruba "fi pamọ́", meaning "keep it safe". Tagline: "Keep it safe."
- Audience: ordinary people who hold USDC and find DeFi confusing. Many are in Nigeria and across Africa. They see this on a phone, in a feed, for two seconds.
- Feel: calm, trustworthy, plain-spoken. A careful savings product, not a trading app and not a crypto project.

# USE WHAT THIS PROJECT ALREADY HAS

The Pamo brand kit and design system are in this project. Use their tokens, type scale and components exactly. Do not redraw the logo; use the existing wordmark.

# COLOURS (decided, do not change or add to)

- White #FFFFFF: the background of almost every graphic
- Black #0A0A0A: all headlines and body text, the logo
- Pamo green #0B7A4B: small and meaningful only: a button, a progress bar, an earned amount, one underlined key word
- Bright green #3DDC84: green text and marks on black only
- Mint #E6F4EC: soft fill behind a chip or a note
- Grey text #5A655E, grey line #DCE2DD, grey surface #F5F7F5
- Caution: text #8A5A00 on fill #FFF4DC, only for an honest risk note

# TYPE

Be Vietnam Pro only. Bold for headlines, semibold for labels, regular for body. Tabular figures for every amount.

# THE PR LOOK

- White first. Very large black headline, set tight, left-aligned, with a lot of empty space.
- A faint dotted grid in grey line may sit behind the content, as in the existing social mockups.
- The product is the illustration. Where a graphic needs a picture, use a real Pamo component from the design system: a pot card, a Goal progress bar, a tier chip with its level mark, a review sheet row, a disabled Withdraw button with its unlock note, the wallet address chip. Draw them crisp and at a readable size.
- One idea per graphic. A headline of 2 to 7 words, one supporting line of up to 20 words.
- One black graphic per carousel at most, used for the strongest line. On black, text is white and the accent is bright green.
- No large green backgrounds.
- The wordmark sits bottom right in black on white, or white on black, with clear space around it. Never green, never in a box, never on a photo.
- Every carousel slide has a small page mark bottom left, like "2 / 7", in grey text.

# COPY RULES

- Use the copy I give you word for word. Do not add claims, numbers or badges.
- Amounts show the unit: "120.50 USDC".
- A rate is always written "4.48% APY today, changes daily". Never a promised number.
- Never write "guaranteed", "risk-free", "safe returns" or "you will earn".
- Never name another savings or finance app.
- Text in square brackets, like [LINK] or [STATUS], is a slot. Keep it visible as a slot; I fill it later.

# SAMPLE CONTENT (when a component needs data)

- Pots: "Rent" (Goal, Steady, 840.00 of 1,200.00 USDC, unlocks Mar 1, 2027, earned 12.48 USDC), "Emergency fund" (Anytime, Calm, 2,310.75 USDC, earned 31.02 USDC), "New laptop" (Goal, Bold, 150.00 of 900.00 USDC, unlocks Dec 20, 2026, earned 0.94 USDC)
- Wallet address chip: 0x71C4…9A3f
- These are example figures.

# SIZES

- Carousel slide and feed flier: 1080 × 1350
- Square: 1080 × 1080
- Story: 1080 × 1920, with the top 250 px and bottom 340 px kept free of text
- Wide post: 1600 × 900
- Profile banner: 1500 × 500, with the left 400 px kept free for the profile picture

Keep all text at least 96 px from every edge. Make each slide its own frame, named in order (01, 02, 03), ready to export as PNG.

# NEVER

- No gradients, glows, glass or shadows on type.
- No purple or blue.
- No crypto clichés: coins, rockets, charts going up, robots, neon, vault doors.
- No stock illustrations of people, no 3D blobs, no emoji.
- No decoration that does not help someone understand their money.
````

---

## 3. Carousel prompts (Claude Design)

Each one is a full prompt. Paste it after the brief.

### C1. Self-custody: who can move your savings?

````text
Make a carousel of 8 slides at 1080 × 1350. Follow the PR brief. Use this copy word for word.

01 (cover)
Headline: Who can move your savings?
Line: On Pamo, one person. You.
Visual: the wallet address chip "0x71C4…9A3f" with a small key icon beside it.

02
Headline: Only you can withdraw.
Line: Every pot belongs to one wallet. Money leaves a pot one way: to the wallet that owns it.
Visual: the "Emergency fund" pot card, with a thin line from it to the wallet address chip.

03
Headline: Pamo can't.
Line: Nobody at Pamo can withdraw, move or freeze your savings. That is written into the contract, not into a promise.
Visual: three plain rows, each with a small crossed-circle icon: "Withdraw your savings", "Move your savings", "Freeze your savings".

04
Headline: You sign every move.
Line: Nothing happens until you approve it in your own wallet. You see the amount, the rate today and the fees first.
Visual: a review sheet with three rows and one green "Save" button.

05
Headline: A pause never locks you in.
Line: If new deposits are ever paused, withdrawals keep working.
Visual: two rows. "New deposits: Paused" in a caution chip. "Withdrawals: Open" in a mint chip.

06 (the black slide)
Headline: Don't take our word. Check.
Line: The contract is public. Anyone can read what it can and cannot do.
Small line in bright green: [LINK]

07
Headline: What self-custody does not do.
Line: It does not remove risk. Your USDC earns by being lent through a lending vault. Rates change daily, and a vault can be short on cash for a while.
Visual: none. Set the line in a caution note.

08 (close)
Headline: Keep it safe.
Line: Start with any amount.
Button shape in green: Start saving
Small grey line at the bottom: Currently on Arc. [LINK]

Slides 02 to 05 share one layout so the set reads as a series. Show all 8 side by side when done.
````

### C1-X. Self-custody, for an X post (4 images)

X shows at most four images in one post, in a two-by-two grid of wide tiles. This is C1 cut to four wide slides.

````text
On a new page in this project, make a set of 4 images at 1600 × 900 for one X post. Follow the PR brief. Use this copy word for word.

They will be seen first as small tiles in a two-by-two grid, so on every image: one very large headline, at most one short line under it, and everything important kept inside the middle 80% of the canvas. Put the page mark "1 / 4" to "4 / 4" bottom left and the wordmark bottom right.

01
Headline: Who can move your savings?
Line: On Pamo, one person. You.
Visual: the wallet address chip "0x71C4…9A3f" with a small key icon beside it, on the right.

02
Headline: Only you can withdraw.
Line: Nobody at Pamo can do any of these. It is written into the contract.
Visual, on the right: three plain rows, each with a small crossed-circle icon: "Withdraw your savings", "Move your savings", "Freeze your savings".

03
Headline: You sign every move.
Line: You see the amount, the rate today and the fees first. And if new deposits are ever paused, withdrawals keep working.
Visual, on the right: a review sheet with three rows and one green "Save" button.

04 (the black image)
Headline: Keep it safe.
Line: Self-custody decides who can move your money. It does not remove lending risk, and rates change daily.
Button shape in green: Start saving
Small line in grey text on black: Currently on Arc. [LINK]

All four share one layout: headline and line on the left, visual on the right. Show the four together in a two-by-two grid when done, so I can see how the post will look.
````

### C2. What is Pamo? (the plain introduction)

````text
Make a carousel of 6 slides at 1080 × 1350. Follow the PR brief. Use this copy word for word.

01 (cover)
Headline: Your USDC is sitting still.
Line: It could be earning while it waits.

02
Headline: Save in pots.
Line: One pot for rent. One for emergencies. One for the new laptop.
Visual: the three sample pot cards, stacked.

03
Headline: Earn while they sit.
Line: Each pot's USDC is lent out through a lending vault, so it earns interest. The rate is live and changes daily.
Visual: the "Emergency fund" card with "Earned 31.02 USDC" in green.

04
Headline: See it before you sign it.
Line: Every save and every withdrawal shows a review first. No surprises.
Visual: a review sheet.

05 (the black slide)
Headline: Only you can withdraw.
Line: Pamo cannot move your savings. Not ever.

06 (close)
Headline: Keep it safe.
Line: Pamo. Savings that earn while they sit.
Button shape in green: Start saving
Small grey line: Currently on Arc. [LINK]
````

### C3. Anytime or Goal: two kinds of pot

````text
Make a carousel of 6 slides at 1080 × 1350. Follow the PR brief. Use this copy word for word.

01 (cover)
Headline: Two ways to save.
Line: One you can reach any time. One you can't, until you get there.

02
Label chip: Anytime Vault
Headline: In and out, whenever.
Line: Add money or take it out any day. It earns for as long as it stays.
Visual: the "Emergency fund" pot card.

03
Label chip: Goal Vault
Headline: Locked until the goal.
Line: Set a target and a date. The pot opens when you reach either one.
Visual: the "Rent" pot card with its progress bar at 840.00 of 1,200.00 USDC.

04
Headline: Locked means locked.
Line: No early break. Not for Pamo, and not for you. That is the point.
Visual: a disabled Withdraw button with the note "Unlocks when you reach 1,200.00 USDC or on Mar 1, 2027".

05
Headline: Both earn. Both are yours.
Line: Whichever you pick, only your wallet can withdraw from it.

06 (close)
Headline: What are you saving for?
Button shape in green: Start saving
Small grey line: Currently on Arc. [LINK]
````

### C4. Calm, Steady, Bold

````text
Make a carousel of 6 slides at 1080 × 1350. Follow the PR brief. Use this copy word for word. Show no rates anywhere in this set.

01 (cover)
Headline: Calm, Steady or Bold.
Line: You choose how your savings earn.
Visual: the three tier chips in a row, each with its level mark (1, 2 and 3 bars filled).

02
Headline: A tier is a lending vault.
Line: Your USDC is lent to borrowers and earns interest. The tier decides which vault it goes into. Not stocks. Not funds.

03
Tier chip: Calm
Headline: The quiet one.
Line: The most careful of the three. Usually the lowest rate.

04
Tier chip: Steady
Headline: The middle road.
Line: A balance between care and rate.

05
Tier chip: Bold
Headline: The reach.
Line: Takes more risk for a higher rate. Read the risk note before you pick it.

06 (close)
Headline: Compare them live.
Line: Rate today, who runs each vault and the cash available, all on one page. No wallet needed.
Button shape in green: See the portfolios
Small grey line: Rates change daily. Currently on Arc. [LINK]
````

### C5. Where does the interest come from?

````text
Make a carousel of 6 slides at 1080 × 1350. Follow the PR brief. Use this copy word for word.

01 (cover)
Headline: Where does the interest come from?
Line: A fair question. Here is the whole answer.

02
Headline: 1. You save USDC into a pot.
Visual: a pot card.

03
Headline: 2. The pot puts it in a lending vault.
Line: The vault is run by a specialist firm, not by Pamo.

04
Headline: 3. Borrowers pay interest.
Line: That interest makes your pot worth more, a little at a time.
Visual: "Earned 12.48 USDC" in green.

05 (the black slide)
Headline: So the rate moves.
Line: It follows real borrowing, so it changes daily. Pamo shows today's rate, even when it is low. No made-up numbers.

06 (close)
Headline: Honest numbers.
Line: And only you can withdraw.
Button shape in green: Start saving
Small grey line: Currently on Arc. [LINK]

Slides 02 to 04 are one sequence: join them with a thin vertical line and numbered dots so the eye follows the three steps.
````

### C6. The name

````text
Make a carousel of 4 slides at 1080 × 1350. Follow the PR brief. Use this copy word for word. This set is almost only type.

01 (cover, the black slide)
Headline: Fi pamọ́.
Line: Yoruba. "Keep it safe."

02
Headline: It is what you say when you hand someone something that matters.
Line: Keep this for me. Keep it safe.

03
Headline: We built a savings app around that sentence.
Line: With one change. You don't hand it to anyone. You keep it yourself.

04 (close)
The wordmark, large and centred.
Line under it: Keep it safe.
Small grey line: [LINK]

Make sure "ọ́" in the headline is drawn correctly: a dot below and an acute accent above, both on the same o.
````

### C7. Self-custody, your side of it

````text
Make a carousel of 6 slides at 1080 × 1350. Follow the PR brief. Use this copy word for word.

01 (cover)
Headline: Self-custody, in plain words.
Line: What it gives you, and what it asks of you.

02
Headline: It means you hold the key.
Line: Your savings answer to your wallet and to nothing else.

03
Headline: What it gives you.
Three rows with a small tick icon: "Nobody can freeze your savings." / "Nobody can spend them for you." / "You don't need anyone's permission to withdraw."

04
Headline: What it asks of you.
Three rows with a small dot icon: "Look after your wallet." / "Keep its recovery phrase private and offline." / "Read the review screen before you sign."

05
Headline: The honest part.
Line: If you lose access to your wallet, Pamo cannot get it back for you. Nobody can.
Set the line in a caution note.

06 (close)
Headline: Your savings. Your key.
Button shape in green: Start saving
Small grey line: Currently on Arc. [LINK]
````

---

## 4. Flier prompts (Claude Design)

Single graphics. Each prompt asks for three sizes so one idea covers the feed, a story and a wide post.

### F1. Only you can withdraw

````text
Make one flier in three sizes: 1080 × 1350, 1080 × 1920 and 1600 × 900. Follow the PR brief.

Headline, very large: Only you can withdraw.
Line: Pamo cannot move your savings. It is written into the contract.
Visual: the wallet address chip "0x71C4…9A3f" with a small key icon, placed low on the canvas.
Wordmark bottom right. Small grey line bottom left: [LINK]
````

### F2. The three can'ts

````text
Make one flier in three sizes: 1080 × 1350, 1080 × 1920 and 1600 × 900. Follow the PR brief. Black background for this one.

Small label in bright green: What Pamo can't do
Three large white lines, stacked:
Withdraw your savings.
Move your savings.
Freeze your savings.
Line in grey text on black: Only your wallet can.
Wordmark bottom right in white.
````

### F3. Save in pots

````text
Make one flier in three sizes: 1080 × 1350, 1080 × 1920 and 1600 × 900. Follow the PR brief.

Headline: Save in pots. Earn while they sit.
Visual: the three sample pot cards (Rent, Emergency fund, New laptop), slightly overlapped, each showing its earned amount in green.
Wordmark bottom right. Small grey line bottom left: [LINK]
````

### F4. Goal pot

````text
Make one flier in three sizes: 1080 × 1350, 1080 × 1920 and 1600 × 900. Follow the PR brief.

Headline: Locked until the goal. Even from you.
Line: Set a target and a date. Your pot opens when you reach either one.
Visual: the "Rent" Goal card with its progress bar at 840.00 of 1,200.00 USDC, and under it a disabled Withdraw button with the note "Unlocks when you reach 1,200.00 USDC or on Mar 1, 2027".
Wordmark bottom right.
````

### F5. Honest numbers

````text
Make one flier in three sizes: 1080 × 1350, 1080 × 1920 and 1600 × 900. Follow the PR brief.

Headline: A rate you can check. Not a promise.
Line: Pamo shows today's rate, live. It changes daily, and we show it even when it is low.
Visual: one tier row: the Steady chip, then "[RATE]% APY today, changes daily".
Wordmark bottom right.
````

### F6. See it before you sign it

````text
Make one flier in three sizes: 1080 × 1350, 1080 × 1920 and 1600 × 900. Follow the PR brief.

Headline: See it before you sign it.
Line: Every save and every withdrawal shows a review first: the amount, the rate today, the fees.
Visual: a review sheet with those rows and one green "Save" button.
Wordmark bottom right.
````

### F7. Growth Calculator

````text
Make one flier in three sizes: 1080 × 1350, 1080 × 1920 and 1600 × 900. Follow the PR brief.

Headline: Try it before you save a cent.
Line: The Growth Calculator shows what your savings could grow to at today's rate. No wallet needed.
Visual: a simple calculator card: starting amount 200.00 USDC, monthly 50.00 USDC, 12 months, and a plain curve in green. Under it, in grey text: "Estimate at today's rate. Not a promise."
Button shape in green: Open the calculator
Wordmark bottom right.
````

### F8. Launch or status card

````text
Make one flier in three sizes: 1080 × 1350, 1080 × 1920 and 1600 × 900. Follow the PR brief.

Small chip top left, mint fill, green text: [STATUS]
The wordmark, very large, in black on white.
Line under it: Keep it safe. Your USDC savings earn while they sit.
Small grey line at the bottom: Currently on Arc. [LINK]
````

### F9. Statement cards (a batch of eight)

````text
Make eight square cards at 1080 × 1080. Follow the PR brief. Each card is one statement in very large black type on white, the wordmark bottom right and nothing else. Make card 4 the black one.

1. Your savings. Your key.
2. Idle USDC earns nothing.
3. No admin key to your money.
4. Don't trust us. Check the contract.
5. Boring in the right places.
6. Start with any amount.
7. Today's rate, even when it is low.
8. Keep it safe.

Keep the type size and position the same on all eight so they work as a set.
````

### F10. Profile banner and link preview

````text
Make two graphics. Follow the PR brief.

A. Profile banner, 1500 × 500. White. The wordmark at the right. To its left, in black: "Keep it safe." Keep the left 400 px empty.

B. Link preview, 1200 × 630. White. Headline in black: "Savings that earn while they sit." Line in grey text: "Only you can withdraw." Wordmark bottom right.
````

---

## 5. Fix-up prompts (Claude Design)

Use these when a result is close but off.

````text
Too much green. Green is only for a button, a progress bar, an earned amount or one key word. Make everything else black on white.
````

````text
You changed my copy. Put the text back exactly as I wrote it, and remove anything you added.
````

````text
The headline is too small. Make it the largest thing on the canvas by a wide margin, and cut the supporting line's size so there is one clear order to read in.
````

````text
The component is too small to read on a phone. Scale it up until its smallest text is at least 28 px at this canvas size.
````

````text
The set does not look like one series. Use the same margins, headline position, type sizes and page mark on every slide.
````

````text
The wordmark is wrong. Use the existing Pamo wordmark from this project, black on white or white on black, with clear space around it. Do not retype or redraw it.
````

---

## 6. Image generator prompts

For Midjourney, an image model in a chat app, or Canva's image tool. These make pictures of objects. They do not make the logo.

### 6.1 The style block (paste before every subject)

````text
Minimal editorial still-life photograph for a calm savings brand. Pure white seamless background (#FFFFFF), soft even daylight from the upper left, one gentle natural shadow. Objects are matte black or unglazed natural clay. A single small accent in deep green (#0B7A4B), used once. Clean, quiet, a lot of empty white space, the subject placed in the lower third so the upper two thirds are empty for a headline to be added later. Sharp focus, real materials, real proportions. No text, no letters, no numbers, no logos, no people, no hands, no coins, no banknotes, no charts, no neon, no gradients, no glow, no purple, no blue, no 3D render look.
````

Add the size at the end: `aspect ratio 4:5` for the feed, `9:16` for a story, `16:9` for a wide post, `1:1` for a square.

### 6.2 Subjects

| # | Use it for | Subject prompt |
|---|---|---|
| 1 | Self-custody | `A single plain metal key lying on the white surface, matte black, with a short deep green cord tied through it.` |
| 2 | Self-custody | `A small lidded clay pot with a simple matte black padlock resting open beside it and one key next to the padlock.` |
| 3 | Only you can withdraw | `One lidded clay pot, closed, seen straight on. A single key stands upright leaning against it. The lid has a thin deep green band.` |
| 4 | Save in pots | `Three lidded clay pots of the same shape in a row, evenly spaced, seen straight on. The middle pot has a thin deep green band around its lid.` |
| 5 | Calm, Steady, Bold | `Three clay pots in a row, small, medium and large, from left to right, seen straight on. Each has a thin deep green band around its rim.` |
| 6 | Goal pot | `A clay pot tied shut with a deep green cord, a plain paper tag hanging from the cord, blank.` |
| 7 | Goal reached | `A clay pot with its lid lifted off and set beside it, the deep green cord untied and lying loose on the surface.` |
| 8 | Earn while it sits | `A clay pot on a plain white ledge in still morning light, with a long soft shadow. A small deep green cloth is folded beside it. Nothing moves.` |
| 9 | The name | `A small clay pot wrapped in plain undyed cloth and tied with a deep green cord, as if packed carefully to be kept.` |
| 10 | Black "moment" slide | `Same scene but on a matte black seamless background (#0A0A0A): a single clay pot lit softly from the upper left, with a thin bright green (#3DDC84) cord around its lid. Lower third placement, the rest empty black.` |
| 11 | Texture background | `Extreme close-up of unglazed clay surface, pale and fine-grained, almost white, very low contrast, evenly lit, so black text stays readable on top.` |
| 12 | Review before you sign | `A plain white paper receipt lying flat with a matte black pen beside it. The paper is blank. A thin deep green ribbon marks one edge.` |

### 6.3 Full-flier prompts (text included)

For image models that draw text well. Check every word in the result; regenerate if a letter is wrong. The bottom-right corner is left empty on purpose, for the real logo.

````text
A minimalist social media poster, aspect ratio 4:5. Pure white background. At the top left, very large bold black sans-serif text in a clean geometric typeface, left-aligned, on two lines: "Only you can" / "withdraw." Below it, small grey text: "Pamo cannot move your savings." In the lower third, a photograph of a single lidded clay pot with a matte black key leaning against it and a thin deep green (#0B7A4B) band on the lid, soft daylight, gentle shadow. The bottom right corner is empty white space. No other text, no logo, no people, no coins, no gradients, no purple, no blue.
````

````text
A minimalist social media poster, aspect ratio 4:5. Pure white background. At the top left, very large bold black sans-serif text in a clean geometric typeface, left-aligned, on three lines: "Save in pots." / "Earn while" / "they sit." In the lower third, a photograph of three lidded clay pots in a row, the middle one with a thin deep green (#0B7A4B) band on its lid, soft daylight, gentle shadows. The bottom right corner is empty white space. No other text, no logo, no people, no coins, no gradients, no purple, no blue.
````

````text
A minimalist social media poster, aspect ratio 4:5. Matte black background (#0A0A0A). At the top left, very large bold white sans-serif text in a clean geometric typeface, left-aligned, on three lines: "Withdraw." / "Move." / "Freeze." Below it, smaller bright green (#3DDC84) text: "Pamo can't. Only your wallet can." In the lower third, a single matte black key lit softly so its edge catches the light. The bottom right corner is empty black space. No other text, no logo, no people, no coins, no gradients, no purple, no blue.
````

````text
A minimalist social media poster, aspect ratio 4:5. Pure white background. At the top left, very large bold black sans-serif text in a clean geometric typeface, left-aligned, on two lines: "Locked until" / "the goal." Below it, small grey text: "Even from you." In the lower third, a photograph of a clay pot tied shut with a deep green (#0B7A4B) cord and a blank paper tag, soft daylight, gentle shadow. The bottom right corner is empty white space. No other text, no logo, no people, no coins, no gradients, no purple, no blue.
````

### 6.4 Fix-ups

- **It added text or a logo:** add `absolutely no text, letters, numbers or logos anywhere in the image` at the start of the prompt.
- **It looks like a 3D render:** add `shot on a real camera, 85mm lens, natural material imperfections`.
- **Too much green:** add `the green is one thin band only, less than 2% of the image`.
- **The subject fills the frame:** add `the subject is small, lower third only, at least 60% of the image is empty background`.

---

## 7. Captions

Short text to post with each piece. Replace `[LINK]` on the day.

| Piece | Caption |
|---|---|
| C1 | Who can move your savings on Pamo? One wallet: yours. Here is exactly what that means, including what it does not protect you from. [LINK] |
| C2 | Idle USDC earns nothing. Pamo lets you save it in pots that earn while they sit, and only you can withdraw. [LINK] |
| C3 | One pot you can reach any day. One that stays shut until you hit your goal. Both earn. [LINK] |
| C4 | Calm, Steady or Bold: three USDC lending vaults, compared live, in plain words. Rates change daily. [LINK] |
| C5 | "Where does the interest come from?" Borrowers. Here is the whole path, in three steps. [LINK] |
| C6 | Fi pamọ́. Keep it safe. That is where the name comes from. [LINK] |
| C7 | Self-custody gives you a lot and asks a little. Both halves, in plain words. [LINK] |
| F1, F2 | Pamo cannot withdraw, move or freeze your savings. Only your wallet can. [LINK] |
| F4 | A Goal pot stays locked until you reach the target or the date. No early break, for anyone. [LINK] |
| F5 | We show today's rate, live. Not a promise, and never a made-up number. [LINK] |
| F7 | See what your savings could grow to at today's rate. No wallet needed. It is an estimate, not a promise. [LINK] |

---

## 8. Check before posting

- [ ] The copy matches §1. No "guaranteed", "risk-free", "safe returns" or "you will earn".
- [ ] Any rate shown is today's live rate, written "% APY today, changes daily".
- [ ] `[STATUS]` and `[LINK]` are filled with what is true today.
- [ ] Any "check the contract" line links to a contract that is public and can be read.
- [ ] The wordmark is the real file, black on white or white on black, and "ọ́" is correct.
- [ ] Green is small. No large green background.
- [ ] Arc appears at most once, small, at the end.
- [ ] No other app is named. No people, coins, rockets or charts going up.
- [ ] The headline reads at phone size with the image held at arm's length.
