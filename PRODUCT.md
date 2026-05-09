# Product

## Register

brand

## Users

Travelers booking premium experiences, primarily in Dubai and Europe. Two
sides of the marketplace:

- **Customers** — discovering itineraries, packages, activities, and
  transfers by city. They arrive from search/social, browse curated
  catalogs, and convert via Stripe checkout. They want to feel they are
  making a confident, well-curated choice — not wading through dense
  OTA filter walls.
- **Creators** — independent guides and operators publishing itineraries
  and getting paid. They live in the dashboard, not the marketing
  surface, but they read the marketing surface to understand how their
  work is presented.

Admin / super-admin roles exist but PRODUCT.md governs the brand
surface; dashboards run on the same vocabulary but with the product
register applied per-task.

## Product Purpose

Weelp is a curated travel-booking marketplace where independent creators
publish multi-day itineraries, single activities, packages, and
transfers, and travelers book them by city. Success looks like:
travelers feel they have found a hand-picked premium experience worth
paying for, and creators feel their work is presented with the care of
an editorial publication, not a flea-market listing grid.

## Brand Personality

Clean, modern, premium. Calm authority, not loud salesmanship.
Editorial-travel rhythm: confident typography, generous whitespace,
imagery does the heavy lifting, sage-green accent
(`hsl(--secondaryDark)` ≈ `#588f7a`) appears with intent, never as
decoration. Voice is second-person, warm but exact: "Spend a morning
on the dunes" beats "Experience the magic of the desert".

## Anti-references

- **Generic OTA layouts** (Booking.com, Expedia). No dense filter rails,
  no yellow/red CTAs, no info-overload card grids competing for the
  eye.
- **AirBnB clone aesthetic.** No pink/coral accents, no identical
  photo cards stamped in a grid, no hero-search overlay floated on a
  stock image.
- **SaaS dashboard cliché.** No purple-to-blue gradients, no
  Inter-for-everything, no rounded-square icon tile above every
  heading. The dashboard register inherits this ban.
- **TripAdvisor-style review walls.** No green-owl badge stack, no
  star-rating clutter, no density-as-credibility.

## Design Principles

1. **Curated, not catalogued.** Every itinerary, city, and creator is
   presented as if it earned its place. Layouts breathe; cards are not
   the default answer.
2. **Imagery carries the brand.** Type and color recede when a strong
   image is present. The design system gets out of the way of the
   destination.
3. **One accent, used sparingly.** Sage green is a signal, not a
   wallpaper. Restrained color strategy: tinted neutrals plus the
   accent at ≤10% surface area on brand pages.
4. **Premium calm over premium loudness.** No glossy gradients, no
   glassmorphism by default, no hero-metric template. Confidence
   shows in restraint.
5. **The brand and the product share a vocabulary.** Marketing pages
   and creator/customer dashboards use the same type scale, the same
   spacing rhythm, the same green. The dashboard is quieter, but it
   is unmistakably the same product.

## Accessibility & Inclusion

WCAG 2.2 AA target. All interactive elements meet 4.5:1 contrast for
text and 3:1 for UI components against their background. Focus
states visible and never relying on color alone. Reduced-motion users
get a static fallback for any scroll-driven or autoplay motion.
Imagery alt text describes the experience, not the file. No
information conveyed by color alone (e.g. price tier, availability).
