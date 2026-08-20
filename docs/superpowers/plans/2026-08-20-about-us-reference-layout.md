# About Us Reference Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Weelp's About Us page with the SteelNova reference's layout, responsive composition, and left/up/right reveal behavior while retaining Weelp branding and content.

**Architecture:** Keep the route as a server-composed page and retain the eight existing About section boundaries. Add reusable directional variants to the shared `Reveal` primitive, then combine Tailwind layout utilities with one About-specific CSS module for the reference's masonry columns, overlapping metrics, image masks, dark split, and hover treatments.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Tailwind CSS, CSS Modules, Swiper, Jest, Testing Library, agent-browser.

---

## File map

- Modify `src/app/components/ui/Reveal.jsx` to document and emit directional reveal variants through its existing `data-reveal-variant` attribute.
- Modify `src/app/globals.css` to animate `left`, `right`, and `lift` reveal variants with reduced-motion fallbacks.
- Create `src/app/components/Pages/FRONT_END/About/AboutPage.module.css` for reference-specific geometry and hover effects shared by About sections.
- Create `src/app/components/Pages/FRONT_END/About/AboutImage.jsx` for stable local-image geometry and accessible error fallbacks.
- Modify all eight `src/app/components/Pages/FRONT_END/About/About*.jsx` section components while preserving their public no-prop interfaces.
- Create `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx` for static section structure and content.
- Create `src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx` for FAQ and testimonial controls.
- Modify `src/app/components/ui/__tests__/Reveal.test.jsx` for directional variant coverage.

### Task 0: Preserve the current worktree baseline

**Files:**

- Review: `src/app/components/Pages/FRONT_END/About/AboutHero.jsx`
- Review: `src/app/(frontend)/home-gold/GoldTopActivitiesSection.jsx`
- Review: `src/app/(frontend)/home-gold/__tests__/GoldTopActivitiesSection.test.jsx`

- [ ] **Step 1: Record the existing user-owned changes**

Run: `git status --short`

Run: `git diff -- src/app/components/Pages/FRONT_END/About/AboutHero.jsx src/app/(frontend)/home-gold/GoldTopActivitiesSection.jsx src/app/(frontend)/home-gold/__tests__/GoldTopActivitiesSection.test.jsx`

Expected: the AboutHero formatting-only change and the two unrelated home-gold edits are visible before implementation.

- [ ] **Step 2: Preserve unrelated files and deliberately replace only the approved AboutHero layout**

Do not stage, format, revert, or otherwise edit either home-gold file. Retain the semantic content of the current AboutHero heading and paragraph when restructuring its markup.

### Task 1: Add directional scroll-reveal primitives

**Files:**

- Modify: `src/app/components/ui/__tests__/Reveal.test.jsx`
- Modify: `src/app/components/ui/Reveal.jsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write a failing CSS animation contract test and directional characterization tests**

Read `src/app/globals.css` in the test and require the missing animation hooks:

```jsx
const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

expect(css).toContain('@keyframes weelpRevealLeft');
expect(css).toContain('@keyframes weelpRevealRight');
expect(css).toContain("[data-reveal='shown'][data-reveal-variant='left']");
expect(css).toContain("[data-reveal='shown'][data-reveal-variant='right']");

it.each(['left', 'right'])('exposes the %s reveal variant', (variant) => {
  const { container } = render(<Reveal variant={variant}>content</Reveal>);
  expect(container.firstChild).toHaveAttribute('data-reveal-variant', variant);
});
```

- [ ] **Step 2: Run the focused test and confirm the CSS contract assertions fail while directional characterization cases pass**

Run: `npx jest src/app/components/ui/__tests__/Reveal.test.jsx --runInBand`

Expected: FAIL because `globals.css` does not yet define the directional keyframes/selectors; the JSX characterization cases pass.

- [ ] **Step 3: Add directional keyframes and selectors**

Keep the existing `data-reveal` state machine. Add `weelpRevealLeft` and `weelpRevealRight` keyframes using `translate3d(-40px, 0, 0)` and `translate3d(40px, 0, 0)` respectively, then bind them to:

```css
[data-reveal='shown'][data-reveal-variant='left'] {
  animation: weelpRevealLeft var(--weelp-duration-reveal) var(--weelp-ease-out) both;
}

[data-reveal='shown'][data-reveal-variant='right'] {
  animation: weelpRevealRight var(--weelp-duration-reveal) var(--weelp-ease-out) both;
}
```

Update the `Reveal.jsx` JSDoc so `variant` explicitly supports `lift`, `left`, and `right`. Include both new selectors in the existing `prefers-reduced-motion` reset.

- [ ] **Step 4: Run the reveal test**

Run: `npx jest src/app/components/ui/__tests__/Reveal.test.jsx --runInBand`

Expected: PASS.

- [ ] **Step 5: Verify computed animation behavior in the visible browser**

After the local page is available, inspect shown left/right reveal roots and assert `animation-name` resolves to `weelpRevealLeft` and `weelpRevealRight`. Emulate reduced motion and assert the same roots have no animation while remaining visible.

### Task 2: Rebuild the reference hero and company-story split

**Files:**

- Create: `src/app/components/Pages/FRONT_END/About/AboutPage.module.css`
- Create: `src/app/components/Pages/FRONT_END/About/AboutImage.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutHero.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutStory.jsx`
- Create: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx`

- [ ] **Step 1: Write failing hero/story structure tests**

Mock `next/image` as a plain `img` and `Reveal` as a pass-through. Render both components and assert:

```jsx
expect(screen.getByRole('heading', { level: 1, name: /shaping journeys through experience and care/i })).toBeInTheDocument();
expect(screen.getByText('Home')).toBeInTheDocument();
expect(screen.getByText('About Us')).toBeInTheDocument();
expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
expect(screen.getByText('120+')).toBeInTheDocument();
expect(screen.getByText('40+')).toBeInTheDocument();
expect(screen.getByRole('link', { name: /contact our team/i })).toHaveAttribute('href', '/contact-us');
expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(2);
```

- [ ] **Step 2: Run the new section test and confirm failure**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx --runInBand`

Expected: FAIL because the current story lacks the reference two-row grid and contiguous metric panel.

- [ ] **Step 3: Implement the hero composition**

Use a `min-height` desktop hero with the reference's left-aligned breadcrumb/content composition, oversized two-line heading, supporting paragraph, and layered background image. Preserve `.weelp-hero-rise`, `.weelp-rise-mask`, and the 200/280 ms entrance delays. Render Home as `NavigationLink href="/"` unconditionally and About Us as the current breadcrumb item.

- [ ] **Step 4: Add the shared About image fallback**

Create a focused client component that accepts the normal `next/image` props, tracks `onError`, and replaces a failed image with an equally sized muted fallback. Decorative images keep `aria-hidden`; meaningful fallbacks expose the supplied alt label. Test success and error states without reading image dimensions from the client.

- [ ] **Step 5: Implement the story two-row composition**

Keep the story image reference in a local `storyImage` data object containing `src`, `alt`, and `fallbackLabel`. Build the exact two-row asymmetric grid: section label/headline at top-left; one contiguous `120+ Destinations | 40+ Local partners` stat panel with a vertical divider at top-right; one large `AboutImage` at bottom-left; and the two existing paragraphs, five checklist rows, and `NavigationLink` to `/contact-us` at bottom-right. Reveal the left cells from the left and the right cells from the right.

- [ ] **Step 6: Add responsive CSS-module geometry**

Define named classes for `hero`, `storyGrid`, `storyHeading`, `storyStats`, `storyImage`, and `storyCopy`. At widths below `768px`, stack heading → stats → image → copy, keep the metric divider readable, and preserve the image aspect ratio.

- [ ] **Step 7: Run the section test**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx --runInBand`

Expected: PASS for hero/story cases.

### Task 3: Rebuild the masonry company section and dark values split

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/AboutOffer.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutWhyChoose.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutPage.module.css`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx`

- [ ] **Step 1: Add failing masonry/value assertions**

Assert the separate masonry header, contact action, three masonry columns, and exactly four value items:

```jsx
expect(screen.getByRole('heading', { name: /trusted travel partner/i })).toBeInTheDocument();
expect(screen.getByRole('link', { name: /get in touch/i })).toHaveAttribute('href', '/contact-us');
expect(screen.getByTestId('about-masonry-header')).toBeInTheDocument();
expect(screen.getAllByTestId('about-masonry-column')).toHaveLength(3);
expect(screen.getAllByTestId('about-value-card')).toHaveLength(4);
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx --runInBand`

Expected: FAIL because `AboutOffer` is currently a card grid and `AboutWhyChoose` lacks the reference image/metric split.

- [ ] **Step 3: Convert `AboutOffer` into the trusted-leader masonry composition**

Keep each image in a local data object and render it through `AboutImage`. First build a separate three-column header row marked `data-testid="about-masonry-header"`: section label in the left column, with the oversized Weelp-focused headline and action spanning the middle/right columns. Then build the masonry row: a tall image/CTA card in the left column; a Lorem Ipsum information card over an image in the middle column; and an image/destination-metric treatment over a support-copy card in the right column. Close with the compact avatar/contact row. Mark each masonry column `data-testid="about-masonry-column"` and reveal the three columns left/up/right.

- [ ] **Step 4: Convert `AboutWhyChoose` into the reference dark split composition**

Use a dark full-width section. Place a large travel image with an overlapping `90+ Local guides` metric panel on the left. On the right, render the existing section label, headline, introduction, and the four current values as a 2×2 icon/title/description grid with `data-testid="about-value-card"`. Reveal the image group from the left, the copy from the right, and stagger the values at 90 ms.

- [ ] **Step 5: Add masonry, hover, and responsive rules**

In the CSS module, encode the three masonry column heights, internal stack ratios, clipped image scaling, metric overlap, and dark split. Disable transforms under reduced motion. Collapse masonry to two columns on tablet and one column on mobile; stack the dark image/value split image-first below desktop.

- [ ] **Step 6: Run the section test**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx --runInBand`

Expected: PASS for masonry/value cases.

### Task 4: Match the three-card team row and split testimonial carousel

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/AboutTeam.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutTestimonials.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutPage.module.css`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx`
- Create: `src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx`

- [ ] **Step 1: Add failing team and carousel tests**

Assert exactly three team articles and accessible carousel controls:

```jsx
expect(screen.getAllByTestId('about-team-card')).toHaveLength(3);
expect(screen.getByRole('button', { name: /previous testimonial/i })).toBeDisabled();
expect(screen.getByRole('button', { name: /next testimonial/i })).toBeEnabled();
```

Mock Swiper with a stateful harness that stores the active index, implements `slidePrev`/`slideNext`, and emits `slideChange`, `reachBeginning`, and `reachEnd` with updated `isBeginning`, `isEnd`, and `activeIndex` values.

- [ ] **Step 2: Run both About tests and confirm failure**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx --runInBand`

Expected: FAIL because six team cards render and carousel disabled state is not tracked.

- [ ] **Step 3: Implement the reference team row**

Keep the first three unique team members and their image references in a local data array. Render each `AboutImage` inside a stable tall frame, then place the member name and role beneath the image in normal document flow inside `data-testid="about-team-card"`. Apply left/up/right reveal variants across the three cards and image-scale hover behavior.

- [ ] **Step 4: Implement the split testimonial layout**

Keep every testimonial image and reviewer avatar in the review data array and render them through `AboutImage`. Place a centered rating and verified-review count above the carousel. Use one Swiper whose slide pairs a large traveler image on the left with one contrasting right panel containing quote mark/rating, review copy, divider, reviewer avatar/name/destination descriptor, and previous/next controls. This paired slide guarantees synchronization while matching the reference split. Track Swiper `slideChange`, `reachBeginning`, and `reachEnd` so controls expose accurate `disabled` states. Preserve reduced-motion speed handling.

- [ ] **Step 5: Verify carousel synchronization and boundaries**

Click Next and assert both the visible traveler image alt text and reviewer name advance together. Assert Previous becomes enabled after advancing, Next becomes disabled on the last slide, and a reduced-motion match-media mock causes Swiper to receive `speed={0}`.

- [ ] **Step 6: Run both About tests**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx --runInBand`

Expected: PASS.

### Task 5: Match the image CTA and FAQ split

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/AboutCTA.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutFAQ.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutPage.module.css`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx`

- [ ] **Step 1: Add failing CTA/FAQ tests**

Assert the CTA action and accordion behavior:

```jsx
expect(screen.getByRole('link', { name: /start planning/i })).toHaveAttribute('href', '/activities');
const first = screen.getByRole('button', { name: /which destinations/i });
const second = screen.getByRole('button', { name: /how does booking work/i });
expect(first).toHaveAttribute('aria-expanded', 'true');
await user.click(second);
expect(first).toHaveAttribute('aria-expanded', 'false');
expect(second).toHaveAttribute('aria-expanded', 'true');
```

- [ ] **Step 2: Run both About tests and confirm the new geometry/content expectations fail**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx --runInBand`

Expected: existing interaction assertions pass where applicable; new structural selectors fail.

- [ ] **Step 3: Rebuild the CTA band**

Keep CTA imagery in a local data object and render it through `AboutImage` inside a stable-height frame. Use a full-bleed image band within the page flow, centered heading/copy/action, clipped overflow, and a restrained background zoom on hover. Replace the plain anchor with `NavigationLink` and retain the `/activities` route.

- [ ] **Step 4: Rebuild the FAQ split**

Keep FAQ imagery in a local data object and render it through `AboutImage` inside a stable-height frame. Match the reference's left accordion/right tall-image layout and spacing. Preserve button semantics, `aria-expanded`, `aria-controls`, panel regions, keyboard behavior, and one-open-at-a-time state. Apply `Reveal variant="left"` to the accordion and `Reveal variant="right"` to the image.

- [ ] **Step 5: Run both About tests**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx --runInBand`

Expected: PASS.

### Task 6: Verify the integrated page

**Files:**

- Review: `src/app/(frontend)/about-us/page.jsx`
- Review: all files changed in Tasks 1-5

- [ ] **Step 1: Write a failing eight-section order test**

Add `data-about-section` to each section root and render the About route in `AboutPageSections.test.jsx`. Assert the exact order:

```jsx
const sections = [...container.querySelectorAll('[data-about-section]')].map((node) => node.dataset.aboutSection);
expect(sections).toEqual(['hero', 'story', 'statement', 'process', 'team', 'testimonials', 'cta', 'faq']);
```

Expected before adding the attributes: FAIL with an empty or incomplete section array.

- [ ] **Step 2: Add stable section identifiers without changing page composition**

Use the eight identifiers from the assertion on the existing component root `<section>` elements. Keep the route's component order unchanged.

- [ ] **Step 3: Run the integrated composition test**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx --runInBand`

Expected: PASS with the approved hero → story → statement → process → team → testimonials → CTA → FAQ order.

- [ ] **Step 4: Format only the explicit changed files**

Run: `npx prettier --write src/app/globals.css src/app/components/ui/Reveal.jsx src/app/components/ui/__tests__/Reveal.test.jsx src/app/components/Pages/FRONT_END/About/AboutPage.module.css src/app/components/Pages/FRONT_END/About/AboutImage.jsx src/app/components/Pages/FRONT_END/About/AboutHero.jsx src/app/components/Pages/FRONT_END/About/AboutStory.jsx src/app/components/Pages/FRONT_END/About/AboutOffer.jsx src/app/components/Pages/FRONT_END/About/AboutWhyChoose.jsx src/app/components/Pages/FRONT_END/About/AboutTeam.jsx src/app/components/Pages/FRONT_END/About/AboutTestimonials.jsx src/app/components/Pages/FRONT_END/About/AboutCTA.jsx src/app/components/Pages/FRONT_END/About/AboutFAQ.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx`

Expected: formatter exits 0 without touching unrelated files.

- [ ] **Step 5: Apply the required error-handling review**

Invoke `error-handling-patterns` and inspect image failure states, Swiper boundary events, missing IntersectionObserver support, and FAQ state. Address any concrete gap before static verification.

- [ ] **Step 6: Run focused tests**

Run: `npx jest src/app/components/ui/__tests__/Reveal.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx --runInBand`

Expected: PASS.

- [ ] **Step 7: Run static verification**

Run: `npm run type-check`

Expected: exit 0.

Run: `npm run lint`

Expected: exit 0 with no dark-mode guard findings.

- [ ] **Step 8: Run the full regression suite**

Run: `npm run test:ci -- --runInBand`

Expected: all suites pass. If the known aggregate Jest memory issue recurs, record the failing suite boundary, rerun affected suites in isolated batches, and do not describe the aggregate run as passing.

- [ ] **Step 9: Run the production build**

Run: `npm run build`

Expected: exit 0 and `/about-us` compiles successfully.

- [ ] **Step 10: Verify in the mandatory visible browser**

Open `http://localhost:3000/about-us` with `agent-browser --session weelp-visible --headed`. Compare the desktop page to the SteelNova reference while scrolling through every section. Verify hero entrance, directional reveals, card staggering, image hover, testimonial navigation, FAQ expansion, dark mode, and no console errors.

- [ ] **Step 11: Verify responsive behavior**

In the same visible session, test widths `1440`, `1024`, `768`, and `390`. Confirm no horizontal overflow, clipped text, overlapping controls, or off-screen metric cards. Confirm reduced-motion emulation leaves all content visible.

- [ ] **Step 12: Run the required code-review and simplify loop**

Dispatch the code-reviewer agent for spec compliance first and code quality second. Fix every critical/major finding, rerun focused verification, and request re-review until approved. Then invoke the required `simplify` skill; if that named skill is unavailable in the active tool catalog, state that explicitly and perform a manual KISS/DRY/YAGNI simplification pass without expanding scope.

- [ ] **Step 13: Repeat final verification after review changes**

Run `npm run type-check`, `npm run lint`, the focused About/Reveal tests, `npm run test:ci -- --runInBand`, `npm run build`, and the visible headed-browser desktop/mobile checks again after all review and simplification edits.

Expected: every command passes, or any pre-existing aggregate-suite infrastructure failure is reported precisely with isolated affected suites passing.

- [ ] **Step 14: Inspect the final diff**

Run: `git diff --check`

Expected: no whitespace errors.

Run: `git status --short`

Expected: only the intended About/motion files plus the user's pre-existing home-gold changes remain modified.
