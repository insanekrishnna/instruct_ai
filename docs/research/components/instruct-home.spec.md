# InstructHome Specification

## Overview
- **Target file:** `src/components/InstructHome.tsx`
- **Screenshots:** `docs/design-references/instruct/desktop-full.png`, `docs/design-references/instruct/mobile-full.png`
- **Interaction model:** hover transitions, mobile nav button, cookie accept/reject close.

## Visual System
- Background: `#fbfbfa`
- Text: `#17191c`
- Muted: `#6f767d`
- Border: `rgba(22, 24, 28, 0.08)`
- Header radius: about `24px`; buttons radius: `14px`; hero prompt radius: `28px`.
- Target uses Typekit plus local variable fonts; clone uses system fallback with serif display to approximate the Ivy-style hero.

## Assets
- `/images/instruct/background-main.webp`
- `/images/instruct/dark-icon.svg`
- `/images/instruct/icon-dark.svg`
- `/images/instruct/social-twitter.svg`
- `/images/instruct/social-linkedin.svg`
- SEO assets in `/seo/`.

## Responsive
- Desktop: header width nearly full with `8px` top margin; hero content max-width `720px`; feature cards in 2 columns.
- Mobile: rounded header inset `16px`; hero h1 `40px`; prompt full width; cards stack; cookie panel overlays lower content.
