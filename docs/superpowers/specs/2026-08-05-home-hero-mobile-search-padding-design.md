# Home hero mobile search padding

## Why this change

The stacked search controls on the mobile home hero sit too close to their available edges. They need a small, even inset without changing the compact visual rhythm or affecting larger breakpoints.

## Approved design

Replace `p-3` with `p-[0.9rem]` on the inner rounded panel in `src/app/components/Pages/FRONT_END/home/HeroSearchPill.jsx`. This is the panel directly surrounding the three search controls and Search button.

- Mobile receives 0.9rem (14.4 pixels at the default root size) of padding on the top, right, bottom, and left.
- The `sm` breakpoint and larger retain the current spacing.
- The outer `HeroSearchPill` wrapper in `HeroSection.jsx` remains unchanged and receives no new padding.
- Search fields, behavior, data flow, animations, and the trust-items row remain unchanged.
- No new component or styling abstraction is needed.

## Verification

Update the focused hero test to assert the mobile padding and its `sm` reset. Run the related Jest test, type-check, lint, and verify the home page in a visible browser at 390 by 844 and 768 by 900 viewports. Confirm the search stack has even breathing room, resets at `sm`, and still behaves normally.
