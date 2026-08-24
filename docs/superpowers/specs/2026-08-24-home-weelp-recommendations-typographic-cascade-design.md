# Weelp Recommendations Rule-Led Cascade Design

## What this design covers

The main homepage “Weelp Recommendations” section will receive a restrained entrance inspired by Steel Nova’s upward reveals for text-heavy content. The section follows the right-cascading “Your Guide” cards, so its motion will shift from card movement to a quieter typographic sequence that closes the homepage cleanly before the footer.

This is entrance animation only. Recommendation data, random selection, link destinations, responsive grid columns, typography, colors, spacing, hover underlines, empty states, and error states stay unchanged.

## Motion sequence

The approved treatment is a **Rule-Led Typographic Cascade**:

- The “Weelp Recommendations” heading fades upward from 18px over 650ms.
- The divider begins 100ms after the heading starts and draws from left to right over 700ms.
- Recommendation links fade upward from 12px over 700ms.
- Link entrances begin 180ms after the section sequence starts and use a 60ms stagger.
- Link stagger indexes are capped at seven, producing eight stagger positions. Items beyond the eighth enter with the eighth position instead of extending the sequence indefinitely when the API returns up to 32 recommendations.
- Text and containers never scale. A horizontal `scaleX` transform is used only to draw the decorative divider; it does not resize content or affect layout.
- The sequence runs once when the section enters the viewport.
- Hovering or focusing a link does not replay its entrance and does not alter the existing underline interaction.
- With reduced motion enabled, all content and the full divider are immediately visible and static.

## Responsive behavior

The same vertical motion is used at every viewport width. Desktop keeps the existing eight-column flow, while mobile keeps its existing two-column flow. Link indexes follow DOM order, so the visible sequence reads left-to-right and then moves to the next row naturally at each breakpoint.

The motion uses opacity and compositor-friendly transforms only. It introduces no horizontal travel, overflow clipping, blur, filter, content scale, or layout-affecting width animation, preventing the temporary scrollbar issue seen in earlier sections.

## Homepage-only scope

`WeelpRecommendations` is shared by the main homepage and `/home-gold`. The main route will explicitly request `entrance="rule-led-cascade"`. `/home-gold` will omit the prop and preserve the component’s current reveal behavior.

A route-composition test will lock this boundary. Browser acceptance testing will open the main homepage only; `/home-gold` isolation will be verified through the automated route test.

## Component structure

The opt-in variant will use one `Reveal` observer at the section root. The heading, divider, grid, and links will expose narrowly scoped data hooks so CSS can coordinate the entire sequence from the root reveal state.

The divider and links remain in their existing layout positions. Each link receives a capped CSS index variable without an additional wrapper. For the opt-in variant, the nested heading and grid `Reveal` observers are replaced by plain containers. When no entrance is requested, the current root, heading, and staggered-grid reveal structure remains unchanged for `/home-gold` and any future default caller.

## Failure and fallback behavior

Existing data behavior remains unchanged:

- A successful empty response continues to render the current empty `SectionFallback`.
- A failed response continues to render the current error `SectionFallback`.
- No new fetch, state, event handler, retry, or asynchronous error path is introduced.

If reduced motion is requested or `IntersectionObserver` is unavailable, the root uses the shared reveal bypass state and scoped CSS shows the heading, complete divider, and all links without animation.

## Verification

Automated tests will verify:

- Only the main homepage opts into `rule-led-cascade`.
- `/home-gold` keeps the default `WeelpRecommendations` props and current reveal structure.
- The opt-in variant uses one reveal observer without adding link wrappers.
- Existing API success, empty, error, link URL, responsive grid, and hover classes remain intact.
- Link indexes are capped at seven for lists longer than eight items.
- CSS matches the 18px/650ms heading, 100ms/700ms divider, 12px/700ms links, 180ms base link delay, and 60ms capped stagger.
- Reduced-motion and missing-observer paths render every element statically.

Visible localhost testing will verify desktop and mobile pending, active, and settled states; natural link order; no page-width overflow before, during, or after the sequence; once-only behavior; preserved hover underlines; reduced motion; and browser errors.
