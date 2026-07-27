# Home-Style Post-Hero Section Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/tours-experiences` and `/holiday` follow the home page by rendering their first content section directly after the hero with no generic wrapper `div`.

**Architecture:** Each route will render `BrowseDestinationsSection` directly and pass its route-specific title, subtitle mode, navigation prefix, and city data. Each hero will own the same responsive bottom margin as the home hero, while `BrowseDestinationsSection` keeps ownership of `container-page`, its carousel, and bottom padding.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS, Jest, Testing Library

---

### Task 0: Enter the frontend repository and load required skills

**Files:**

- Read: `src/docs/superpowers/specs/2026-07-27-home-post-hero-section-structure-design.md`

- [ ] **Step 1: Confirm the repository and branch**

Run:

```bash
cd '/run/media/ashish-khawla/Website data/Fanatic Developement/weelp/frontend'
git rev-parse --show-toplevel
git branch --show-current
git status --short
```

Expected: the top level ends in `/weelp/frontend`, the branch is `main`, and only expected task files are present. Run every later shell command from this frontend directory.

- [ ] **Step 2: Invoke the mandatory pre-implementation skills**

Invoke, in order:

```text
superpowers:executing-plans
next-best-practices
vercel-react-best-practices
vercel-composition-patterns
superpowers:test-driven-development
```

Do not write implementation code before all five skills have been loaded and their relevant instructions incorporated.

- [ ] **Step 3: Commit the reviewed documentation checkpoint**

Before Task 1, explicitly stage and commit the finalized plan plus the formatter-normalized spec:

```bash
git add \
  src/docs/superpowers/specs/2026-07-27-home-post-hero-section-structure-design.md \
  src/docs/superpowers/plans/2026-07-27-home-post-hero-section-structure.md
git commit -m "docs: plan home-style post-hero sections"
git status --short
```

Expected: the documentation commit succeeds and the worktree is clean before implementation begins. Do not include either documentation file in the later source/test implementation commit.

### Task 1: Lock the public route structure with failing tests

**Files:**

- Create: `src/app/(frontend)/tours-experiences/__tests__/page.test.jsx`
- Create: `src/app/(frontend)/holiday/__tests__/page.test.jsx`

- [ ] **Step 1: Write the tours route structure test**

```jsx
import { render, screen } from '@testing-library/react';

import ToursExperiencesPage from '../page';
import { getFeaturedCitiesWithStartingPrice } from '@/lib/services/tours';

jest.mock('@/lib/services/tours', () => ({
  getFeaturedCitiesWithStartingPrice: jest.fn(),
}));

jest.mock('@/app/components/Pages/FRONT_END/tours/ToursHero', () => ({
  __esModule: true,
  default: () => <section data-testid="tours-hero" />,
}));

jest.mock('@/app/components/Pages/FRONT_END/home/BrowseDestinationsSection', () => ({
  __esModule: true,
  default: ({ cities, title, subtitleMode, navigationPrefix }) => (
    <section data-testid="tours-destinations" data-city-count={cities.length} data-title={title} data-subtitle-mode={subtitleMode} data-navigation-prefix={navigationPrefix} />
  ),
}));

describe('ToursExperiencesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the hero and destinations as direct sibling sections', async () => {
    getFeaturedCitiesWithStartingPrice.mockResolvedValue([{ id: 1, name: 'Dubai' }]);

    const { container } = render(await ToursExperiencesPage());
    const main = container.querySelector('main');
    const hero = screen.getByTestId('tours-hero');
    const destinations = screen.getByTestId('tours-destinations');

    expect(main.children).toHaveLength(2);
    expect(main.children[0]).toBe(hero);
    expect(main.children[1]).toBe(destinations);
    expect(destinations.parentElement).toBe(main);
    expect(destinations).toHaveAttribute('data-city-count', '1');
    expect(destinations).toHaveAttribute('data-title', 'Trending Spots');
    expect(destinations).toHaveAttribute('data-subtitle-mode', 'price');
    expect(destinations).toHaveAttribute('data-navigation-prefix', 'trending-spots');
  });

  it('preserves the empty fallback when featured city loading rejects', async () => {
    getFeaturedCitiesWithStartingPrice.mockRejectedValueOnce(new Error('offline'));

    render(await ToursExperiencesPage());

    expect(screen.getByTestId('tours-destinations')).toHaveAttribute('data-city-count', '0');
  });
});
```

- [ ] **Step 2: Write the holiday route structure test**

```jsx
import { render, screen } from '@testing-library/react';

import HolidayPage from '../page';
import { getAllFeaturedCities } from '@/lib/services/cities';

jest.mock('@/lib/services/cities', () => ({
  getAllFeaturedCities: jest.fn(),
}));

jest.mock('@/app/components/Pages/FRONT_END/holiday/BannerSection', () => ({
  __esModule: true,
  default: () => <section data-testid="holiday-hero" />,
}));

jest.mock('@/app/components/Pages/FRONT_END/home/BrowseDestinationsSection', () => ({
  __esModule: true,
  default: ({ cities, title, subtitleMode, navigationPrefix }) => (
    <section data-testid="holiday-destinations" data-city-count={cities.length} data-title={title} data-subtitle-mode={subtitleMode} data-navigation-prefix={navigationPrefix} />
  ),
}));

describe('HolidayPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the hero and destinations as direct sibling sections', async () => {
    getAllFeaturedCities.mockResolvedValue({ data: [{ id: 1, name: 'Dubai' }] });

    const { container } = render(await HolidayPage());
    const hero = screen.getByTestId('holiday-hero');
    const destinations = screen.getByTestId('holiday-destinations');

    expect(container.children).toHaveLength(2);
    expect(container.children[0]).toBe(hero);
    expect(container.children[1]).toBe(destinations);
    expect(destinations.parentElement).toBe(container);
    expect(destinations).toHaveAttribute('data-city-count', '1');
    expect(destinations).toHaveAttribute('data-title', 'Trending Spots');
    expect(destinations).toHaveAttribute('data-subtitle-mode', 'count');
    expect(destinations).toHaveAttribute('data-navigation-prefix', 'holiday-trending-spots');
  });

  it.each([
    ['a raw array', [{ id: 1, name: 'Dubai' }]],
    ['an object-wrapped array', { data: [{ id: 1, name: 'Dubai' }] }],
  ])('preserves featured cities returned as %s', async (_label, response) => {
    getAllFeaturedCities.mockResolvedValueOnce(response);

    render(await HolidayPage());

    expect(screen.getByTestId('holiday-destinations')).toHaveAttribute('data-city-count', '1');
  });

  it('passes an empty list to the shared section when no cities are available', async () => {
    getAllFeaturedCities.mockResolvedValueOnce({ data: [] });

    render(await HolidayPage());

    expect(screen.getByTestId('holiday-destinations')).toHaveAttribute('data-city-count', '0');
  });
});
```

- [ ] **Step 3: Run the new tests and verify they fail**

Run:

```bash
npx jest --runInBand \
  'src/app/(frontend)/tours-experiences/__tests__/page.test.jsx' \
  'src/app/(frontend)/holiday/__tests__/page.test.jsx'
```

Expected: FAIL because the mocked `BrowseDestinationsSection` is still rendered transitively inside each adapter's intervening `div`, so it is not a direct sibling of the hero.

### Task 2: Render destinations directly from the route pages

**Files:**

- Modify: `src/app/(frontend)/tours-experiences/page.js`
- Modify: `src/app/(frontend)/holiday/page.js`
- Delete: `src/app/components/Pages/FRONT_END/tours/TrendingSpots.jsx`
- Delete: `src/app/components/Pages/FRONT_END/holiday/TrendingSection.jsx`
- Delete: `src/app/components/Pages/FRONT_END/holiday/__tests__/TrendingSection.test.jsx`

- [ ] **Step 1: Replace the tours adapter with the shared section**

Change the imports and content render to:

```jsx
import ToursHero from '@/app/components/Pages/FRONT_END/tours/ToursHero';
import BrowseDestinationsSection from '@/app/components/Pages/FRONT_END/home/BrowseDestinationsSection';
import { getFeaturedCitiesWithStartingPrice } from '@/lib/services/tours';

// ...

<main>
  <ToursHero />
  <BrowseDestinationsSection cities={cities} title="Trending Spots" subtitleMode="price" navigationPrefix="trending-spots" />
</main>;
```

- [ ] **Step 2: Replace the holiday adapter with the shared section**

Change the imports and content render to:

```jsx
import BannerSection from '@/app/components/Pages/FRONT_END/holiday/BannerSection';
import BrowseDestinationsSection from '@/app/components/Pages/FRONT_END/home/BrowseDestinationsSection';
import { getAllFeaturedCities } from '@/lib/services/cities';

// ...

<>
  <BannerSection />
  <BrowseDestinationsSection cities={featuredCities} title="Trending Spots" subtitleMode="count" navigationPrefix="holiday-trending-spots" />
</>;
```

- [ ] **Step 3: Remove the obsolete adapter files and adapter-only test**

Delete:

```text
src/app/components/Pages/FRONT_END/tours/TrendingSpots.jsx
src/app/components/Pages/FRONT_END/holiday/TrendingSection.jsx
src/app/components/Pages/FRONT_END/holiday/__tests__/TrendingSection.test.jsx
```

- [ ] **Step 4: Run the route tests and verify they pass**

Run:

```bash
npx jest --runInBand \
  'src/app/(frontend)/tours-experiences/__tests__/page.test.jsx' \
  'src/app/(frontend)/holiday/__tests__/page.test.jsx'
```

Expected: PASS. Each hero and destination section is a direct sibling and all existing data/display props are preserved.

### Task 3: Move post-hero spacing ownership to the heroes

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/tours/__tests__/ToursHero.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/holiday/__tests__/BannerSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/tours/ToursHero.jsx`
- Modify: `src/app/components/Pages/FRONT_END/holiday/BannerSection.jsx`

- [ ] **Step 1: Update the hero tests to require home-page margins**

In both hero tests, assert:

```jsx
expect(hero).toHaveClass('mb-10', 'sm:mb-16', 'lg:mb-24');
```

Remove the tours assertion that explicitly rejects these margin classes.

- [ ] **Step 2: Run the hero tests and verify they fail**

Run:

```bash
npx jest --runInBand \
  src/app/components/Pages/FRONT_END/tours/__tests__/ToursHero.test.jsx \
  src/app/components/Pages/FRONT_END/holiday/__tests__/BannerSection.test.jsx
```

Expected: FAIL because neither hero owns the home-page bottom margins yet.

- [ ] **Step 3: Add the responsive bottom margins to both heroes**

Add `mb-10 sm:mb-16 lg:mb-24` to each root hero section:

```jsx
<section className="weelp-hero-rise relative ... bg-surface-tint p-6 mb-10 sm:mb-16 lg:mb-24">
```

Do not change hero height, positioning, background, animation, form, decoration, or globe classes.

- [ ] **Step 4: Run all focused tests**

Run:

```bash
npx jest --runInBand \
  'src/app/(frontend)/tours-experiences/__tests__/page.test.jsx' \
  'src/app/(frontend)/holiday/__tests__/page.test.jsx' \
  src/app/components/Pages/FRONT_END/tours/__tests__/ToursHero.test.jsx \
  src/app/components/Pages/FRONT_END/holiday/__tests__/BannerSection.test.jsx
```

Expected: PASS.

### Task 4: Run static verification

**Files:**

- Verify all modified files

- [ ] **Step 0: Invoke the mandatory post-change reliability skill**

Invoke:

```text
error-handling-patterns
```

Confirm that the existing tours rejection fallback and holiday response normalization remain intact before running static checks.

- [ ] **Step 1: Run type-check**

Run:

```bash
npm run type-check
```

Expected: exit code 0.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: exit code 0 with no ESLint warnings and no new dark-mode guard findings.

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected: exit code 0 with `/holiday` and `/tours-experiences` built successfully.

- [ ] **Step 4: Check whitespace and stale imports**

Run:

```bash
git diff --check
rg -n 'TrendingSpots|TrendingSection' src --glob '!src/docs/**'
```

Expected: `git diff --check` exits 0 and `rg` returns no production/test imports or references.

### Task 5: Run the mandatory review and simplification gates

**Files:**

- Review the complete implementation diff

- [ ] **Step 1: Dispatch the code-reviewer agent**

Review the changes against the approved spec, project conventions, direct-sibling DOM contract, data preservation, and responsive spacing ownership.

Expected: no unresolved critical or high-severity findings.

- [ ] **Step 2: Address findings and re-run focused tests**

For every accepted finding, add or adjust a failing test first, make the smallest correction, then re-run the focused test command from Task 3.

- [ ] **Step 3: Repeat code review until blocking findings are cleared**

After corrections and focused verification, dispatch the code-reviewer again. Repeat the fix → focused verification → re-review loop until the reviewer reports no unresolved critical or major findings.

- [ ] **Step 4: Invoke the simplify skill**

Refine only the changed code for clarity, reuse, and efficiency. Do not reintroduce adapter wrappers or broaden the change.

- [ ] **Step 5: Re-run the reliability gate after any review or simplification edit**

If either review remediation or simplification changes code, invoke:

```text
error-handling-patterns
```

Then re-run the focused tests, type-check, lint, build, and `git diff --check` before browser verification. If simplification makes a material code change, dispatch one final code-reviewer pass and clear any blocking findings before proceeding.

Expected: every command exits 0 after review and simplification.

### Task 6: Verify responsive behavior in the visible browser

**Routes:**

- `http://localhost:3000/tours-experiences`
- `http://localhost:3000/holiday`

- [ ] **Step 1: Confirm local servers are ready**

Run:

```bash
curl -I http://localhost:3000
curl -I http://localhost:8000/api/region/
```

Expected: both local services respond. If the frontend is unavailable, start it from the frontend repository with `npm run dev` and wait until `http://localhost:3000` responds before continuing.

- [ ] **Step 2: Open a named headed session**

Run:

```bash
XDG_RUNTIME_DIR=/run/user/1000 \
XDG_SESSION_TYPE=x11 \
AGENT_BROWSER_ARGS=--no-sandbox \
AGENT_BROWSER_HEADED=true \
agent-browser --session weelp-visible open http://localhost:3000/tours-experiences
```

- [ ] **Step 3: Verify both routes at 320px, 768px, and 1280px**

For each route, run the equivalent of:

```bash
XDG_RUNTIME_DIR=/run/user/1000 agent-browser --session weelp-visible set viewport 320 900
XDG_RUNTIME_DIR=/run/user/1000 agent-browser --session weelp-visible set viewport 768 1000
XDG_RUNTIME_DIR=/run/user/1000 agent-browser --session weelp-visible set viewport 1280 900
```

After each viewport change, inspect the hero and its `nextElementSibling`. Use computed styles to verify `margin-bottom` is `40px`, `64px`, and `96px` respectively, and verify the next sibling is a `SECTION` with `container-page`.

At each width confirm:

- Hero and destination section are direct DOM siblings.
- There is no intervening generic wrapper `div`.
- Hero bottom spacing computes to 40px at 320px, 64px at 768px, and 96px at 1280px.
- The normal page background begins after the hero.
- Destination container alignment matches the home page.
- Destination carousel navigation and touch/swipe behavior remain functional.
- Hero animation, decorations, forms, globe positioning, and overflow remain correct.
- There is no horizontal overflow.

- [ ] **Step 4: Inspect console and network failures**

Run the visible-browser console and request checks on each changed route.

Expected: no new runtime errors or failed application requests caused by the change.

### Task 7: Commit, push, and verify production

**Files:**

- Commit all implementation and test changes

- [ ] **Step 1: Invoke final verification**

Invoke:

```text
superpowers:verification-before-completion
```

Do not claim completion or create the implementation commit until the skill's evidence requirements are satisfied.

- [ ] **Step 2: Confirm the final diff contains only approved files**

Run:

```bash
git status --short
git diff --stat
git diff --check
```

- [ ] **Step 3: Commit on `main` with explicit staging**

Run:

```bash
git add \
  'src/app/(frontend)/tours-experiences/page.js' \
  'src/app/(frontend)/holiday/page.js' \
  'src/app/(frontend)/tours-experiences/__tests__/page.test.jsx' \
  'src/app/(frontend)/holiday/__tests__/page.test.jsx' \
  'src/app/components/Pages/FRONT_END/tours/ToursHero.jsx' \
  'src/app/components/Pages/FRONT_END/tours/__tests__/ToursHero.test.jsx' \
  'src/app/components/Pages/FRONT_END/holiday/BannerSection.jsx' \
  'src/app/components/Pages/FRONT_END/holiday/__tests__/BannerSection.test.jsx'
git add -u -- \
  'src/app/components/Pages/FRONT_END/tours/TrendingSpots.jsx' \
  'src/app/components/Pages/FRONT_END/holiday/TrendingSection.jsx' \
  'src/app/components/Pages/FRONT_END/holiday/__tests__/TrendingSection.test.jsx'
git commit -m "refactor: align post-hero sections with home"
```

- [ ] **Step 4: Push and confirm the remote commit**

Run:

```bash
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Expected: local `HEAD` and remote `main` hashes match.

- [ ] **Step 5: Confirm Netlify published the exact commit**

Use the authenticated visible browser to inspect the Netlify deployment for `weelp.netlify.app`.

Expected: the production deployment is published and reports the exact local/remote commit hash.

- [ ] **Step 6: Verify production markup**

Inspect:

```text
https://weelp.netlify.app/tours-experiences
https://weelp.netlify.app/holiday
```

Expected: each destination section is a direct sibling after its hero with no generic wrapper `div`, and responsive spacing matches the local verification.
