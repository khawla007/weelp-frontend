# §7 Homepage Section Reveals — Design

**Date:** 2026-06-02
**Roadmap section:** §7 of `docs/frontend-animation-implementation-steps-2026-05-15.md` (P1, "Not started")
**Status:** approved design, pending implementation plan

## Context

The animation roadmap is complete except §7. Every other homepage motion (hero rise, listing
updates, mega-menu, search) shipped, but the major homepage sections below the hero still pop in
with no pacing. §7 adds editorial scroll-reveal to those sections so the page reads as paced rather
than static — without animating every element and without regressing the existing hero rise.

The reveal infrastructure already exists and is used across the About pages, blog list, and transfer
results, so this is mostly _applying a proven pattern_ to four named sections plus two small polish
items — not building new motion machinery.

## Goal

Add opacity + 12px translateY (~520ms) scroll-reveal to the four named below-fold homepage sections,
plus an AI-card hover-scale and a recommendation-link underline-reveal, all reduced-motion-safe and
hydration-safe. Keep the hero, the AI overlay/decorative modules, and the non-named sections unchanged.

## Scope (decided)

- **Sections revealed (named 4 only):** `AiSection`, `BrowseDestinationsSection`, `WanderersBanner`,
  `WeelpRecommendations`. **Not** ProductSlider / Testimonial / Blog (avoids "animated everywhere",
  an explicit §7 acceptance check).
- **Hero:** unchanged — keeps its existing `.hero-rise` at-paint animation.
- **Micro-enhancements (both in):** AI-card hover-scale; WeelpRecommendations link underline-reveal.
- **Heavy decorative modules (tsparticles / cobe / maplibre):** left as-is. All already lazy-load in
  `useEffect` and are reduced-motion-gated; maplibre is already `dynamic(ssr:false)`. Wrapping
  `AiSection` in `Reveal` (`initialHidden`) naturally defers their mount until the section nears the
  viewport. No further deferral work.

## Reused infrastructure (no reinvention)

- **`src/app/components/ui/Reveal.jsx`** — client component. Props: `as` (default `div`),
  `initialHidden` (render `data-reveal="pending"`/hidden in SSR for below-fold), `delay`, `y`
  (default 12), `duration`, `once`, `className`, `...rest`. Uses IntersectionObserver
  (`threshold 0.15`, `rootMargin 0px 0px -10% 0px`); SSR-safe via `useIsoLayoutEffect`; calls
  `prefersReducedMotion()` → sets state `shown` immediately when reduced motion is on.
- **`src/app/globals.css`** — already defines `[data-reveal='pending']` (hidden, `translateY` =
  `--weelp-fade-up-y` default 12px) and `[data-reveal='shown']` (runs `weelpFadeUp` over
  `--weelp-duration-slow` = 520ms, ease `--weelp-ease-out`), plus the
  `@media (prefers-reduced-motion: reduce)` reset that flattens `[data-reveal]` to visible/no-anim.
  So §7's "opacity + 12px / 520ms / reduced-motion" requirement is the Reveal default — no CSS change.
- **`src/lib/motion.js`** `prefersReducedMotion()` — server-safe (`false` when no `window`).
- **House hover patterns** to mirror: image hover-zoom (item-card / CityCard / GallerySlider) and the
  blog-card underline `background-size 0%→100%` reveal (§11).

## Per-file changes

Reference pattern for all section wraps: About pages, e.g.
`AboutStory.jsx:13` → `<Reveal as="section" initialHidden className="container-page …">…</Reveal>`.
In each case the section's existing top-level `className` (and any attributes like `aria-labelledby`)
move onto the `Reveal` element; `Reveal`'s `...rest` forwards arbitrary attributes.

| File                                 | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home/AiSection.jsx`                 | Wrap top-level `<section className="container-page flex flex-col …">` as `<Reveal as="section" initialHidden className=…>`. Server component stays server; its existing children (TravelBuddyWidget, image card, PersonalisedGlobe) pass through unchanged. **Hover-scale:** wrap the AI article-card image in an `overflow-hidden` clip and add `transition-transform duration-500 ease-[var(--weelp-ease-out)] group-hover:scale-[1.02] motion-reduce:group-hover:scale-100` — placed _under_ the `data-overlay` so the existing overlay slide/fade is untouched. |
| `home/BrowseDestinationsSection.jsx` | Wrap top-level `<section className="container-page flex flex-col gap-8 …">` in `Reveal` (already `'use client'`).                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `home/WanderersBanner.jsx`           | Wrap top-level `<section aria-labelledby="wanderers-heading" className="relative h-[260px] …">` in `Reveal`, forwarding `aria-labelledby` via `...rest`.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `home/WeelpRecommendations.jsx`      | Wrap top-level `<section className="w-full bg-[#f8faf9] …">` in `Reveal`. **Underline-reveal:** on the itinerary links, replace the plain `transition hover:text-…` with the house `background-size 0%→100%` underline (linear-gradient background, `bg-no-repeat`, `[background-size:0%_2px]` → `hover:[background-size:100%_2px]`, `transition-[background-size]`), reduced-motion-safe via `motion-reduce:transition-none`.                                                                                                                                      |

### Reduced-motion guard note

The AI-card hover-scale uses `motion-reduce:group-hover:scale-100` — **not** `motion-reduce:transform-none`,
which loses CSS specificity to the `.group:hover .group-hover:scale-[1.02]` rule (learned and
browser-verified on GallerySlider, commit `cc4516d`). Same correctness applies here.

## What this does NOT change

- HeroSection (`.hero-rise` intact).
- ProductSlider / Testimonial / Blog sections.
- AiSection overlay behavior, TravelBuddy map, Cobe globe, tsparticles — all untouched; only the
  card image gains a clip + hover-scale and the section gains a reveal wrapper.
- `Reveal.jsx`, `globals.css`, `motion.js` — reused, not edited.

## Failure paths worth knowing

- **Hydration mismatch:** prevented by `initialHidden` (server renders `pending`/hidden for these
  below-fold sections, matching the client's pre-observer state). All four are below the fold.
- **Server/client boundary:** `Reveal` is a client component; the three server sections render it with
  children (allowed — server children pass through a client wrapper). No section needs to become a
  client component.
- **Overlay fight:** the AI hover-scale sits on the image beneath `data-overlay`; the overlay's own
  `group-hover` slide/fade is unchanged, so they compose rather than conflict.
- **Existing tests:** `AiSection.test.jsx`, `Reveal.test.jsx` (and any homepage section tests) must
  still pass after wrapping — verify the wrapper doesn't break selectors those tests rely on.

## Verification

1. `npx tsc --noEmit` clean; `npm run lint` clean.
2. Scoped jest on touched sections + Reveal: `npx jest AiSection Reveal BrowseDestinations …` green
   (full suite must stay 144/144).
3. Browser (`agent-browser`, headed): scroll the homepage — the 4 sections reveal once (opacity +
   ~12px translateY over ~520ms), each on its own scroll-in, not a cascade of child elements.
4. Reduced-motion emulation: all 4 sections render fully visible, no animation, no console error; AI
   hover-scale holds scale 1.
5. DevTools: console clean, no hydration/`server/client mismatch` warning, AI overlay still
   slides/fades on hover, and the tsparticles/cobe/maplibre chunks are not requested until AiSection
   nears the viewport.

## Acceptance (from §7)

- Homepage feels paced, not animated everywhere — only 4 section reveals + 2 micro-polish.
- Images remain the primary visual signal.
- AI overlay behavior intact.
- No hydration/server-client mismatch from the reveal wrapper.
- Heavy decorative modules not loaded earlier than needed.
