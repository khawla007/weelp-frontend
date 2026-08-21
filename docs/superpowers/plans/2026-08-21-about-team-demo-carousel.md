# About Team Demo Carousel Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task by task. Keep `docs/superpowers/specs/2026-08-21-about-team-demo-carousel-design.md` open while working.

**Goal:** Replace the About page's oversized three-card Team grid with a contained six-member carousel matching the measured SteelNova proportions and behavior while retaining Weelp styling and accessibility.

**Architecture:** Keep Team data and UI inside `AboutTeam.jsx`, convert only that component to a client boundary, and enhance its server-rendered member list with the installed Swiper package. Use the existing `container-page`, `AboutImage`, reveal, badge, and heading primitives; keep section sizing in `AboutPage.module.css`. Store all six portraits locally so runtime never depends on the demo host.

**Tech Stack:** Next.js 16 App Router, React 19, JSX, CSS Modules, Tailwind CSS, Swiper 12, Jest 30, Testing Library, agent-browser.

---

## Task 1: Pin the approved Team contract with failing tests

**Files:**

- Create: `src/app/components/Pages/FRONT_END/About/__tests__/AboutTeam.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx:8-21,102-107`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js:1-78`

### Step 1: Add a focused component test with observable Swiper props

Mock `next/image`, `swiper/react`, `swiper/css`, and `Reveal` using existing About-test conventions. Capture the props passed to mocked `Swiper`, preserve slide children, expose an instance with `slidePrev`/`slideNext`, and install a stable `window.matchMedia` mock.

Assert:

- six Team cards and all approved names/travel roles;
- six local `/assets/images/about/team/*.webp` sources;
- a focusable region named `Weelp team members`;
- `slidesPerView: 1`, `spaceBetween: 30`, `speed: 600`, `grabCursor: true`, `watchOverflow: true`, `loop: false`, and `rewind: false`;
- breakpoints 768, 992, 1200, and 1400 with the approved slide counts/gaps;
- no autoplay, navigation, pagination, or scrollbar;
- focused Left/Right Arrow presses call `slidePrev`/`slideNext`;
- reduced motion changes only the speed to zero.

Reset captured state and restore `matchMedia` between tests.

### Step 2: Update the page composition assertion

Replace the old three-person assertion with six cards, `data-team-layout="reference-carousel"`, and the accessible Team region. Extend the page-level Swiper mock only enough to pass through relevant props; leave testimonial assertions intact.

### Step 3: Add CSS contract assertions

Extend `AboutPageSpacing.test.js` to require:

- no fixed Team `min-height` and 96px desktop block padding;
- a `.teamInner` container-owned stack;
- the approved desktop header-to-carousel gap;
- a square `.teamImage`;
- 64px tablet and 40px mobile section padding.

Treat these as fast regression signals; visible-browser computed measurements remain authoritative.

### Step 4: Run tests and confirm red

```bash
npx jest --runInBand \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutTeam.test.jsx \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js
```

Expected: FAIL because the legacy component has three grid cards and old spacing.

### Step 5: Keep the failing contract uncommitted

Do not commit the red state. The repository requires code review, simplification, and final green verification before any implementation commit. Continue directly to Task 2 with the failing tests visible in the working tree.

## Task 2: Add the six approved local portraits

**Files:**

- Create: `public/assets/images/about/team/martin-alexander.webp`
- Create: `public/assets/images/about/team/sarah-johnson.webp`
- Create: `public/assets/images/about/team/mike-anderson.webp`
- Create: `public/assets/images/about/team/emily-carter.webp`
- Create: `public/assets/images/about/team/david-thompson.webp`
- Create: `public/assets/images/about/team/jessica-williams.webp`

### Step 1: Download explicit source-to-target pairs

Create the Team asset directory and download these explicit source-to-target pairs with `curl --fail --location --output` so an HTTP error cannot be saved under a `.webp` extension:

```bash
curl --fail --location --output public/assets/images/about/team/martin-alexander.webp \
  https://demo.casethemes.net/steelnova/wp-content/uploads/2026/04/user-8.webp
curl --fail --location --output public/assets/images/about/team/sarah-johnson.webp \
  https://demo.casethemes.net/steelnova/wp-content/uploads/2026/05/6258dc82e5d46776f8863482d80139f9bc4e80e2.webp
curl --fail --location --output public/assets/images/about/team/mike-anderson.webp \
  https://demo.casethemes.net/steelnova/wp-content/uploads/2026/05/7162d48b6ef910da9dc33965f109e5c380026f9d.webp
curl --fail --location --output public/assets/images/about/team/emily-carter.webp \
  https://demo.casethemes.net/steelnova/wp-content/uploads/2026/05/604dd3210d9752f5ad947f9fd458d97e0d688b50.webp
curl --fail --location --output public/assets/images/about/team/david-thompson.webp \
  https://demo.casethemes.net/steelnova/wp-content/uploads/2026/05/89514e6b7c86fcd2f73df0f5e8d44191027811cf.webp
curl --fail --location --output public/assets/images/about/team/jessica-williams.webp \
  https://demo.casethemes.net/steelnova/wp-content/uploads/2026/05/d79768daf1d50ce9791e17c5ee3005da12d99e76.webp
```

Use explicit destinations, never hotlink from JSX, and do not overwrite unrelated assets.

### Step 2: Validate assets

Run an explicit file-count assertion, `test -s` for every named target, and `file --mime-type` for format validation. Use an image metadata tool already available in the environment to confirm readable dimensions. Then visually inspect every image (or a generated contact sheet that does not modify the source assets) to confirm the intended person-to-filename mapping.

Expected: exactly six non-empty files, each reports `image/webp`, each has readable non-zero dimensions, and visual inspection matches the six reference portraits rather than an error document.

### Step 3: Preserve the licensing caveat

Do not add licensing claims to UI. Retain the spec note that copying portraits does not grant publication rights and ownership/licensing must be confirmed before public production use.

### Step 4: Keep validated assets uncommitted

Leave the six validated files in the working tree for the final review gate; do not create an intermediate asset commit.

## Task 3: Implement the accessible Swiper carousel

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/AboutTeam.jsx:1-44`

### Step 1: Create the narrow client boundary

Add `'use client';`, React hooks, `Swiper`/`SwiperSlide`, and `swiper/css`. Do not move the parent About page client-side or alter shared APIs.

### Step 2: Replace the data

Add the six approved members:

1. Martin Alexander — Founder & CEO
2. Sarah Johnson — Head of Guest Experience
3. Mike Anderson — Travel Operations Manager
4. Emily Carter — Destination Partnerships Manager
5. David Thompson — Experience Design Director
6. Jessica Williams — Booking & Finance Manager

Use stable IDs, exact local image paths, descriptive portrait alts, and existing fallback labels.

### Step 3: Handle reduced motion

Use an SSR-stable initial value of `false`; in an effect, read `(prefers-reduced-motion: reduce)`, synchronize the state, subscribe to changes, and clean up the listener. Vary only Swiper speed between 600 and 0. Leave responsive layout in static breakpoints to avoid hydration shifts. Tests must cover the initial 600ms value, effect synchronization/change event, zero speed, and listener cleanup.

### Step 4: Build the section and carousel

Add a `container-page` inner wrapper. Keep the Weelp badge and shared heading, change the heading to `Meet Our Amazing Team Members`, and use this exact approved adaptation of the demo introduction: `A dedicated group of travel specialists committed to creating meaningful journeys through local insight, thoughtful planning, and genuine care.`

Wrap Swiper in:

```jsx
role="region"
aria-label="Weelp team members"
tabIndex={0}
```

Store the Swiper instance in a ref. Handle `ArrowLeft`/`ArrowRight` on this focusable wrapper with guarded `slidePrev()`/`slideNext()`, preventing default only for handled keys. Ignore bubbled key events whose target is an interactive descendant so future links or buttons retain native keyboard behavior.

Configure:

```js
slidesPerView: 1
spaceBetween: 30
speed: reducedMotion ? 0 : 600
grabCursor: true
watchOverflow: true
loop: false
rewind: false
breakpoints: {
  768: { slidesPerView: 2, spaceBetween: 30 },
  992: { slidesPerView: 3, spaceBetween: 30 },
  1200: { slidesPerView: 3, spaceBetween: 45 },
  1400: { slidesPerView: 3, spaceBetween: 49 },
}
```

Do not configure autoplay, arrows, pagination, scrollbar, loop, or rewind behavior.

### Step 5: Preserve resilience and reveal

Render each member as an article in a `SwiperSlide`. Keep the square clipped image, `AboutImage` fallback, hover zoom, and normal-flow text. Repeat the left/lift/right reveal sequence by index modulo its length.

Use this explicit responsive image hint rather than the legacy generic `100vw, 33vw` value:

```jsx
sizes = '(max-width: 639px) calc(100vw - 32px), (max-width: 767px) calc(100vw - 48px), (max-width: 991px) 48vw, (max-width: 1479px) 31vw, 440px';
```

This tracks one mobile column, two tablet columns, three desktop columns, and the max-container card width without over-fetching the original portrait.

### Step 6: Run focused tests

Rerun Task 1's Jest command. Expected: component/composition tests pass; CSS tests may remain red until Task 4.

### Step 7: Run the required post-JSX checkpoint

```bash
npm run type-check
npm run lint
```

Apply `error-handling-patterns` before the commands, then open the current local page in the named visible headed browser. A layout mismatch is expected until Task 4, but confirm the route renders, all six local portraits load, keyboard navigation works, and no runtime/console failure was introduced. Keep all changes uncommitted for the final review gate.

## Task 4: Match measured geometry inside Weelp's container

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/AboutPage.module.css:302-325,423-556,598-688`
- Modify the tests from Task 1 if their selector hooks need alignment, without weakening assertions.

### Step 1: Replace grid-era spacing

Remove fixed Team min-height and viewport-like inline padding. Use Weelp's 6rem (96px) desktop Major Section padding. Add `.teamInner`, center the header, and use a 62px desktop header-to-carousel gap.

### Step 2: Add stable typography hooks

Use CSS module classes for:

- title: about 47–48px/57px desktop, 32px tablet, 27px mobile;
- intro: 16px/26px, max-width 700px;
- name: 30px/40px desktop, about 24px/32px mobile;
- role: 18px/26px, about 3px below the name.

Keep Weelp fonts, weights, foreground tokens, centered intro, and left-aligned member copy.

### Step 3: Preserve fluid square containment

Keep `.teamImage { aspect-ratio: 1; }`, zero radius, and clipped overflow. Add only Team-scoped Swiper containment. Do not modify global carousel behavior. At 1920px, the 1416px content width with two 49px gaps should naturally yield about 439–440px slides; do not hard-code card width.

### Step 4: Add responsive spacing

Use Weelp's Major Section Rule: 96px desktop, 64px tablet (768–1023), and 40px mobile (<768) block padding. Use a 50px mobile header gap. Retain `container-page` mobile padding and remove the obsolete `.teamGrid` one-column rule.

### Step 5: Format and test

```bash
npx prettier --check \
  src/app/components/Pages/FRONT_END/About/AboutTeam.jsx \
  src/app/components/Pages/FRONT_END/About/AboutPage.module.css \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutTeam.test.jsx \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js
npx jest --runInBand \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutTeam.test.jsx \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx
```

Expected: formatting and all focused About suites pass.

### Step 6: Run the required post-CSS checkpoint

```bash
npm run type-check
npm run lint
```

Apply `error-handling-patterns`, then repeat the local visible headed check at desktop, tablet, and mobile. Confirm the completed layout before proceeding. Do not commit yet.

## Task 5: Run mandated engineering verification

### Step 1: Apply the error-handling review

Use `error-handling-patterns`. Confirm failed portraits remain in square frames via `AboutImage`, missing Swiper methods are guarded, and media-query listeners clean up.

### Step 2: Run checks in order

```bash
npm run type-check
npm run lint
npx jest --runInBand \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutTeam.test.jsx \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js \
  src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx
git diff --check
git status --short
```

Expected: type-check, ESLint, the dark-mode guard included by `npm run lint`, focused tests, and diff check pass.

## Task 6: Perform visible-browser comparison

**URLs:**

- Local: `http://localhost:3000/about-us`
- Demo: `https://demo.casethemes.net/steelnova/about-us/`

### Step 1: Serve current frontend and open headed sessions

Confirm port 3000 serves this frontend. Open local first in a named visible `agent-browser --headed` session and the demo in a separate named headed session.

### Step 2: Compare 1920, 1440, 1024, 768, and 390 widths

At each size verify:

- content remains within `container-page`;
- 3/2/1 cards appear at approved breakpoints;
- portraits are square and copy stays below;
- spacing follows the reference rhythm;
- no arrows, dots, scrollbar, autoplay, clipping, or next-section overlap;
- light/dark text and image fallback remain usable.

At 1920px, measure about 1416px carousel width, 439–440px slides, 49px gaps, and near-951px section height with 96px outer padding. At every viewport verify:

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth;
```

Also make quick boundary checks at 767/768 and 991/992 pixels to verify Swiper changes from one to two and two to three slides without overflow or a stale layout.

### Step 3: Exercise behavior

Mouse-drag; resize across a breakpoint; focus the Team region and test both arrow keys plus an unrelated key; emulate reduced motion; and, if practical, force one portrait failure to confirm the square fallback. Record measurements and intentional deviations.

## Task 7: Review, simplify, integrate, and push

### Step 1: Dispatch mandatory code review

Have the code-review agent inspect the implementation against the approved spec/plan, Next.js boundaries, accessibility, reduced motion, responsive containment, tests, and assets. Fix all critical/major task findings and re-review until clear.

### Step 2: Apply mandatory simplify pass

Use the project `simplify` workflow for naming, duplication, event handling, and CSS consolidation. Do not broaden into shared-carousel refactoring without a demonstrated need.

### Step 3: Reverify after review edits

Rerun type-check, lint, all four focused About suites, `npm run build`, `git diff --check`, and a headed desktop/tablet/mobile smoke check if JSX or CSS changed.

### Step 4: Commit and push main

Confirm the frontend branch is `main`. Commit verified review fixes and push frontend `main` to `origin/main`, excluding unrelated changes.

### Step 5: Report outcome

Provide commit hashes, verification results, measured desktop geometry, responsive/interaction results, links to principal files, and the portrait-licensing reminder.
