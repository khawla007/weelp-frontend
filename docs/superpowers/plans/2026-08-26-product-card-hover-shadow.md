# Product Card Hover Shadow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the existing theme-aware hover shadow to every shared full product card without changing its border, geometry, compact variant, or touch layout.

**Architecture:** The shared `FullItemCard` article remains the single owner of the full-card silhouette. A tokenized Tailwind hover-shadow class and shadow-only transition are added there, while existing light, dark, and `/home-gold` CSS variables continue to supply the theme-specific values.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Jest, React Testing Library, agent-browser.

---

### Task 1: Add the shared full-card hover shadow

**Files:**

- Modify: `src/app/components/ui/__tests__/ItemCard.test.jsx`
- Modify: `src/app/components/ui/item-card.jsx`
- Modify: `Reports/daily-work-report.md` from the workspace root after verification

- [ ] **Prerequisite: Apply the mandatory Next.js and React guidance**

Before editing JSX, invoke and apply `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Keep the behavior on the existing shared full-card article; do not add a client boundary, state, a new prop, or a parallel card component.

- [ ] **Step 1: Write the failing full-card hover contract**

Extend the existing `renders the home-gold composition with a sibling detail link and wishlist control` test with:

```jsx
expect(card).toHaveClass(
  'transition-shadow',
  'duration-300',
  'hover:[box-shadow:var(--weelp-card-hover-shadow)]',
  'motion-reduce:transition-none',
);
expect(card.className).not.toMatch(/hover:(?:-?translate|scale)/);
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx --runInBand
```

Expected: FAIL because the full-card article does not yet include the hover-shadow or shadow-transition classes.

- [ ] **Step 3: Implement the minimal tokenized hover treatment**

In `FullItemCard`, change only the article class to include the approved classes:

```jsx
className={`relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--weelp-card-border)] bg-background p-2 transition-shadow duration-300 hover:[box-shadow:var(--weelp-card-hover-shadow)] motion-reduce:transition-none ${className}`}
```

Do not add transforms, new shadow values, JavaScript hover state, or border changes.

- [ ] **Step 4: Run focused regression tests**

Run:

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx src/app/__tests__/deepForestTheme.test.js --runInBand
```

Expected: both suites PASS. Compact-card assertions and light/dark/gold token contracts remain green.

- [ ] **Step 5: Apply the code-quality gate**

Review the static class change against `error-handling-patterns`; no runtime error path or fallback is introduced. Then run:

```bash
git diff --check
npm run type-check
npm run lint
npm run build
```

Expected: every command exits 0.

- [ ] **Step 6: Verify the visible browser behavior**

In the named headed `weelp-visible` localhost session, verify the first full card before and during hover:

- resting `box-shadow` is `none`;
- hovered `box-shadow` is non-`none`;
- border color and card rectangle remain unchanged;
- normal dark keeps `#263b33` and dark `/home-gold` keeps the scoped gold border;
- compact blog cards retain their existing behavior.

- [ ] **Step 7: Complete review, reporting, and integration**

Request the mandatory code-review agent, address any findings, perform the simplify pass, rerun the verification commands, update the August 26 daily report, and commit:

```bash
git add src/app/components/ui/item-card.jsx src/app/components/ui/__tests__/ItemCard.test.jsx
git commit -m "feat(cards): add hover shadow"
git push origin main
```

Confirm `HEAD` equals `origin/main` and the worktree is clean.
