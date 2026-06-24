# Phase 5 QA Matrix

Phase 5 could not be completed as a final sign-off because the required pre-edit audit is not clean:

- `npm run dark:audit` currently reports 1091 findings across 201 files.
- 578 findings are `shadow-utility` catalog entries.
- 513 findings are hardcoded color or neutral utility findings.
- The temporary Phase 1 dark bridge remains in `src/app/globals.css`.

The route matrix below is the required capture set once the remaining findings are fixed or explicitly exempted. Artifacts should be stored in this folder by route slug and viewport/theme.

## Public Routes

| Route                              | Light desktop                 | Dark desktop                 | Light mobile                 | Dark mobile                 | System follow         |
| ---------------------------------- | ----------------------------- | ---------------------------- | ---------------------------- | --------------------------- | --------------------- |
| `/`                                | `home/home-light-desktop.png` | `home/home-dark-desktop.png` | `home/home-light-mobile.png` | `home/home-dark-mobile.png` | `home/home-system.md` |
| `/cities`                          | Pending                       | Pending                      | Pending                      | Pending                     | Pending               |
| `/cities/[slug]`                   | Pending                       | Pending                      | Pending                      | Pending                     | Pending               |
| `/cities/[slug]/activities/[slug]` | Pending                       | Pending                      | Pending                      | Pending                     | Pending               |
| `/search`                          | Pending                       | Pending                      | Pending                      | Pending                     | Pending               |
| `/explore-creators`                | Pending                       | Pending                      | Pending                      | Pending                     | Pending               |
| `/checkout`                        | Pending                       | Pending                      | Pending                      | Pending                     | Pending               |
| `/booking/[id]`                    | Pending                       | Pending                      | Pending                      | Pending                     | Pending               |
| `/user/login`                      | Pending                       | Pending                      | Pending                      | Pending                     | Pending               |
| `/blogs`                           | Pending                       | Pending                      | Pending                      | Pending                     | Pending               |
| `/blogs/[slug]`                    | Pending                       | Pending                      | Pending                      | Pending                     | Pending               |
| `/terms`                           | Pending                       | Pending                      | Pending                      | Pending                     | Pending               |
| `/about-us`                        | Pending                       | Pending                      | Pending                      | Pending                     | Pending               |

## Customer Dashboard Routes

| Route                                | Light desktop | Dark desktop | Light mobile | Dark mobile | System follow |
| ------------------------------------ | ------------- | ------------ | ------------ | ----------- | ------------- |
| `/dashboard/customer/overview`       | Pending       | Pending      | Pending      | Pending     | Pending       |
| `/dashboard/customer/my-itineraries` | Pending       | Pending      | Pending      | Pending     | Pending       |
| `/dashboard/customer/notifications`  | Pending       | Pending      | Pending      | Pending     | Pending       |
| `/dashboard/customer/settings/*`     | Pending       | Pending      | Pending      | Pending     | Pending       |

## Admin Dashboard Routes

| Route                           | Light desktop | Dark desktop | Light mobile | Dark mobile | System follow |
| ------------------------------- | ------------- | ------------ | ------------ | ----------- | ------------- |
| `/dashboard/admin/destinations` | Pending       | Pending      | Pending      | Pending     | Pending       |
| `/dashboard/admin/cities`       | Pending       | Pending      | Pending      | Pending     | Pending       |
| `/dashboard/admin/users`        | Pending       | Pending      | Pending      | Pending     | Pending       |
| `/dashboard/admin/orders`       | Pending       | Pending      | Pending      | Pending     | Pending       |
| `/dashboard/admin/packages`     | Pending       | Pending      | Pending      | Pending     | Pending       |
| `/dashboard/admin/activities`   | Pending       | Pending      | Pending      | Pending     | Pending       |
| `/dashboard/admin/reviews`      | Pending       | Pending      | Pending      | Pending     | Pending       |

## Artifact Naming

Use this pattern for captures:

```text
<route-slug>-light-desktop.png
<route-slug>-dark-desktop.png
<route-slug>-light-mobile.png
<route-slug>-dark-mobile.png
<route-slug>-system.md
```

System check notes should include the browser preference simulation used, the `localStorage['weelp-theme']` value, and whether the `html.dark` class followed the simulated preference after reload.

## Third-Party Theming Status

| Surface                   | Status           | Notes                                                                                           |
| ------------------------- | ---------------- | ----------------------------------------------------------------------------------------------- |
| Stripe Elements           | Wired            | Uses `resolvedTheme` to select `night` or `stripe` Appearance API theme.                        |
| MapLibre travel-buddy map | Wired            | OSM raster tiles receive a dark treatment; popups use theme tokens.                             |
| Toast notifications       | Verified in code | Radix toast components are token-based and remove dark shadows.                                 |
| Rich-text editor surfaces | Wired            | Shared Tiptap CSS and legacy Tiptap CSS use tokens for copy, code, pre, links, and blockquotes. |

## Current Blockers

The final screenshot matrix, safety-net removal, and final sign-off should wait until the source audit is zero or every remaining finding has a direct exemption. Removing the bridge now would violate Phase 5.5.
