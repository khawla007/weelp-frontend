# Home Top Activities Stagger — Design

**Date:** 2026-08-24  
**Status:** approved
**Reference:** `https://demo.casethemes.net/steelnova/`

## What this changes

The homepage's `Top activities` carousel will gain a one-time entrance that follows the horizontal direction of the slider. The section layout, activity cards, data, responsive breakpoints, navigation behavior, and hover states remain unchanged.

The Steel Nova comparison showed its analogous service carousel entering card by card from the right over roughly 1.25 seconds, with about 200 milliseconds between cards. Weelp will keep that directional rhythm but shorten it for a lighter travel experience and for a carousel that can show five cards at desktop width.

## Entrance sequence

The existing section header remains independent from the cards:

1. `Top activities` and its navigation arrows lift and fade into place using the current 40-pixel, 900-millisecond `Reveal` treatment.
2. The carousel cards begin at the same intersection event. Each card moves from 32 pixels to the right into its final position, fades from transparent to opaque, and settles from `scale(0.985)` to `scale(1)` over 850 milliseconds.
3. Cards are staggered by 90 milliseconds in DOM order, producing a left-to-right wave while every card travels left into place.

The delay index is capped at four. This gives the five possible desktop cards delays of 0, 90, 180, 270, and 360 milliseconds while ensuring off-screen slides also finish promptly. Cards therefore never appear missing when the user operates the carousel immediately after the entrance.

## Scope and component boundary

The effect is opt-in rather than a new default for every carousel:

- the homepage route requests a `stagger-right` carousel entrance for `Top activities`;
- `ProductSliderSection` uses one opt-in section-level `Reveal` root to trigger both its header and cards, while existing callers retain their current independent reveals;
- `CarouselShell` owns slide indexing because it renders each `SwiperSlide`, and can skip its own observer when the parent section owns the entrance;
- `globals.css` owns the animation and pending/shown states alongside the existing reveal system.

This keeps destination, testimonial, blog, city, and dashboard carousels unchanged. Swiper continues to own track translation, and the entrance animates individual slide elements only, so the effect does not compete with the wrapper transform used during navigation.

## Trigger and interaction behavior

One existing `Reveal` intersection observer on the opted-in section becomes the trigger for both the header and carousel. It fires once when the section reaches the current threshold and does not replay on reverse scrolling. The header and cards read the same parent `pending` or `shown` state, so their sequence cannot drift because of separate intersection samples.

The entrance is separate from carousel navigation. Clicking an arrow during or after the reveal still uses Swiper's existing 300-millisecond track transition. Changing slides does not replay card opacity, translation, scale, or stagger.

## Motion accessibility

Under `prefers-reduced-motion: reduce`, the carousel and every slide render immediately at full opacity with no transform, scale, animation, delay, or retained compositor layer. Navigation remains available and unchanged.

## Failure paths worth knowing

- **Invisible off-screen slides:** avoided by animating every slide and capping the delay index rather than leaving later slides pending.
- **Swiper transform conflict:** avoided by animating slide elements while Swiper translates the wrapper.
- **Out-of-sync header and cards:** avoided by driving both from one section-level `Reveal` state rather than nesting independent observers.
- **Other carousel regressions:** avoided by making the treatment opt-in and enabling it only on the homepage `Top activities` call.
- **Hydration flash:** avoided by continuing to use `initialHidden` on the below-fold carousel reveal root.
- **Repeated motion on navigation:** avoided because the intersection state changes once and is not tied to Swiper's active index.

## Verification

Focused tests will verify that the homepage opts in, the optional prop reaches `CarouselShell`, slide delay indexes cap at four, the carousel root carries the scoped entrance hook, and the CSS includes the directional keyframe plus reduced-motion reset.

After focused tests, type-check, and lint pass, a visible headed browser at `http://localhost:3000` will verify the sequence on reload, responsive behavior, arrow interaction during and after entrance, one-time playback, reduced motion, and a clean console.
