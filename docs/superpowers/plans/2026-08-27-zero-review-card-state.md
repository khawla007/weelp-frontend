# Zero Review Card State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the existing review row as `★ 0 (0)` when public product data explicitly reports zero approved reviews, without emitting invalid AggregateRating schema.

**Architecture:** Preserve explicit zero values in the product mapper, then separate visible review-row eligibility from structured-data eligibility inside the full `ItemCard`. Missing or invalid review data stays hidden.

**Tech Stack:** Next.js 16, React 19, JavaScript/JSX, Jest, React Testing Library.

---

### Task 1: Preserve explicit zero review data

**Files:**

- Modify: `src/lib/__tests__/mapProductToItemCard.test.js`
- Modify: `src/lib/mapProductToItemCard.js`

- [ ] **Step 1: Write failing mapper assertions**

Convert the existing explicit-zero case into the positive zero-state contract: with `average_rating: 0` and `reviews_count: 0`, assert `rating: '0'`, `ratingValue: 0`, `reviewCount: '0'`, and `reviewCountValue: 0`. Add a genuinely missing-input fixture and assert all four outputs—`rating`, `ratingValue`, `reviewCount`, and `reviewCountValue`—are `null`; retain the malformed/out-of-range case as invalid-input coverage.

- [ ] **Step 2: Run the mapper test and verify RED**

```bash
npx jest src/lib/__tests__/mapProductToItemCard.test.js --runInBand
```

Expected: FAIL because the mapper currently converts explicit zero review values to `null`.

- [ ] **Step 3: Implement the minimal mapper correction**

Allow rating zero through `formatRating` and the valid rating range; allow review-count zero through `formatReviewCount` and the valid non-negative integer range. Do not default missing values to zero.

- [ ] **Step 4: Run the mapper test and verify GREEN**

```bash
npx jest src/lib/__tests__/mapProductToItemCard.test.js --runInBand
```

Expected: PASS.

### Task 2: Render zero reviews without invalid schema

**Files:**

- Modify: `src/app/components/ui/__tests__/ItemCard.test.jsx`
- Modify: `src/app/components/ui/item-card.jsx`

- [ ] **Step 1: Write failing ItemCard assertions**

Add a stable `data-testid="product-item-review"` marker to the visible review row. Render a full card with `rating="0"`, `ratingValue={0}`, `reviewCount="0"`, and `reviewCountValue={0}`; assert the marked row contains the star, `0`, and `(0)`, but no `AggregateRating` itemtype exists. Add separate missing and invalid full-card fixtures/rerenders and assert the marked review row is absent, so the test cannot confuse review zero with unrelated price or text. Retain the positive review schema test.

- [ ] **Step 2: Run the ItemCard test and verify RED**

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx --runInBand
```

Expected: FAIL because the visible row currently shares the positive-only schema condition.

- [ ] **Step 3: Implement separate visual and schema predicates**

Add a display predicate accepting valid non-negative review values. Use it for the visible row. Keep the current positive-only predicate for `AggregateRating` metadata, conditionally adding schema attributes and meta tags only when eligible.

- [ ] **Step 4: Run focused tests and verify GREEN**

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx src/lib/__tests__/mapProductToItemCard.test.js --runInBand
```

Expected: PASS.

### Task 3: Review and verify

**Files:**

- Modify: `Reports/daily-work-report.md` from the workspace root after verification.

- [ ] **Step 1: Run project gates**

```bash
npm run type-check
npm run lint
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx src/lib/__tests__/mapProductToItemCard.test.js src/app/components/Pages/FRONT_END/shared/__tests__/SharedFilterSection.test.jsx --runInBand
npm run build
git diff --check
```

- [ ] **Step 2: Verify the visible localhost city page**

On `/cities/dubai`, confirm zero-review filter cards display `★ 0 (0)`, reviewed cards retain their real values, and no browser runtime errors appear at desktop and mobile widths.

- [ ] **Step 3: Complete review and delivery**

Run the mandatory code-reviewer gate, apply `simplify` only if it improves clarity without changing behavior, repeat affected verification after any changes, update the daily report, commit, and push frontend `main`.
