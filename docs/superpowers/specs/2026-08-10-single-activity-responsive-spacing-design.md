# Single Activity Responsive Spacing Design

## Goal

Bring the lower half of single activity pages back onto Weelp's established
mobile-first spacing scale. FAQs must end with 16px of space on mobile, while
Similar Experiences must no longer leave a large empty block before the
footer on mobile or tablet.

## What the audit found

The single-product section currently owns `pb-28` below the `xl` breakpoint.
That creates 112px of section padding at both mobile and tablet widths. At the
1024px breakpoint, the tablet Similar Experiences wrapper adds another 70px
bottom margin, producing 182px of trailing space.

The FAQ wrapper has no bottom padding on narrow screens. Similar Experiences
therefore begins immediately after the final FAQ card instead of receiving the
requested 16px separation.

The 112px padding was introduced alongside the fixed mobile booking action.
That action remains rendered through a portal and the footer follows the
single-product section, so reducing section-owned whitespace does not remove
the user's ability to scroll the final cards above the fixed action.

## Approved responsive spacing

Use the existing Weelp responsive rhythm instead of one-off large values:

- Mobile below 768px: 16px after FAQs and 16px after Similar Experiences.
- Tablet from 768px: 24px after FAQs and at the section end.
- Large tablet from 1024px: 32px after FAQs and at the section end.
- Desktop from 1280px: preserve the current two-column desktop spacing.

The 70px Similar Experiences margin moves from the `lg` breakpoint to `xl`,
so it remains a desktop layout choice and no longer compounds tablet spacing.

## Behavior that stays unchanged

- The fixed mobile/tablet booking action and safe-area padding.
- Activity pricing, date, traveler, add-on, and cart behavior.
- FAQ anchoring, accordion animation, and desktop stable-height behavior.
- Similar Experiences cards, data, ordering, and mobile/tablet visibility.
- The desktop 60/40 content and booking layout.
- Itinerary and package page spacing at every breakpoint. The responsive
  spacing change is activity-only even though the layout component is shared.

## Verification

Tests will lock the responsive class contract for the FAQ wrapper, outer
single-product section, and desktop-only Similar Experiences margin.

Visible-browser checks will cover:

- Yacht Cruise at 390px, 768px, and 1024px for the reported layout.
- Desert Safari with BBQ at the same widths because it includes reviews and
  FAQs as well as the remaining activity content.
- The final FAQ card to Similar Experiences gap.
- The Similar Experiences section to footer gap.
- Fixed booking action visibility and overlap.
- Horizontal overflow and desktop behavior at 1280px.

## Out of scope

- Visual redesigns of cards, typography, tabs, or the booking sidebar.
- Changes to reviews, FAQ data, pricing, or backend responses.
- Production deployment.
