# Weelp Recommendations Rule-Led Cascade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved rule-led typographic entrance to the main homepage “Weelp Recommendations” section without changing `/home-gold`, its data behavior, layout, links, or hover interaction.

**Architecture:** `WeelpRecommendations` receives an explicit `entrance="rule-led-cascade"` opt-in from the main route. The opt-in variant uses its existing root `Reveal` as the only observer, emits semantic hooks and capped link indexes, and lets scoped CSS coordinate the heading, divider, and links; default callers retain the current three-Reveal structure.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, CSS keyframes, Jest, Testing Library, agent-browser

---

### Task 0: Confirm the execution environment and required guidance

**Files:**

- Read: `../.agents/skills/next-best-practices/SKILL.md`
- Read: `../.agents/skills/vercel-react-best-practices/SKILL.md`
- Read: `../.agents/skills/vercel-composition-patterns/SKILL.md`
- Verify: current Git branch and worktree state

- [ ] **Step 1: Confirm implementation is on the required branch**

Run:

```bash
test "$(git branch --show-current)" = "main"
git status --short
```

Expected: the branch check exits 0 and the worktree contains only the untracked plan before implementation. Stop if another branch or unrelated change is present.

- [ ] **Step 2: Load the mandatory Next.js and React guidance**

Read all three listed `SKILL.md` files completely. Preserve the current component boundary: `WeelpRecommendations` remains an async Server Component, `Reveal` remains the existing Client Component, and no data is moved into a new client boundary.

### Task 1: Lock and implement the component and route contracts

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendations.test.jsx`
- Modify: `src/app/(frontend)/home-gold/__tests__/page.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/home/WeelpRecommendations.jsx`
- Modify: `src/app/(frontend)/page.js`
- Verify unchanged: `src/app/(frontend)/home-gold/page.js`

- [ ] **Step 1: Expand the failing component tests**

Update the `Reveal` mock so every call is observable in the DOM without discarding component props:

```jsx
const revealMock = jest.fn(({ as: Component = 'div', children, className = '', initialHidden, variant, stagger, ...props }) => (
  <Component data-testid="reveal" data-initial-hidden={initialHidden ? 'true' : undefined} data-reveal-variant={variant} data-reveal-stagger={stagger} className={className} {...props}>
    {children}
  </Component>
));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: (props) => revealMock(props),
}));
```

Mock `SectionFallback` with a component that records and renders its props. Reset both mocks before every test, call `jest.restoreAllMocks()` after every test, and assert each rendered path calls `getFeaturedItinerariesMock` exactly once with no arguments.

Create a deterministic ten-item fixture with `name`, `slug`, and `city_slug`, except that the second item deliberately omits `city_slug`. Render `await WeelpRecommendations({ entrance: 'rule-led-cascade' })` and assert:

```jsx
const section = screen.getByRole('heading', { name: 'Weelp Recommendations' }).closest('section');
const links = screen.getAllByRole('link');

expect(screen.getAllByTestId('reveal')).toHaveLength(1);
expect(section).toHaveAttribute('data-recommendations-section-entrance', 'rule-led-cascade');
expect(section).toHaveAttribute('data-initial-hidden', 'true');
expect(section.querySelector('[data-recommendations-heading]')).toBeInTheDocument();
expect(section.querySelector('[data-recommendations-rule]')).toBeInTheDocument();
expect(section.querySelector('[data-recommendations-grid]')).toBeInTheDocument();
expect(links).toHaveLength(10);
expect(links.map((link) => link.style.getPropertyValue('--weelp-recommendations-index'))).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '7', '7']);
```

Assert the first link keeps `/cities/dubai/itineraries/<slug>`, the second link keeps the existing `/cities/itineraries/<slug>` fallback when `city_slug` is absent, the current typography inline styles, the exact responsive grid classes, and the existing gradient underline/hover/reduced-transition classes. Assert every link is a direct child of the grid so no animation wrapper is introduced.

Add a separate maximum-count test with 33 items. Stabilize the existing shuffle without changing production code:

```jsx
jest.spyOn(Math, 'random').mockReturnValue(0.5);
getFeaturedItinerariesMock.mockResolvedValue({ success: true, data: makeItineraries(33) });

render(await WeelpRecommendations({ entrance: 'rule-led-cascade' }));

expect(screen.getAllByRole('link')).toHaveLength(32);
expect(getFeaturedItinerariesMock).toHaveBeenCalledTimes(1);
expect(getFeaturedItinerariesMock).toHaveBeenCalledWith();
```

Render the same fixture without `entrance` and assert the current contract remains: three Reveal roots, the section has no recommendation entrance attribute, the heading wrapper uses `variant="lift"`, the grid wrapper uses `variant="lift"` and `stagger={45}`, no recommendation data hooks exist, and no link has `--weelp-recommendations-index` before the Reveal mock processes it.

Add success-empty and failure tests:

```jsx
getFeaturedItinerariesMock.mockResolvedValue({ success: true, data: [] });
render(await WeelpRecommendations({ entrance: 'rule-led-cascade' }));
expect(sectionFallbackMock).toHaveBeenLastCalledWith(
  {
    eyebrow: 'Weelp recommends',
    message: 'Our editors are between picks for you. Browse the catalog and save the ones you love for next time.',
    variant: 'empty',
    pivotHref: '/cities',
    pivotLabel: 'Browse all cities',
  },
  undefined,
);

getFeaturedItinerariesMock.mockResolvedValue({ success: false, data: [] });
render(await WeelpRecommendations({ entrance: 'rule-led-cascade' }));
expect(sectionFallbackMock).toHaveBeenLastCalledWith(
  {
    eyebrow: 'Weelp recommends',
    message: "We couldn't pull this week's picks just now. Refresh, or browse the full catalog.",
    variant: 'error',
    pivotHref: '/cities',
    pivotLabel: 'Browse all cities',
  },
  undefined,
);
```

Each fallback test must also assert one no-argument service call and that no recommendation entrance wrapper is rendered, preserving the current fallback path.

- [ ] **Step 2: Add the failing main-versus-gold route test**

Import the shared component in `src/app/(frontend)/home-gold/__tests__/page.test.jsx`:

```jsx
import WeelpRecommendations from '@/app/components/Pages/FRONT_END/home/WeelpRecommendations';
```

Then add:

```jsx
it('opts only the main homepage recommendations into the rule-led cascade', async () => {
  const homeChildren = await getHomeChildren();
  const goldChildren = await getGoldChildren();
  const homeRecommendations = homeChildren.find((child) => child.type === WeelpRecommendations);
  const goldRecommendations = goldChildren.find((child) => child.type === WeelpRecommendations);

  expect(homeRecommendations).toBeDefined();
  expect(goldRecommendations).toBeDefined();
  expect(homeRecommendations.props.entrance).toBe('rule-led-cascade');
  expect(goldRecommendations.props.entrance).toBeUndefined();
});
```

- [ ] **Step 3: Run both suites and verify RED**

Run:

```bash
npx jest --runTestsByPath \
  src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendations.test.jsx \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  --runInBand
```

Expected: FAIL because `WeelpRecommendations` does not accept the variant, emit hooks or capped indexes, and the main route does not opt in.

- [ ] **Step 4: Implement the minimal opt-in component structure**

Change the signature without breaking direct calls in existing tests:

```jsx
const WeelpRecommendations = async ({ entrance } = {}) => {
```

After selecting itineraries, derive:

```jsx
const usesRuleLedCascade = entrance === 'rule-led-cascade';
const HeadingRoot = usesRuleLedCascade ? 'div' : Reveal;
const GridRoot = usesRuleLedCascade ? 'div' : Reveal;
const sectionEntranceProps = usesRuleLedCascade ? { 'data-recommendations-section-entrance': 'rule-led-cascade' } : {};
const headingProps = usesRuleLedCascade ? { 'data-recommendations-heading': '' } : { variant: 'lift' };
const gridProps = usesRuleLedCascade ? { 'data-recommendations-grid': '' } : { stagger: 45, variant: 'lift' };
```

Keep the existing root `Reveal as="section" initialHidden`, section classes, padding container, heading, divider, grid, and links. Apply `sectionEntranceProps` to the root. Render the heading block through `HeadingRoot`, mark the existing divider with `data-recommendations-rule` only for the variant, and render the grid through `GridRoot`.

Map with an index and add only the opt-in animation props to each existing `Link`:

```jsx
const recommendationMotionProps = usesRuleLedCascade
  ? {
      'data-recommendations-link': '',
      style: {
        fontFamily: fontIT,
        fontWeight: 500,
        letterSpacing: '-0.38px',
        lineHeight: 2.06,
        '--weelp-recommendations-index': Math.min(index, 7),
      },
    }
  : {
      style: { fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px', lineHeight: 2.06 },
    };
```

Spread these props onto the current link without changing its key, `href`, classes, or text. Do not modify fallback rendering or `getRandomItems`.

In `src/app/(frontend)/page.js`, change only the final populated component call:

```jsx
<WeelpRecommendations entrance="rule-led-cascade" />
```

Leave `src/app/(frontend)/home-gold/page.js` unchanged.

- [ ] **Step 5: Run both suites and verify GREEN**

Run the Step 3 command.

Expected: both suites pass, including the default structure and route-isolation assertions.

### Task 2: Define and implement the scoped motion contract

**Files:**

- Create: `src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendationsMotionStyles.test.js`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write the failing stylesheet contract test**

Read `src/app/globals.css` and use balanced-block helpers like `BlogSectionMotionStyles.test.js`. Scope every assertion under:

```js
const root = "[data-recommendations-section-entrance='rule-led-cascade']";
```

Assert all of these contracts:

- `@keyframes weelpRecommendationsRuleReveal` changes only `transform: scaleX(0)` to `transform: scaleX(1)`.
- Pending and shown root states are neutralized with `opacity: 1`, `transform: none`, and `animation: none`.
- State-independent heading and link hooks set `--weelp-reveal-y: 18px` and `12px` respectively.
- The rule has `transform-origin: left center` without animating width.
- Pending heading and links have opacity 0, their approved vertical translations, and `will-change: transform, opacity`.
- The pending rule uses `scaleX(0)` and `will-change: transform`.
- Shown heading uses `weelpRevealUp 650ms`, delay 0ms.
- Shown rule uses `weelpRecommendationsRuleReveal 700ms`, delay 100ms.
- Shown links use `weelpRevealUp 700ms`, delay `calc(180ms + var(--weelp-recommendations-index, 0) * 60ms)`.
- The bypassed-root reset and the actual balanced `@media (prefers-reduced-motion: reduce)` block set heading, rule, and links to visible/static: opacity 1 where applicable, transform none, animation none, delay 0ms, and `will-change: auto`.
- Complete scoped rule bodies contain no blur, filter, overflow declaration, or animated width. Content selectors contain no `scale`; `scaleX` is allowed only in the divider rule/keyframe.

- [ ] **Step 2: Run the stylesheet suite and verify RED**

Run:

```bash
npx jest --runTestsByPath \
  src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendationsMotionStyles.test.js \
  --runInBand
```

Expected: FAIL because the scoped keyframe and rules do not exist.

- [ ] **Step 3: Implement the rule-led CSS choreography**

Add the divider keyframe near the other homepage reveal keyframes:

```css
@keyframes weelpRecommendationsRuleReveal {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}
```

Near the other scoped homepage entrance selectors, add rules rooted at `[data-recommendations-section-entrance='rule-led-cascade']` that:

1. Neutralize the root’s default pending/shown motion.
2. Define the heading and link `--weelp-reveal-y` values independently of reveal state.
3. Define the divider’s left transform origin independently of reveal state.
4. Own hidden pending styles on the heading, divider, and links.
5. Apply the exact shown animations and delays from Step 1.
6. Reset the three roles under `data-reveal-motion='bypassed'`.
7. Add the equivalent complete reset inside the existing reduced-motion media query.

Do not add horizontal travel, clipping, filters, content scale, or width transitions.

- [ ] **Step 4: Run all four focused suites and verify GREEN**

Run:

```bash
npx jest --runTestsByPath \
  src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendations.test.jsx \
  src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendationsMotionStyles.test.js \
  src/app/components/ui/__tests__/Reveal.test.jsx \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  --runInBand
```

Expected: all suites pass.

### Task 3: Verify the implementation and visible behavior

**Files:**

- Verify: all modified and created files

- [ ] **Step 1: Apply the mandatory error-handling checkpoint**

Read the `error-handling-patterns` skill completely. Confirm the animation adds no request, input, stateful business operation, or recoverable error path. The existing success-empty and failure fallbacks remain unchanged; the only motion fallback is the shared static reveal bypass.

- [ ] **Step 2: Run project checks**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit 0 and the dark-mode guard reports no new hardcoded-color findings.

- [ ] **Step 3: Inspect every intended path**

Run:

```bash
git diff -- \
  'src/app/(frontend)/page.js' \
  'src/app/(frontend)/home-gold/page.js' \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  src/app/components/Pages/FRONT_END/home/WeelpRecommendations.jsx \
  src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendations.test.jsx \
  src/app/globals.css
nl -ba docs/superpowers/plans/2026-08-24-home-weelp-recommendations-typographic-cascade.md
nl -ba src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendationsMotionStyles.test.js
```

Expected: `/home-gold/page.js` has no diff; the main route alone opts in; data, layout, link classes, and fallback copy are unchanged; both untracked files are inspected in full.

- [ ] **Step 4: Run the mandatory visible localhost audit**

Confirm the local frontend is ready, then open the main homepage visibly:

```bash
curl -I --max-time 5 http://localhost:3000
agent-browser --session weelp-recommendations-visible --headed --args "--no-sandbox" open http://localhost:3000
```

Expected: localhost responds successfully and a visible headed browser opens the main route.

Set desktop size and reload from the top:

```bash
agent-browser --session weelp-recommendations-visible set viewport 1440 900
agent-browser --session weelp-recommendations-visible set media light no-preference
agent-browser --session weelp-recommendations-visible open http://localhost:3000/?recommendations-motion=desktop
```

Use `agent-browser eval` to locate `[data-recommendations-section-entrance='rule-led-cascade']`, its heading, rule, and links. Before scrolling, return the root state, `scrollWidth`, `clientWidth`, and each role’s computed opacity, transform, animation name, duration, and delay. Expected: root is `pending`; the heading is 18px below and transparent; the rule is `scaleX(0)`; links are 12px below and transparent; `scrollWidth <= clientWidth`.

Trigger and sample the active state in one evaluation so timing is reproducible:

```bash
agent-browser --session weelp-recommendations-visible eval "(async () => { const root=document.querySelector('[data-recommendations-section-entrance=rule-led-cascade]'); const heading=root.querySelector('[data-recommendations-heading]'); const rule=root.querySelector('[data-recommendations-rule]'); const links=[...root.querySelectorAll('[data-recommendations-link]')]; const pack=e=>{const s=getComputedStyle(e);return {opacity:s.opacity,transform:s.transform,name:s.animationName,duration:s.animationDuration,delay:s.animationDelay};}; root.scrollIntoView({block:'center'}); await new Promise(r=>setTimeout(r,120)); return {state:root.dataset.reveal,overflow:[document.documentElement.scrollWidth,document.documentElement.clientWidth],heading:pack(heading),rule:pack(rule),links:links.slice(0,10).map(pack)}; })()"
```

Expected: the heading runs `weelpRevealUp` for 650ms at 0ms delay; the rule runs `weelpRecommendationsRuleReveal` for 700ms at 100ms delay; links run `weelpRevealUp` for 700ms at delays 180ms, 240ms, 300ms, 360ms, 420ms, 480ms, 540ms, then capped 600ms; no overflow appears.

Wait 1400ms and query the same roles. Expected: opacity 1 and zero translation for content, a full divider, root `shown`, and no overflow. Save animation names/start times in `window.__recommendationsAnimationBaseline`, scroll the section fully out of view, scroll it back, wait 200ms, and compare the current animation names/start times with the saved baseline. Expected: the values are unchanged, every animation remains settled, and the root remains `data-reveal="shown"`; this proves the entrance runs once.

Hover the first `[data-recommendations-link]` and verify its existing underline reaches the current hover background size. Focus the same link separately and verify focus does not restart heading, divider, or link animations; do not expect or add a focus underline.

Set mobile size and reload:

```bash
agent-browser --session weelp-recommendations-visible set viewport 390 844
agent-browser --session weelp-recommendations-visible open http://localhost:3000/?recommendations-motion=mobile
```

Repeat the exact pending, 120ms active, and 1400ms settled evaluations. Return each of the first eight links’ text and bounding-rectangle `top`/`left`; assert each pair shares a row top and its left coordinate increases, proving natural left-to-right DOM order in the two-column grid. Confirm the same 12px vertical motion, capped delays, and `scrollWidth <= clientWidth` in all three states. Repeat the scroll-out/scroll-back baseline comparison and confirm the mobile entrance also remains settled with root state `shown`.

Enable reduced motion and navigate freshly:

```bash
agent-browser --session weelp-recommendations-visible set media light reduced-motion
agent-browser --session weelp-recommendations-visible open http://localhost:3000/?recommendations-motion=reduced
```

Use one evaluation to return `matchMedia('(prefers-reduced-motion: reduce)').matches`, the root reveal/bypass states, overflow, and computed opacity, transform, animation name, delay, and `will-change` for the heading, rule, and first eight links. Expected: reduced motion is true; root is `shown` and `data-reveal-motion="bypassed"`; content is visible with no transform; the full divider has no transform; animation is `none`, delay is zero, `will-change` is `auto`, and no overflow exists.

Finish with:

```bash
agent-browser --session weelp-recommendations-visible errors
agent-browser --session weelp-recommendations-visible close
```

Expected: no browser errors and the named session closes. Do not open `/home-gold`; its isolation is covered by the automated route test.

### Task 4: Complete mandatory review and integration gates

**Files:**

- Review: all seven intended plan, implementation, and test paths

- [ ] **Step 1: Dispatch the mandatory final code-reviewer agent**

Review the complete diff against the approved spec, main-only boundary, one-observer architecture, default-callsite preservation, capped indexes, unchanged link/data/fallback behavior, CSS timing, no-overflow constraints, bypass behavior, and tests. Fix every critical or important issue and re-review until approved.

- [ ] **Step 2: Run the simplify pass**

Invoke the repository’s `simplify` skill if available. If unavailable, state that constraint and use the available surgical-change guidance to review clarity, reuse, and efficiency without unrelated refactoring.

- [ ] **Step 3: Repeat checks after any review or simplify edit**

If review, its fix loop, or simplification changes implementation or test code, rerun the affected focused tests, Task 3’s error-handling and project checks, the automated `/home-gold` route-isolation suite, and Task 3 Step 4’s complete visible browser audit before continuing.

- [ ] **Step 4: Run fresh final verification**

Run:

```bash
npx jest --runTestsByPath \
  src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendations.test.jsx \
  src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendationsMotionStyles.test.js \
  src/app/components/ui/__tests__/Reveal.test.jsx \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  --runInBand
npm run type-check
npm run lint
npx prettier --check \
  docs/superpowers/plans/2026-08-24-home-weelp-recommendations-typographic-cascade.md \
  'src/app/(frontend)/page.js' \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  src/app/components/Pages/FRONT_END/home/WeelpRecommendations.jsx \
  src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendations.test.jsx \
  src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendationsMotionStyles.test.js \
  src/app/globals.css
git diff --check
git status --short
```

Expected: four suites pass; type-check, lint, formatting, and whitespace checks exit 0; status lists exactly the seven intended paths.

- [ ] **Step 5: Commit and push the verified main branch**

Stage exactly:

```bash
test "$(git branch --show-current)" = "main"
git add \
  docs/superpowers/plans/2026-08-24-home-weelp-recommendations-typographic-cascade.md \
  'src/app/(frontend)/page.js' \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  src/app/components/Pages/FRONT_END/home/WeelpRecommendations.jsx \
  src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendations.test.jsx \
  src/app/components/Pages/FRONT_END/home/__tests__/WeelpRecommendationsMotionStyles.test.js \
  src/app/globals.css
git commit -m "feat: animate Weelp Recommendations"
git push origin main
```

After the push hook completes, verify the worktree is clean and local `HEAD` equals `origin/main`.
