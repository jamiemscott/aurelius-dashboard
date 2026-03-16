# OutSystems UI → Aurelius Token Bridge
## Architecture Plan & Theory

**Branch:** `explore/osui-theme-bridge`
**Status:** Plan only — no implementation committed
**Goal:** Allow OutSystems UI components to consume Aurelius design tokens transparently, without forking or modifying either system.

---

## 1. The Problem

OutSystems UI (OSUI) defines its own CSS custom property vocabulary:

```css
/* OSUI expects these at :root */
--color-primary
--color-neutral-0 … --color-neutral-10
--font-size-base
--space-base
--border-radius-soft
--shadow-m
```

Our Aurelius design system defines *its own* vocabulary:

```css
/* Aurelius tokens */
--gold
--text-1, --text-2, --text-3
--bg, --bg-card, --bg-sidebar
--fs-base, --fs-body, --fs-nav …
--pad
--radius-card, --radius-item, --radius-btn
--shadow-card
```

When an OSUI component renders inside an OutSystems application styled with our theme, it will look for its own variables and find nothing — falling back to OSUI's baked-in defaults. The result is a visual disconnect: OSUI components use their own greys and blues while the rest of the page uses Aurelius gold and dark surfaces.

---

## 2. The Solution: A Unidirectional Bridge File

Create a single new file:

```
src/styles/theme/osui-bridge.css
```

This file contains **only** `:root` custom property declarations where each OSUI variable is set to the value of the corresponding Aurelius token using `var()`:

```css
:root {
  --color-primary: var(--gold);
  --color-neutral-10: var(--bg);
  --font-size-base: var(--fs-base);
  /* … and so on */
}
```

**Direction of the mapping:**

```
OSUI variable  ←  Aurelius token
```

OSUI consumes our tokens. Our tokens are never changed. The bridge is a thin adapter layer — like a power plug adaptor, not a rewiring of the house.

This file is loaded **after** `colours.css` and `typography.css` (so our tokens are already declared when the bridge runs), and **before** any OSUI component CSS (so OSUI's components inherit the overrides).

---

## 3. Why This Works

CSS custom properties cascade. When a browser resolves `var(--color-primary)` inside an OSUI component, it walks up the DOM looking for a declaration. By declaring `--color-primary: var(--gold)` at `:root`, we ensure it is always found — and it always resolves to whatever `--gold` currently is (`#F5A623` in dark, same in light since gold is invariant).

Because `--gold` itself uses `light-dark()` for the text variant (`--gold-text`), and because our `colour-scheme` is set at `:root` and switched via `:has(.theme-checkbox:checked)`, the OSUI bridge automatically participates in our theme toggle **without any extra JavaScript**.

---

## 4. Full Token Mapping (Proposed)

### 4a. Colour — Brand

| OSUI token | Aurelius token | Notes |
|---|---|---|
| `--color-primary` | `var(--gold)` | Aurelius primary accent |
| `--color-secondary` | `var(--gold-soft)` | Softer variant `#FFB547` |
| `--color-primary-hover` | `var(--gold-glow)` | 25% opacity gold overlay |

### 4b. Colour — Semantic / Status

| OSUI token | Aurelius token | Notes |
|---|---|---|
| `--color-success` | `var(--green)` | `#22C55E` |
| `--color-success-light` | `var(--green-dim)` | `rgba(34,197,94,0.12)` |
| `--color-error` | `var(--red)` | `#EF4444` |
| `--color-error-light` | `var(--red-dim)` | `rgba(239,68,68,0.12)` |
| `--color-warning` | `var(--gold)` | Gold reads as warning naturally |
| `--color-warning-light` | `var(--gold-dim)` | |
| `--color-info` | `var(--gold-soft)` | No blue in Aurelius palette — closest warm neutral |
| `--color-info-light` | `var(--gold-dim)` | |

### 4c. Colour — Neutral Scale

OSUI uses a 0–10 neutral scale (0 = white, 10 = black in light mode; inverted in dark). We map this to our surface and text hierarchy tokens. The bridge needs to account for the *inverted* direction in dark mode.

> **This is the trickiest mapping.** OSUI assumes neutral-0 is the lightest value.
> In dark mode, our "lightest surface" is actually our darkest hex (`#0B0D10`).
> Solution: use `light-dark()` in the bridge declarations themselves.

| OSUI token | Light value | Dark value | Strategy |
|---|---|---|---|
| `--color-neutral-0` | `#FFFFFF` | `#0B0D10` | `light-dark(#FFF, var(--bg))` |
| `--color-neutral-1` | `#F4F5F7` | `#0E1014` | `light-dark(var(--bg), var(--bg-sidebar))` |
| `--color-neutral-2` | `#E8EAF0` | `#14171C` | `light-dark(…, var(--bg-card))` |
| `--color-neutral-3` | `#D5D8E0` | `#1A1E25` | `light-dark(…, var(--bg-hover))` |
| `--color-neutral-4` | `#B8BCC8` | `#3A3E47` | midpoint — custom value |
| `--color-neutral-5` | `#8C9099` | `#6B7280` | `light-dark(…, var(--text-3))` |
| `--color-neutral-6` | `#696E75` | `#8C9099` | `light-dark(var(--text-3), var(--text-2))` |
| `--color-neutral-7` | `#555A65` | `#B0B3B8` | `light-dark(var(--text-2), var(--text-2))` |
| `--color-neutral-8` | `#3A3E47` | `#D0D3D8` | midpoint — custom value |
| `--color-neutral-9` | `#111318` | `#F0F1F4` | `light-dark(var(--text-1), …)` |
| `--color-neutral-10` | `#000000` | `#FFFFFF` | `light-dark(#000, var(--text-1))` |

### 4d. Typography

| OSUI token | Aurelius token | Resolved value |
|---|---|---|
| `--font-size-base` | `var(--fs-base)` | `14px` |
| `--font-size-display` | `var(--fs-kpi-hero)` | `calc(var(--fs-base) + 14px)` = 28px |
| `--font-size-h1` | `var(--fs-page-title)` | 22px |
| `--font-size-h2` | `var(--fs-section-title)` | 18px |
| `--font-size-h3` | `var(--fs-data-lg)` | 24px |
| `--font-size-h4` | `var(--fs-drawer-title)` | 20px |
| `--font-size-h5` | `var(--fs-input)` | 15px |
| `--font-size-h6` | `var(--fs-body)` | 14px |
| `--font-size-body` | `var(--fs-body)` | 14px |
| `--font-size-body-s` | `var(--fs-ui)` | 13px |
| `--font-size-body-xs` | `var(--fs-sm)` | 11px |
| `--font-weight-light` | `var(--fw-light)` | 300 |
| `--font-weight-regular` | `var(--fw-regular)` | 400 |
| `--font-weight-semibold` | `var(--fw-semibold)` | 600 |
| `--font-weight-bold` | `var(--fw-bold)` | 700 |
| `--font-family-base` | `var(--font-sans)` | Inter |
| `--font-family-heading` | `var(--font-serif)` | Playfair Display |

### 4e. Spacing

OSUI uses a named 8px scale. Our `--pad` is 24px. The cleanest mapping treats OSUI's `--space-base` as 16px (a common 8px-grid base) and derives the rest:

| OSUI token | Value | Aurelius equivalent |
|---|---|---|
| `--space-none` | 0 | — |
| `--space-xs` | 4px | hardcode `4px` |
| `--space-s` | 8px | hardcode `8px` |
| `--space-base` | 16px | hardcode `16px` |
| `--space-m` | 24px | `var(--pad)` |
| `--space-l` | 32px | hardcode `32px` |
| `--space-xl` | 40px | hardcode `40px` |
| `--space-xxl` | 48px | hardcode `48px` |

Spacing values are pure numbers and don't benefit from referencing our tokens (our spacing isn't yet tokenised beyond `--pad`). Hardcoding these is acceptable for now; if we later add `--space-*` tokens to Aurelius the bridge can be updated.

### 4f. Border Radius

| OSUI token | Aurelius token | Value |
|---|---|---|
| `--border-radius-none` | — | `0` |
| `--border-radius-soft` | `var(--radius-item)` | `12px` |
| `--border-radius-rounded` | `var(--radius-card)` | `16px` |
| `--border-radius-circle` | `var(--radius-btn)` | `999px` |

### 4g. Shadow

| OSUI token | Aurelius token | Notes |
|---|---|---|
| `--shadow-none` | — | `none` |
| `--shadow-xs` | hardcode | `0 1px 4px rgba(0,0,0,0.06)` |
| `--shadow-s` | hardcode | `0 2px 8px rgba(0,0,0,0.10)` |
| `--shadow-m` | `var(--shadow-card)` | our primary elevation |
| `--shadow-l` | hardcode | `0 24px 48px rgba(0,0,0,0.50)` |
| `--shadow-xl` | hardcode | `0 32px 64px rgba(0,0,0,0.60)` |

### 4h. Layer (z-index)

| OSUI token | Value |
|---|---|
| `--osui-sidebar-layer` | `100` |
| `--osui-popup-layer` | `200` |
| `--osui-bottom-sheet-layer` | `300` |
| `--osui-notification-layer` | `400` |
| `--layer-global-instant-interaction` | `9000` |

These have no Aurelius equivalents yet — the bridge declares sensible values directly.

---

## 5. Load Order

The bridge file is inserted as the **last** theme import, after all Aurelius tokens are declared and before any component CSS:

```css
/* bundle.css */

/* Theme — Aurelius tokens */
@import "theme/fonts.css";
@import "theme/colours.css";
@import "theme/typography.css";
@import "theme/animations.css";

/* Theme — OSUI adapter (reads the tokens above, exposes OSUI vocabulary) */
@import "theme/osui-bridge.css";   /* ← new */

/* Base, Layout, Modules … */
@import "base/base.css";
/* … */
```

This ordering guarantees:
1. All `var(--gold)`, `var(--fs-base)` etc. are already resolved before the bridge is evaluated
2. OSUI component CSS (loaded later) finds its variables pre-populated
3. Our own component CSS is entirely unaffected — it never references OSUI variables

---

## 6. Theme Switching Compatibility

Our theme toggle works via:

```css
:root               { color-scheme: dark; }
html:has(.theme-checkbox:checked) { color-scheme: light; }
```

All our tokens use `light-dark()`. The bridge file participates in this automatically — any bridge declaration that contains `light-dark()` or references one of our `light-dark()` tokens will update when the scheme changes.

For the neutral scale mapping, we'll use `light-dark()` directly in the bridge since OSUI's neutral direction inverts between modes:

```css
/* Inside osui-bridge.css */
:root {
  --color-neutral-0: light-dark(#ffffff, var(--bg));
  --color-neutral-10: light-dark(#000000, var(--text-1));
}
```

OSUI's own dark/light switching (if the OutSystems app also has a theme toggle) would need to be reconciled — this is a known integration challenge discussed in §8.

---

## 7. What the Bridge Does NOT Do

- **Does not modify any Aurelius token** — our existing CSS is entirely untouched
- **Does not import or bundle OSUI CSS** — OutSystems handles that; we only bridge the variables
- **Does not handle OSUI component markup** — HTML structure, BEM classes, and JavaScript remain OutSystems' responsibility
- **Does not provide OSUI extended colour families** (`--color-red-dark`, `--color-blue-lightest`, etc.) unless needed — these would be added on demand

---

## 8. Known Challenges & Open Questions

### 8a. Two theme toggles
If the OutSystems app provides its own light/dark toggle independent of ours, the two `color-scheme` contexts could conflict. Proposed solution: strip the OSUI theme toggle and delegate entirely to ours, or add a JavaScript listener that keeps both in sync.

### 8b. OSUI component-level variable overrides
Some OSUI components declare their own local overrides (`--osui-card-background`, `--osui-button-radius`, etc.). These are component-scoped and sit *below* `:root` in specificity — they will win unless we counter with equal or higher specificity. The bridge can include component-scoped overrides if/when we identify conflicts.

### 8c. OutSystems CSS injection order
OutSystems injects CSS at runtime. If OSUI's base stylesheet loads *after* our bundle it will overwrite the bridge variables. Mitigation: wrap bridge declarations in a `@layer` with higher priority, or investigate OutSystems' CSS loading lifecycle to ensure our bundle loads last.

### 8d. Neutral scale inversion
The 0=lightest/10=darkest convention in light mode vs. our own dark-first approach requires careful `light-dark()` mapping on every neutral step. This is the most error-prone part of the implementation and will require visual testing across both modes.

### 8e. Colour gap — no Aurelius blue
OSUI expects `--color-info` to be blue-tinted. We've mapped it to `--gold-soft` as the closest warm neutral, but if OSUI uses this for informational UI states (banners, tooltips) the visual intent may feel off. We may need to introduce a `--color-info` token in Aurelius that's a muted blue-grey.

---

## 9. Implementation Phases

When we're ready to move beyond planning:

**Phase 1 — Stub the bridge file**
Create `src/styles/theme/osui-bridge.css` with all variables mapped. Register it in `bundle.css`. No OSUI components yet — just validate that `:root` contains both vocabularies simultaneously and nothing breaks.

**Phase 2 — Bring in one OSUI component**
Import a single OSUI component (e.g. Button or Card) and verify it renders using Aurelius tokens. Fix any mismatches found in the neutral scale or component-level overrides.

**Phase 3 — Dark/light validation**
Toggle themes in both directions. Verify neutral scale inverts correctly. Fix any `light-dark()` mapping errors.

**Phase 4 — Full component library**
Expand to remaining OSUI components as the OutSystems build is developed. Add component-scoped bridge overrides on a per-component basis as needed.

**Phase 5 — Audit & remove hardcodes**
Pass the combined stylesheet through a contrast checker. Introduce any missing Aurelius tokens (e.g. `--color-info-blue`) that the bridge currently hardcodes.

---

## 10. File Summary

```
src/styles/theme/
  fonts.css          ← unchanged
  colours.css        ← unchanged
  typography.css     ← unchanged
  animations.css     ← unchanged
  osui-bridge.css    ← NEW — adapter layer (plan only, not yet created)

src/styles/bundle.css  ← one @import line added after animations.css
```

Total implementation surface: **one new file + one line in bundle.css.**

---

*This document lives on `explore/osui-theme-bridge` and will be updated as the implementation evolves.*
