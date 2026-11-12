# Site settings: wiring plan

The Site settings drawer (PR #224) is UI only. This plan wires it up one setting at a time, from the easy wins to the hard ones, with the risks for each.

Effort: **S** is a few hours, **M** is about a day, **L** is several days or needs design or legal input.

---

## Step 0: groundwork (do this first)

Every setting relies on this step, so it goes in first, together with the first easy win.

- **One settings store.** Add a small `src/js/settings.js` that reads and writes one `localStorage` key, `aurelius-settings`.
  - It applies each setting as an attribute on `<html>`, for example `data-ava="off"` or `data-motion="reduced"`. The CSS then only has to look at those attributes.
  - It fills the drawer's controls with the saved values when the drawer opens.
  - It powers **Reset to defaults**, and **Done** closes the drawer.
- **Run it in `<head>` before the first paint.** Otherwise each page loads with the default look and then jumps to the saved one, for example white and then dark. It has to be added to all 29 pages, the same way `footer.js` was.
- **Announce changes.** Reuse the `.theme-live` live region, for example "Text size: Large".
- **The "Preview only" notice** comes out once all the settings are wired. Until then, mark each control that isn't wired yet.

**Risks**
- **OutSystems picks up `bundle.css` from GitHub `main`.** Any CSS we add reaches the ODC app the moment it's merged. Put every rule behind an `html[data-…]` attribute, which ODC never sets, so nothing changes there until ODC opts in.
- **`localStorage` can be blocked**, for example in private browsing or with strict privacy settings. Wrap every read and write in `try/catch` and fall back to the defaults. The site must look right with nothing stored.
- **"On this device" means this browser only.** The drawer says so, which is accurate. If clients expect their settings to follow them to another device, they need saving against the account, which needs a backend: in ODC, a user entity or client variables.

---

## Easy wins

### 1. Show the Ava chat button (S)
Hide `#chat-bubble-btn` with `html[data-ava="off"] .chat-bubble-btn { display: none; }`.

- **Risk: harder to find help.** Ava stays reachable from the Ask Aurelius AI page and the Help page. Leave the "Meet your AI wealth assistant" banner alone, or hide it too, but decide which.
- **Risk: open chat.** If the chat panel is open when the button is hidden, close it as well.

### 2. Hide background pattern (S)
The wave is one pseudo-element in `layout.css` (`url('../images/wave.svg')`). Hide it under `html[data-pattern="off"]`.

- **Risk: light mode surfaces.** Some are see-through on purpose so the wave shows behind them. Check each one still has a solid colour behind it once the wave is gone.
- **Risk overall:** low.

### 3. Theme: Light, Dark, System (S–M)
Today the theme is CSS only: `html:has(.theme-checkbox:checked)` sets `color-scheme: light`. **It isn't saved on the main site**, so it resets on every new page; only `login.js` and `splash.js` save it, under `aurelius-theme`.

Wire it as:
- `data-theme="light"` or `"dark"` sets `color-scheme`.
- **System** leaves it to the device's `prefers-color-scheme`.

The header switch, the account menu and the drawer must all read and write the same value.

- **Risk: three controls for one thing.** The header switch, the account menu and the drawer could disagree. Make the store the only source of truth and have all three follow it.
- **Risk: a wrong-theme flash on load** if the head script is missing (see Step 0).
- **Risk: ODC uses the same `:has()` rule.** Keep it working alongside the new attribute rather than replacing it.
- **Bonus:** this fixes the theme resetting between pages, which is a bug today.

---

## Medium

### 4. Default chart period (M)
`charts.js` already handles ranges (`updateHistoryView`, with 1M, 3M, 6M, 1Y and All). Each chart opens on the saved period.

- **Risk: periods don't match across charts.** Some charts don't offer every period; there's no 5Y on some. Map each saved period to the nearest one a chart has.
- **Risk: the active button.** The chart's own range buttons must show the right one as selected, not just the data.
- **Risk: short histories.** A client's history may be shorter than the chosen period, so "5 years" has to fall back to "Since you joined" gracefully.
- **Risk: Plan My Future** has its own chart code (`src/js/plan/`). Decide whether this setting applies there.

### 5. Reduce motion (M)
68 `prefers-reduced-motion` rules across about 11 partials already switch motion off when the device asks. A setting can't trigger a media query, so each rule needs a matching `html[data-motion="reduced"]` selector.

- **Risk: missing one.** The cleanest fix is to move each animation behind one shared custom property, such as `--motion: 1` or `0`, set by both the media query and the attribute. That's a refactor across the partials.
- **Risk: JavaScript-driven motion** isn't covered by CSS: view transitions, Highcharts animations and the spinning card border. Each needs its own check.
- **Rule: the setting can only reduce motion.** If the device asks for reduced motion, the site must never animate, whatever the setting says.

### 6. Hide balances (M–L)
Blur money figures until they're tapped.

- **Risk: coverage is the whole job.** Figures use many classes, including `kpi-value` (64 times), `stat-chip-value`, `activity-amount`, `review-row-value`, table cells, chart tooltips and axis labels, and much of it is written by JavaScript. One missed figure defeats the point. Add one shared hook class, such as `.site-money`, to every figure, including ODC's.
- **Risk: blur only hides what's on screen.**
  - **Screen readers** still read the figures. That's fine, since this is about people looking over your shoulder, but say so.
  - **Copying and printing** still show the real numbers. Hide them in print styles too.
  - **Blur strength:** it must be strong enough that the numbers can't be read.
- **Risk: tap to reveal** must work from the keyboard, show focus, and announce "hidden" or "shown". It needs a short, clear label, such as "Balance hidden, press to show".
- **Risk: charts** need the axis values and tooltips hidden too, through Highcharts options rather than CSS.

---

## Harder

### 7. Density (L)
Compact spacing for the tables and lists in `tables.css`, `documents.css`, `activity.css` and the adviser tables.

- **Risk: half-done looks broken.** If only some lists get compact, it looks like a bug. List every table and list first.
- **Risk: touch target size.** WCAG 2.5.8 asks for at least 24px. Compact could apply on wider screens only, or keep the targets the same size and just shrink the gaps.

### 8. Higher contrast (L, needs design)
Override tokens under `html[data-contrast="more"]`: `--text-2`, `--text-3`, `--border`, `--divider`, and the faint card border gradient. Also follow `prefers-contrast: more`.

- **Risk: off-brand.** It needs a design pass in both themes, so it still looks like Aurelius rather than a debug mode.
- **Risk: gold on light** already needs the AA gold. Check every gold use against 4.5:1 for text and 3:1 for icons and borders.
- **Prerequisite: fix `--shadow-s` and the other shadow tokens.** They put whole shadows inside `light-dark()`, so they compute to `none`. Raised surfaces matter more in high contrast.

### 9. Text size (L)
Most type is ready: 470 font sizes use tokens built on `--fs-base`, which is 14px on `<html>`. Large and Larger would scale `--fs-base`, for example to 115% and 130%.

- **Risk: fixed pixel sizes.** 43 font sizes are fixed, in `login.css`, `adviser.css`, `plan-chart.css`, `plan.css`, `onboarding.css` and others. They won't scale, so convert them to tokens first.
- **Risk: charts and SVG text.** Highcharts takes font sizes in JavaScript, and SVG `<text>` (labels, site map art) won't follow the token.
- **Risk: fixed heights clip text.** Examples include the site map card band (108px), the 64px setting options and the KPI card heights. They need minimum heights instead.
- **Risk: layouts break sooner.** At 130%, the top nav, sidebar and tables overflow earlier. The 1024px Menu breakpoint was measured at standard size and may need to come earlier.
- **Risk: double scaling with browser zoom.** That's acceptable, but test 130% text at 200% zoom.
- **Testing:** every page at both larger sizes, in both themes, on desktop and phone. This is the biggest test effort in the plan.

### 10. Cookie settings (L, needs legal sign-off)
This isn't a technical problem. It needs a real consent process:
- a banner on first visit, and optional cookie categories
- a record of consent, and nothing optional loaded before consent
- a way to change your mind (this link)

All of it under UK GDPR and PECR.

- **Risk: a control that does nothing is misleading.** The prototype sets no optional cookies, so there's nothing to control yet. Keep it as a link to a Cookie Settings page, or a mocked one, and don't fake a working preference.
- **Risk: ODC will probably use a consent management platform.** Design the page to match what that platform provides.
- **Owner:** this needs compliance and legal sign-off before it ships.

---

## Suggested PRs

| PR | Scope | Effort |
|---|---|---|
| 1 | Step 0 groundwork + Show Ava button + Hide background pattern | S–M |
| 2 | Theme: Light, Dark, System (also fixes the theme resetting between pages) | S–M |
| 3 | Fix the shadow tokens (`--shadow-s` and the others) | S |
| 4 | Default chart period | M |
| 5 | Reduce motion (shared `--motion` refactor) | M |
| 6 | Hide balances (shared `.site-money` hook, then the blur) | M–L |
| 7 | Density | L |
| 8 | Higher contrast (after a design pass) | L |
| 9 | Text size (convert fixed px first, then scale) | L |
| 10 | Cookie settings (after legal sign-off) | L |

## Risks across the whole plan

- **ODC parity:** every setting we wire in the prototype needs the same storage and attribute in ODC, or it only works here. Track the ODC work per PR.
- **Testing grows fast.** Theme, text size, density and contrast multiply into many combinations. Test the likely ones (each setting on its own, plus "everything on") rather than all of them.
- **Settings that fight each other.** Large text with Compact density and Larger text with Hide balances are combinations to test on purpose.
- **Scope creep.** Each setting touches every page. Keep to one setting per PR so each can be reviewed and rolled back on its own.
