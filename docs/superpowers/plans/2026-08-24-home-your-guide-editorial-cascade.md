# Your Guide Editorial Cascade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved Steel Nova-inspired Editorial Right Cascade to the main homepage “Your Guide” carousel without changing `/home-gold` or other `BlogSection` callers.

**Architecture:** `BlogSection` receives an explicit `entrance="editorial-right"` variant and uses one root `Reveal` observer only for that variant. `CarouselShell` remains responsible for Swiper markup and capped slide indexes, while scoped CSS owns the header rise, card direction, stagger, responsive fallback, and reduced-motion reset.

**Tech Stack:** Next.js 16, React 19, Swiper, Tailwind CSS, CSS keyframes, Jest, Testing Library

---

### Task 0: Confirm the execution environment and required guidance

**Files:**

- Read: `../.agents/skills/next-best-practices/SKILL.md`
- Read: `../.agents/skills/vercel-react-best-practices/SKILL.md`
- Read: `../.agents/skills/vercel-composition-patterns/SKILL.md`
- Verify: current Git branch

- [ ] **Step 1: Confirm implementation will occur on the required branch**

Run:

```bash
test "$(git branch --show-current)" = "main"
```

Expected: exit 0. Stop before editing if the branch is not `main`.

- [ ] **Step 2: Load the mandatory Next.js and React guidance**

Read all three listed `SKILL.md` files completely before writing implementation code. Preserve the current client boundaries: `BlogSection`, `CarouselShell`, and `Reveal` remain client components; no new fetch or server/client serialization path is introduced.

### Task 1: Lock the shared component and route contracts

**Files:**

- Create: `src/app/components/ui/__tests__/BlogSection.test.jsx`
- Modify: `src/app/components/ui/__tests__/CarouselShell.test.jsx`
- Modify: `src/app/(frontend)/home-gold/__tests__/page.test.jsx`
- Modify: `src/app/components/ui/BlogSection.jsx`
- Modify: `src/app/components/ui/CarouselShell.jsx`
- Modify: `src/app/(frontend)/page.js`
- Verify unchanged: `src/app/(frontend)/home-gold/page.js`

- [ ] **Step 1: Write failing `BlogSection` variant tests**

Mock `Reveal`, `CarouselShell`, and `ItemCard`, then render one blog with and without the entrance variant. Add a third test asserting `BlogSection({ blogs: [] })` returns `null`. The editorial assertion must prove one root reveal, a plain heading row with `data-guide-section-header`, no nested reveal wrappers, and these carousel props:

```jsx
expect(mockCarouselShell).toHaveBeenLastCalledWith(
  expect.objectContaining({
    entrance: 'editorial-right',
    observeReveal: false,
  }),
  undefined,
);
```

Also assert that the call preserves the exact blog-carousel contract:

```jsx
expect(mockCarouselShell).toHaveBeenLastCalledWith(
  expect.objectContaining({
    navigationPrefix: 'guide-blog',
    breakpoints: {
      450: { slidesPerView: 1, spaceBetween: 10 },
      640: { slidesPerView: 2, spaceBetween: 15 },
      768: { slidesPerView: 3, spaceBetween: 15 },
      1024: { slidesPerView: 4, spaceBetween: 20 },
      1440: { slidesPerView: 5, spaceBetween: 20 },
    },
    slideClassName: '!h-auto',
    showMobilePagination: true,
  }),
  undefined,
);
```

Call the captured `renderSlide` with the mapped fixture and assert it returns the existing compact `ItemCard` with the same `href`, `image`, `title`, `category`, and `publishedAt` props. This locks card rendering without testing internal CSS classes.

The default assertion must prove `data-guide-section-entrance` is absent, the two existing `BlogSection` reveal wrappers remain, and both `entrance` and `observeReveal` stay undefined at the `CarouselShell` callsite.

- [ ] **Step 2: Extend the failing `CarouselShell` index contract**

Add a test that renders seven slides with `entrance="editorial-right"`, `observeReveal={false}`, navigation, pagination, and a supplied breakpoint object. Assert `data-carousel-entrance="editorial-right"`, no `data-reveal`, seven direct `.swiper-slide` elements, and indexes `0`, `4`, and `4` on slides 1, 5, and 7. Assert the captured Swiper props still contain `slidesPerView: 1.08`, `spaceBetween: 18`, the supplied breakpoints, navigation selectors, and clickable dynamic pagination. Keep the existing `stagger-right` test unchanged.

- [ ] **Step 3: Extend the failing main-versus-gold route test**

Add a route-composition test to `src/app/(frontend)/home-gold/__tests__/page.test.jsx`:

```jsx
publicApi.get.mockResolvedValue({
  data: { data: [{ id: 3, title: 'A local guide' }] },
});

const homeChildren = await getHomeChildren();
const goldChildren = await getGoldChildren();
const homeGuide = homeChildren.find((child) => child.type.sectionName === 'BlogSection');
const goldGuide = goldChildren.find((child) => child.type.sectionName === 'BlogSection');

expect(homeGuide).toBeDefined();
expect(goldGuide).toBeDefined();
expect(homeGuide.props.entrance).toBe('editorial-right');
expect(goldGuide.props.entrance).toBeUndefined();
```

Locate each element by `child.type.sectionName === 'BlogSection'`, matching the existing Curate and AI-section isolation tests.

- [ ] **Step 4: Run the three files and verify RED**

Run:

```bash
npx jest --runTestsByPath \
  src/app/components/ui/__tests__/BlogSection.test.jsx \
  src/app/components/ui/__tests__/CarouselShell.test.jsx \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  --runInBand
```

Expected: FAIL because neither component accepts `editorial-right` and the main route does not pass it.

- [ ] **Step 5: Implement the minimal component contract**

In `BlogSection.jsx`, add `entrance` to the component signature and JSDoc, then derive `usesEditorialEntrance = entrance === 'editorial-right'`. For this variant only:

```jsx
<Reveal as="section" initialHidden data-guide-section-entrance="editorial-right" className={sectionClassName}>
  <div data-guide-section-header className="flex items-center justify-between">
    {/* existing SectionHeader and navigation buttons */}
  </div>
  <div>
    <CarouselShell entrance="editorial-right" observeReveal={false} {...existingCarouselProps} />
  </div>
</Reveal>
```

When the variant is absent, preserve the current `<section>`, header `Reveal`, delayed carousel `Reveal`, and default `CarouselShell` props. Do not duplicate the heading, navigation-button, or card-rendering internals; select wrapper components and wrapper props around the existing content.

In `CarouselShell.jsx`, replace the `stagger-right`-only boolean with an indexed-entrance check that accepts exactly `stagger-right` and `editorial-right`. Emit `data-carousel-entrance={entrance}` and `--weelp-carousel-reveal-index: Math.min(index, 4)` for either supported indexed variant. Do not change observer defaults or Swiper configuration.

In the main route, change only the populated-blog call to:

```jsx
<BlogSection blogs={blogs} navigationId="guide-blog" entrance="editorial-right" className="pb-12 md:pb-16 lg:pb-24" />
```

Leave `/home-gold` unchanged.

- [ ] **Step 6: Run the three focused files and verify GREEN**

Run the command from Step 4.

Expected: all assertions pass.

### Task 2: Define the editorial motion contract

**Files:**

- Create: `src/app/components/ui/__tests__/BlogSectionMotionStyles.test.js`
- Modify: `src/app/components/ui/__tests__/Reveal.test.jsx`
- Modify: `src/app/components/ui/Reveal.jsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write the failing no-observer fallback test**

In `Reveal.test.jsx`, delete `global.IntersectionObserver`, render `<Reveal initialHidden>content</Reveal>`, and assert the root becomes `data-reveal="shown"` with `data-reveal-motion="bypassed"`. Extend the existing reduced-motion test with the same bypass-marker assertion. Restore the observer in the existing `beforeEach` for every other test.

- [ ] **Step 2: Write a failing stylesheet contract test**

Read `src/app/globals.css` and assert all of the following:

- `@keyframes weelpGuideCardReveal` starts at opacity 0 with `translate3d(var(--weelp-guide-x, 0), var(--weelp-guide-y, 0), 0)` and ends fully visible at zero translation, with no `scale()`.
- `[data-guide-section-entrance='editorial-right']` neutralizes the root's pending and shown animation.
- The state-independent header hook sets `--weelp-reveal-y: 24px`.
- The state-independent slide rule defaults to `--weelp-guide-x: 0` and `--weelp-guide-y: 16px`.
- Pending header and slides own initial opacity/transform and `will-change`.
- Shown header uses `weelpRevealUp 700ms` with no delay.
- Shown slides use `weelpGuideCardReveal 850ms` and `calc(var(--weelp-carousel-reveal-index, 0) * 110ms)`.
- Inside `@media (min-width: 1024px)`, slides switch to `--weelp-guide-x: 28px` and `--weelp-guide-y: 0`.
- The reduced-motion rule resets the header and slides to opacity 1, no transform, no animation, zero delay, and `will-change: auto`.
- The same reset applies when the root has `data-reveal-motion='bypassed'`, covering browsers without `IntersectionObserver`.

- [ ] **Step 3: Run both tests and verify RED**

Run:

```bash
npx jest --runTestsByPath \
  src/app/components/ui/__tests__/Reveal.test.jsx \
  src/app/components/ui/__tests__/BlogSectionMotionStyles.test.js \
  --runInBand
```

Expected: FAIL because `Reveal` does not emit the bypass marker and the editorial CSS does not exist.

- [ ] **Step 4: Implement the reveal bypass marker**

In `Reveal.jsx`, add a boolean `motionBypassed` state. In the existing branch for reduced motion or missing `IntersectionObserver`, set it to true before setting the reveal state to shown. Set it to false on the normal observer path. Emit this internal attribute on the root:

```jsx
data-reveal-motion={motionBypassed ? 'bypassed' : undefined}
```

Do not expose a new public prop or change observer thresholds, timing variables, SSR state, or `once` behavior.

- [ ] **Step 5: Implement the CSS choreography**

Add one variable-driven card keyframe:

```css
@keyframes weelpGuideCardReveal {
  from {
    opacity: 0;
    transform: translate3d(var(--weelp-guide-x, 0), var(--weelp-guide-y, 0), 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}
```

Use `[data-guide-section-entrance='editorial-right']` as the root for every selector. Keep `--weelp-reveal-y`, `--weelp-guide-x`, and `--weelp-guide-y` in state-independent selectors so they remain defined when `data-reveal` changes from pending to shown. Pending selectors own hidden styles; shown selectors own animations. Add the desktop override at 1024px, a complete reduced-motion selector pair, and an equivalent scoped reset for `[data-reveal-motion='bypassed']` so missing-API fallback is static. Do not add scale, blur, filters, or new overflow clipping.

- [ ] **Step 6: Run all five focused suites and verify GREEN**

Run:

```bash
npx jest --runTestsByPath \
  src/app/components/ui/__tests__/BlogSection.test.jsx \
  src/app/components/ui/__tests__/BlogSectionMotionStyles.test.js \
  src/app/components/ui/__tests__/CarouselShell.test.jsx \
  src/app/components/ui/__tests__/Reveal.test.jsx \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  --runInBand
```

Expected: all suites pass.

### Task 3: Verify behavior in code and the visible browser

**Files:**

- Verify: all modified and created files

- [ ] **Step 1: Apply the mandatory error-handling checkpoint**

Read the `error-handling-patterns` skill completely. Confirm this entrance adds no network requests, user input, asynchronous business operation, or new recoverable error path; the only fallback is the explicit static reveal bypass covered in Task 2.

- [ ] **Step 2: Run project checks**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit 0 and the dark-mode guard reports no new hardcoded-color findings.

- [ ] **Step 3: Inspect the complete diff**

Run:

```bash
git diff -- \
  'src/app/(frontend)/page.js' \
  'src/app/(frontend)/home-gold/page.js' \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  src/app/components/ui/BlogSection.jsx \
  src/app/components/ui/CarouselShell.jsx \
  src/app/components/ui/Reveal.jsx \
  src/app/components/ui/__tests__/CarouselShell.test.jsx \
  src/app/components/ui/__tests__/Reveal.test.jsx \
  src/app/globals.css
nl -ba src/app/components/ui/__tests__/BlogSection.test.jsx
nl -ba src/app/components/ui/__tests__/BlogSectionMotionStyles.test.js
```

Expected: the main route alone opts in; `/home-gold/page.js` has no diff; both new untracked tests are read in full; the shared `Reveal` change is limited to the internal bypass marker.

- [ ] **Step 4: Run the mandatory visible localhost audit**

Open the site visibly first with:

```bash
agent-browser --session weelp-guide-visible --headed --args "--no-sandbox" open http://localhost:3000
```

At 1440×900, capture pending, active, and settled computed styles to verify the 24px header rise, 28px rightward card entrance, 110ms indexes, and no scale. At 390×844, verify every card starts at `translateY(16px)` with zero horizontal translation. At both widths, assert `scrollWidth <= clientWidth` before, during, and after the entrance.

After the cards settle, use the next navigation control and confirm the carousel advances without replaying entrance animations. Run `agent-browser --session weelp-guide-visible set media light reduced-motion`, navigate freshly to `http://localhost:3000/?guide-motion=reduced`, confirm `matchMedia('(prefers-reduced-motion: reduce)').matches` is true, and confirm the header and slides are fully visible with no transform or animation. Inspect browser errors. Do not open `/home-gold`; route isolation is covered by the automated composition test.

### Task 4: Complete mandatory review and integration gates

**Files:**

- Review: all implementation, test, and plan files

- [ ] **Step 1: Dispatch the code-reviewer agent**

Review the completed diff against the approved spec, main-only route boundary, one-observer architecture, default-callsite preservation, Swiper structure, responsive overflow safety, reduced motion, and test coverage. Fix every critical or important issue and re-review until approved.

- [ ] **Step 2: Run the simplify pass**

Invoke the repository's `simplify` skill if available. If it is unavailable, explicitly report that constraint and perform the same focused clarity/reuse/efficiency review using the available surgical-change guidelines. Avoid unrelated refactoring. Re-run focused tests after any edit.

- [ ] **Step 3: Repeat every required check after review or simplify edits**

If code review, its fix loop, or the simplify pass changes any implementation or test file, rerun the affected focused tests, repeat Task 3's error-handling/project checks, and repeat Task 3 Step 4's complete visible-browser acceptance audit before continuing. This repeat audit must cover desktop and mobile direction/offsets, overflow before/during/after entrance, once-only carousel navigation, reduced motion, and browser errors. Keep `/home-gold` browser testing excluded; rerun its automated composition test instead.

- [ ] **Step 4: Run fresh final verification**

Run:

```bash
npx jest --runTestsByPath \
  src/app/components/ui/__tests__/BlogSection.test.jsx \
  src/app/components/ui/__tests__/BlogSectionMotionStyles.test.js \
  src/app/components/ui/__tests__/CarouselShell.test.jsx \
  src/app/components/ui/__tests__/Reveal.test.jsx \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  --runInBand
npm run type-check
npm run lint
npx prettier --check \
  docs/superpowers/plans/2026-08-24-home-your-guide-editorial-cascade.md \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  'src/app/(frontend)/page.js' \
  src/app/components/ui/BlogSection.jsx \
  src/app/components/ui/CarouselShell.jsx \
  src/app/components/ui/Reveal.jsx \
  src/app/components/ui/__tests__/BlogSection.test.jsx \
  src/app/components/ui/__tests__/BlogSectionMotionStyles.test.js \
  src/app/components/ui/__tests__/CarouselShell.test.jsx \
  src/app/components/ui/__tests__/Reveal.test.jsx \
  src/app/globals.css
git diff --check
git status --short
```

Expected: five suites pass; type-check, lint, formatting, and whitespace checks exit 0; status lists only the eleven intended paths.

- [ ] **Step 5: Commit and push the verified main branch**

Stage exactly:

```bash
test "$(git branch --show-current)" = "main"
git add \
  docs/superpowers/plans/2026-08-24-home-your-guide-editorial-cascade.md \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  'src/app/(frontend)/page.js' \
  src/app/components/ui/BlogSection.jsx \
  src/app/components/ui/CarouselShell.jsx \
  src/app/components/ui/Reveal.jsx \
  src/app/components/ui/__tests__/BlogSection.test.jsx \
  src/app/components/ui/__tests__/BlogSectionMotionStyles.test.js \
  src/app/components/ui/__tests__/CarouselShell.test.jsx \
  src/app/components/ui/__tests__/Reveal.test.jsx \
  src/app/globals.css
git commit -m "feat: animate Your Guide carousel"
git push origin main
```

After the push hook finishes, verify a clean worktree and confirm local `HEAD` equals `origin/main`.
