# Mini Cart Single Booking Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the mini cart with one-booking checkout and make the edit icon useful for itinerary/activity bookings.

**Architecture:** Update the Zustand mini-cart store so `addItem` replaces the cart with one normalized item. Extend the product card with a derived edit href that only supports public itinerary/activity URLs with city and item slugs. Add missing activity route metadata when adding from `SingleProductForm`, and hydrate the product sidebar from `editCartItem`.

**Tech Stack:** Next.js 16, React 19, Zustand, Jest, Testing Library.

---

### Task 1: Cart Store Replacement Behavior

**Files:**

- Modify: `src/lib/store/useMiniCartStore.js`
- Test: `src/lib/store/useMiniCartStore.test.js`

- [ ] **Step 1: Add a failing store test**

Create `src/lib/store/useMiniCartStore.test.js` with tests that reset persisted state, add two valid items, and expect the second item to be the only cart line.

- [ ] **Step 2: Run the store test and confirm it fails**

Run: `npm test -- src/lib/store/useMiniCartStore.test.js --runInBand`

Expected: the replacement test fails because the current store appends new cart lines.

- [ ] **Step 3: Replace append logic**

Change `addItem` so it validates price, normalizes the new item, sets `cartItems` to `[normalized]`, and sets `totalPrice` to the normalized item price.

- [ ] **Step 4: Run the store test and confirm it passes**

Run: `npm test -- src/lib/store/useMiniCartStore.test.js --runInBand`

Expected: all store tests pass.

### Task 2: Mini Cart Edit Link

**Files:**

- Modify: `src/app/components/MiniCartProductCard.jsx`
- Test: `src/app/components/__tests__/MiniCartProductCard.test.jsx`

- [ ] **Step 1: Add failing component tests**

Extend the existing test file with cases for an activity edit link, a package with no edit link, and missing route metadata with no edit link.

- [ ] **Step 2: Run the component test and confirm it fails**

Run: `npm test -- src/app/components/__tests__/MiniCartProductCard.test.jsx --runInBand`

Expected: edit-link tests fail because the icon is static.

- [ ] **Step 3: Implement derived edit href**

Import `NavigationLink`, render the pen as a link only for `activity` or `itinerary` lines with `citySlug` and `itemSlug`, and keep delete behavior unchanged.

- [ ] **Step 4: Run the component test and confirm it passes**

Run: `npm test -- src/app/components/__tests__/MiniCartProductCard.test.jsx --runInBand`

Expected: all product-card tests pass.

### Task 3: Pass Routing Metadata From Cart Lines

**Files:**

- Modify: `src/app/components/Modals/MiniCartNew.jsx`
- Modify: `src/app/components/Form/SingleProductForm.jsx`

- [ ] **Step 1: Pass slugs into the product card**

Forward `val.city_slug` and `val.slug` from `MiniCartNew` to `MiniCartProductCard`.

- [ ] **Step 2: Store activity slugs when adding**

In `SingleProductForm`, include `slug` and `city_slug` for activity cart lines as well as itineraries.

- [ ] **Step 3: Run focused tests**

Run:

```bash
npm test -- src/lib/store/useMiniCartStore.test.js src/app/components/__tests__/MiniCartProductCard.test.jsx --runInBand
```

Expected: all focused tests pass.

### Task 4: Verification

**Files:**

- No further file changes expected.

- [ ] **Step 1: Run lint**

Run: `npm run lint`

Expected: lint completes without new errors.

- [ ] **Step 2: Run a production build if lint passes**

Run: `npm run build`

Expected: build completes.

- [ ] **Step 3: Browser check**

Run the frontend and open a visible browser session to a public item page. Add an item, add another item, confirm the mini cart contains only the newest item, and confirm the edit icon navigates back to the item page.

### Task 5: Product Sidebar Edit Hydration

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx`
- Modify: `src/app/components/Form/SingleProductForm.jsx`
- Test: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarCartEdit.test.jsx`

- [ ] **Step 1: Add failing sidebar edit test**

Render `ProductSidebar` with `editCartItem=42` and a matching activity cart line. Expect the traveler count, date range, matching add-on, and `Update booking` action to appear.

- [ ] **Step 2: Hydrate form state from cart**

Read `editCartItem` from `useSearchParams`, find the matching cart line, reset the form date/traveler fields, and derive selected add-ons from cart addon IDs.

- [ ] **Step 3: Keep the update action available**

When editing the cart item already on the page, show the submit action as `Update booking` instead of replacing it with `Item Moved to Cart`.
