# Home Curate Inward Frame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give only the main homepage Curate banner the approved one-time inward-framing entrance while preserving `/home-gold`, theme colors, layout, interaction, and reduced-motion behavior.

**Architecture:** Keep `WanderersBanner` as the shared server-rendered composition and opt the main homepage into an explicit `entrance="inward-frame"` variant. Its existing outer `Reveal` remains the sole IntersectionObserver-driven trigger; scoped data hooks let global CSS choreograph the top content, pattern motion wrappers, divider lines, and link without adding another client boundary or runtime listener. The default branch retains the two nested `Reveal` groups used by `/home-gold`.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Tailwind CSS, global CSS keyframes, Jest, Testing Library, `agent-browser`

---

## File map

- Modify `src/app/(frontend)/page.js` to opt only `/` into `inward-frame`.
- Modify `src/app/(frontend)/home-gold/__tests__/page.test.jsx` to lock the route boundary: `/` opts in and `/home-gold` does not.
- Modify `src/app/components/Pages/FRONT_END/home/WanderersBanner.jsx` to expose an explicit entrance variant, stable descendant hooks, and transform-safe pattern wrappers while preserving the default reveal path.
- Modify `src/app/components/Pages/FRONT_END/home/__tests__/WanderersBanner.test.jsx` to cover the opt-in markup contract, the unchanged default reveal structure, color classes, link, and directional hooks.
- Create `src/app/components/Pages/FRONT_END/home/__tests__/WanderersMotionStyles.test.js` to lock timing, distances, easing, direction, root override, and reduced-motion CSS.
- Modify `src/app/globals.css` to define the scoped keyframes and state selectors.

## Required workflow before implementation

Before Task 1, invoke `superpowers:executing-plans`, then `test-driven-development`, `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Keep every behavior change in a strict red-green-refactor cycle: write the focused test, observe the expected failure, add only the minimum implementation, and observe the focused suite passing.

After each application/test/CSS edit cycle in Tasks 1–3, invoke `error-handling-patterns`, then run type-check, lint, and the named visible headed localhost browser smoke check before moving to the next task. This presentational feature adds no recoverable runtime operation, so the expected error-handling outcome is confirmation that no new catch/fallback path belongs in the code.

Do not commit application, test, or CSS changes during Tasks 1–3. The project gate requires the full implementation to pass code review, simplification, automated verification, and headed-browser acceptance before its first code commit.

### Task 0: Commit the approved design and reviewed implementation plan

**Files:**
- Modify: `docs/superpowers/specs/2026-08-24-home-curate-inward-frame-design.md`
- Create: `docs/superpowers/plans/2026-08-24-home-curate-inward-frame.md`

- [ ] **Step 1: Verify the documentation diff**

Run:

```bash
git diff --check
git status --short
```

Expected: the approved spec status is modified, the implementation plan is untracked, and no application file is part of this documentation checkpoint.

- [ ] **Step 2: Commit only the two reviewed documents**

```bash
git add docs/superpowers/specs/2026-08-24-home-curate-inward-frame-design.md docs/superpowers/plans/2026-08-24-home-curate-inward-frame.md
git commit -m "docs: plan curate inward-frame animation"
```

Expected: one documentation-only commit on `main`.

### Task 1: Lock and implement the homepage-only route opt-in

**Files:**
- Modify: `src/app/(frontend)/home-gold/__tests__/page.test.jsx:43-98`
- Modify: `src/app/(frontend)/page.js:84`

- [ ] **Step 1: Write the failing route-scope test**

Rename the existing helper and add a homepage helper:

```jsx
const getGoldChildren = async () => Children.toArray((await GoldHomePage()).props.children);
const getHomeChildren = async () => Children.toArray((await HomePage()).props.children);
```

Replace every existing `getChildren()` call in this test file with `getGoldChildren()`, then add:

```jsx
it('opts only the main homepage Curate banner into the inward-frame entrance', async () => {
  const homeChildren = await getHomeChildren();
  const goldChildren = await getGoldChildren();
  const homeBanner = homeChildren.find((child) => child.type.sectionName === 'WanderersBanner');
  const goldBanner = goldChildren.find((child) => child.type.sectionName === 'WanderersBanner');

  expect(homeBanner.props.entrance).toBe('inward-frame');
  expect(goldBanner.props.entrance).toBeUndefined();
  expect(goldBanner.props.patternTone).toBe('gold-dark');
});
```

- [ ] **Step 2: Run the route test and verify it fails for the missing opt-in**

Run:

```bash
npx jest --runInBand 'src/app/(frontend)/home-gold/__tests__/page.test.jsx'
```

Expected: FAIL because the main homepage banner's `entrance` prop is `undefined`; all existing `/home-gold` assertions remain green.

- [ ] **Step 3: Add the explicit main-homepage variant**

In `src/app/(frontend)/page.js`, replace the banner call with:

```jsx
<WanderersBanner entrance="inward-frame" />
```

Do not change `src/app/(frontend)/home-gold/page.js`; it must remain:

```jsx
<WanderersBanner patternTone="gold-dark" />
```

- [ ] **Step 4: Run the route test and verify it passes**

Run:

```bash
npx jest --runInBand 'src/app/(frontend)/home-gold/__tests__/page.test.jsx'
```

Expected: PASS, including the new route-scope assertion.

- [ ] **Step 5: Run the mandatory post-change gate**

Invoke `error-handling-patterns`, then run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-curate-task1 --headed --args "--no-sandbox" open http://localhost:3000
```

Expected: type-check and lint pass; the visible homepage loads without an error overlay. Open `http://localhost:3000/home-gold` in the same visible session and confirm it also loads. Do not commit yet.

### Task 2: Add transform-safe motion hooks while preserving the default banner

**Files:**
- Modify: `src/app/components/Pages/FRONT_END/home/__tests__/WanderersBanner.test.jsx:1-42`
- Modify: `src/app/components/Pages/FRONT_END/home/WanderersBanner.jsx:1-70`

- [ ] **Step 1: Write the failing component contract tests**

Replace the two query helpers with:

```jsx
const getSection = (container) => container.querySelector('section[aria-labelledby="wanderers-heading"]');
const getPatternLeaves = (container) => container.querySelectorAll('[data-wanderers-pattern] svg');
const getDividerLines = (container) => container.querySelectorAll('[data-wanderers-line]');
```

Keep the two existing color tests, then add:

```jsx
it('exposes the inward-frame choreography from one parent reveal', () => {
  const { container } = render(<WanderersBanner entrance="inward-frame" />);
  const section = getSection(container);

  expect(section).toHaveAttribute('data-wanderers-entrance', 'inward-frame');
  expect(section.querySelector('[data-wanderers-top]')).toBeInTheDocument();
  expect(section.querySelectorAll('[data-wanderers-pattern]')).toHaveLength(2);
  expect(section.querySelector('[data-wanderers-pattern="left"]')).toBeInTheDocument();
  expect(section.querySelector('[data-wanderers-pattern="right"]')).toBeInTheDocument();
  expect(section.querySelector('[data-wanderers-line="left"]')).toBeInTheDocument();
  expect(section.querySelector('[data-wanderers-line="right"]')).toBeInTheDocument();
  expect(section.querySelector('[data-wanderers-button]')).toHaveAttribute('href', '/cities');
  expect(section.querySelectorAll('[data-reveal]')).toHaveLength(0);
});

it('retains the existing grouped reveal when no entrance variant is requested', () => {
  const { container } = render(<WanderersBanner />);
  const section = getSection(container);

  expect(section).not.toHaveAttribute('data-wanderers-entrance');
  expect(section.querySelectorAll('[data-reveal]')).toHaveLength(2);
});
```

- [ ] **Step 2: Run the component test and verify the new contract fails**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/home/__tests__/WanderersBanner.test.jsx
```

Expected: FAIL because the banner does not accept `entrance`, lacks motion hooks/wrappers, and still renders nested reveals for the opt-in case.

- [ ] **Step 3: Replace `WanderersBanner.jsx` with the explicit variant implementation**

Use this complete component:

```jsx
import Image from 'next/image';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import Reveal from '@/app/components/ui/Reveal';

const AVATARS = Array.from({ length: 6 }, (_, i) => i);

const SAGE_LEAF_PATH = 'M0 571.5c4.16667-99 64.89999-297 274.5-297-219.60001 0-274.5-183-274.5-274.5l0 571.5z';
const SAGE_PATTERN_CLASS = 'text-weelp-sage-deep';
const GOLD_DARK_PATTERN_CLASS = 'text-weelp-sage-deep dark:text-[oklch(0.7_0.075_78/0.48)]';

const WanderersBanner = ({ patternTone = 'sage', entrance }) => {
  const patternClassName = patternTone === 'gold-dark' ? GOLD_DARK_PATTERN_CLASS : SAGE_PATTERN_CLASS;
  const usesInwardFrame = entrance === 'inward-frame';

  const topContent = (
    <>
      <ul className="flex items-center gap-1.5" aria-hidden="true">
        {AVATARS.map((i) => (
          <li key={i} className="size-7 overflow-hidden rounded-full border border-background shadow-sm dark:shadow-none ring-1 ring-border md:size-8">
            <Image src="/assets/testimonial.png" alt="" width={32} height={32} className="size-full object-cover" />
          </li>
        ))}
      </ul>

      <p id="wanderers-heading" className="text-xs font-normal leading-5 text-copy md:text-sm">
        Be among 400+ other wanderers!
      </p>
    </>
  );

  const actionRow = (
    <>
      <span data-wanderers-line="left" aria-hidden="true" className={`h-px flex-1 bg-current ${patternClassName}`} />
      <NavigationLink
        data-wanderers-button=""
        href="/cities"
        className="group relative inline-flex h-11 w-[96px] shrink-0 items-center justify-center text-base font-medium leading-none !text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-weelp-sage-deep md:w-[88px] lg:h-[40px]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[5px] bg-weelp-sage-deep transition-colors group-hover:bg-weelp-sage-hover dark:border dark:border-border dark:bg-[var(--weelp-home-page)] dark:group-hover:bg-[var(--weelp-home-page)] dark:group-hover:opacity-90"
          style={{ transform: 'skewX(-10deg)' }}
        />
        <span className="relative z-10">Curate</span>
      </NavigationLink>
      <span data-wanderers-line="right" aria-hidden="true" className={`h-px flex-1 bg-current ${patternClassName}`} />
    </>
  );

  return (
    <Reveal
      as="section"
      initialHidden
      data-wanderers-entrance={usesInwardFrame ? entrance : undefined}
      aria-labelledby="wanderers-heading"
      className="relative h-[164px] w-full overflow-hidden bg-background sm:h-[200px] md:h-[260px]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-1/2 hidden h-[190px] w-auto -translate-y-1/2 md:block lg:h-[230px]">
        <div data-wanderers-pattern="left" className="h-full">
          <svg viewBox="0 0 275 572" preserveAspectRatio="xMinYMid meet" className={`block h-full w-auto ${patternClassName}`}>
            <path d={SAGE_LEAF_PATH} fill="currentColor" />
          </svg>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 hidden h-[190px] w-auto -translate-y-1/2 md:block lg:h-[230px]">
        <div data-wanderers-pattern="right" className="h-full">
          <svg viewBox="0 0 275 572" preserveAspectRatio="xMaxYMid meet" className={`block h-full w-auto ${patternClassName}`} style={{ transform: 'scaleX(-1)' }}>
            <path d={SAGE_LEAF_PATH} fill="currentColor" />
          </svg>
        </div>
      </div>

      {usesInwardFrame ? (
        <div data-wanderers-top="" className="container-page relative z-10 flex h-full flex-col items-center gap-3 pt-4 text-center md:gap-4 md:pt-[21px]">
          {topContent}
        </div>
      ) : (
        <Reveal data-wanderers-top="" variant="lift" className="container-page relative z-10 flex h-full flex-col items-center gap-3 pt-4 text-center md:gap-4 md:pt-[21px]">
          {topContent}
        </Reveal>
      )}

      <div className="container-page absolute inset-x-0 top-[64%] z-10 -translate-y-1/2 md:top-[calc(50%-5px)]">
        {usesInwardFrame ? (
          <div className="flex items-center justify-center gap-3 md:gap-4">{actionRow}</div>
        ) : (
          <Reveal variant="lift" delay={120} className="flex items-center justify-center gap-3 md:gap-4">
            {actionRow}
          </Reveal>
        )}
      </div>
    </Reveal>
  );
};

export default WanderersBanner;
```

The outer positioning wrappers retain `-translate-y-1/2`; CSS will animate only the inner `[data-wanderers-pattern]` wrappers. The right SVG retains only `scaleX(-1)`, so its mirror cannot be overwritten by the horizontal entrance.

- [ ] **Step 4: Run the component test and verify it passes**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/home/__tests__/WanderersBanner.test.jsx
```

Expected: PASS. Both color tests remain green, the opt-in section has zero descendant reveal roots (one observer total: the outer section), and the default section retains two descendant reveal roots (three observers total: outer plus two groups).

- [ ] **Step 5: Run the mandatory post-change gate**

Invoke `error-handling-patterns`, then run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-curate-task2 --headed --args "--no-sandbox" open http://localhost:3000
```

Expected: type-check and lint pass; in the visible browser, `/` and `/home-gold` retain the same Curate layout, pattern placement, colors, and working `/cities` link before CSS choreography is added. Do not commit yet.

### Task 3: Implement the approved CSS choreography and reduced-motion path

**Files:**
- Create: `src/app/components/Pages/FRONT_END/home/__tests__/WanderersMotionStyles.test.js`
- Modify: `src/app/globals.css:758-920,1069-1101`

- [ ] **Step 1: Write the failing CSS contract tests**

Create `WanderersMotionStyles.test.js`:

```js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

test('defines the approved Curate inward-frame entrance contract', () => {
  expect(css).toContain('@keyframes weelpWanderersTopReveal');
  expect(css).toContain('transform: translate3d(0, 12px, 0)');
  expect(css).toContain('@keyframes weelpWanderersPatternLeft');
  expect(css).toContain('transform: translate3d(-36px, 0, 0)');
  expect(css).toContain('@keyframes weelpWanderersPatternRight');
  expect(css).toContain('transform: translate3d(36px, 0, 0)');
  expect(css).toContain('@keyframes weelpWanderersLineDraw');
  expect(css).toContain('transform: scaleX(0)');
  expect(css).toContain('@keyframes weelpWanderersButtonReveal');
  expect(css).toContain('transform: translate3d(0, 14px, 0) scale(0.97)');
  expect(css).toContain('animation: weelpWanderersTopReveal 700ms var(--weelp-ease-out) both');
  expect(css).toContain('animation: weelpWanderersPatternLeft 850ms var(--weelp-ease-out) both');
  expect(css).toContain('animation: weelpWanderersPatternRight 850ms var(--weelp-ease-out) both');
  expect(css).toContain('animation: weelpWanderersLineDraw 700ms var(--weelp-ease-out) both');
  expect(css).toContain('animation: weelpWanderersButtonReveal 700ms var(--weelp-ease-out) both');
  expect(css).toContain('animation-delay: 80ms');
  expect(css).toContain('animation-delay: 160ms');
  expect(css).toContain('animation-delay: 260ms');
  expect(css).toContain('[data-wanderers-line=\'left\']');
  expect(css).toContain('transform-origin: left center');
  expect(css).toContain('[data-wanderers-line=\'right\']');
  expect(css).toContain('transform-origin: right center');
});

test('removes Curate choreography for reduced-motion users', () => {
  const reducedMotionBlock = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  const reducedWanderersRule =
    /\[data-wanderers-entrance='inward-frame'\]\[data-reveal\] \[data-wanderers-top\],[\s\S]*?\[data-wanderers-entrance='inward-frame'\]\[data-reveal\] \[data-wanderers-button\]\s*{[^}]*opacity: 1;[^}]*transform: none;[^}]*animation: none;[^}]*animation-delay: 0ms;[^}]*will-change: auto;[^}]*}/s;

  expect(reducedMotionBlock).toMatch(reducedWanderersRule);
});
```

- [ ] **Step 2: Run the CSS test and verify it fails**

Run:

```bash
npx jest --runInBand src/app/components/Pages/FRONT_END/home/__tests__/WanderersMotionStyles.test.js
```

Expected: FAIL because none of the Curate keyframes or scoped selectors exist.

- [ ] **Step 3: Add the four focused keyframes**

Place these beside the existing reveal keyframes in `src/app/globals.css`:

```css
@keyframes weelpWanderersTopReveal {
  from {
    opacity: 0;
    transform: translate3d(0, 12px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes weelpWanderersPatternLeft {
  from {
    opacity: 0;
    transform: translate3d(-36px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes weelpWanderersPatternRight {
  from {
    opacity: 0;
    transform: translate3d(36px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes weelpWanderersLineDraw {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes weelpWanderersButtonReveal {
  from {
    opacity: 0;
    transform: translate3d(0, 14px, 0) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}
```

- [ ] **Step 4: Add the scoped pending and shown state rules**

Place this block after the testimonial entrance rules. It neutralizes the outer generic fade, gives compositor hints only while pending, and applies the approved sequence:

```css
[data-wanderers-entrance='inward-frame'][data-reveal='pending'],
[data-wanderers-entrance='inward-frame'][data-reveal='shown'] {
  opacity: 1;
  transform: none;
  animation: none;
}

[data-wanderers-entrance='inward-frame'][data-reveal='pending'] [data-wanderers-top] {
  opacity: 0;
  transform: translate3d(0, 12px, 0);
  will-change: transform, opacity;
}

[data-wanderers-entrance='inward-frame'][data-reveal='pending'] [data-wanderers-pattern='left'] {
  opacity: 0;
  transform: translate3d(-36px, 0, 0);
  will-change: transform, opacity;
}

[data-wanderers-entrance='inward-frame'][data-reveal='pending'] [data-wanderers-pattern='right'] {
  opacity: 0;
  transform: translate3d(36px, 0, 0);
  will-change: transform, opacity;
}

[data-wanderers-entrance='inward-frame'] [data-wanderers-line='left'] {
  transform-origin: left center;
}

[data-wanderers-entrance='inward-frame'] [data-wanderers-line='right'] {
  transform-origin: right center;
}

[data-wanderers-entrance='inward-frame'][data-reveal='pending'] [data-wanderers-line] {
  transform: scaleX(0);
  will-change: transform;
}

[data-wanderers-entrance='inward-frame'][data-reveal='pending'] [data-wanderers-button] {
  opacity: 0;
  transform: translate3d(0, 14px, 0) scale(0.97);
  will-change: transform, opacity;
}

[data-wanderers-entrance='inward-frame'][data-reveal='shown'] [data-wanderers-top] {
  animation: weelpWanderersTopReveal 700ms var(--weelp-ease-out) both;
}

[data-wanderers-entrance='inward-frame'][data-reveal='shown'] [data-wanderers-pattern='left'] {
  animation: weelpWanderersPatternLeft 850ms var(--weelp-ease-out) both;
  animation-delay: 80ms;
}

[data-wanderers-entrance='inward-frame'][data-reveal='shown'] [data-wanderers-pattern='right'] {
  animation: weelpWanderersPatternRight 850ms var(--weelp-ease-out) both;
  animation-delay: 80ms;
}

[data-wanderers-entrance='inward-frame'][data-reveal='shown'] [data-wanderers-line] {
  animation: weelpWanderersLineDraw 700ms var(--weelp-ease-out) both;
  animation-delay: 160ms;
}

[data-wanderers-entrance='inward-frame'][data-reveal='shown'] [data-wanderers-button] {
  animation: weelpWanderersButtonReveal 700ms var(--weelp-ease-out) both;
  animation-delay: 260ms;
}
```

- [ ] **Step 5: Add the explicit reduced-motion reset**

Inside the first existing `@media (prefers-reduced-motion: reduce)` block, add:

```css
[data-wanderers-entrance='inward-frame'][data-reveal] [data-wanderers-top],
[data-wanderers-entrance='inward-frame'][data-reveal] [data-wanderers-pattern],
[data-wanderers-entrance='inward-frame'][data-reveal] [data-wanderers-line],
[data-wanderers-entrance='inward-frame'][data-reveal] [data-wanderers-button] {
  opacity: 1;
  transform: none;
  animation: none;
  animation-delay: 0ms;
  will-change: auto;
}
```

Do not alter the existing responsive classes: pattern positioning wrappers remain `hidden md:block`, while top content, lines, and the button remain present below `md`.

- [ ] **Step 6: Run all focused animation tests**

Run:

```bash
npx jest --runInBand 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' src/app/components/Pages/FRONT_END/home/__tests__/WanderersBanner.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/WanderersMotionStyles.test.js src/app/components/ui/__tests__/Reveal.test.jsx
```

Expected: PASS. The route scope, default banner, color contract, CSS timing, reduced motion, and shared `Reveal` behavior all remain green.

- [ ] **Step 7: Run the mandatory post-change gate**

Invoke `error-handling-patterns`, then run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-curate-task3 --headed --args "--no-sandbox" open http://localhost:3000
```

Expected: type-check and lint pass; the visible homepage shows the new Curate sequence with no error overlay. Do not commit yet; Task 4 performs full visual acceptance.

### Task 4: Run project verification and visible UI acceptance

**Files:**
- Verify only; modify implementation/tests only if a check exposes a scoped defect.

- [ ] **Step 1: Run static verification**

Run each command independently:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit 0 with no TypeScript errors, ESLint warnings, dark-mode guard findings, or whitespace errors.

- [ ] **Step 2: Start or confirm the local frontend**

Run:

```bash
curl -I http://localhost:3000
```

If it is unavailable, run `npm run dev` from `frontend` and leave that process active during browser acceptance. Do not inspect production.

- [ ] **Step 3: Verify desktop motion in a visible headed browser**

Run:

```bash
agent-browser --session weelp-curate-motion --headed --args "--no-sandbox" open http://localhost:3000
agent-browser --session weelp-curate-motion set viewport 1440 900
```

In the visible browser, reload at the top and scroll naturally to Curate. Confirm this order by eye:

1. faces and supporting text lift/fade first;
2. both teal patterns travel inward symmetrically;
3. left and right lines draw from the outside toward the button;
4. Curate settles last without bounce;
5. scrolling away and back does not replay the entrance.

Check light and dark mode. Confirm the patterns and lines stay teal on `/`, the link still navigates to `/cities`, keyboard focus remains visible, and DevTools/console shows no errors.

- [ ] **Step 4: Verify responsive containment and route isolation**

Set the same visible session to `390 × 844`, reload, and scroll to the banner. Confirm side patterns remain hidden, top content/lines/button follow the same sequence, and no right-side scrollbar appears.

On desktop and mobile, evaluate:

```js
document.documentElement.scrollWidth === document.documentElement.clientWidth
```

Expected: `true`.

Open `http://localhost:3000/home-gold` in the visible session and confirm its Curate banner retains the prior grouped reveal, teal lines/patterns in light mode, and gold lines/patterns only in dark mode.

- [ ] **Step 5: Verify reduced motion in a separate visible session**

Run:

```bash
agent-browser --session weelp-curate-reduced --headed --args "--no-sandbox --force-prefers-reduced-motion=reduce" open http://localhost:3000
```

Scroll to Curate and confirm every marked element is immediately visible at its final position, with no delayed or residual movement, while the link remains interactive.

### Task 5: Complete the mandatory review, simplification, and delivery gates

**Files:**
- Review the complete uncommitted implementation before its first code commit: inspect `git diff HEAD`, `git status --short`, and the full contents of every untracked implementation/test file reported by status (including `src/app/components/Pages/FRONT_END/home/__tests__/WanderersMotionStyles.test.js`).
- Modify only files identified by a concrete review or simplification finding.

- [ ] **Step 1: Dispatch the code-review agent**

Ask the required `superpowers:code-reviewer` agent to inspect the full working-tree diff and every untracked implementation/test file, then compare the implementation with:

- `docs/superpowers/specs/2026-08-24-home-curate-inward-frame-design.md`;
- this implementation plan;
- the homepage-only route boundary;
- transform ownership, reduced motion, overflow containment, accessibility, and unchanged color behavior.

Expected: a severity-ranked report with file/line evidence. For every critical or important in-scope finding, write or update the focused test first when behavior changes, observe the expected failure, apply the correction, invoke `error-handling-patterns`, then rerun the focused tests, type-check, lint, and visible headed browser checks. Request re-review until no such findings remain.

- [ ] **Step 2: Run the simplification gate**

Invoke the `simplify` skill. If the environment still does not expose that named skill, record that limitation and perform its equivalent manual KISS pass: remove duplicate selectors/markup where doing so preserves clarity, confirm there is only one observer, no new state/effect/client boundary, no generalized animation abstraction, and no prop beyond the explicit `entrance` variant. Rerun focused tests after any refinement.

- [ ] **Step 3: Run final verification against the committed result**

Run:

```bash
npx jest --runInBand 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' src/app/components/Pages/FRONT_END/home/__tests__/WanderersBanner.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/WanderersMotionStyles.test.js src/app/components/ui/__tests__/Reveal.test.jsx
npm run type-check
npm run lint
git diff --check
git status --short
```

Expected: tests, type-check, lint, and diff check pass. Status contains only intentional reviewed changes, or is clean if review produced no follow-up edit.

- [ ] **Step 4: Commit the complete reviewed implementation**

Stage every intentional application and test file only after code review, simplification, automated verification, and visible browser acceptance are green:

```bash
git add src/app/globals.css src/app/components/Pages/FRONT_END/home/WanderersBanner.jsx src/app/components/Pages/FRONT_END/home/__tests__/WanderersBanner.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/WanderersMotionStyles.test.js 'src/app/(frontend)/page.js' 'src/app/(frontend)/home-gold/__tests__/page.test.jsx'
git commit -m "feat: animate homepage curate frame"
```

Expected: one reviewed implementation commit containing the complete route, component, CSS, and test change.

- [ ] **Step 5: Push the verified `main` branch**

Confirm the branch, then push:

```bash
git branch --show-current
git push origin main
```

Expected: the branch is `main`, the remote accepts the verified commits, and no production URL is used for UI acceptance.
