# Shared Wishlist State Design

## What this change fixes

The single-item page currently writes to the wishlist API without reading or updating the state used by the customer dashboard. Its heart therefore stays neutral after a successful save and cannot show that an item was already saved.

The authenticated customer's server-backed wishlist will become the shared source of truth for the single-item action and dashboard. A successful save will immediately paint the detail-page heart red, previously saved items will start red, and the dashboard will observe the same cache without a page refresh. Guests will continue through the existing login/signup modal instead of calling the wishlist API.

Wishlist hearts will not appear on public item cards. The shared card component, product mapper, and listing sections remain unchanged.

## State and data flow

The existing SWR wishlist hook will own reads and mutations through the canonical unfiltered wishlist key. It will identify entries by `item_type` and `item_id`, matching the backend's unique identity.

When an authenticated customer saves an item, the hook adds a temporary entry to the cache before the POST settles. The single-item action turns red immediately and the dashboard sees the same entry. The successful API row replaces that temporary entry. A failure removes only that optimistic identity, preserving unrelated concurrent wishlist changes.

Removing a saved item follows the inverse flow: the identity disappears immediately, the existing DELETE endpoint runs, and only that identity is restored if the request fails.

## Single-item control

A focused client component renders the detail-page action with a heart and `Save to Wishlist` or `Saved to Wishlist`. Unsaved hearts use the current neutral treatment. Saved hearts use the existing destructive/red token for stroke and fill.

The control exposes an accurate accessible name (`Save ... to wishlist` or `Remove ... from wishlist`) and `aria-pressed`. It stays visible at mobile and desktop sizes. Rapid repeat clicks are ignored while a mutation is pending.

## Authentication and failures

Wishlist data is not requested while NextAuth reports an unauthenticated session. A guest click opens the existing authentication modal with a callback that performs the same save action after successful login or signup.

Service failures roll back only the affected identity and show the backend message when available. The post-login callback handles its own rejection because the modal does not await callback promises. Pending state always clears in `finally`.

## Verification

Tests cover disabled guest fetching, shared optimistic state, identity-scoped rollback, overlapping mutations, initial saved/red state, immediate red state after save, removal, post-login success/failure, and detail-banner integration. The customer dashboard's existing tests remain in place.

After focused tests, type-check, and lint pass, the visible local browser will confirm:

- public item cards contain no wishlist hearts;
- the guest detail-page action opens login/signup;
- an authenticated save turns the detail heart red without refresh;
- the saved item appears in the customer dashboard from the shared state.
