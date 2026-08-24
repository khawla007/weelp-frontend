# Your Guide Editorial Cascade Design

## What this design covers

The main homepage “Your Guide” carousel will receive an entrance inspired by Steel Nova’s “Latest Updates” section. Steel Nova brings its news cards in from the right with a 250ms step between three cards. Weelp shows as many as five cards at desktop width, so it will keep that direction while using a tighter rhythm suited to the denser carousel.

This is entrance motion only. Card layout, content, links, hover behavior, carousel navigation, pagination, and data loading stay unchanged.

## Motion direction

The approved treatment is an **Editorial Right Cascade**:

- The heading and navigation controls reveal together with a 24px fade-up over 700ms.
- Blog cards use a pure opacity-and-translate entrance from 28px to the right over 850ms.
- Cards are staggered by 110ms, capped at the first five slide indexes.
- The cards do not scale. This keeps the editorial treatment cleaner than the existing Top Activities reveal.
- On viewports below 1024px, every card uses a 16px vertical fade-up instead of horizontal travel. This avoids temporary horizontal page overflow and reads naturally when only one or a few cards are visible.
- The sequence runs once when the section enters the viewport. Moving the carousel afterward does not replay the entrance.
- With reduced motion enabled, the heading, controls, and cards are immediately visible and static.

## Homepage-only scope

`BlogSection` is shared by the main homepage, `/home-gold`, and other pages. The main route will explicitly request `entrance="editorial-right"`. `/home-gold` and every other existing caller will omit the prop and preserve the current reveal behavior.

A route-composition test will lock this boundary so a future refactor cannot accidentally apply the animation to `/home-gold`.

## Component structure

The editorial variant will use one `Reveal` observer at the `BlogSection` root. The heading row and carousel slides will expose semantic data hooks that CSS can choreograph from that single state. No extra wrapper will be added around individual cards, so Swiper sizing and equal-height slide behavior remain intact.

For this variant, `CarouselShell` will receive `observeReveal={false}` and will only supply the capped slide index used by the stagger. Its existing `stagger-right` behavior for other homepage sections will remain unchanged. The default `BlogSection` structure will also remain unchanged when no entrance is requested.

## Failure and fallback behavior

The section already returns nothing when there are no blog items; that behavior remains unchanged. If `IntersectionObserver` is unavailable, or the visitor prefers reduced motion, the shared `Reveal` behavior and CSS fallback will show all content without choreography.

No new requests, state, event handlers, or error paths are introduced.

## Verification

Automated tests will verify:

- Only the main homepage opts into `editorial-right`.
- `/home-gold` keeps the default `BlogSection` props.
- The editorial variant uses one reveal observer and preserves the heading, navigation, carousel, and slide structure.
- Slide indexes are capped consistently for the five-card desktop layout.
- CSS contracts match the 700ms header, 850ms cards, 110ms stagger, desktop rightward direction, mobile vertical direction, and complete reduced-motion reset.

Visible localhost testing will cover desktop and mobile entrance order, page width before/during/after animation, carousel navigation after the entrance, and reduced-motion rendering. The audit will use the main homepage only; `/home-gold` isolation will be verified through the route test rather than opening that page in the browser.
