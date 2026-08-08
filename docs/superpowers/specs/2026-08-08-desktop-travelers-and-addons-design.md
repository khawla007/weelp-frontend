# Desktop Travelers and Add-ons Design

## Goal

Refine the single-item booking form so traveler labels match the surrounding field typography and the Add-ons section starts open on desktop without taking control away from the user.

## Scope

This change applies to the booking sidebar shared by activity, itinerary, and package item pages.

- Adult, Children, and Infant labels use the same 16px size as the Travelers and When field text.
- Their age descriptions remain secondary 14px text.
- Add-ons starts open only at the existing desktop `xl` breakpoint (1280px and wider).
- Add-ons starts closed below `xl`.
- After initialization, the accordion remains manually collapsible and expandable.
- A later viewport resize does not override a choice the user has already made.

## Implementation shape

The traveler labels receive an explicit `text-base` class instead of inheriting the application's larger global `h3` typography.

The Add-ons accordion becomes controlled by local open-value state in `ProductSidebar`. The server and initial hydration render use the closed state. After mount, a one-time `matchMedia('(min-width: 1280px)')` check opens Add-ons when the page was loaded at desktop width. Subsequent accordion changes come only from the user; no resize listener is needed.

This keeps a single Add-ons DOM tree, preserves Radix Accordion keyboard and accessibility behavior, and avoids duplicating selection controls for desktop and mobile.

## Behavior and failure paths

- If `matchMedia` is unavailable, Add-ons safely remains closed.
- If there are no add-ons, the section remains absent as it is today.
- Selecting or deselecting an add-on does not change whether the accordion is open.
- Existing traveler counters, validation, pricing, booking, cart-edit, and mobile action behavior remain unchanged.

## Verification

Automated tests will cover:

- explicit 16px sizing on Adult, Children, and Infant labels;
- desktop initialization with Add-ons expanded;
- mobile/tablet initialization with Add-ons collapsed;
- manual desktop collapse after the default opening;
- the existing single-product regression suite, type-check, lint, and production build.

Visible localhost browser checks will confirm the typography and accordion behavior on representative activity, itinerary, and package routes at desktop and narrow viewports.
