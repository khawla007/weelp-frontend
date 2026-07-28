# Home Testimonial Responsive Header Design

## Why this needs changing

The home-page testimonial card currently puts the avatar, traveler identity,
item name, and star rating in one wrapping flex row
(`src/app/components/Testimonial.jsx:8`). When the item name is long, the
rating consumes the remaining horizontal space and the identity block wraps
under the avatar. The visual relationship between the traveler and the item
then becomes unclear.

The slider can show four cards from the desktop breakpoint
(`src/app/components/sliders/TestimonialSlider.jsx:38`), so each card must also
work at narrow widths even when the overall page is wide.

## Approved layout

The card header will use two stacked groups:

1. The first row contains the avatar on the left. The five-star rating and
   review date sit together on the right, with the date below the stars.
2. The traveler name and verified badge appear beneath that row.
3. The reviewed item name appears directly beneath the traveler name and uses
   the full card width.
4. The review text follows below the identity block.

The date moves out of the card footer because it is metadata for the rating,
not part of the review body. Keeping the rating and date together also leaves
the identity block free to wrap naturally.

## Responsive behavior

The same structure will be used at every breakpoint. It does not need
responsive JavaScript or a separate mobile component.

- The avatar keeps a fixed size.
- The stars and date remain right-aligned and do not wrap into the avatar.
- Traveler and item names use the full width below the first row.
- Long names wrap normally; they are not truncated or line-clamped.
- The review text keeps its existing three-line clamp.
- Card height continues to stretch with the Swiper slide so cards in the row
  remain visually aligned.

This structure was chosen over a three-column header because a fixed metadata
column squeezed the item name at 260–320px card widths. It was also chosen over
placing all metadata beside the identity because that still made the available
width dependent on the rating.

## Accessibility and data behavior

The existing username, verified badge, item name, rating, review text, and date
values remain unchanged. Missing usernames continue to display `Anonymous`,
and missing review text continues to display the current fallback.

The avatar will keep useful alternative text tied to the traveler rather than
the generic word `testimonial`. The decorative stars will not create repeated
screen-reader noise; the rating will have one concise accessible label.

## Verification

Component coverage will exercise a long traveler name and a long item name. It
will confirm that:

- rating and date share the top metadata group;
- traveler and item names render in the full-width identity block;
- names are not line-clamped;
- review text retains its three-line clamp;
- missing optional values do not break the layout.

After type-check and lint, the home page will be inspected in the visible
browser at narrow mobile, tablet, and desktop widths. The card must show the
complete traveler and item names without either line moving under the avatar,
overlapping the rating, or causing horizontal overflow.

## Out of scope

- Slider autoplay, speed, and breakpoint changes.
- Backend review data changes.
- New avatar sources or profile-photo loading.
- Changes to other review-card components.
