# About Us Fidelity Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct the About Us page so its full-width bands, oversized story metrics, overlaps, section proportions, CTA/FAQ treatment, and blur reveal match the live SteelNova reference while retaining Weelp branding.

**Architecture:** Keep the existing eight section components and server-composed route. Add one focused semantic blur-heading component, reshape the About CSS module around measured desktop geometry, and use responsive overrides to remove overlaps safely below desktop. Structure tests provide regression contracts; visible browser rectangle measurements provide the final fidelity evidence.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Tailwind CSS, CSS Modules, Jest, Testing Library, agent-browser.

---

## File map

- Create `src/app/components/Pages/FRONT_END/About/BlurRevealHeading.jsx` for semantic character-level heading motion.
- Create `src/app/components/Pages/FRONT_END/About/__tests__/BlurRevealHeading.test.jsx` for accessibility and split-character contracts.
- Modify `src/app/globals.css` for the blur-heading animation and reduced-motion reset.
- Modify `src/app/components/Pages/FRONT_END/About/AboutPage.module.css` for measured full-bleed, overlap, height, and responsive geometry.
- Modify `AboutHero.jsx`, `AboutStory.jsx`, `AboutOffer.jsx`, `AboutWhyChoose.jsx`, `AboutTeam.jsx`, `AboutTestimonials.jsx`, `AboutCTA.jsx`, and `AboutFAQ.jsx` to use the corrected geometry and heading motion.
- Modify `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx` for full-bleed and overlap structure contracts.
- Modify `src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx` only if revised markup affects existing selectors.
- Preserve the unrelated dirty Home Gold component and test without staging, formatting, or editing them.

### Task 1: Lock the missed fidelity details with failing tests

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx`
- Create: `src/app/components/Pages/FRONT_END/About/__tests__/BlurRevealHeading.test.jsx`

- [ ] **Step 1: Add story overlap and metric-content assertions**

Require separate upper/lower story rows, a raised metric panel, and descriptive copy inside both metrics:

```jsx
expect(screen.getByTestId('about-story-top')).toBeInTheDocument();
expect(screen.getByTestId('about-story-bottom')).toBeInTheDocument();
expect(screen.getByTestId('about-story-stats')).toHaveClass('storyStatsOverlap');
expect(screen.getByText(/curated destinations across/i)).toBeInTheDocument();
expect(screen.getByText(/local partners helping/i)).toBeInTheDocument();
```

- [ ] **Step 2: Add full-bleed section assertions**

Require structural hooks that distinguish full-width imagery from constrained cards:

```jsx
expect(container.querySelector('[data-about-section="process"] [data-testid="about-process-split"]')).toHaveClass('fullBleedSplit');
expect(container.querySelector('[data-about-section="cta"]')).toHaveClass('fullBleedBand');
expect(container.querySelector('[data-about-section="faq"]')).toHaveClass('fullBleedBand');
expect(screen.getByTestId('about-faq-heading-row')).toBeInTheDocument();
expect(screen.getByTestId('about-faq-content-row')).toBeInTheDocument();
expect(screen.getByTestId('about-faq-overlap-image')).toBeInTheDocument();
```

- [ ] **Step 3: Add compact team and semantic blur-heading tests**

Render `BlurRevealHeading` and require one accessible heading name while every decorative character is hidden:

```jsx
render(<BlurRevealHeading as="h2">Meaningful journeys</BlurRevealHeading>);
expect(screen.getByRole('heading', { name: 'Meaningful journeys' })).toBeInTheDocument();
expect(screen.getAllByTestId('blur-reveal-character').every((node) => node.closest('[aria-hidden="true"]'))).toBe(true);
```

Also require the team grid to expose `data-team-layout="reference-compact"`.

- [ ] **Step 4: Run the tests and confirm the expected failures**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/BlurRevealHeading.test.jsx --runInBand`

Expected: FAIL because the story is still a normal grid, full-bleed/two-row FAQ hooks are absent, the compact team hook is absent, and `BlurRevealHeading` does not exist.

### Task 2: Add the reference character blur reveal

**Files:**

- Create: `src/app/components/Pages/FRONT_END/About/BlurRevealHeading.jsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/BlurRevealHeading.test.jsx`

- [ ] **Step 1: Implement the semantic split component**

Accept `as`, `children`, `className`, and `delay`. Render a `Reveal` root with `variant="blur"` and `aria-label={children}`. Split words into inline-block spans and characters into `data-testid="blur-reveal-character"` spans inside one `aria-hidden="true"` visual wrapper. Assign `--weelp-blur-index` and preserve spaces between word wrappers.

- [ ] **Step 2: Add blur reveal styles**

Characters begin at `opacity: 0`, `filter: blur(10px)`, and a small positive Y offset. When the root becomes shown, animate to full opacity, no blur, and zero offset using a per-character delay based on `--weelp-blur-index`. Under `prefers-reduced-motion: reduce`, remove animation/filter/transform and force opacity to one.

- [ ] **Step 3: Run the component test**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/BlurRevealHeading.test.jsx --runInBand`

Expected: PASS with one semantic heading name and hidden decorative characters.

### Task 3: Correct hero and oversized overlapping story geometry

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/AboutHero.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutStory.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutPage.module.css`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx`

- [ ] **Step 1: Replace the story's single grid with coordinated rows**

Render `data-testid="about-story-top"` around the label/headline and statistic panel, then `data-testid="about-story-bottom"` around image/copy. Add short Weelp descriptions beneath both statistic labels. Apply `BlurRevealHeading` to the story heading.

- [ ] **Step 2: Encode the measured desktop overlap**

At `min-width: 1024px`, use `46% 54%` for the upper row and `57% 36%` plus `7%` gap for the lower row. Give the metric panel `min-height: 21.875rem`, a higher `z-index`, square-to-soft reference corners, and a `-5rem` lower-row offset so it overlaps the image. At 1440px target a metric box near `744×351px`, image near `781×658px`, and intersections near `130px` horizontal/`80px` vertical. Enlarge metric numerals and descriptions to fill the panel.

- [ ] **Step 3: Encode mobile de-overlap**

Below `1024px`, remove negative margins and z-index dependency. Below `768px`, stack both statistics vertically and order headline → statistics → image → copy. Keep the page wrapper clipped horizontally.

- [ ] **Step 4: Tighten the hero transition into story**

Remove the hero's section bottom margin and target a desktop height near the reference. Put story whitespace inside the story band through explicit responsive padding, not between bands.

- [ ] **Step 5: Run the focused structure tests**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx --runInBand`

Expected: PASS for story structure, metric copy, and overlap hooks.

### Task 4: Rebuild the remaining full-width bands

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/AboutOffer.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutWhyChoose.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutTeam.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutTestimonials.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutCTA.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutFAQ.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutPage.module.css`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx`

- [ ] **Step 1: Deepen the company masonry**

Increase section whitespace and use reference-like column heights: approximately 51rem left, 23rem/27rem center, and 31rem/19rem right. Keep the existing three-column header and contact row. Apply `BlurRevealHeading` to the main heading.

- [ ] **Step 2: Make the process section a flush split**

Mark the split `data-testid="about-process-split"` and `fullBleedSplit`. Remove `container-page` and rounded image framing from the split itself. Use a desktop `47% 53%` grid with a minimum height near 65rem, full-height image, padded copy panel, and the existing overlapping guide metric. Mobile stacks image first.

- [ ] **Step 3: Compact the team band**

Mark the grid `data-team-layout="reference-compact"`. Change desktop portrait ratio and section padding so three portraits, names, and roles fit the reference's compact band rather than the current extra-tall cards. Apply the blur heading without changing team data.

- [ ] **Step 4: Align testimonial proportions**

Keep one control pair and synchronized paired slides. Use Weelp's Major Section spacing (`96px` desktop, `64px` tablet, `40px` mobile), a 416px desktop split, 16px outer card corners, and yellow-400 rating stars with a 4px gap. Below 901px tall, let desktop outer padding fluidly reduce from 96px to 32px so the full section remains below the fixed header. At or below 780px tall, use the short-height treatment: 24px outer padding and header gap, a 360px minimum split, and 36px panel padding. Preserve current accessibility and reduced-motion behavior. Apply the blur heading.

- [ ] **Step 5: Make CTA edge to edge**

Put `fullBleedBand` on the section root, remove `container-page`, rounded corners, and bottom gap from the media frame, and target the reference's approximately 31rem desktop band. Keep centered Weelp copy and `/activities` navigation.

- [ ] **Step 6: Convert FAQ to two interlocked full-width rows**

Put `fullBleedBand` on the root. Create `data-testid="about-faq-heading-row"` as an approximately 32rem heading band. Create a separate `data-testid="about-faq-content-row"` beneath it. On desktop, place the accordion in an approximately 58% left column and `data-testid="about-faq-overlap-image"` in an approximately 50% right column. Offset the accordion upward about 11rem and the image upward about 19.5rem so both bridge the row boundary, matching the reference. Keep the section's outer overflow visible vertically while the page wrapper clips only horizontal overflow. Below desktop, remove negative offsets and stack heading → image → accordion.

- [ ] **Step 7: Run About tests**

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx --runInBand`

Expected: PASS with full-bleed, compact-team, carousel, FAQ, and route contracts preserved.

### Task 5: Measure fidelity in the mandatory visible browser

**Files:**

- Review: all changed About files

- [ ] **Step 1: Run static verification**

Run: `npm run type-check`

Run: `npm run lint`

Run: `npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/BlurRevealHeading.test.jsx src/app/components/ui/__tests__/Reveal.test.jsx --runInBand`

Expected: all commands exit zero.

- [ ] **Step 2: Compare desktop rectangles**

Open the reference and localhost in `agent-browser --session weelp-visible --headed` at 1440×1000. Measure every `[data-about-section]` root and the story image/stat boxes. Confirm:

- every section root spans the document width;
- story statistics are `744×351px ± 8%`, the image is `781×658px ± 8%`, and their horizontal/vertical intersections are `130px ± 20px` and `80px ± 16px`;
- company masonry inner width is `1320px ± 6%`, columns are equal `413px ± 6%` with `40px ± 12px` gaps, outer column height is `900px ± 8%`, and inner card stacks match `496/364`, `364/496`, and `496/364` within `±8%`;
- the process split ratio is `666/758px ± 6%` with total height `1043px ± 8%`; its metric panel is `373×233px ± 8%` and sits near the lower-left image area;
- team portraits are three approximately square `432px ± 8%` frames with `49px ± 12px` gaps inside a section near `1037px ± 10%`;
- at 1440px wide, the testimonial image and panel are each approximately `675×416px ± 8%`, separated by about `18px ± 10px`, with 16px outer corners and exactly one visible control pair in the panel footer; the full section remains no taller than the viewport minus the 66px desktop header;
- CTA spans the viewport at `493px ± 10%`, with no rounded outer card or container side margin;
- FAQ heading/content rows are `511px ± 10%` and `468px ± 10%`; accordion is approximately `827×538px ± 10%` and overlaps the content-row top by `175px ± 30px`; the right image is approximately `718×787px ± 10%` and overlaps it by `311px ± 35px`.

- [ ] **Step 3: Compare responsive behavior**

Repeat at 1024, 768, and 390 pixels. Confirm mobile story statistics stack, negative overlap is absent, FAQ DOM/visual order is heading → image → accordion, masonry becomes two then one column without changing card order, process stacks image-first, testimonial panels stack image-first, controls do not overlap text, and `document.documentElement.scrollWidth <= window.innerWidth`.

- [ ] **Step 4: Verify motion**

Reload before each check. Confirm headings begin blurred and resolve character by character when scrolled into view. Emulate reduced motion and confirm characters are immediately sharp and visible. Confirm no browser console errors.

### Task 6: Review, simplify, and finish

**Files:**

- Review: final diff only

- [ ] **Step 1: Run the production build and regression suite**

Run: `npm run build`

Run: `npm run test:ci -- --runInBand`

Expected: build succeeds. Report any known unrelated stale-contract suite failures precisely rather than describing the full suite as passing.

- [ ] **Step 2: Dispatch the mandatory code reviewer**

Review fidelity against `docs/superpowers/specs/2026-08-20-about-us-fidelity-correction-design.md` first, then code quality. Fix critical/major findings and request re-review until approved.

- [ ] **Step 3: Simplify without changing geometry**

Invoke the required `simplify` skill if available. If unavailable, perform and report a manual KISS/DRY/YAGNI pass. Do not collapse named geometry classes whose explicitness supports visual comparison.

- [ ] **Step 4: Repeat fresh verification**

Run focused tests, type-check, lint, build, `git diff --check`, and the visible desktop/mobile browser measurements after review changes.

- [ ] **Step 5: Commit only the correction files and push `main`**

Inspect `git status --short`, explicitly exclude both Home Gold files, commit the approved correction, and push `origin main` as required by project instructions.
