---
name: Weelp
description: A curated travel-booking marketplace for Dubai- and Europe-bound travelers.
colors:
  sage-deep: '#588f7a'
  sage-hover: '#4d8069'
  sage-tint: '#b5d8cb'
  sage-wash: '#f2f7f5'
  ink: '#18181b'
  nav-menu-normal: '#000000'
  nav-menu-hover: 'rgba(24, 24, 27, 0.7)'
  copy: '#52525b'
  label: '#71717a'
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
    fontFamily: "degular_demo, 'Inter Tight', sans-serif"
    fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)'
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: '-0.005em'
    note: 'Editorial accent only. Pen reserves Degular for decorative section labels (~42-52px). Never replaces a heading tier.'
  headline:
    fontFamily: "'Inter Tight', sans-serif"
    fontSize: 'clamp(1.75rem, 3.2vw, 2.375rem)'
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: '-0.01em'
  title:
    fontFamily: "'Inter Tight', sans-serif"
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
- Editorial type pairing: Inter Tight for headlines and body, Inter for small UI labels, Degular as a decorative accent only. See `docs/frontend-design-correction/typography.md` for the pen-derived tier reference.
- Flat surfaces by default; depth appears only on intent (hover, focus).
- Cards used sparingly. The default answer is whitespace and rhythm, not a card grid.
- Imagery is destination-led; chrome and decoration recede when a strong photo is present.

### Global responsive sizing contract

This section is the source of truth for new public-facing responsive work. It
records the shared values that must be reused instead of choosing new numbers
page by page. Existing intentional exceptions remain valid only when their
component or design spec documents the reason.

#### Spacing rhythms

Weelp uses two responsive spacing rhythms. They solve different layout
problems and must not be substituted for one another.

| Rhythm        | Mobile `<768px` | Tablet `≥768px` | Large tablet `≥1024px` | Tailwind contract         | Use                                                                                            |
| ------------- | --------------: | --------------: | ---------------------: | ------------------------- | ---------------------------------------------------------------------------------------------- |
| Compact       |            16px |            24px |                   32px | `p-4 md:p-6 lg:p-8`       | Page-edge refinements, component groups, FAQ handoffs, and short gaps between adjacent content |
| Major section |            40px |            64px |                   96px | `py-10 md:py-16 lg:py-24` | Hero handoffs, full-width bands, listing-page endings, and major public sections               |

The Compact Responsive Rule is `16 → 24 → 32`. When a mobile or tablet page
needs ordinary padding or a short section handoff, start with this sequence.
Do not introduce a new `20/28/36` or arbitrary pixel sequence without an
approved component-specific reason.

The Major Section Rule is `40 → 64 → 96`. Its reusable implementation lives in
`src/lib/publicSectionSpacing.js`. Major editorial whitespace must not be
reduced to the compact rhythm merely because both are called “section
spacing.”

At `xl` (`1280px`) and above, preserve a component's approved desktop layout.
If desktop requires a different value, express that override explicitly, such
as `xl:pb-0` or `xl:mb-[70px]`, and cover it with a regression test.

#### Type and shell sizes

These are the canonical element and public-shell sizes. Page-specific hero
art direction may opt into a documented display size; ordinary content must
use the global tier.

| Role                          |                     Mobile |        Tablet |                    Desktop | Weight / line height | Canonical implementation                             |
| ----------------------------- | -------------------------: | ------------: | -------------------------: | -------------------- | ---------------------------------------------------- |
| `h1` hero heading             | `clamp(28px, 3.2vw, 38px)` |    same clamp |                 same clamp | 600 / 1.05           | Global `h1` in `src/app/globals.css`                 |
| `h2` section heading          |                       28px |          28px |                       28px | 600 / 1.1            | Global `h2`                                          |
| `h3` sub-heading              |                       24px |          24px |                       24px | 600 / 1.2            | Global `h3`                                          |
| `h4` card title               |                       18px |          18px |                       18px | 600 / 1.3            | Global `h4`                                          |
| `h5` compact heading          |                       16px |          16px |                       16px | 600 / 1.4            | Global `h5`                                          |
| `h6` small heading            |                       14px |          14px |                       14px | 600 / 1.4            | Global `h6`                                          |
| Paragraph                     |                       16px |          16px |                       16px | 400 / 1.5            | Global `p`                                           |
| Lead paragraph                |              20–24px fluid | 20–24px fluid |              20–24px fluid | 500 / 1.4            | `p.lead`                                             |
| Default button label          |                       14px |          14px |                       14px | 500 / 1.2            | Global `button` and `Button` primitive               |
| Body/content anchor           |  16px or inherited context |     inherited |                  inherited | 500                  | Global `a`; links do not create a separate text tier |
| Header primary navigation     |                          — |             — | 15px at `lg`, 16px at `xl` | 500 / inherited      | `Layout/NavigationMenu.jsx`                          |
| Mobile navigation drawer      |                       15px |          15px |                          — | 500 / inherited      | `Layout/MobileMenu.jsx`                              |
| Footer column heading         |                       15px |          16px |                       18px | 700 / 1.2            | `Layout/footer.jsx`                                  |
| Footer navigation anchor      |                       14px |          15px |                       18px | 500 / 1.5            | `Layout/footer.jsx`                                  |
| Footer legal anchor/copyright |                       13px |          15px |                       18px | 500 / 1.5            | `Layout/footer.jsx`                                  |

Inline anchors inherit the size of their surrounding paragraph, heading, or
label. A standalone content link therefore uses the 16px body tier. Header,
footer, drawer, legal, chip, and button-links use the explicit component tier
listed above. Never add a blanket font size to every `<a>` because that would
break contextual links inside headings and small labels.

#### Button dimensions

| Button size |    Height | Horizontal padding |           Label | Icon |
| ----------- | --------: | -----------------: | --------------: | ---: |
| Small       |      36px |               12px |            14px | 16px |
| Default     |      40px |               16px |            14px | 16px |
| Large       |      44px |               32px | 14px by default | 16px |
| Icon-only   | 40 × 40px |                  0 |               — | 16px |

Public navigation controls and important mobile actions must expose at least a
44 × 44px interaction target even when their visible icon or text is smaller.
The primitive dimensions above come from `src/components/ui/button.jsx`;
component-specific CTA sizing must be explicit rather than silently changing
the primitive.

#### Header, footer, and logo

| Element                  |                                                            Mobile |       Tablet |               Desktop |
| ------------------------ | ----------------------------------------------------------------: | -----------: | --------------------: |
| Public logo image        |                                             32px high, auto width |    32px high | 36px high, auto width |
| Public logo wordmark     |                                                              18px |         18px |                  18px |
| Mobile drawer wordmark   |                                                              16px |         16px |                     — |
| Header main bar          | 69px rendered height: 12px vertical padding around ≥44px controls |         same |     66px fixed height |
| Header top strip         |                                                 46px when present |         46px |                  46px |
| Footer navigation target |                                                 minimum 44px high | minimum 44px |          minimum 44px |

The logo asset path remains centralized in `src/lib/config/brand.js`. Sizing
belongs to the shell components because the same asset has a 32px mobile and
36px desktop presentation. Do not embed a new logo path or choose a new logo
height inside individual pages.

## 2. Colors

A restrained palette built around a sage-green accent and a warm-leaning neutral stack. The accent appears with intent; the neutrals carry the surface.

### Primary

- **Sage Deep** (`#588f7a`): The single brand accent. Primary buttons, navigation progress, range-slider tracks, focus signals. Used on ≤10% of any given screen — its rarity is the point.
- **Sage Hover** (`#4d8069`): Pressed / hovered state of Sage Deep. Pairs only with `#588f7a` on interactive surfaces (CTA buttons, link active state). Never used at rest.

### Secondary

- **Sage Tint** (`#b5d8cb`): Soft accent surface — selected day-picker cells, secondary chips, hover wash on accent rows.
- **Sage Wash** (`#f2f7f5`): The most diluted form of the brand — date-range middles, very light section backgrounds where the eye should still register "we are inside the brand."

### Neutral

- **Ink** (`#18181b`): Primary text. Headlines, body when emphasis is needed. Bound globally as `--ink`.
- **Copy** (`#52525b`): Body text default. Long-form reading. Bound globally as `--copy`. Note: this is the canonical assignment as of Phase 12; prior DESIGN.md revisions named the lighter `#71717a` as Copy — superseded.
- **Label** (`#71717a`): Form labels, eyebrow text, secondary metadata. Bound globally as `--label`. Note: this is the canonical assignment as of Phase 12; prior DESIGN.md revisions named the darker `#52525b` as Label — superseded.
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

**The Navigation Menu Color Rule.** Navigation menu links are the sanctioned exception to the no-pure-black text rule. Public header menu items, footer menu links, dashboard sidebar menu items, dashboard sidebar dropdown items, and dashboard user-menu dropdown links use black at rest (`#000000`, Tailwind `text-black`) and `rgba(24, 24, 27, 0.7)` on hover (`hover:text-[#18181b]/70`). Active dashboard sidebar items remain black, not sage. The global base layer leaves `a:visited` at `color: inherit`, so menu links only need their rest and hover utilities — no `visited:*` overrides required. Sage is reserved for primary actions, progress/focus signals, and badges, not resting menu text.

**The Reserved-Brand-Signal Rule.** External-platform brand colors are not Weelp tokens, but a small set is preserved verbatim where the surface depends on third-party recognition. Sanctioned exceptions today:

- `#00B67A` — Trustpilot star on `CheckoutCards.jsx`.
- `#fed141` — third-party-style rating-star gold (Google / Trustpilot / app-store recognition) on `singleproduct/BannerSection.jsx`, `singleproduct/SingleProductReview.jsx`, and `shared/FilterSidebar.jsx`.

New brand-signal exceptions must be opted in explicitly via `eslint.config.mjs` (Phase 12 lint guards), one file at a time; never as a blanket allow-list.

**Lint enforcement.** §2 hex allow-list (className + inline style), §3 Global-Heading Rule, §5 Primitive Baseline (zinc canonical), and §7 Single-Container Rule are enforced via five custom rules in `eslint-rules/index.js` (`weelp/no-noncanonical-hex`, `weelp/no-inline-style-hex`, `weelp/no-inline-heading-font`, `weelp/no-semantic-gray`, `weelp/no-noncanonical-container`). Rules run only on cascaded surfaces — see `CASCADED_SURFACES` in `eslint.config.mjs`. New surfaces graduate into the guard set as their phase ships.

## 3. Typography

The canonical reference is `Designs/pencil-homepage.pen`. The full pen-derived tier reference lives at `docs/frontend-design-correction/typography.md`. This section is the in-DESIGN summary.

**Primary Font:** Inter Tight (Google) — headings, body, buttons, links. The pen file uses Inter Tight on ~84% of all text nodes.
**Secondary Font:** Inter (Google) — small UI labels, chips, table cells (~15% of pen nodes; 11–14px).
**Editorial Accent:** `degular_demo` (custom OTF) — decorative section labels at 42–52px regular weight only. The pen uses it 10 times.
**Script Accent:** Montez — sparingly, for editorial flourish in long-form content; never in product UI.

Plus Jakarta Sans is **retired**. It was introduced in earlier phases without pen basis and produced drift across headings; remove on sight.

**Character:** Confident, editorial, slightly architectural. Inter Tight carries the section work and the long reading. Degular is decoration — never a heading swap.

### Hierarchy

- **Hero** (Inter Tight, 600, `clamp(1.75rem, 3.2vw, 2.375rem)`, line-height 1.1, tracking -0.01em): Homepage h1, full-bleed banner h1.
- **Section opener** (Inter Tight, 600, 48px): Mid-page editorial moments — "Plan your Holiday.", "Explore Creators".
- **Section heading** (Inter Tight, 600, 28px): "Top activities", "Reviews", "FAQs".
- **Sub-heading** (Inter Tight, 600, 24px): Card group titles, in-page block headers.
- **Card title** (Inter Tight, 600, 18px): Product card names, list-row titles.
- **Body lead** (Inter Tight, 500, 20–24px, line-height 1.4): Hero subhead, section intro paragraphs.
- **Body** (Inter Tight, 400/500, 16px, line-height 1.6): Long reading. Cap line length at 65–75ch.
- **Body small** (Inter Tight, 400/500, 14px): Meta text, form helper text.
- **Label** (Inter, 400/500, 12–14px, letter-spacing 0.02em): Form labels, eyebrows, badges. Sentence case by default; uppercase only for short eyebrows (≤3 words).
- **Editorial accent** (Degular Demo, 400, 42–52px): One-off decorative labels only.

### Named Rules

**The Inter-Tight-First Rule.** Inter Tight is the default font on every `<h1>`–`<h6>`, every `<p>`, every `<button>`, every `<a>` via the `@layer base` block in `src/app/globals.css`. Raw tags inherit canonical font-family, weight, size, line-height, and ink color automatically — no per-component `style={{ fontFamily }}` or matching className needed. Tailwind utilities (`text-*`, `font-*`, `leading-*`) still win on specificity, so a card or dashboard heading can opt into a smaller size by class.

**The Reserved-Accent Rule.** Degular only appears as decorative section labels (42–52px regular weight) in editorial features. Apply via the `.display` utility — never as the font for an h1, h2, or section heading. If every accent on the page uses Degular, Degular has stopped meaning anything.

**The Two-Sans Rule.** Inter Tight carries headings and body, Inter carries small labels. Do not introduce a third sans. Outfit is loaded by next/font but should not be referenced in new code; treat it as legacy.

**Exception policy.** Per-component inline font / text overrides on a heading are only acceptable when the design intent diverges from the global tier (e.g. `BannerSection.jsx` blog hero uses `text-[52px]` because its visual weight sits between hero and section opener). Duplicating the global tier inline is drift — strip on sight.

## 4. Elevation

Surfaces are flat at rest. Depth is a response to intent, not a decoration. The system uses one ambient shadow for hover lift and one tighter shadow for floating navigation controls; that is the entire elevation vocabulary.

### Shadow Vocabulary

- **Card Hover** (`box-shadow: 0 1px 2px rgba(24, 24, 27, 0.06), 0 4px 12px rgba(24, 24, 27, 0.08)`): Applied on `:hover` to clickable cards (itineraries, packages, activities). Two-layer stack tuned for compact vertical extent (~16px below) so the shadow renders fully inside Swiper carousels and overflow-bounded sections without pushing layout or requiring large compensating buffers. Proximity layer at 6% opacity defines near-edge contact; ambient layer at 8% with 3:1 blur-to-offset keeps the falloff soft past card corners. Exposed as `--weelp-card-hover-shadow`.
- **Floating Control** (`box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.1)`): Carousel arrows, sticky CTA pills. The Swiper navigation buttons.
- **Floating Control / Accent State** (`box-shadow: 4px 4px 15px rgba(88, 143, 122, 0.3)`): Same control, hover state — the shadow tints sage to confirm the action.

### Named Rules

**The Flat-At-Rest Rule.** No shadow is applied to a non-hovered, non-floating element. Cards do not float when nothing has happened yet. Hover earns the shadow.

**The No-Decorative-Shadow Rule.** Shadows communicate hover, focus, or float. They never communicate "this is a card." A card is a card because of its radius, padding, and content rhythm — not because it has a drop-shadow at rest.

## 5. Components

**Primitive baseline.** All form/button/skeleton/dialog/sheet/popover/toast surfaces resolve through the shadcn/ui primitives in `src/components/ui/`. Those primitives ship a stock `neutral-*` Tailwind palette that sits within ±2 hex points of the canonical `zinc-*` palette named in §2 (e.g. `bg-neutral-100` ≈ `#f5f5f5` vs canonical `#f4f4f5`). Re-hexing the primitives across 32 files for a perceptual delta below noise floor is high blast for low signal, so the baseline is grandfathered: primitives keep their neutral-\* classes, product code targets canonical zinc hexes via the arbitrary syntax (`text-[#18181b]`, `border-[#e4e4e7]`), and the lint guards check both.

The success-state palette on `Alert` and `Toast` was migrated in Phase 12c from external bootstrap-green (`#256029` / `#B6E2A1` / `#F0FDF4` / `#568f7c` / `#4a7a6a`) to canonical sage tier (`#588f7a` border + `#f2f7f5` wash + `#18181b` ink). One sage, one success voice.

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

### Travel Buddy (AI Concierge)

The Buddy is a chat + map widget on the homepage (`src/app/components/Home/TravelBuddyWidget.jsx`, `BuddyChat.jsx`, `TravelBuddyMap.jsx`) backed by the live Anthropic API route at `src/app/api/buddy/route.js`. It is a concierge, not a chatbot — every visual and copy decision must reinforce that distinction.

- **Surface shape:** Two-pane composition — chat column on one side, map preview on the other. Both panes share the canonical card corner radius (24px) and surface white background. No floating chat bubble, no slide-in drawer, no avatar tile.
- **Voice:** Second-person, warm but exact, identical to marketing copy. No "As an AI...", no emoji garnish, no markdown headers, no bullet-wall responses. If the model wants to enumerate, render the enumeration as a map pin, not a list of `*` bullets.
- **Color:** Sage Deep (`#588f7a`) is the assistant's single signal — used on the send-button CTA, the active pin, and the "thinking" indicator. Never paint the assistant turn bubble sage; never use sage as the chat background. The One-Voice Rule still applies.
- **Map preview:** MapLibre GL with OSM tiles. Pin markers in Sage Deep at rest, Sage Hover on focus. `fitBounds` runs over `PREVIEW_PINS` on mount with padding 48, duration 0, maxZoom 3.
- **Loading state:** A single short verb in Copy color ("Thinking", "Looking that up") — not a typing-indicator dot cluster, not an animated avatar.
- **Don't:** Render assistant turns as gradient bubbles, robot avatars, ChatGPT-style markdown blocks, purple-to-blue accent strokes, or any visual that reads as "generic AI assistant." The PRODUCT.md anti-reference applies in full.

### Accessibility

**Contrast matrix on `#ffffff`** (WCAG 2.2 AA needs 4.5:1 body / 3:1 large):

| Token     | Hex       | Ratio  | Verdict                                  |
| --------- | --------- | ------ | ---------------------------------------- |
| Ink       | `#18181b` | 16.0:1 | AAA all sizes                            |
| Copy      | `#52525b` | 7.4:1  | AAA all sizes                            |
| Label     | `#71717a` | 4.6:1  | AA body                                  |
| Steel     | `#435a67` | 8.2:1  | AAA all sizes                            |
| Sage Deep | `#588f7a` | 3.8:1  | **AA large only** (≥18px or ≥14px / 700) |

The Sage Deep ratio is the operative constraint. Sage on white below 18px / 14px-bold is a WCAG failure; escalate to `#52525b` (Copy) for the resting state and use sage on hover (or move sage to a non-text role — icon, underline, border). Phase 12d migrated two `text-xs text-[#588f7a]` action links on `NotificationWidget.jsx` (Mark all read, View all) to this ink-default + sage-hover pattern.

**Tailwind token mapping.** The hexes above ship as a `weelp` color namespace in `tailwind.config.js`. New work uses these utilities; do not introduce fresh `text-[#...]`, `bg-[#...]`, or `border-[#...]` literals for these values.

| Hex       | Token key          | Utility                                                                                              |
| --------- | ------------------ | ---------------------------------------------------------------------------------------------------- |
| `#18181b` | `weelp.ink`        | `text-weelp-ink`, `bg-weelp-ink`                                                                     |
| `#52525b` | `weelp.copy`       | `text-weelp-copy`                                                                                    |
| `#71717a` | `weelp.label`      | `text-weelp-label`                                                                                   |
| `#435a67` | `weelp.steel`      | `text-weelp-steel`, `bg-weelp-steel`                                                                 |
| `#588f7a` | `weelp.sage-deep`  | `text-weelp-sage-deep`, `bg-weelp-sage-deep`, `border-weelp-sage-deep`, `hover:text-weelp-sage-deep` |
| `#4d8069` | `weelp.sage-hover` | `hover:bg-weelp-sage-hover`                                                                          |
| `#b5d8cb` | `weelp.sage-tint`  | `bg-weelp-sage-tint`                                                                                 |
| `#f2f7f5` | `weelp.sage-wash`  | `bg-weelp-sage-wash`                                                                                 |

Alpha-suffixed callsites (`#435a6742`, `#435a6730`, `#588f7a4D`, etc.) remain as arbitrary literals until the token system grows a `weelp.steel/26` alpha syntax — a separate cleanup, not blocking on contrast.

**Focus visibility.** `globals.css` ships a global `:focus-visible` outline at `rgba(88, 143, 122, 0.45)` 2px + 2px offset on every `<input>`/`<textarea>`/`<select>`/`<button>`. Component-level Tailwind utilities (e.g. `focus-visible:ring-2 focus-visible:ring-[#588f7a]/40`) layer on top for non-default surfaces — never strip the global outline.

**Reduced motion.** `globals.css` honors `prefers-reduced-motion: reduce` globally — animations and transitions collapse to 0.01ms; smooth scroll falls back to auto. Components that need motion semantics under reduced-motion (e.g. crossfade in place of slide) can opt back in via `@media (prefers-reduced-motion: no-preference)` inside their own scope.

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
- **Don't** introduce a third sans-serif. Inter Tight (headings + body), Inter (small labels), Degular (decorative accent) — that is the set.
- **Don't** use Degular on a heading. The Reserved-Accent Rule guards it for editorial decoration only.
- **Don't** add Plus Jakarta Sans back. It is retired from the type system.
- **Don't** convey information through color alone. Discount, availability, and price-tier states must also use shape, weight, or text.
- **Don't** style the Travel Buddy as a generic AI assistant. No purple-to-blue chat bubbles, no robot avatars, no ChatGPT-style markdown walls, no "thinking…" dot-cluster animations, no `As an AI...` hedging. The PRODUCT.md anti-reference is enforced in code.
- **Don't** ship a map-first city or homepage layout in the Google Travel / Kayak idiom — full-bleed map with floating result cards stamped over it. Maps support discovery; the editorial surface leads.
- **Don't** reintroduce the retired home-chrome tokens (`--weelp-home-accent #f59e0b`, `--weelp-home-brand #123347`, `--weelp-home-muted #6a7d88`, `--weelp-card-category-text #16a34a`). They have zero references in `src/` and represent pre-Phase-12 drift; treat as deprecated.

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

**Pen-Canonical Bleed Exception.** `tailwind.config.js` exposes `maxWidth.pen: 1480px` (Tailwind class `max-w-pen`). Reserved for full-bleed editorial media sections that need the wider pen-derived rail — typically hero image bands, the WanderersBanner pen layout, and the Travel Buddy two-pane preview. Page-level type and CTA chrome still constrain to `container-page` (1280px) inside the wider band.
