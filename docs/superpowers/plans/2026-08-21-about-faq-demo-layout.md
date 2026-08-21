# About FAQ Demo Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Before editing Next.js code, apply next-best-practices, vercel-react-best-practices, and vercel-composition-patterns. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the SteelNova demo FAQ composition inside Weelp's canonical container, proportionally scaling its panels and preserving Weelp content and interaction.

**Architecture:** Keep `AboutFAQ` as the existing client accordion and make a surgical shell/class correction plus responsive CSS changes. Desktop geometry is derived from the measured 0.944 rail ratio; tablet and mobile use the existing stacked DOM order and Weelp spacing tokens. No animation work or component extraction is included.

**Tech Stack:** Next.js 16, React 19, CSS Modules, Tailwind CSS, Jest, Testing Library, agent-browser

---

### Task 1: Lock the container and responsive layout contract

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx`

- [ ] **Step 1: Write failing structural assertions**

Rename the composition test to `uses full-width process and CTA bands with a contained interlocked FAQ`, then update the FAQ assertion so it requires `container-page` and no longer requires `fullBleedBand`:

```jsx
const faq = container.querySelector('[data-about-section="faq"]');
expect(faq).toHaveClass('container-page');
expect(faq).not.toHaveClass('fullBleedBand');
expect(screen.getAllByTestId('about-faq-item')).toHaveLength(5);
expect(screen.getAllByTestId('about-faq-item')[0]).toHaveClass('faqItem');
expect(screen.getAllByTestId('about-faq-item')[0]).not.toHaveClass('rounded-[24px]');
expect(screen.getAllByTestId('about-faq-item')[0]).not.toHaveClass('shadow-sm');
```

Add source-contract assertions for the scaled desktop grid, dimensions, and canonical stacked spacing:

```jsx
expect(declarationsFor('.faqHeadingRow')).toContain('min-height: 31.0625rem;');
expect(declarationsFor('.faqContentRow')).toContain('grid-template-columns: 52.1333% 3% 44.8667%;');
expect(declarationsFor('.faqContent')).toContain('grid-column: 1 / 3;');
expect(declarationsFor('.faqContent')).toContain('margin-top: -10.3125rem;');
expect(declarationsFor('.faqImage')).toContain('grid-column: 2 / 4;');
expect(declarationsFor('.faqImage')).toContain('margin-top: -18.375rem;');
expect(declarationsFor('.faqButton')).toContain('font-size: 1.1875rem;');
expect(declarationsFor('.faqButton')).toContain('border-bottom: 1px solid hsl(var(--border));');
expect(declarationsFor('.faqButton')).toContain('cursor: pointer;');
expect(declarationsFor('.faqIcon')).toContain('width: 1.875rem;');
expect(declarationsFor('.faqIcon')).toContain('height: 1.875rem;');
expect(declarationsFor('.faqIconOpen')).toContain('background: hsl(var(--weelp-sage-deep));');
expect(declarationsFor('.faqButton:focus-visible')).toContain('outline: 2px solid hsl(var(--weelp-sage-deep));');
expect(stylesheet).toMatch(/@media \(max-width: 1279px\)[\s\S]*?\.faqHeadingRow\s*\{[^}]*padding: 4rem 0 1\.5rem;[^}]*\}[\s\S]*?\.faqContentRow\s*\{[^}]*padding: 0 0 4rem;[^}]*\}/);
expect(stylesheet).toMatch(/@media \(max-width: 1279px\)[\s\S]*?\.faqImage,[\s\S]*?\.faqContent\s*\{[^}]*grid-row: auto;[^}]*grid-column: 1;[^}]*margin-top: 0;[^}]*\}/);
expect(stylesheet).toMatch(
  /@media \(max-width: 1279px\)[\s\S]*?\.faqImage\s*\{[^}]*border-radius: 1\.5rem 1\.5rem 0 0;[^}]*\}[\s\S]*?\.faqContent\s*\{[^}]*border-radius: 0 0 1\.5rem 1\.5rem;[^}]*\}/,
);
expect(stylesheet).toMatch(/@media \(max-width: 767px\)[\s\S]*?\.faqHeadingRow\s*\{[^}]*padding: 2\.5rem 0 1rem;[^}]*\}[\s\S]*?\.faqContentRow\s*\{[^}]*padding: 0 0 2\.5rem;[^}]*\}/);
```

Extend `AboutInteractions.test.jsx` so the existing one-open-item test asserts the initial and switched icon states:

```jsx
const firstIcon = screen.getByTestId('about-faq-icon-destinations');
const secondIcon = screen.getByTestId('about-faq-icon-booking');
expect(firstIcon).toHaveAttribute('data-state', 'open');
expect(firstIcon).toHaveAttribute('data-icon', 'minus');
expect(secondIcon).toHaveAttribute('data-state', 'closed');
expect(secondIcon).toHaveAttribute('data-icon', 'plus');

fireEvent.click(second);

expect(firstIcon).toHaveAttribute('data-icon', 'plus');
expect(secondIcon).toHaveAttribute('data-icon', 'minus');
```

- [ ] **Step 2: Run the focused tests and confirm the red state**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx --runInBand
```

Expected: FAIL because the FAQ still uses `fullBleedBand`, the scaled container geometry is absent, and the FAQ item/icon test IDs plus the plus/minus state contract are not implemented.

### Task 2: Apply the measured, flow-safe demo geometry inside `container-page`

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/About/AboutFAQ.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutPage.module.css`

- [ ] **Step 1: Constrain the FAQ shell**

Change the section class in `AboutFAQ.jsx`:

```jsx
<section data-about-section="faq" className={`container-page ${styles.faqSection}`}>
```

Keep the FAQ data, semantic controls, and reveal components unchanged. Replace the separate rounded question cards with CSS-module classes for a single divider list (`faqItem`, `faqButton`, `faqAnswer`, and `faqIcon`), and render an `aria-hidden` `Minus` for the open item and `Plus` for closed items inside the 30px state control. Put `data-state` and `data-icon` on the icon wrapper so the interaction contract is testable. Add the sanctioned `weelp-plain-action` class to each trigger so the global dark-mode button surface does not override the flat row. Update the responsive image hint to match the new stack breakpoint:

```jsx
sizes = '(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 48px), (max-width: 1279px) calc(100vw - 64px), (max-width: 1479px) 48vw, 678px';
```

Add the measured divider treatment:

```css
.faqItem {
  padding-top: 1.25rem;
}

.faqButton {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1.875rem;
  padding: 0 0 0.9375rem;
  border: 0;
  border-bottom: 1px solid hsl(var(--border));
  background: transparent;
  color: hsl(var(--foreground));
  font-size: 1.1875rem;
  font-weight: 600;
  line-height: 1.4;
  text-align: left;
  cursor: pointer;
}

.faqButton:global(.weelp-plain-action) {
  border-bottom: 1px solid hsl(var(--border)) !important;
}

.faqButton:focus-visible {
  border-radius: 0.25rem;
  outline: 2px solid hsl(var(--weelp-sage-deep));
  outline-offset: 0.25rem;
}

.faqIcon {
  display: grid;
  width: 1.875rem;
  height: 1.875rem;
  flex: 0 0 1.875rem;
  place-items: center;
  border-radius: 0.25rem;
  background: hsl(var(--weelp-sage-wash));
  color: hsl(var(--foreground));
}

.faqIconOpen {
  background: hsl(var(--weelp-sage-deep));
  color: hsl(0 0% 100%);
}

.faqAnswer {
  padding: 1.375rem 0 1rem;
  color: hsl(var(--muted-foreground));
  font-size: 1rem;
  line-height: 1.625;
}
```

- [ ] **Step 2: Replace full-width desktop percentages with scaled demo ratios**

Implement the measured desktop contract in the CSS module:

```css
.faqSection {
  position: relative;
  overflow: visible;
}

.faqHeadingRow {
  position: relative;
  min-height: 31.0625rem;
  padding: 8.25rem 0 4rem;
  background: hsl(var(--background));
}

.faqHeading {
  max-width: 36rem;
}

.faqContentRow {
  position: relative;
  display: grid;
  grid-template-columns: 52.1333% 3% 44.8667%;
  min-height: 27.625rem;
  background: hsl(var(--weelp-sage-wash));
}

.faqImage {
  grid-row: 1;
  grid-column: 2 / 4;
  align-self: start;
  z-index: 1;
  min-height: 46.4375rem;
  margin-top: -18.375rem;
  border-radius: 0;
}

.faqContent {
  grid-row: 1;
  grid-column: 1 / 3;
  align-self: start;
  z-index: 2;
  min-height: 31.75rem;
  margin-top: -10.3125rem;
  padding: 2.5625rem 3.125rem 2.75rem 3.6875rem;
  background: hsl(var(--background));
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 8%);
}
```

- [ ] **Step 3: Make tablet and mobile use Weelp spacing and radii**

Add a FAQ-only stacked layout breakpoint at `1279px`, remove the old FAQ declarations from the shared `1023px` block, and use the established responsive spacing. Do not widen the shared breakpoint because that would alter unrelated About sections:

```css
@media (max-width: 1279px) {
  .faqHeadingRow {
    min-height: 0;
    padding: 4rem 0 1.5rem;
  }

  .faqContentRow {
    display: grid;
    grid-template-columns: 1fr;
    min-height: 0;
    gap: 0;
    padding: 0 0 4rem;
  }

  .faqImage,
  .faqContent {
    grid-row: auto;
    grid-column: 1;
    width: 100%;
    margin-top: 0;
  }

  .faqImage {
    min-height: 36rem;
    border-radius: 1.5rem 1.5rem 0 0;
  }

  .faqContent {
    min-height: 0;
    padding: 3rem;
    border-radius: 0 0 1.5rem 1.5rem;
    box-shadow: none;
  }
}

@media (max-width: 767px) {
  .faqHeadingRow {
    padding: 2.5rem 0 1rem;
  }

  .faqContentRow {
    padding: 0 0 2.5rem;
  }

  .faqImage {
    min-height: 27rem;
    border-radius: 1rem 1rem 0 0;
  }

  .faqContent {
    padding: 2rem 1rem;
    border-radius: 0 0 1rem 1rem;
  }
}
```

- [ ] **Step 4: Run the focused tests and confirm the green state**

Run the Task 1 Jest command again.

Expected: all three suites PASS.

### Task 3: Verify quality and responsive fidelity

**Files:**

- Modify only if verification exposes a scoped FAQ defect.

- [ ] **Step 1: Apply the error-handling checkpoint and run static verification**

Read and apply `error-handling-patterns` to the changed client interaction boundary. This layout-only change must preserve the existing event-handler behavior without adding catches, silent failure paths, or new async work. Then run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit 0 without new errors.

- [ ] **Step 2: Run focused behavior tests and the production build**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/About/__tests__/AboutInteractions.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSpacing.test.js --runInBand
npm run build
```

Expected: focused tests pass and Next.js build exits 0.

- [ ] **Step 3: Check the layout in the already-open visible browser**

Explicitly open named headed session `weelp-faq-layout` at `http://localhost:3000/about-us`. Inspect 1920×1080, 1440×900, 1280×900, 1279×900, 1024×768, 768×1024, and 390×844. Confirm:

- desktop bands remain entirely within `container-page`;
- the accordion aligns left and image aligns right;
- the scaled panels preserve the demo overlap without clipping;
- tablet/mobile order is heading → image → accordion;
- radii are visible on stacked panels;
- light and dark themes preserve readable surfaces;
- 200% text zoom or temporarily lengthened FAQ copy grows the grid without covering the footer;
- `document.documentElement.scrollWidth <= window.innerWidth` at every size.

- [ ] **Step 4: Complete review and simplify gates**

Dispatch the required code reviewer against the final diff, address all critical and major findings, and re-review until none remain. Then run the `simplify` skill over the touched implementation. Re-run Task 3 verification after any correction.

- [ ] **Step 5: Commit and push `main`**

Stage only the FAQ implementation, tests, design spec, and plan. Commit with:

```bash
git commit -m "fix: match about FAQ demo layout"
git push origin main
```

Expected: `main` is pushed and `git status --short` is clean.
