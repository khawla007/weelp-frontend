# About FAQ Road-and-Car Journey Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the About FAQ illustration with a double-lane road that constructs once, remains visible, and carries a repeating car journey to an arrival-synchronized destination-pin pulse.

**Architecture:** Keep `FaqJourneyAnimation` as the only client-side scene component and retain its tested IntersectionObserver lifecycle. The inline SVG owns two explicit desktop/compact compositions; SVG masks reveal each road, while CSS Modules own the one-time road build, repeating car motion, pin pulse, cloud drift, responsive switching, pausing, and static fallback.

**Tech Stack:** Next.js 16, React 19, JavaScript, CSS Modules, inline SVG, Jest, Testing Library, agent-browser

---

## Current implementation state

The rejected video spike is already removed. `AboutFAQ` already mounts `FaqJourneyAnimation`, and the current component has tested static/running/paused observer states, Strict Mode stale-callback protection, observer-setup failure fallback, desktop/compact route geometry, and FAQ non-remounting coverage. The remaining work replaces the thin route-only SVG/CSS with the approved road-and-car sequence without changing FAQ data, accordion state, full-width geometry, or 96/64/40px spacing.

## File map

- Modify `src/app/components/Pages/FRONT_END/About/FaqJourneyAnimation.jsx` — road masks/layers, car artwork, destination-pin pulse wrappers, and explicit desktop/compact compositions.
- Modify `src/app/components/Pages/FRONT_END/About/AboutPage.module.css` — road palette, one-time construction, repeating car/pin timeline, pause state, responsive composition, and static/reduced-motion fallback.
- Modify `src/app/components/Pages/FRONT_END/About/__tests__/FaqJourneyAnimation.test.jsx` — final SVG structure, fallback, observer lifecycle, and FAQ stability coverage.
- Modify `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js` — final animation contract and responsive/reduced-motion CSS regression coverage.
- Verify `src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx` — FAQ behavior and journey delegation remain unchanged.
- Verify `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx` — real About page still renders SVG without image/video media.
- Modify `Reports/daily-work-report.md` from the workspace root — replace the FAQ journey upcoming work with the verified completion summary.

### Task 1: Replace route-only expectations with the approved road-and-car contract

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/FaqJourneyAnimation.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js`

- [ ] **Step 1: Update the SVG structure assertions first**

In `FaqJourneyAnimation.test.jsx`, change the component import to:

```jsx
import FaqJourneyAnimation, { COMPACT_ROAD_PATH, DESKTOP_ROAD_PATH } from '../FaqJourneyAnimation';
```

Keep all observer, accessibility, media-absence, Strict Mode, setup-failure, and FAQ non-remounting assertions. Replace route/pin-only assertions in the first test with:

```jsx
expect(screen.getAllByTestId('about-faq-journey-road')).toHaveLength(2);
expect(screen.getAllByTestId('about-faq-journey-road-reveal')).toHaveLength(2);
expect(container.querySelectorAll('[data-journey-element="car"]')).toHaveLength(2);
expect(container.querySelectorAll('[data-journey-element="pin"]')).toHaveLength(2);

for (const reveal of screen.getAllByTestId('about-faq-journey-road-reveal')) {
  expect(reveal).toHaveAttribute('pathLength', '1');
}

expect(screen.getByTestId('about-faq-journey-car-desktop')).toHaveStyle({
  '--faq-journey-car-path': `path("${DESKTOP_ROAD_PATH}")`,
});
expect(screen.getByTestId('about-faq-journey-car-compact')).toHaveStyle({
  '--faq-journey-car-path': `path("${COMPACT_ROAD_PATH}")`,
});
expect(DESKTOP_ROAD_PATH).toBe('M112 488C326 370 456 488 671 399C873 316 998 422 1185 377C1257 342 1310 355 1360 395');
expect(COMPACT_ROAD_PATH).toBe('M585 474C680 426 737 456 802 420C846 396 879 393 900 395');
expect(screen.getByTestId('about-faq-journey-pin-desktop')).toHaveAttribute('transform', 'translate(1360 273)');
expect(screen.getByTestId('about-faq-journey-pin-compact')).toHaveAttribute('transform', 'translate(900 273)');
```

Export `DESKTOP_ROAD_PATH` and `COMPACT_ROAD_PATH` from `FaqJourneyAnimation.jsx` so the test validates the actual road/car geometry without duplicating path strings.

Extend `changes journey motion without remounting the FAQ content` to retain the scene nodes as well as FAQ nodes:

```jsx
const roads = screen.getAllByTestId('about-faq-journey-road');
const cars = [...document.querySelectorAll('[data-journey-element="car"]')];
const pins = [...document.querySelectorAll('[data-journey-element="pin"]')];

act(() => observer.callback([{ isIntersecting: true }]));
act(() => observer.callback([{ isIntersecting: false }]));
act(() => observer.callback([{ isIntersecting: true }]));

expect(screen.getAllByTestId('about-faq-journey-road')).toEqual(roads);
expect([...document.querySelectorAll('[data-journey-element="car"]')]).toEqual(cars);
expect([...document.querySelectorAll('[data-journey-element="pin"]')]).toEqual(pins);
```

This proves running → paused → running changes preserve the already-constructed road/car/pin DOM rather than remounting and restarting the sequence.

- [ ] **Step 2: Replace route-only CSS assertions first**

In the journey CSS test in `AboutPageSpacing.test.js`, retain `.faqJourney`, `.faqJourneySvg`, cloud animation, paused state, responsive switching, and reduced-motion checks. Replace route-only checks with assertions covering:

```js
expect(stylesheet).toMatch(/\.faqJourneyRoadEdge\s*\{[^}]*stroke-width: 18;[^}]*\}/);
expect(stylesheet).toMatch(/\.faqJourneyRoadSurface\s*\{[^}]*stroke-width: 12;[^}]*\}/);
expect(stylesheet).toMatch(/\.faqJourneyRoadDivider\s*\{[^}]*stroke: var\(--weelp-home-accent\);[^}]*stroke-dasharray: 0\.025 0\.02;[^}]*\}/);
expect(stylesheet).toMatch(/\.faqJourneyRoadReveal\s*\{[^}]*stroke-dasharray: 1;[^}]*stroke-dashoffset: 0;[^}]*\}/);
expect(stylesheet).toMatch(/\.faqJourneyCar\s*\{[^}]*offset-path: var\(--faq-journey-car-path\);[^}]*offset-distance: 100%;[^}]*opacity: 1;[^}]*\}/);
expect(stylesheet).toMatch(/@keyframes faqJourneyRoadBuild\s*\{[\s\S]*?stroke-dashoffset: 1;[\s\S]*?stroke-dashoffset: 0;[\s\S]*?\}/);
expect(stylesheet).toMatch(
  /@keyframes faqJourneyCarDrive\s*\{[\s\S]*?56%,\s*76%\s*\{[^}]*offset-distance: 100%;[^}]*opacity: 1;[^}]*\}[\s\S]*?80%\s*\{[^}]*offset-distance: 100%;[^}]*opacity: 0;[^}]*\}[\s\S]*?80\.01%,\s*100%\s*\{[^}]*offset-distance: 0%;[^}]*opacity: 0;[^}]*\}[\s\S]*?\}/,
);
expect(stylesheet).toMatch(
  /@keyframes faqJourneyPinPulse\s*\{[\s\S]*?0%,\s*56%\s*\{[^}]*transform: scale\(1\);[^}]*\}[\s\S]*?63%\s*\{[^}]*transform: scale\(1\.14\);[^}]*\}[\s\S]*?70%,\s*100%\s*\{[^}]*transform: scale\(1\);[^}]*\}[\s\S]*?\}/,
);
expect(stylesheet).toMatch(
  /\.faqJourney\[data-motion='running'\] \.faqJourneyRoadReveal,\s*\.faqJourney\[data-motion='paused'\] \.faqJourneyRoadReveal\s*\{[^}]*animation: faqJourneyRoadBuild 4s var\(--weelp-ease-out\) both;[^}]*\}/,
);
expect(stylesheet).toMatch(/\.faqJourney\[data-motion='running'\] \.faqJourneyCar,[\s\S]*?animation: faqJourneyCarDrive 10s 4s ease-in-out infinite both;/);
expect(stylesheet).toMatch(/\.faqJourney\[data-motion='running'\] \.faqJourneyPinPulse,[\s\S]*?animation: faqJourneyPinPulse 10s 4s ease-in-out infinite;/);
expect(stylesheet).toMatch(
  /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.faqJourney\[data-motion\] \.faqJourneyRoadReveal\s*\{[^}]*stroke-dashoffset: 0;[^}]*\}[\s\S]*?\.faqJourney\[data-motion\] \.faqJourneyCar\s*\{[^}]*offset-distance: 100%;[^}]*opacity: 1;[^}]*\}/,
);
```

- [ ] **Step 3: Run the two focused test files and confirm RED**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/About/__tests__/FaqJourneyAnimation.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js --runInBand
```

Expected: FAIL because the current SVG has thin route paths and the current CSS has route-drawing animation but no road masks, car, or arrival pulse.

- [ ] **Step 4: Run the mandatory post-test-change chain**

The expected RED result is the TDD proof, not a completion failure. After recording that expected failure, invoke `error-handling-patterns`, then run the remaining literal post-change gates against the still-running current page:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-faq-journey --headed --args '--no-sandbox' open http://localhost:3000/about-us
```

Expected: type-check, ESLint, and dark-mode guard exit 0; the unchanged production UI remains available in the visible local browser. Do not alter production code until these gates finish.

### Task 2: Build the final SVG compositions

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/FaqJourneyAnimation.jsx`

- [ ] **Step 1: Load the required Next.js and React guidance**

Invoke `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns` before editing JSX. Retain the existing single client boundary, module-level helper components, direct CSS Module import, and decorative accessibility contract.

- [ ] **Step 2: Define shared road paths and the focused composition helper**

Add module-level exports and a helper above `FaqJourneyAnimation`:

```jsx
export const DESKTOP_ROAD_PATH = 'M112 488C326 370 456 488 671 399C873 316 998 422 1185 377C1257 342 1310 355 1360 395';
export const COMPACT_ROAD_PATH = 'M585 474C680 426 737 456 802 420C846 396 879 393 900 395';

const JourneyCar = () => (
  <g transform="translate(-18 -11)">
    <path className={styles.faqJourneyCarBody} d="M3 8h7l6-7h14l7 7h4c4 0 7 3 7 7v5H0v-5c0-4 1-7 3-7Z" />
    <path className={styles.faqJourneyCarWindow} d="M14 8 19 3h9l5 5Z" />
    <circle className={styles.faqJourneyCarWheel} cx="11" cy="21" r="5" />
    <circle className={styles.faqJourneyCarWheel} cx="38" cy="21" r="5" />
  </g>
);

const JourneyComposition = ({ variant, path, pinX }) => {
  const isDesktop = variant === 'desktop';
  const maskId = `faq-journey-road-mask-${variant}`;

  return (
    <g className={isDesktop ? styles.faqJourneyCompositionDesktop : styles.faqJourneyCompositionCompact}>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="560">
          <path data-testid="about-faq-journey-road-reveal" className={styles.faqJourneyRoadReveal} pathLength="1" d={path} />
        </mask>
      </defs>
      <g data-testid="about-faq-journey-road" mask={`url(#${maskId})`}>
        <path className={styles.faqJourneyRoadEdge} d={path} />
        <path className={styles.faqJourneyRoadSurface} d={path} />
        <path className={styles.faqJourneyRoadDivider} pathLength="1" d={path} />
      </g>
      <g data-testid={`about-faq-journey-pin-${variant}`} data-journey-element="pin" transform={`translate(${pinX} 273)`}>
        <g className={styles.faqJourneyPinPulse}>
          <path className={styles.faqJourneyPin} d="M0 0c-24 0-43 19-43 43 0 35 43 79 43 79s43-44 43-79C43 19 24 0 0 0Z" />
          <circle className={styles.faqJourneyPinCenter} cx="0" cy="42" r="14" />
        </g>
      </g>
      <g
        data-variant={variant}
        data-testid={`about-faq-journey-car-${variant === 'desktop' ? 'desktop' : 'compact'}`}
        data-journey-element="car"
        className={styles.faqJourneyCar}
        style={{ '--faq-journey-car-path': `path("${path}")` }}
      >
        <JourneyCar />
      </g>
    </g>
  );
};
```

- [ ] **Step 3: Replace the old route and pin pairs**

Inside the existing SVG, keep the sky, sun, cloud, mountain, and ground layers unchanged. Remove both `.faqJourneyRoute` paths and both old pin groups. Render:

```jsx
<JourneyComposition variant="desktop" path={DESKTOP_ROAD_PATH} pinX={1360} />
<JourneyComposition variant="compact" path={COMPACT_ROAD_PATH} pinX={900} />
```

The road ends at each marker tip `(1360, 395)` or `(900, 395)`. Paint the pin before the car so the arrived/static car remains recognizable above the marker tip; protect that ordering with a DOM-order regression assertion for both compositions. `JourneyCar` remains internal and decorative; no title, label, focus target, or control is added.

- [ ] **Step 4: Run the component test and confirm the remaining failure is CSS-only**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/About/__tests__/FaqJourneyAnimation.test.jsx --runInBand
```

Expected: SVG structure, observer, accessibility, setup failure, Strict Mode, and FAQ stability tests PASS. CSS assertions remain for Task 3.

- [ ] **Step 5: Run the mandatory post-JSX gates**

Invoke `error-handling-patterns`, then run:

```bash
npm run type-check
npm run lint
agent-browser --session weelp-faq-journey --headed --args '--no-sandbox' open http://localhost:3000/about-us
```

Expected: type-check, ESLint, and dark-mode guard exit 0. The visible local page renders the FAQ without runtime errors; final road/car styling remains intentionally pending Task 3.

### Task 3: Implement the one-time road build and repeating arrival timeline

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/AboutPage.module.css`

- [ ] **Step 1: Replace route-only palette and animation rules**

Remove `.faqJourneyRoute`, `.faqJourneyRouteDesktop`, `.faqJourneyRouteMobile`, `.faqJourneyPinDesktop`, and `.faqJourneyPinMobile`. Keep the existing landscape palette and cloud rules. Add:

```css
.faqJourneyRoadEdge,
.faqJourneyRoadSurface,
.faqJourneyRoadDivider,
.faqJourneyRoadReveal {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.faqJourneyRoadEdge {
  stroke: hsl(var(--background) / 82%);
  stroke-width: 18;
}

.faqJourneyRoadSurface {
  stroke: hsl(var(--weelp-sage-deep) / 88%);
  stroke-width: 12;
}

.faqJourneyRoadDivider {
  stroke: var(--weelp-home-accent);
  stroke-width: 2;
  stroke-dasharray: 0.025 0.02;
}

.faqJourneyRoadReveal {
  stroke: white;
  stroke-width: 22;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
}

.faqJourneyCar {
  offset-path: var(--faq-journey-car-path);
  offset-rotate: auto;
  offset-distance: 100%;
  opacity: 1;
}

.faqJourneyCarBody {
  fill: var(--weelp-home-accent);
  stroke: hsl(var(--foreground) / 72%);
  stroke-width: 1.5;
}

.faqJourneyCarWindow {
  fill: hsl(var(--background) / 90%);
}

.faqJourneyCarWheel {
  fill: hsl(var(--foreground));
}

.faqJourneyPin {
  fill: var(--weelp-home-accent);
}

.faqJourneyPinCenter {
  fill: hsl(var(--background));
}

.faqJourneyPinPulse {
  transform-box: fill-box;
  transform-origin: center bottom;
}

.faqJourneyCompositionCompact {
  display: none;
}
```

- [ ] **Step 2: Add the coordinated motion rules**

```css
.faqJourney[data-motion='running'] .faqJourneyRoadReveal,
.faqJourney[data-motion='paused'] .faqJourneyRoadReveal {
  animation: faqJourneyRoadBuild 4s var(--weelp-ease-out) both;
}

.faqJourney[data-motion='running'] .faqJourneyCar,
.faqJourney[data-motion='paused'] .faqJourneyCar {
  animation: faqJourneyCarDrive 10s 4s ease-in-out infinite both;
}

.faqJourney[data-motion='running'] .faqJourneyPinPulse,
.faqJourney[data-motion='paused'] .faqJourneyPinPulse {
  animation: faqJourneyPinPulse 10s 4s ease-in-out infinite;
}

.faqJourney[data-motion='running'] .faqJourneyCloud,
.faqJourney[data-motion='paused'] .faqJourneyCloud {
  animation: faqJourneyCloud 28s ease-in-out infinite alternate;
}

.faqJourney[data-motion='paused'] .faqJourneyRoadReveal,
.faqJourney[data-motion='paused'] .faqJourneyCar,
.faqJourney[data-motion='paused'] .faqJourneyPinPulse,
.faqJourney[data-motion='paused'] .faqJourneyCloud {
  animation-play-state: paused;
}

@keyframes faqJourneyRoadBuild {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes faqJourneyCarDrive {
  0% {
    offset-distance: 0%;
    opacity: 0;
  }
  3% {
    opacity: 1;
  }
  56%,
  76% {
    offset-distance: 100%;
    opacity: 1;
  }
  80% {
    offset-distance: 100%;
    opacity: 0;
  }
  80.01%,
  100% {
    offset-distance: 0%;
    opacity: 0;
  }
}

@keyframes faqJourneyPinPulse {
  0%,
  56% {
    transform: scale(1);
  }
  63% {
    transform: scale(1.14);
  }
  70%,
  100% {
    transform: scale(1);
  }
}
```

This creates one four-second road build, then a ten-second repeating car/pin cycle. The car reaches the pin at 56%, the pin peaks after arrival at 63%, and the car rests through 76%. It fades while held at the destination, then jumps to the start at `80.01%` only after becoming fully transparent, so no backward travel is rendered.

- [ ] **Step 3: Switch the compact composition at the existing breakpoint**

Inside `@media (max-width: 1279px)` add:

```css
.faqJourneyCompositionDesktop {
  display: none;
}
.faqJourneyCompositionCompact {
  display: block;
}
```

- [ ] **Step 4: Finish the static and reduced-motion fallback**

Replace route-only reduced-motion rules with:

```css
@media (prefers-reduced-motion: reduce) {
  .faqJourney[data-motion] .faqJourneyRoadReveal,
  .faqJourney[data-motion] .faqJourneyCar,
  .faqJourney[data-motion] .faqJourneyPinPulse,
  .faqJourney[data-motion] .faqJourneyCloud {
    animation: none;
  }

  .faqJourney[data-motion] .faqJourneyRoadReveal {
    stroke-dashoffset: 0;
  }
  .faqJourney[data-motion] .faqJourneyCar {
    offset-distance: 100%;
    opacity: 1;
  }
  .faqJourney[data-motion] .faqJourneyPinPulse,
  .faqJourney[data-motion] .faqJourneyCloud {
    transform: none;
  }
}
```

The component's `data-motion="static"` base styles already show the complete road and parked car when IntersectionObserver or CSS animation is unavailable.

- [ ] **Step 5: Run focused GREEN verification and mandatory post-CSS gates**

Invoke `error-handling-patterns`, then run:

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/About/__tests__/FaqJourneyAnimation.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js --runInBand
npx prettier --check src/app/components/Pages/FRONT_END/About/FaqJourneyAnimation.jsx src/app/components/Pages/FRONT_END/About/AboutPage.module.css src/app/components/Pages/FRONT_END/About/__tests__/FaqJourneyAnimation.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js
npm run type-check
npm run lint
git diff --check
agent-browser --session weelp-faq-journey --headed --args '--no-sandbox' open http://localhost:3000/about-us
```

Expected: all focused tests, type-check, ESLint, and dark-mode guard PASS; Prettier reports all checked files formatted; diff check prints nothing; the visible page shows the road/car scene without runtime errors before the full viewport audit.

### Task 4: Complete review, quality, browser, report, and delivery gates

**Files:**

- Verify or modify only the files in the file map when a gate exposes a defect.
- Modify: `../Reports/daily-work-report.md`

- [ ] **Step 1: Perform the required error-handling review**

Invoke `error-handling-patterns`. Confirm the existing observer behavior still covers missing APIs, setup exceptions, incomplete entries, cleanup, stale callbacks, and the completed static fallback. Do not add user-facing errors or retries for this decorative animation.

- [ ] **Step 2: Run static and complete About gates**

```bash
npm run type-check
npm run lint
npx jest src/app/components/Pages/FRONT_END/About/__tests__ --runInBand
npm run build
git diff --check
```

Expected: TypeScript exits 0; ESLint and the dark-mode guard exit 0; all About tests pass without React warnings; the Next.js production build completes; diff check prints nothing.

- [ ] **Step 3: Run the mandatory visible headed-browser audit**

Confirm `http://localhost:3000/about-us` returns HTTP 200, then open:

```bash
agent-browser --session weelp-faq-journey --headed --args '--no-sandbox' open http://localhost:3000/about-us
```

At `1440×900`, `1024×900`, and `390×844`, audit light and dark modes. Confirm:

- the road constructs only once after entering the viewport and never clears between car loops;
- the car starts after road completion, follows the road center, arrives at the pin, rests, disappears, and restarts without reversing;
- the pin pulses at arrival, not at departure;
- desktop and compact roads terminate exactly at their visible pins;
- the small car never competes with FAQ copy or crosses the card visually;
- the background remains full width, FAQ remains container-constrained, 96/64/40px spacing is intact, and horizontal overflow is zero;
- no image/video appears or loads in the FAQ scene.

With reduced motion enabled, confirm road animation, car animation, pin animation, and cloud animation are `none`; road reveal offset is `0`; car offset distance is `100%`; the parked car and pin remain visible.

Scroll the section offscreen and back to confirm `data-motion` changes between `paused` and `running` without remounting FAQ content or restarting the completed road construction.

- [ ] **Step 4: Dispatch final code review and simplify**

Dispatch the required code-reviewer agent against the complete diff. Address every critical or important finding and re-review until clear. Invoke the available `simplify` skill; if unavailable, perform a documented manual clarity/reuse/efficiency pass limited to the touched files.

After review and simplification, unconditionally run the full final verification again, even when the reviewer and simplification pass make no changes:

```bash
npx jest src/app/components/Pages/FRONT_END/About/__tests__/FaqJourneyAnimation.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js --runInBand
npm run type-check
npm run lint
npx jest src/app/components/Pages/FRONT_END/About/__tests__ --runInBand
npm run build
git diff --check
```

Then unconditionally reopen the local page in the visible headed session and repeat the complete desktop, tablet, mobile, light, dark, reduced-motion, and pause/resume matrix from Step 3:

```bash
agent-browser --session weelp-faq-journey --headed --args '--no-sandbox' open http://localhost:3000/about-us
```

This final headed audit occurs after review and simplification even when neither stage changes code. If either stage does change JSX or CSS, the new browser results replace the earlier audit results.

- [ ] **Step 5: Update the daily report**

In `../Reports/daily-work-report.md`, replace the current FAQ journey entries under `### Upcoming Work` with a completion summary covering the approved one-time double-lane road build, repeating car journey, arrival pulse, static/reduced-motion state, responsive light/dark browser audit, review gates, test/build results, commit, and push. Preserve unrelated upcoming work.

- [ ] **Step 6: Create the single verified implementation commit and push main**

Stage only the plan, FAQ implementation/tests, and daily report paths. Confirm the branch is `main`, then commit and push:

```bash
git add docs/superpowers/plans/2026-08-21-about-faq-journey-animation.md
git add src/app/components/Pages/FRONT_END/About/AboutFAQ.jsx src/app/components/Pages/FRONT_END/About/AboutPage.module.css src/app/components/Pages/FRONT_END/About/FaqJourneyAnimation.jsx
git add src/app/components/Pages/FRONT_END/About/__tests__/FaqJourneyAnimation.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js
git commit -m "feat: animate FAQ road journey"
git branch --show-current
git push origin main
```

The daily report belongs to the workspace repository rather than the frontend Git repository. Commit it in its own repository only if `git -C .. rev-parse --show-toplevel` confirms the workspace root is version-controlled; otherwise leave the report updated locally and state that clearly in the handoff.
