---
name: Weelp
description: A curated travel-booking marketplace for Dubai- and Europe-bound travelers.
colors:
  sage-deep: '#588f7a'
  sage-tint: '#b5d8cb'
  sage-wash: '#f2f7f5'
  ink: '#18181b'
  copy: '#71717a'
  label: '#52525b'
  surface: '#ffffff'
  page: '#f8faf9'
  soft: '#f4f4f5'
  border: '#e4e4e7'
  divider: '#eaeaea'
  steel: '#435a67'
  signal-warn: '#ff725e'
  signal-warn-wash: '#fff5f3'
typography:
  display:
    fontFamily: "degular_demo, 'Plus Jakarta Sans', sans-serif"
    fontSize: 'clamp(2.5rem, 6vw, 4.25rem)'
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: '-0.01em'
  headline:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: 'clamp(1.75rem, 3vw, 2.5rem)'
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: '-0.005em'
  title:
    fontFamily: "'Plus Jakarta Sans', sans-serif"
    fontSize: '1.25rem'
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 'normal'
  body:
    fontFamily: "'Inter Tight', 'Inter', sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 'normal'
  label:
    fontFamily: "'Inter', sans-serif"
    fontSize: '0.8125rem'
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: '0.02em'
rounded:
  sm: '8px'
  md: '16px'
  lg: '24px'
  pill: '999px'
spacing:
  xs: '8px'
  sm: '12px'
  md: '16px'
  lg: '24px'
  xl: '40px'
  '2xl': '64px'
components:
  button-primary:
    backgroundColor: '{colors.sage-deep}'
    textColor: '{colors.surface}'
    rounded: '{rounded.sm}'
    padding: '12px 24px'
  button-primary-hover:
    backgroundColor: '#4d8069'
    textColor: '{colors.surface}'
    rounded: '{rounded.sm}'
    padding: '12px 24px'
  button-ghost:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '12px 24px'
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '20px'
  chip-warn:
    backgroundColor: '{colors.signal-warn-wash}'
    textColor: '{colors.signal-warn}'
    rounded: '{rounded.sm}'
    padding: '4px 10px'
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '10px 14px'
---

# Design System: Weelp

## 1. Overview

**Creative North Star: "The Editorial Concierge"**

Weelp's interface behaves like a quiet expert who knows the right operator
in every city. Travel-magazine pacing, generous whitespace, confident
typography, imagery that earns its place. The system steps back so the
destination can step forward. Sage green is a signal, not a wallpaper.

This is a curated marketplace, not a search engine for hotels. Every
itinerary, creator, and city is presented as if it were chosen, because
it was. The visual system rejects the dense filter-rail aesthetic of
Booking.com and Expedia, the pink-coral photo-card grid of AirBnB, and
the purple-gradient SaaS dashboard cliché on the operator side.

**Key Characteristics:**

- Restrained color strategy: tinted neutrals plus a single sage accent at ≤10% surface area on brand pages.
- Editorial type pairing: Degular for display, Plus Jakarta for headlines, Inter Tight for body, Inter for labels.
- Flat surfaces by default; depth appears only on intent (hover, focus).
- Cards used sparingly. The default answer is whitespace and rhythm, not a card grid.
- Imagery is destination-led; chrome and decoration recede when a strong photo is present.

## 2. Colors

A restrained palette built around a sage-green accent and a warm-leaning neutral stack. The accent appears with intent; the neutrals carry the surface.

### Primary

- **Sage Deep** (`#588f7a`): The single brand accent. Primary buttons, navigation progress, range-slider tracks, focus signals. Used on ≤10% of any given screen — its rarity is the point.

### Secondary

- **Sage Tint** (`#b5d8cb`): Soft accent surface — selected day-picker cells, secondary chips, hover wash on accent rows.
- **Sage Wash** (`#f2f7f5`): The most diluted form of the brand — date-range middles, very light section backgrounds where the eye should still register "we are inside the brand."

### Neutral

- **Ink** (`#18181b`): Primary text. Headlines, body when emphasis is needed.
- **Copy** (`#71717a`): Body text default. Long-form reading.
- **Label** (`#52525b`): Form labels, eyebrow text, secondary metadata.
- **Steel** (`#435a67`): Slate-leaning gray for icon strokes and city-page tab text — carries a hint of Mediterranean sky.
- **Surface** (`#ffffff`): Card and input fills.
- **Page** (`#f8faf9`): Page background — a near-white with the faintest sage tint, ties the brand into the canvas without coloring it.
- **Soft** (`#f4f4f5`): Input fills on muted forms, badge backgrounds, neutral chips.
- **Border** (`#e4e4e7`): Default 1px dividers.
- **Divider** (`#eaeaea`): Heavier rules under section headings.

### Signal

- **Warn** (`#ff725e`): Discount badges, deletion confirmations, hard alerts. Never decorative.
- **Warn Wash** (`#fff5f3`): Soft red-orange surface paired with Warn for low-noise badges.

### Named Rules

**The One-Voice Rule.** The sage primary appears on ≤10% of any brand-register screen. If you find yourself painting a section sage, you are wrong: the section wants a sage _signal_, not a sage _backdrop_.

**The Single-Sage Rule.** There is one sage. `#588f7a` is canonical. The legacy variants `#56947d`, `#558e7b`, `#51927a`, `#57947d` scattered across globals.css are drift, not range. Replace them with `#588f7a` (or `var(--secondaryDark)`) on sight.

**The No-Pure-Black, No-Pure-White Rule.** Backgrounds are `#f8faf9` or `#ffffff`. Text is `#18181b` ink, never `#000000`. Borders are `#e4e4e7`, never `#000000` at any opacity.

## 3. Typography

**Display Font:** `degular_demo` (custom OTF) with Plus Jakarta Sans as fallback.
**Headline Font:** Plus Jakarta Sans (Google).
**Body Font:** Inter Tight (Google), with Inter as a secondary system for labels and dense UI.
**Script Accent:** Montez — used sparingly for editorial flourish in long-form content; never in product UI.

**Character:** Confident, editorial, slightly architectural. Plus Jakarta carries the section work; Inter Tight does the long reading. Degular is reserved for marquee moments — it is not a replacement for Plus Jakarta on every heading.

### Hierarchy

- **Display** (Degular, 500, `clamp(2.5rem, 6vw, 4.25rem)`, line-height 1.05): Hero and section-opener moments only. Never on dashboard pages.
- **Headline** (Plus Jakarta, 600, `clamp(1.75rem, 3vw, 2.5rem)`, line-height 1.15): Page titles, major section headings on brand pages.
- **Title** (Plus Jakarta, 600, 20px, line-height 1.3): Card titles, modal titles, list-section titles.
- **Body** (Inter Tight, 400, 16px, line-height 1.6): Long reading. Cap line length at 65–75ch.
- **Label** (Inter, 500, 13px, letter-spacing 0.02em): Form labels, eyebrows, breadcrumbs, badge text. Sentence case by default; uppercase only for very short eyebrow labels (≤3 words).

### Named Rules

**The Reserved-Display Rule.** Degular only appears in hero blocks, opener spreads, and editorial features. Section headings inside a page are Plus Jakarta. If every heading on the page uses Degular, Degular has stopped meaning anything.

**The Two-Sans Rule.** Inter Tight carries body, Inter carries labels. Do not introduce a third sans. Outfit and Inter (loose) are loaded by next/font but should not be referenced in new code; treat them as legacy.

**The Global-Heading Rule.** Plus Jakarta is the default font on every `<h1>`–`<h6>` via the `@layer base` block in `src/app/globals.css`. Raw heading tags inherit canonical font-family, weight, size, line-height, and ink color automatically — no per-component `style={{ fontFamily }}` or matching className needed. Tailwind utilities (`text-*`, `font-*`, `leading-*`) still win on specificity, so a card or dashboard heading can opt into a smaller size by class. For hero / section-opener marquee moments, apply the `.display` utility on top of an `<h1>` to switch to Degular at the display tier — that is the only heading site that should carry custom font-family or size declarations.

**Exception policy.** Per-component inline font / text overrides on a heading are only acceptable when the design intent diverges from the global tier (e.g. `BannerSection.jsx` blog hero uses `text-[52px]` because its visual weight sits between display and headline). Duplicating the global tier inline is drift — strip on sight.

## 4. Elevation

Surfaces are flat at rest. Depth is a response to intent, not a decoration. The system uses one ambient shadow for hover lift and one tighter shadow for floating navigation controls; that is the entire elevation vocabulary.

### Shadow Vocabulary

- **Card Hover** (`box-shadow: 0 14px 30px rgba(24, 24, 27, 0.1)`): Applied on `:hover` to clickable cards (itineraries, packages, activities). Already exposed as `--weelp-card-hover-shadow`.
- **Floating Control** (`box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.1)`): Carousel arrows, sticky CTA pills. The Swiper navigation buttons.
- **Floating Control / Accent State** (`box-shadow: 4px 4px 15px rgba(88, 143, 122, 0.3)`): Same control, hover state — the shadow tints sage to confirm the action.

### Named Rules

**The Flat-At-Rest Rule.** No shadow is applied to a non-hovered, non-floating element. Cards do not float when nothing has happened yet. Hover earns the shadow.

**The No-Decorative-Shadow Rule.** Shadows communicate hover, focus, or float. They never communicate "this is a card." A card is a card because of its radius, padding, and content rhythm — not because it has a drop-shadow at rest.

## 5. Components

### Buttons

- **Shape:** Gently curved (8px radius, `{rounded.sm}`). Pill (999px) reserved for filter chips and floating CTAs only.
- **Primary:** Sage Deep (`#588f7a`) background, white text, 12px × 24px padding. Hover deepens to `#4d8069`; focus shows a 2px sage outline at 30% opacity.
- **Ghost:** White background, ink text, 1px Border (`#e4e4e7`) stroke. Hover: background → Soft (`#f4f4f5`); border unchanged.
- **Destructive:** Warn (`#ff725e`) background, white text. Used only for confirmed-destructive actions.
- **Don't:** Use sage at the 30%+ surface area for stacked CTAs. One sage button per viewport, ideally per section.

### Cards (Itinerary / Activity / Package)

- **Corner Style:** 24px outer (`{rounded.lg}`), 16px inner for nested image (`{rounded.md}`).
- **Background:** Surface white. Page background carries the sage tint; the card stays neutral.
- **Image Strategy:** Fixed 200px image height (`--weelp-card-image-height`) at the top of the card, full-bleed inside the 16px inner radius. The image is the protagonist; type below is supporting.
- **Shadow Strategy:** Flat at rest. Card Hover shadow on `:hover`. See Elevation.
- **Border:** 1px Border (`#e4e4e7`) at rest. Removed on hover (the shadow takes over).
- **Internal Padding:** 20px (`--weelp-card-padding`).
- **Don't:** Stack cards inside cards. Don't repeat the same icon-tile-above-heading template across the grid; vary which signal earns the eye (image, price, creator name).

### Chips & Badges

- **Discount Badge:** Warn (`#ff725e`) text and 0.8px border, Warn-Wash (`#fff5f3`) fill. Used for percentage-off labels on cards.
- **Filter Chip (City Page):** Steel (`#435a67`) text, translucent slate background (`#cfdbe533`). Active state: same fill, sage-tinted border (`#cfdbe580`). Pill radius (999px).
- **Don't:** Use stars or numeric ratings as chips. Trust is conveyed by curation, not by review-count clutter (PRODUCT.md anti-reference: TripAdvisor review walls).

### Inputs

- **Style:** White background, 1px transparent border at rest, ink text, 8px radius. The project explicitly removes browser default outlines and focus rings (`outline: none !important`) — replace with explicit border-color and a 2px sage focus shadow on `:focus-visible` so accessibility doesn't fall through.
- **Focus:** Border becomes Sage Deep (`#588f7a`); a 2px sage outline at 30% opacity sits outside the border.
- **Error:** Border becomes Warn (`#ff725e`); a single-line message in Warn beneath, not a tooltip.
- **Disabled:** 50% opacity, cursor not-allowed (already in globals).

### Date Pickers (RDP + tfc_calendar)

- **Selected Day:** Sage Deep fill, white text, 6px radius.
- **Range Middle:** Sage Wash (`#f2f7f5`) fill, ink text — wash, not deep, so the start/end days remain emphatic.
- **Nav Buttons:** Sage Deep, white icons, 8px radius.

### Navigation Progress (NProgress)

- 5px Sage Deep bar fixed to the top of the viewport during route transitions, with a soft sage glow at the leading edge. The only place sage is allowed to occupy a horizontal stripe at full width — and only because it disappears in <500ms.

## 6. Do's and Don'ts

### Do:

- **Do** keep the sage primary at ≤10% of any brand-register screen. The One-Voice Rule is non-negotiable.
- **Do** use `#588f7a` as the canonical sage. Replace `#56947d`, `#558e7b`, `#51927a`, `#57947d` in legacy code as you touch it.
- **Do** reach for whitespace before reaching for a card. If a section can be communicated with type rhythm and an image, do that.
- **Do** let imagery carry the brand. When a strong destination photo is on screen, the surrounding type and color step back.
- **Do** apply the Card Hover shadow only on `:hover`. Cards are flat at rest.
- **Do** restore visible focus states on inputs and buttons. The global `outline: none !important` is a regression to fix, not a pattern to reproduce.

### Don't:

- **Don't** paint sage across a section background. Sage is a signal, not a wallpaper.
- **Don't** use border-left or border-right >1px as a colored stripe accent on cards or alerts. The shared Absolute Bans apply.
- **Don't** use gradient text (`background-clip: text`). Emphasize via weight or scale.
- **Don't** ship glassmorphism by default. Blurs are rare and purposeful or absent.
- **Don't** use the SaaS hero-metric template (big number, small label, supporting stats, gradient accent) anywhere. It is the first-order training-data reflex.
- **Don't** stamp identical photo cards in a uniform grid (AirBnB anti-reference). Vary card width, vary which signal earns the eye.
- **Don't** import the Booking.com / Expedia dense filter rail on the city page. Filters are progressive disclosure, not a left-rail wall.
- **Don't** introduce a third sans-serif. Inter Tight body, Inter labels, Plus Jakarta headlines, Degular display — that is the set.
- **Don't** use Degular on every heading. The Reserved-Display Rule guards it for marquee moments only.
- **Don't** convey information through color alone. Discount, availability, and price-tier states must also use shape, weight, or text.

## 7. Layout & Container

The shell of every page-level section reads at one canonical width. Drift between `max-w-4xl`, `max-w-5xl`, `max-w-6xl`, and `max-w-7xl` across sibling sections is what made Reviews look narrower than Top Activities on the homepage — every section is now anchored to the same outer rail.

### The Canonical Container

`container-page` is defined in the `@layer components` block of `src/app/globals.css`:

```css
.container-page {
  @apply mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8;
}
```

Page-level wrappers should use this single class instead of hardcoding `max-w-*` plus manual horizontal padding. It supplies horizontal centering, full-row width, the canonical 1280px ceiling, and the responsive padding scale.

### Named Rules

**The Single-Container Rule.** Every page-level section wrapper across public pages, dashboard surfaces, and modals reads at the canonical `container-page` width. If a section needs to feel narrower, narrow the _content_ inside the canonical container, not the container itself.

**Reading-Column Exception.** Long-form prose surfaces (single-blog body, legal pages — `/privacy`, `/terms`, `/cancellation` — single-product guide, About story columns, FAQ answers) constrain to `max-w-4xl` or a `max-w-[65ch]` reading column per the body 65–75ch rule in §3. The outer wrapper still uses `container-page`; the inner prose column applies a narrower `max-w-*` for legibility. Document the intent inline if it isn't obvious.

**Edge-to-Edge Exception.** Full-bleed image bands, gradient hero backgrounds, and sticky action bars span `w-full` on the outer `<section>`. The inner content panel inside that band uses `container-page` so the framing stays canonical even when the band itself runs corner-to-corner.

**Dashboard Surface Exception.** Settings layouts inside `/dashboard/admin/settings` and `/dashboard/customer/settings` retain `max-w-6xl` because dashboard reading width is a tighter ergonomic target than the public marketing rail. New dashboard work that lives outside settings should default to `container-page`.
