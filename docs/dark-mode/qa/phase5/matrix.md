# Phase 5 QA Matrix

Phase 5 final sweep status after the June 24 cleanup:

- `npm run dark:audit` reports 0 findings across 0 files.
- `docs/dark-mode/dark-lint-baseline.json` has 0 baseline findings.
- The temporary Phase 1 color bridge was removed from `src/app/globals.css`.
- Dark-mode shadow normalization remains as an explicit final policy: standard shadows are disabled in dark mode while tokenized borders/surfaces carry elevation.

The route matrix below remains the full release capture set for public pages and
the customer, creator, and admin dashboards. This pass records targeted notes
for the routes affected by the final cleanup.

## June 24 Targeted Checks

Visible headed browser session: `agent-browser --session weelp-visible --headed --args "--no-sandbox" open http://localhost:3000/`

| Route                          | Viewport       | Theme | Result                                                                                                                                     |
| ------------------------------ | -------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                            | Desktop        | Dark  | Body/card surfaces used dark tokens; no horizontal overflow.                                                                               |
| `/`                            | Mobile 375x812 | Dark  | Mobile menu present; no horizontal overflow.                                                                                               |
| `/`                            | Mobile 375x812 | Light | Light tokens restored; no horizontal overflow.                                                                                             |
| `/cities`                      | Desktop        | Dark  | Listing/card content rendered; no horizontal overflow.                                                                                     |
| `/user/login`                  | Desktop        | Dark  | Auth form rendered with inputs/buttons; no horizontal overflow.                                                                            |
| `/dashboard/customer/earnings` | Desktop        | Dark  | Redirected to `/user/login?callbackUrl=%2Fdashboard%2Fcustomer%2Fearnings` without credentials; authenticated table visual check deferred. |

## Public Routes

| Route                              | Light desktop                 | Dark desktop                 | Light mobile                 | Dark mobile                 | First visit dark                |
| ---------------------------------- | ----------------------------- | ---------------------------- | ---------------------------- | --------------------------- | ------------------------------- |
| `/`                                | `home/home-light-desktop.png` | `home/home-dark-desktop.png` | `home/home-light-mobile.png` | `home/home-dark-mobile.png` | `home/home-first-visit-dark.md` |
| `/cities`                          | Pending                       | Pending                      | Pending                      | Pending                     | Pending                         |
| `/cities/[slug]`                   | Pending                       | Pending                      | Pending                      | Pending                     | Pending                         |
| `/cities/[slug]/activities/[slug]` | Pending                       | Pending                      | Pending                      | Pending                     | Pending                         |
| `/search`                          | Pending                       | Pending                      | Pending                      | Pending                     | Pending                         |
| `/explore-creators`                | Pending                       | Pending                      | Pending                      | Pending                     | Pending                         |
| `/checkout`                        | Pending                       | Pending                      | Pending                      | Pending                     | Pending                         |
| `/booking/[id]`                    | Pending                       | Pending                      | Pending                      | Pending                     | Pending                         |
| `/user/login`                      | Pending                       | Pending                      | Pending                      | Pending                     | Pending                         |
| `/blogs`                           | Pending                       | Pending                      | Pending                      | Pending                     | Pending                         |
| `/blogs/[slug]`                    | Pending                       | Pending                      | Pending                      | Pending                     | Pending                         |
| `/terms`                           | Pending                       | Pending                      | Pending                      | Pending                     | Pending                         |
| `/about-us`                        | Pending                       | Pending                      | Pending                      | Pending                     | Pending                         |

## Customer and Creator Dashboard Routes

| Route                                    | Light desktop | Dark desktop | Light mobile | Dark mobile | First visit dark |
| ---------------------------------------- | ------------- | ------------ | ------------ | ----------- | ---------------- |
| `/dashboard/customer/overview`           | Pending       | Pending      | Pending      | Pending     | Pending          |
| `/dashboard/customer/my-itineraries`     | Pending       | Pending      | Pending      | Pending     | Pending          |
| `/dashboard/customer/earnings`           | Pending       | Pending      | Pending      | Pending     | Pending          |
| `/dashboard/customer/application-status` | Pending       | Pending      | Pending      | Pending     | Pending          |
| `/dashboard/customer/notifications`      | Pending       | Pending      | Pending      | Pending     | Pending          |
| `/dashboard/customer/settings/*`         | Pending       | Pending      | Pending      | Pending     | Pending          |

## Admin Dashboard Routes

| Route                           | Light desktop | Dark desktop | Light mobile | Dark mobile | First visit dark |
| ------------------------------- | ------------- | ------------ | ------------ | ----------- | ---------------- |
| `/dashboard/admin/destinations` | Pending       | Pending      | Pending      | Pending     | Pending          |
| `/dashboard/admin/cities`       | Pending       | Pending      | Pending      | Pending     | Pending          |
| `/dashboard/admin/users`        | Pending       | Pending      | Pending      | Pending     | Pending          |
| `/dashboard/admin/orders`       | Pending       | Pending      | Pending      | Pending     | Pending          |
| `/dashboard/admin/packages`     | Pending       | Pending      | Pending      | Pending     | Pending          |
| `/dashboard/admin/activities`   | Pending       | Pending      | Pending      | Pending     | Pending          |
| `/dashboard/admin/reviews`      | Pending       | Pending      | Pending      | Pending     | Pending          |

## Artifact Naming

Use this pattern for captures:

```text
<route-slug>-light-desktop.png
<route-slug>-dark-desktop.png
<route-slug>-light-mobile.png
<route-slug>-dark-mobile.png
<route-slug>-first-visit-dark.md
<route-slug>-saved-light.md
```

First-visit notes should record that `localStorage['weelp-theme']` was absent
before reload, `html.dark` was present on first paint, and no light flash was
visible. Saved-light notes should record that the stored `light` preference won
after reload.

## Third-Party Theming Status

| Surface                   | Status           | Notes                                                                                           |
| ------------------------- | ---------------- | ----------------------------------------------------------------------------------------------- |
| Stripe Elements           | Wired            | Uses `resolvedTheme` to select `night` or `stripe` Appearance API theme.                        |
| MapLibre travel-buddy map | Wired            | OSM raster tiles receive a dark treatment; popups use theme tokens.                             |
| Toast notifications       | Verified in code | Radix toast components are token-based and remove dark shadows.                                 |
| Rich-text editor surfaces | Wired            | Shared Tiptap CSS and legacy Tiptap CSS use tokens for copy, code, pre, links, and blockquotes. |

## Current Blockers

No audit, guardrail, or authenticated dashboard verification blockers remain.
