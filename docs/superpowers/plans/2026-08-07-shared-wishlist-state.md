# Shared Wishlist State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the single-item wishlist heart immediately reflect the authenticated customer's saved state and synchronize with the customer dashboard, while keeping wishlist icons off public item cards.

**Architecture:** Keep the Laravel API unchanged and use the canonical unfiltered SWR wishlist key as the frontend source of truth. A focused client control in the detail banner reads that cache and performs identity-scoped optimistic add/remove operations. Public card components and product mappers remain unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, SWR 2, NextAuth, Zustand auth modal, Jest 30, Testing Library, Tailwind CSS

---

### Task 1: Make the wishlist hook an authenticated shared cache

**Files:**

- Create: `src/hooks/api/customer/__tests__/wishlist.test.jsx`
- Modify: `src/hooks/api/customer/wishlist.js`

- [x] **Step 1: Write failing tests**

Cover disabled fetching and two hook consumers observing the same optimistic item before the POST resolves. Add rollback, overlapping save, and optimistic removal cases around mocked service promises.

- [x] **Step 2: Verify RED**

Run:

```bash
npx jest src/hooks/api/customer/__tests__/wishlist.test.jsx --runInBand
```

Expected: the existing hook fails disabled-fetch and optimistic-state assertions.

- [x] **Step 3: Implement identity-scoped optimistic mutations**

Extract `enabled` before building request parameters, use a `null` SWR key when disabled, preserve existing response shapes, and mutate `WISHLIST_ITEMS_KEY` through `useSWRConfig()`.

For add, insert `{ ...payload, id: `optimistic:${item_type}:${item_id}` }`, replace only that temporary row on success, and remove only that row on failure. For removal, capture the affected identity, delete it optimistically, and merge back only the missing captured row if DELETE rejects. Rethrow service errors after rollback so the UI can report them.

- [x] **Step 4: Verify GREEN**

Run the focused hook test. Expected: five tests pass without warnings.

### Task 2: Build the single-item wishlist control

**Files:**

- Create: `src/app/components/Wishlist/WishlistButton.jsx`
- Create: `src/app/components/Wishlist/__tests__/WishlistButton.test.jsx`

- [x] **Step 1: Write failing UI tests**

Test initial red state, immediate red state after save, neutral state after removal, guest auth modal behavior, and post-login callback success/failure. Assert saved state with:

```jsx
expect(screen.getByRole('button', { name: /remove desert safari from wishlist/i })).toHaveAttribute('aria-pressed', 'true');
expect(screen.getByTestId('wishlist-heart')).toHaveClass('fill-destructive', 'text-destructive');
expect(screen.getByText('Saved to Wishlist')).toBeVisible();
```

- [x] **Step 2: Implement the label control**

Create `WishlistButton({ item, className = '' })`. Normalize the item, call `useWishlistItems({ enabled: status === 'authenticated' })`, derive saved state by string-safe identity comparison, and render heart plus `Save to Wishlist` or `Saved to Wishlist` at all breakpoints.

Use one async action for authenticated clicks and the auth-modal callback. It owns pending state, add/remove choice, success toast, backend-aware failure toast, and `finally` cleanup. It consumes expected service failures after showing the toast so the modal cannot create an unhandled rejection.

- [ ] **Step 3: Remove the unused card/icon variant and verify GREEN**

Run:

```bash
npx jest src/app/components/Wishlist/__tests__/WishlistButton.test.jsx --runInBand
```

Expected: seven tests pass and no circular icon-only variant remains.

### Task 3: Connect only the single-item banner

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/singleproduct/BannerSection.jsx`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/BannerSection.test.jsx`
- Verify unchanged: `src/app/components/ui/item-card.jsx`
- Verify unchanged: `src/lib/mapProductToItemCard.js`

- [x] **Step 1: Write the failing banner integration test**

Mock the shared control and assert it receives the detail snapshot containing ID, type, title, slug, city, price, and currency.

- [x] **Step 2: Replace banner-local save-only logic**

Remove direct service, session, auth store, toast, and local saving state from `BannerSection`. Render:

```jsx
<WishlistButton item={wishlistItem} />
```

- [ ] **Step 3: Verify cards remain heart-free**

Run existing mapper and card-section tests, then inspect every `ItemCard` call. No card receives or renders `WishlistButton`; the detail banner is the only public product surface with the control.

### Task 4: Complete verification and review

- [ ] **Step 1: Run wishlist and dashboard tests**

Run:

```bash
npx jest src/hooks/api/customer/__tests__/wishlist.test.jsx src/app/components/Wishlist/__tests__/WishlistButton.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/BannerSection.test.jsx src/lib/wishlist/__tests__/normalizeWishlistItem.test.js --runInBand
npx jest --runTestsByPath 'src/app/(dashboard)/dashboard/customer/wishlist/__tests__/WishlistClient.test.jsx' --runInBand
```

- [ ] **Step 2: Apply error-handling review and static checks**

Apply `error-handling-patterns`, then run `npm run type-check`, `npm run lint`, and `git diff --check`. All must exit zero.

- [ ] **Step 3: Verify the visible local UI**

Open `http://localhost:3000` in named headed session `weelp-wishlist-visible`. Confirm listing cards have no heart. On a single-item page, confirm a guest click opens login/signup. Log in locally, save the item, confirm the heart immediately turns red and says `Saved to Wishlist`, then open the customer dashboard and confirm the item appears without a manual refresh.

- [ ] **Step 4: Run review and simplify gates**

Dispatch the required code-reviewer agent over the final diff, fix critical findings, and re-review. Apply simplification without changing behavior. If UI code changes, repeat visible verification. Rerun focused tests, type-check, lint, and `git diff --check`.

- [ ] **Step 5: Commit and push main**

Confirm the branch is `main`, stage only this wishlist work, commit with `fix: synchronize wishlist state`, and push `origin main` after hooks pass.
