# Pamo: Brand Design

The colours, logo and type rules for Pamo, and how to use them. Every screen, the logo and any pitch material build from the values here.

- **Companion docs:** [Build_Guide.md](Build_Guide.md) §6 (screens and copy rules) · [Specification.md](Specification.md) (what we build) · [Brand_Kit_Prompt.md](Brand_Kit_Prompt.md) (prompts for generating the brand kit and design system)
- **Status:** colours confirmed Oct 7, 2026. Typeface and logo artwork are still open (§8).

---

## 1. The brand in one line

- **Name:** plain **Pamo** everywhere. Only the logo carries the tone marks: **Pamọ́**.
- **Tagline:** *Keep it safe.* From the Yoruba *fi pamọ́*, "keep it safe".
- **Feel:** calm, trustworthy, plain-spoken. Money apps earn trust by being boring in the right places.

---

## 2. Colours

### Brand colours

White comes first. It is the colour you see most; green is the colour you remember.

| Colour | Hex | Share of a screen | Used for |
|---|---|---|---|
| **White** | `#FFFFFF` | About 60 to 70% | Page and card backgrounds |
| **Black** | `#0A0A0A` | About 20 to 30% | Text, numbers, the logo, dark sections |
| **Pamo green** | `#0B7A4B` | About 10% | Buttons, links, progress, earned amounts |

### Helpers

These are not extra brand colours. They exist so the three above work in every situation.

| Helper | Hex | Used for |
|---|---|---|
| **Bright green** | `#3DDC84` | Green text and marks on black only. Never on white |
| **Mint** | `#E6F4EC` | Soft fills behind green text: chips, success notes, selected rows |
| **Green pressed** | `#096640` | Hover and pressed state of a green button |
| **Grey text** | `#5A655E` | Secondary text and captions on white |
| **Grey text on black** | `#A3ADA6` | Secondary text in dark sections |
| **Grey muted** | `#8A948D` | Placeholder and disabled text only |
| **Grey line** | `#DCE2DD` | Borders, dividers, the empty part of a progress bar |
| **Grey surface** | `#F5F7F5` | Page background behind white cards, when cards need to lift |

### Status colours

Used only to report a problem or a caution. They never decorate.

| Status | Text | Fill | Used for |
|---|---|---|---|
| **Error** | `#B3261E` | `#FCEBE9` | Failed transaction, invalid amount |
| **Caution** | `#8A5A00` | `#FFF4DC` | Vault short on cash, deposits paused, a locked Goal pot |

Good news needs no status colour: success is Pamo green on mint.

---

## 3. Usage rules

1. **White is the default background.** A screen with no reason to be dark is white.
2. **Text is black.** Green text is only for links and earned amounts.
3. **One green button per screen.** It is the main action. Other buttons are black outline or plain text.
4. **Green means "act" or "gain".** Do not use it for headings, icons with no action, or decoration.
5. **No large green backgrounds.** Green stays small so it keeps its meaning. The one exception is a success screen after a save.
6. **Black backgrounds are moments, not a mode.** A dark footer or one dark landing section is fine. v1 has no dark mode.
7. **On black, switch greens.** Buttons stay Pamo green with white labels. Green text and marks use bright green.
8. **Never rely on colour alone.** Every state also has a word or an icon: "Earned", "Locked", "Failed".
9. **Amounts use tabular figures** so digits line up, and always show **USDC**.

---

## 4. Contrast

Checked against WCAG: text needs 4.5 or more, shapes next to each other need 3 or more.

| Pair | Ratio | Result |
|---|---|---|
| Black text on white | 19.8 | Pass |
| White text on Pamo green (buttons) | 5.4 | Pass |
| Pamo green text on white | 5.4 | Pass |
| Pamo green text on mint | 4.8 | Pass |
| Pamo green text on grey surface | 5.0 | Pass |
| White text on green pressed | 7.0 | Pass |
| Bright green text on black | 11.1 | Pass |
| Pamo green shape next to black | 3.7 | Pass |
| Grey text on white | 6.1 | Pass |
| Grey text on grey surface | 5.6 | Pass |
| Grey text on black (dark sections) | 8.6 | Pass |
| Error text on white / on its fill | 6.5 / 5.7 | Pass |
| Caution text on white / on its fill | 5.9 / 5.4 | Pass |
| Grey muted on white | 3.1 | Placeholder and disabled only |
| Pamo green text on black | 3.7 | Fail: use bright green |
| Bright green text on white | 1.8 | Fail: never use |

---

## 5. Tiers

Calm, Steady and Bold are **not** three different colours. Each tier shows its name plus a level mark: three small bars, with one, two or three filled in Pamo green and the rest in grey line.

| Tier | Level mark |
|---|---|
| **Calm** | 1 of 3 bars filled |
| **Steady** | 2 of 3 bars filled |
| **Bold** | 3 of 3 bars filled |

The tier chip is the name and the mark on a mint fill. The name is always shown, so the tier is readable without the mark.

---

## 6. Logo

- **Wordmark:** **Pamọ́**, plain black text on white, no background block. This is confirmed.
- **On black:** the same wordmark in white.
- **Never** set the wordmark in green, place it on a photo, or put it in a coloured box.
- **Clear space:** keep at least the height of the letter "a" free on every side.
- **Motion:** on the landing page, "Pamo" fades in and the tone marks settle into place (Build Guide §7.3).

---

## 7. Type

- One clean sans for everything. Inter is the placeholder until the typeface is chosen (§8).
- The typeface must draw **ọ́** correctly (the dot below and the acute accent together) for the wordmark.
- Tabular figures for every amount.
- Weights: regular for body, semibold for buttons and labels, bold for headings and big balances.

---

## 8. Tailwind tokens

Defined once in the web app's global CSS and used everywhere. No screen writes a hex value directly. This is Tailwind v4 `@theme` syntax.

```css
@theme {
  --color-white: #FFFFFF;
  --color-black: #0A0A0A;

  --color-green: #0B7A4B;
  --color-green-pressed: #096640;
  --color-green-bright: #3DDC84;
  --color-mint: #E6F4EC;

  --color-grey-text: #5A655E;
  --color-grey-text-dark: #A3ADA6;
  --color-grey-muted: #8A948D;
  --color-grey-line: #DCE2DD;
  --color-grey-surface: #F5F7F5;

  --color-error: #B3261E;
  --color-error-fill: #FCEBE9;
  --color-caution: #8A5A00;
  --color-caution-fill: #FFF4DC;
}
```

This gives classes like `bg-green`, `text-grey-text`, `border-grey-line` and `bg-mint`.

---

## 9. Open decisions

| Decision | Recommendation | Status |
|---|---|---|
| Brand colours | White, black, Pamo green `#0B7A4B` | ✅ Confirmed |
| White as the first colour | White dominant, green as the accent | ✅ Confirmed |
| Typeface | One sans that draws ọ́ well; Inter as placeholder | Open |
| Logo artwork | Wordmark only, black on white | Spelling confirmed, artwork open |
| Tier level mark | Three bars, 1 to 3 filled | Recommended, not confirmed |
| Status colours | Error `#B3261E`, caution `#8A5A00` | Recommended, not confirmed |
| Dark mode | Not in v1 | Recommended, not confirmed |
