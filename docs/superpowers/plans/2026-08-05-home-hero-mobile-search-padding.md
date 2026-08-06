# Home Hero Mobile Search Padding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 0.9rem, even mobile-only inset around the home hero search while preserving the current tablet and desktop layout.

**Architecture:** Keep the existing `HeroSearchPill` composition unchanged and replace the mobile padding utility on its inner rounded panel, which directly surrounds the three search controls and Search button. Lock the breakpoint behavior and the absence of added outer-wrapper padding with the existing focused `HeroSection` component test.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Jest, React Testing Library

---

### Task 1: Increase padding on the mobile search panel

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/home/HeroSearchPill.jsx:8`
- Revert: `src/app/components/Pages/FRONT_END/home/HeroSection.jsx:70`

- [ ] **Step 1: Write the failing responsive-spacing assertion**

Extend the shared-search test so it identifies the inner rounded panel through the mocked search child, asserts its 0.9rem mobile padding and `sm` reset, and confirms the outer hero wrapper remains unchanged:

```jsx
it('applies mobile-only padding to the panel around the search controls', () => {
  const { getByTestId } = render(<HeroSection />);

  const search = getByTestId('home-discovery-search');
  const searchPanel = search.parentElement;
  const heroSearchWrapper = search.closest('.weelp-hero-ui-rise');

  expect(search).toBeInTheDocument();
  expect(searchPanel).toHaveClass('p-[0.9rem]', 'sm:p-0');
  expect(heroSearchWrapper).not.toHaveClass('p-[0.9rem]', 'sm:p-0');
});
```

- [ ] **Step 2: Run the focused test and verify the new assertion fails**

Run:

```bash
npm test -- --runInBand src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx
```

Expected: FAIL because the inner search panel still contains `p-3`, and the outer hero wrapper incorrectly contains `p-[0.9rem] sm:p-0`.

- [ ] **Step 3: Add the minimal responsive padding utilities**

Restore the outer hero search wrapper to its original classes, then update only the existing inner rounded panel without changing its structure or child component:

```jsx
<div
  className="weelp-hero-ui-rise relative z-20 w-full max-w-[920px]"
  style={{ '--weelp-motion-delay': '400ms', marginTop: '-6px' }}
>
  <HeroSearchPill />
</div>

<div className="relative overflow-visible rounded-[24px] bg-background p-[0.9rem] shadow-[0_18px_45px_-22px_rgba(18,51,71,0.25)] dark:shadow-none sm:rounded-[28px] sm:p-0">
  <HomeActivityItinerarySearch />
</div>
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
npm test -- --runInBand src/app/components/Pages/FRONT_END/home/__tests__/HeroSection.test.jsx
```

Expected: PASS for every `HeroSection` test.

- [ ] **Step 5: Run static verification**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit successfully with no new errors or whitespace issues.

- [ ] **Step 6: Verify the result in the visible local browser**

Open `http://localhost:3000` in a fresh named headed `agent-browser` session, set the viewport to `390 844`, and inspect the home hero search. Then set the viewport to `768 900` and inspect the same wrapper again.

Expected: at 390 pixels wide the inner rounded panel around the three controls and Search button has 0.9rem (14.4 pixels at the default root size) of space on all four sides and remains usable; the outer hero wrapper has zero padding. At 768 pixels wide the inner panel padding is reset to zero.

- [ ] **Step 7: Review and simplify the final diff**

Review only the two implementation files against the approved design. Confirm that the implementation adds no state, event handlers, components, dependencies, or unrelated visual changes.
