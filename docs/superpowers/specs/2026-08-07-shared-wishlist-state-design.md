# Shared Wishlist State Design

## What this change fixes

Saving an activity, itinerary, or package currently writes to the wishlist API without updating the state used by the rest of the frontend. The detail-page action therefore keeps its unsaved appearance, existing wishlist membership is not shown, and other card or dashboard views do not react until their data is fetched again.

The fix will make the authenticated customer's server-backed wishlist the single source of truth for wishlist hearts. A successful save will paint the heart red immediately, previously saved items will start red, and every mounted consumer will observe the same state without a page refresh. Guests will continue through the existing login/signup modal instead of calling the wishlist API.

## State and data flow

The existing SWR wishlist hook will own reads and mutations. It will expose item-identity helpers and optimistic add/remove operations around the canonical unfiltered wishlist cache. Components will identify an item by `item_type` and `item_id`, matching the backend's existing unique wishlist identity.

When an authenticated customer clicks an unsaved heart, SWR will optimistically add the normalized item to the cache before the POST completes. Every mounted detail action, item-card heart, and dashboard wishlist consumer using that key will rerender from the same cache. If the request fails, SWR will restore the previous cache and the destructive toast will explain the failure. Revalidation after success will replace the optimistic entry with the backend response.

The control will also support removal because a red saved heart must remain an honest interactive state. Removal will optimistically delete the matching entry, call the existing identity-based DELETE endpoint, roll back on failure, and revalidate after success.

## UI boundaries

A focused client component will render the wishlist control in two explicit variants:

- `icon`: a circular heart overlay for shared public item cards.
- `label`: the detail-page action with a heart and saved/unsaved text.

Keeping this behavior in a client leaf lets the shared `ItemCard` retain its current rendering responsibilities. The card mapper will supply the normalized identity and display snapshot needed by the wishlist API. The card control will prevent its click from activating the surrounding item link.

Unsaved hearts will use the current neutral treatment. Saved hearts will use the existing destructive/red color token for both stroke and fill. The control will have an accurate accessible name (`Save ... to wishlist` or `Remove ... from wishlist`) and an `aria-pressed` state. The detail-page action will be available at mobile and desktop sizes rather than remaining desktop-only.

The creator itinerary like counter is intentionally excluded. It represents social likes through a separate API and is not a customer wishlist control.

## Authentication behavior

Wishlist data will not be requested while the NextAuth session is unauthenticated. Clicking as a guest opens the existing auth modal with a callback that performs the original wishlist action after successful authentication. No POST or DELETE request is made before authentication.

## Failure paths worth knowing

- Missing or unsupported item identity leaves the control disabled and avoids a malformed API call.
- A failed optimistic save or removal restores the prior shared state and shows the backend message when available.
- Rapid repeat clicks are ignored while the current mutation is pending.
- An empty or unavailable wishlist response is treated as no saved items without breaking card rendering.

## Verification

Tests will be written before implementation and will cover:

- the wishlist hook's shared optimistic add/remove behavior and rollback contract;
- initial red state for an item already returned by the wishlist endpoint;
- immediate red state after an authenticated save;
- guest clicks opening the login/signup modal without an API call;
- card clicks not navigating when the nested wishlist control is used;
- detail-page saved/unsaved labels and accessible pressed state;
- mapper output containing the item identity required by cards.

After focused tests pass, the frontend type check and lint will run. The final verification will use the named visible browser session against `http://localhost:3000` for both guest and authenticated flows, checking the detail page, shared item cards, and customer dashboard without refreshing.
