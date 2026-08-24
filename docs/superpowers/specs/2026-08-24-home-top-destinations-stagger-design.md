# Home Top Destinations Stagger — Design

**Date:** 2026-08-24  
**Status:** approved
**Builds on:** `docs/superpowers/specs/2026-08-24-home-top-activities-stagger-design.md`

## What this changes

The homepage `Top Destinations` carousel will use the same one-time entrance rhythm as `Top activities`: the header lifts into place while the visible cards enter from the right in a short left-to-right stagger.

This is an animation-only change. Destination data, card markup, responsive breakpoints, section spacing, navigation controls, pagination, hover states, and fallback behavior remain unchanged.

## Chosen approach

`BrowseDestinationsSection` is shared by the main homepage, Home Gold, Holiday, Tours & Experiences, and Region pages. The entrance will therefore remain opt-in:

- the main homepage passes `carouselEntrance="stagger-right"`;
- `BrowseDestinationsSection` accepts that optional prop and uses one section-level `Reveal` when it is enabled;
- the section header reads the parent reveal state instead of creating its own observer;
- `CarouselShell` receives the existing entrance value and skips its observer because the parent owns the trigger;
- callers that omit the prop retain their current reveal behavior.

This reuses the animation primitive already implemented for `Top activities`. No second keyframe, timing system, or destination-specific motion CSS will be introduced.

## Entrance sequence

When the homepage destination section reaches the existing reveal threshold:

1. the `Top Destinations` heading and navigation controls lift and fade into place;
2. destination slides fade from transparent to opaque while moving from 32 pixels right to their final position and settling from `scale(0.985)` to `scale(1)`;
3. the first five slide indexes use delays of 0, 90, 180, 270, and 360 milliseconds;
4. later slide indexes remain capped at 360 milliseconds so hidden cards are ready when the visitor navigates.

Each slide settles over 850 milliseconds. The reveal runs once and does not replay when the visitor scrolls back, uses the carousel arrows, or changes the active slide.

## Interaction and accessibility

Swiper continues to translate its wrapper during navigation. The entrance continues to animate individual slides, avoiding a transform conflict with Swiper's 300-millisecond track movement.

Under `prefers-reduced-motion: reduce`, the header and cards render immediately with full opacity, no transform, no animation delay, and no retained compositor hint. Navigation and mobile pagination remain unchanged.

## Alternatives considered

Making the entrance the default inside `BrowseDestinationsSection` would also alter four unrelated routes. That broad rollout is outside this task.

Duplicating destination markup or wrapping the component only from the homepage would avoid a prop but create a second implementation path for the same component. The opt-in prop keeps one component boundary and matches `ProductSliderSection`.

## Verification

Tests will verify that:

- the main homepage opts `Top Destinations` into `stagger-right`;
- `BrowseDestinationsSection` forwards the entrance to `CarouselShell` and disables its child observer;
- the opted-in section exposes the same section and header hooks as `Top activities`;
- callers without the prop preserve the existing independent reveal structure.

After focused tests, type-check, and lint, a visible headed browser at `http://localhost:3000` will verify the desktop and mobile entrance, stagger timing, one-time playback, carousel navigation, reduced-motion behavior, and browser errors.
