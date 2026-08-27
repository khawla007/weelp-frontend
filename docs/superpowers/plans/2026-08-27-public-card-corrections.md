# Public Card Corrections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore natural-height blog cards and the compact two-card AI Travel Buddy featured-activity carousel without changing other shared card consumers.

**Architecture:** Keep the existing explicit `editorial` and `product-compact` `ItemCard` compositions. Remove only the product fixed-height token from editorial cards, then restore the Travel Buddy consumer's previous compact variant and carousel density.

**Tech Stack:** Next.js 16, React 19, JavaScript/JSX, Tailwind CSS, Jest, React Testing Library, agent-browser.

---

### Task 1: Lock both regressions with focused tests

**Files:**

- Modify: `src/app/components/ui/__tests__/ItemCard.test.jsx`
- Modify: `src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx`

- [ ] **Step 1: Change the editorial geometry assertion**

Assert that `editorial-item-card` keeps `rounded-[24px]` but does not contain any class from `FEATURE_CARD_HEIGHT_CLASS`, while the full product card still contains its fixed-height classes.

- [ ] **Step 2: Restore the Travel Buddy contract assertions**

Render at least two rich activity fixtures and assert `breakpoints` equals `{ 0: { slidesPerView: 2, spaceBetween: 12 } }`. Assert every mocked `ItemCard` node receives `variant="product-compact"` and `imageClassName="h-[112px] sm:h-[185px] lg:h-[200px]"`, so the test proves the contract for every rendered slide rather than a single fixture. Keep and run the real `ItemCard.test.jsx` product-compact test as the source of truth that rating, description, attributes, price, Explore, wishlist, and publication content are absent.

- [ ] **Step 3: Run the focused tests and verify RED**

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx --runInBand
```

Expected: FAIL because editorial cards still include product fixed heights and Travel Buddy still uses one full card per slide.

### Task 2: Apply the minimal component corrections

**Files:**

- Modify: `src/app/components/ui/item-card.jsx`
- Modify: `src/app/components/Home/TravelBuddyWidget.jsx`

- [ ] **Step 1: Make editorial height content-driven**

Remove `FEATURE_CARD_HEIGHT_CLASS` only from `EditorialItemCard`'s article class list. Keep the shared surface, media, hover, focus, and full-product composition unchanged.

- [ ] **Step 2: Restore the compact Travel Buddy composition**

Set `BUDDY_SLIDER_BREAKPOINTS` to two slides at the zero breakpoint and render `ItemCard` with `variant="product-compact"` plus `imageClassName="h-[112px] sm:h-[185px] lg:h-[200px]"`.

- [ ] **Step 3: Run focused tests and verify GREEN**

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx --runInBand
```

Expected: PASS.

### Task 3: Review and verify

**Files:**

- Modify: `Reports/daily-work-report.md` from the workspace root after verification.

- [ ] **Step 1: Run static checks and focused regression tests**

```bash
npm run type-check
npm run lint
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx src/app/components/ui/__tests__/BlogSection.test.jsx src/app/components/ui/__tests__/ProductSliderSection.test.jsx src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx --runInBand
npm run build
git diff --check
```

- [ ] **Step 2: Verify in the visible localhost browser**

On `/`, confirm Your Guide blog cards follow their content height and AI Travel Buddy shows two compact featured cards with only image, category, and title. Check desktop and mobile widths and confirm no console/runtime errors.

- [ ] **Step 3: Complete mandatory review gates**

Run the code-reviewer gate, address findings, invoke `simplify`, repeat verification if code changes, update the daily report, commit, and push frontend `main`.
