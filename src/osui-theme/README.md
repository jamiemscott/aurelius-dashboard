# Aurelius OSUI theme — first experimental draft

An override stylesheet that gives OutSystems UI widgets the Aurelius look, packaged as a theme in the ODC library **WealthManagement_Lib_Beta**. OSUI stays the base theme; this file only overrides it.

It replaces the bridge approach (`src/styles/theme/osui-bridge.css`, plus `bundle.css` imported from the external site) for anything built on the Beta library. The dashboard bundle and `AureliusTheme_Lib` are unchanged.

## Files

| File | What it does |
| --- | --- |
| `tokens.css` | Aurelius seeds, scales and semantic tokens, scoped to `.aurelius`. Also the colour-scheme states. |
| `osui-variables.css` | Sets OSUI's own variables (`--color-*`, `--font-size-*`, `--border-radius-*`, `--shadow-*`) from the tokens. **Most of the theme happens here.** |
| `base.css` | Font, headings, links, focus, scrollbars. |
| `widgets/*.css` | Aurelius details OSUI's variables can't express: pill buttons, the gradient card edge, input focus ring, tinted alerts and toasts, the menu, tabs, and so on. |
| `aurelius-osui-theme.css` | **Built output. Paste this into ODC.** Don't edit it. |

The fonts come from the shared `src/styles/theme/fonts.css`.

Build both the dashboard bundle and this theme:

```bash
node build.js
```

## How it works

- **Checked against OutSystems UI 2.19.2**, the version deployed to nttdatauk-dev. That isn't 2.27; several values in `osui-bridge.css` don't match 2.19.2 (for example `--space-m` is 24px).
- **OSUI 2.19 paints nearly everything through its variables.** Only about 20 rules outside Flatpickr hardcode a colour. So setting the variables restyles widgets, patterns and OSUI's utility classes (`.background-primary`, `.text-neutral-7` and so on) with no class changes in ODC.
- **The neutral scale is mapped by role, not mirrored.** OSUI uses `--color-neutral-0` as the widget surface, 4 for borders, 9–10 for text. Dark mode maps each role to its Aurelius equivalent: card grey surfaces, quiet borders, light text. There's a comment table at the top of `osui-variables.css`.
- **Everything is scoped under `.aurelius`.**
- **No `@layer`.** OSUI's stylesheet is unlayered, and unlayered CSS always beats layered CSS. So the theme stays unlayered and wins by loading after OSUI, plus the extra `.aurelius` class. Where OSUI uses a longer selector, the override repeats it.
- **Light and dark use `light-dark()` throughout.** No token is redeclared per mode. Tints use `color-mix(in oklab, …)`, because `oklch` shifts the hue towards lavender when mixing a status colour with the blue-grey neutrals.

## Applying it in ODC (for you to run)

1. Run `node build.js`.
2. In ODC Studio, open **WealthManagement_Lib_Beta**:
   - Add a theme called **Aurelius** with **OutSystemsUI** as its base theme.
   - Paste the whole of `aurelius-osui-theme.css` into its stylesheet.
   - Make the theme public, then publish.
3. In **WealthManagement_LiveStyleGuide**:
   - Add the dependency on the Beta library's Aurelius theme.
   - Set the **LiveStyleGuide** theme's base theme to **Aurelius**. The style guide keeps its own chrome CSS on top.
   - Publish.
4. **Add the `.aurelius` class to `<body>`**, for example in the layout's OnReady with `document.body.classList.add('aurelius')`, or use `<html>`.
   - It has to be `body` or `html`, not a layout container: the date picker and Virtual Select attach their popups to `<body>`.
5. **Set the colour scheme** with a state class on the same element:

   | Classes | Mode |
   | --- | --- |
   | `.aurelius` | dark (the Aurelius default) |
   | `.aurelius.is-light` | light |
   | `.aurelius.is-system` | follows the device setting |

## Checking it locally

```bash
npx serve .
```

Then open `/test/osui-theme/`.

The page loads the real OSUI 2.19.2 and ODC runtime stylesheets from the deployed Live Style Guide, then this theme, and has Dark, Light and System buttons. The OSUI URLs carry a content hash; if the widgets come up unstyled after the style guide is republished, copy the new URLs from its `<head>`. Font Awesome icons show as boxes there because of cross-origin font loading. That only affects the test page.

## Choices made in this draft

- **Default `.btn`** (OSUI's outlined button) becomes the Aurelius ghost-gold secondary. **`.btn-cancel`** is a quiet neutral ghost.
- **Links, active menu items and active tabs** use `--gold-text` (AA-safe in light mode), not `--color-primary`.
- **Inputs in dark mode** use `--neutral-9`, darker than the card, so a field reads as a field inside a card. The dashboard uses card grey (`--neutral-8`).
- **Alerts** are tinted with an accent bar, like the dashboard's feedback messages, instead of OSUI's solid fills.
- **`--header-size`** is 68px and **`--side-menu-size`** is 240px, to match the Aurelius topbar and sidebar.
- **Warning and info** got AA-safe light-mode values: `#B45309` and `#2563EB`.

## Not done yet / to check on your return

- **The Live Style Guide's own theme** (`.pattern-preview`, `.side-navigation`, swatches) hardcodes light colours (`#fff`, `#F5F6FA`, `#DEDFE4`). In dark mode those panels stay white until they're switched to OSUI variables. That's an edit in ODC, not in this file.
- **Not checked against live ODC markup yet:** Tabs, Wizard, Sidebar, Notification, Date Picker, Range Slider, Carousel and the side-menu layout. They're themed through variables and should follow, but they've only been checked against OSUI's CSS, not seen rendered.
- **Fonts still load from Google Fonts** (`fonts.gstatic.com`). Moving them into the library as resources would remove the external dependency.
- **Found in passing in `src/styles/theme/colours.css`:** the shadow tokens wrap whole `box-shadow` values in `light-dark()`, which only accepts colours, so browsers drop them. This theme switches only the shadow colour. The dashboard file needs the same fix.
