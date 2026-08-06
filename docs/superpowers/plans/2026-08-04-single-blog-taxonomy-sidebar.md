# Single Blog Taxonomy Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present single-blog categories and tags as compact inline text and keep one clean, responsive sidebar section on mobile.

**Architecture:** Keep the existing server-rendered `ContentSection` and pure taxonomy helpers. Change only layout and presentation classes: taxonomy links become plain text with inline wrapping, while the sidebar wrapper removes nested mobile padding and retains desktop spacing.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Jest, Testing Library

---

### Task 1: Lock the inline taxonomy and responsive sidebar contract

**Files:**

- Modify: `src/app/components/Pages/FRONT_END/singleblog/__tests__/ContentSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/singleblog/SingleBlogModules.jsx`
- Modify: `src/app/components/Pages/FRONT_END/singleblog/ContentSection.jsx`

- [ ] **Step 1: Write the failing presentation test**

First update the `Reveal` mock so it forwards the sidebar test id without passing animation-only props into the test DOM:

```jsx
jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ children, className = '', 'data-testid': testId }) => (
    <div className={className} data-testid={testId}>
      {children}
    </div>
  ),
}));
```

Then add this test after the existing taxonomy-link test:

```jsx
it('uses inline taxonomy text and one full-width mobile sidebar', () => {
  const { container } = render(
    <ContentSection
      content="A sufficiently long article body that should render in the public content surface."
      categories={[{ name: 'Travel Tips', slug: 'travel-tips' }]}
      tags={[{ name: 'Family', slug: 'family' }]}
    />,
  );

  const sidebar = container.querySelector('[data-testid="blog-sidebar"]');
  const categoryLink = screen.getByRole('link', { name: 'Travel Tips' });
  const tagLink = screen.getByRole('link', { name: 'Family' });
  const categoryList = categoryLink.closest('ul');
  const tagList = tagLink.closest('ul');

  expect(container.querySelectorAll('[data-testid="blog-sidebar"]')).toHaveLength(1);
  expect(sidebar).toHaveClass('w-full', 'px-0', 'lg:px-8');
  expect(categoryList).toHaveClass('flex', 'flex-wrap', 'max-w-none');
  expect(tagList).toHaveClass('flex', 'flex-wrap', 'max-w-none');

  [categoryLink, tagLink].forEach((link) => {
    expect(link).not.toHaveClass('border');
    expect(link).not.toHaveClass('rounded-md');
    expect(link).not.toHaveClass('px-6');
    expect(link).not.toHaveClass('py-4');
    expect(link).toHaveClass('text-base', 'hover:text-weelp-sage-text');
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/singleblog/__tests__/ContentSection.test.jsx
```

Expected: FAIL because the sidebar has no test id/full-width mobile contract and taxonomy items still have bordered button classes and a narrow `max-w-52` list.

- [ ] **Step 3: Apply the minimal responsive layout change**

The required `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns` guidance was loaded and reviewed before this implementation step.

In `ContentSection.jsx`, replace the sidebar `Reveal` classes with:

```jsx
<Reveal
  variant="lift"
  initialHidden
  delay={120}
  data-testid="blog-sidebar"
  className="flex w-full flex-1 flex-col gap-6 px-0 pt-8 sm:gap-8 lg:gap-12 lg:px-8 lg:py-6"
>
```

In `SingleBlogModules.jsx`, replace the taxonomy class constants with:

```jsx
const taxonomyLabelClasses = 'text-base font-medium capitalize text-Lynchcolor break-words';
const taxonomyLinkClasses = `${taxonomyLabelClasses} transition-colors hover:text-weelp-sage-text`;
```

For both taxonomy lists, replace the list classes with:

```jsx
className = 'flex max-w-none flex-wrap gap-x-4 gap-y-2';
```

Keep both headings, filter destinations, fallback labels, and the share section unchanged.

- [ ] **Step 4: Run the focused test to verify GREEN**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/FRONT_END/singleblog/__tests__/ContentSection.test.jsx
```

Expected: all `ContentSection` tests PASS without warnings.

- [ ] **Step 5: Run project checks**

Invoke `error-handling-patterns` first. This presentation-only change introduces no new failure path; confirm the existing safe fallback behavior for missing names/slugs remains intact, then run:

Run:

```bash
npm run type-check
npm run lint
```

Expected: both commands exit 0.

- [ ] **Step 6: Verify in the visible localhost browser**

Open the local single-blog page in the named headed browser, then verify at 390×844 and 1280×900:

```bash
agent-browser --session weelp-visible --headed open http://localhost:3000/blogs/wildfire-safety-for-travelers-how-to-stay-safe-in-fire-season
agent-browser --session weelp-visible set viewport 390 844
agent-browser --session weelp-visible set viewport 1280 900
```

Expected: one taxonomy/share sidebar; category and tag values appear as wrapping inline text without boxes; mobile has no nested horizontal sidebar inset; desktop retains the article/sidebar split.

- [ ] **Step 7: Complete review, simplification, and delivery gates**

Run the required code-review agent against the diff, address critical findings, apply the available simplification pass, rerun the focused test/type-check/lint/browser verification, then commit and push `main`. The workspace `AGENTS.md` now persists the user's localhost-first UI testing preference.
