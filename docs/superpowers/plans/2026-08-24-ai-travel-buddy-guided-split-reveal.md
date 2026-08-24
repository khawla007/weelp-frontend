# AI Travel Buddy Guided Split Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved guided split entrance to “Your AI Travel Buddy” on the main homepage while leaving `/home-gold` unchanged.

**Architecture:** Keep `AiSection` server-rendered and retain one `Reveal` observer at the section root. An explicit `entrance="guided-split"` variant adds semantic data hooks to the heading and four cards; CSS owns the responsive direction, timing, stagger, and reduced-motion behavior. The existing globe activation and card hover interactions remain untouched.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, CSS keyframes, Jest, Testing Library

---

### Task 1: Define and verify the homepage-only entrance contract

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/home/AiSection.jsx`
- Modify: `src/app/components/Home/TravelBuddyWidget.jsx`
- Modify: `src/app/(frontend)/page.js`
- Modify: `src/app/(frontend)/home-gold/__tests__/page.test.jsx`
- Verify unchanged: `src/app/(frontend)/home-gold/page.js`

- [ ] **Step 1: Write failing component tests**

Add tests that render `AiSection({ entrance: 'guided-split' })` and assert one section-level `data-ai-travel-buddy-entrance="guided-split"` hook, `data-ai-travel-buddy-role` hooks for `heading`, `chat`, `map`, `savings`, and `personalised`, and no nested `data-reveal` observers. Assert that the grid retains `lg:grid-cols-3`, has exactly four direct `article` children, and preserves `lg:row-span-2` on chat plus `lg:col-span-2` on personalised. Also render `AiSection()` and assert the entrance and role hooks are absent while the existing reveal structure remains.

Extend the existing route-composition test in `src/app/(frontend)/home-gold/__tests__/page.test.jsx` to locate both `AiSection` elements and assert that main `/` receives `entrance="guided-split"` while `/home-gold` receives no entrance prop.

- [ ] **Step 2: Run the focused component test and confirm the new assertions fail**

Run: `npx jest --runTestsByPath src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' --runInBand`

Expected: FAIL because the guided-split entrance contract is not implemented yet.

- [ ] **Step 3: Implement the explicit entrance variant**

Update `AiSection` to accept an `entrance` string, use the section root as the only reveal observer for the guided split, add role hooks conditionally, and pass the explicit variant to `TravelBuddyWidget`. Update `TravelBuddyWidget` to attach conditional chat and map role hooks without adding wrappers that would break the CSS grid. Set `<AiSection entrance="guided-split" />` only in `src/app/(frontend)/page.js`; keep `/home-gold` as `<AiSection />`.

- [ ] **Step 4: Run the focused component test and confirm it passes**

Run: `npx jest --runTestsByPath src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' --runInBand`

Expected: PASS.

### Task 2: Add the responsive motion treatment

**Files:**

- Create: `src/app/components/Pages/FRONT_END/home/__tests__/AiSectionMotionStyles.test.js`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write failing stylesheet contract tests**

Add stylesheet contract assertions for the variable-driven `weelpAiTravelBuddyReveal` keyframe and the exact root selector `[data-ai-travel-buddy-entrance='guided-split']`. Verify the root itself is neutral; state-independent role selectors own `--weelp-ai-x`, `--weelp-ai-y`, and `--weelp-ai-scale` so the variables remain defined when the root changes from pending to shown; pending role rules own only opacity, transform, and `will-change`; shown role rules own animation and delay. Verify the heading uses 700ms at 0ms; chat, map, savings, and personalised use 850ms at 100ms, 200ms, 300ms, and 400ms respectively. Verify mobile defaults use `x: 0` and `y: 16px`, the heading overrides `y: 24px`, personalised uses `scale: 0.985`, and the `min-width: 1024px` rule switches chat to `x: -32px, y: 0` and map/savings to `x: 32px, y: 0`. Verify reduced motion resets every role's opacity, transform, animation, delay, and will-change.

- [ ] **Step 2: Run the stylesheet test and confirm it fails**

Run: `npx jest src/app/components/Pages/FRONT_END/home/__tests__/AiSectionMotionStyles.test.js --runInBand`

Expected: FAIL because the keyframe and selectors do not exist yet.

- [ ] **Step 3: Implement the CSS animation**

Add one `weelpAiTravelBuddyReveal` keyframe whose start transform is `translate3d(var(--weelp-ai-x, 0), var(--weelp-ai-y, 0), 0) scale(var(--weelp-ai-scale, 1))` and whose end is zero translation at scale 1. Neutralize the guided-split section root in both pending and shown states so it does not blanket-fade. Define each role's transform variables in selectors that match both pending and shown root states. Pending role rules own only opacity, the matching transform, and `will-change`; shown role rules own the keyframe animation and the exact delays below.

- Heading: `x: 0`, `y: 24px`, scale 1, 700ms, 0ms delay.
- Chat: mobile `x: 0`, `y: 16px`; desktop `x: -32px`, `y: 0`; scale 1, 850ms, 100ms delay.
- Map: mobile `x: 0`, `y: 16px`; desktop `x: 32px`, `y: 0`; scale 1, 850ms, 200ms delay.
- Savings: mobile `x: 0`, `y: 16px`; desktop `x: 32px`, `y: 0`; scale 1, 850ms, 300ms delay.
- Personalised: `x: 0`, `y: 16px`, scale `0.985`, 850ms, 400ms delay.

Use only opacity and transform. Add a reduced-motion selector list covering every `data-ai-travel-buddy-role` and reset `opacity: 1`, `transform: none`, `animation: none`, `animation-delay: 0ms`, and `will-change: auto`.

- [ ] **Step 4: Run both focused test files**

Run: `npx jest --runTestsByPath src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/AiSectionMotionStyles.test.js 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' --runInBand`

Expected: PASS.

### Task 3: Verify behavior and visual quality

**Files:**

- Verify: all modified files

- [ ] **Step 1: Run project checks**

Run: `npm run type-check`

Expected: exit 0.

Run: `npm run lint`

Expected: exit 0.

- [ ] **Step 2: Review the implementation diff**

Run: `git diff --check`

Expected: no whitespace errors.

Run: `git diff -- 'src/app/(frontend)/page.js' 'src/app/(frontend)/home-gold/page.js' 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' src/app/components/Pages/FRONT_END/home/AiSection.jsx src/app/components/Home/TravelBuddyWidget.jsx src/app/globals.css src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/AiSectionMotionStyles.test.js`

Expected: `/` opts in, `/home-gold` does not, and changes are limited to the approved entrance.

Run: `git diff --no-index /dev/null src/app/components/Pages/FRONT_END/home/__tests__/AiSectionMotionStyles.test.js`

Expected: the full untracked stylesheet contract test is visible for review; exit 1 is normal because the file differs from `/dev/null`.

- [ ] **Step 3: Inspect in the mandatory visible browser**

Open `http://localhost:3000` with a named headed `agent-browser` session. Verify the section sequence at desktop and mobile widths, measure `scrollWidth <= clientWidth` while roles are pending, while animations are active, and after they settle, confirm the globe and hover interactions still work, and confirm `/home-gold` retains its previous reveal. Emulate `prefers-reduced-motion: reduce`, confirm `matchMedia` reports the preference, and verify all five roles compute to fully visible static styles.

### Task 4: Complete review, simplify, and fresh verification gates

**Files:**

- Review: all modified and created files

- [ ] **Step 1: Dispatch the mandatory code-reviewer agent**

Review the complete diff against the approved design, route isolation, observer architecture, responsive directions, reduced motion, accessibility, and tests. Address every critical or important finding, then re-run the review until approved.

- [ ] **Step 2: Run the mandatory simplify pass**

Invoke the repository's `simplify` skill if available. If the skill is unavailable in the current environment, explicitly report that constraint and perform the same focused clarity/reuse/efficiency pass without broad refactoring. Re-run focused tests after any edit.

- [ ] **Step 3: Run fresh final verification**

Run: `npx jest --runTestsByPath src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/AiSectionMotionStyles.test.js 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' --runInBand`

Expected: all suites pass.

Run: `npm run type-check`

Expected: exit 0.

Run: `npm run lint`

Expected: exit 0.

Run: `git diff --check`

Expected: no output.

Run: `git status --short`

Expected: only these eight paths are changed:

```text
docs/superpowers/plans/2026-08-24-ai-travel-buddy-guided-split-reveal.md
src/app/(frontend)/home-gold/__tests__/page.test.jsx
src/app/(frontend)/page.js
src/app/components/Home/TravelBuddyWidget.jsx
src/app/components/Pages/FRONT_END/home/AiSection.jsx
src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx
src/app/components/Pages/FRONT_END/home/__tests__/AiSectionMotionStyles.test.js
src/app/globals.css
```

- [ ] **Step 4: Stage the exact verified files only after user approval to commit**

Run: `git add docs/superpowers/plans/2026-08-24-ai-travel-buddy-guided-split-reveal.md 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' 'src/app/(frontend)/page.js' src/app/components/Home/TravelBuddyWidget.jsx src/app/components/Pages/FRONT_END/home/AiSection.jsx src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/AiSectionMotionStyles.test.js src/app/globals.css`
