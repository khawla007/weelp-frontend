# Website-wide Blog Card Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show category, title, two-line excerpt, and compact tag metadata on every public blog card while making shorter cards match the tallest card in their row.

**Architecture:** Keep `mapBlogToItemCard` as the only public-blog adapter and expand its normalized editorial-card contract with `shortDescription`, `tag`, and `additionalTagCount`. Render those fields and the full-height behavior inside the shared editorial `ItemCard`, then make the `/blogs` grid item explicitly fill its grid track; all `BlogSection` carousels inherit the result without page-specific markup.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Tailwind CSS, Swiper 12, Jest 30, React Testing Library

---

## Required execution workflow

Run every command in this plan from the `frontend/` repository. Before editing Next.js code, load `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Use test-driven development for each behavior change. After each task's code change, run the `error-handling-patterns` review, targeted tests, type-check, lint, and the named visible `agent-browser` smoke check. Keep Tasks 1–3 uncommitted. After all implementation work, complete the mandatory code-review and simplify loop, always repeat the full tests/type-check/lint/browser verification after that loop, then make one implementation commit and push `main`.

Before the first browser check, confirm that the local frontend responds:

```bash
curl --max-time 5 -I http://localhost:3000
```

Expected: an HTTP response from the local Next.js app. If the check fails, start `npm run dev` in a persistent terminal from `frontend/`, wait for the ready message, and repeat the check before opening the browser.

### Task 1: Expand the normalized blog-card contract

**Files:**

- Modify: `src/lib/__tests__/mapProductToItemCard.test.js`
- Modify: `src/lib/mapProductToItemCard.js`

- [ ] **Step 1: Write the failing mapper tests**

Replace the current first `mapBlogToItemCard` test and extend the blank-value test so the contract covers excerpt and tag normalization:

```js
test('maps public blog content into the shared editorial card contract', () => {
  expect(
    mapBlogToItemCard({
      id: 14,
      name: 'Wildfire Safety',
      slug: 'wildfire-safety',
      excerpt: 'How to stay safe during fire season.',
      categories: [{ category_name: '  ' }, { name: 'Nature' }],
      tags: [{ tag_name: 'Safety' }, { name: 'Outdoors' }, 'Seasonal', { tag_name: '  ' }],
      media_gallery: [{ is_featured: true, url: '/wildfire.jpg' }],
    }),
  ).toEqual({
    id: 14,
    href: '/blogs/wildfire-safety',
    image: '/wildfire.jpg',
    title: 'Wildfire Safety',
    category: 'Nature',
    shortDescription: 'How to stay safe during fire season.',
    tag: 'Safety',
    additionalTagCount: 2,
  });
});

test('uses safe fallbacks and omits blank optional editorial content', () => {
  expect(
    mapBlogToItemCard({
      name: '  ',
      excerpt: '  ',
      tags: [{ tag_name: ' ' }, null],
    }),
  ).toEqual(
    expect.objectContaining({
      href: null,
      title: 'Untitled',
      category: null,
      shortDescription: null,
      tag: null,
      additionalTagCount: 0,
    }),
  );
});
```

- [ ] **Step 2: Run the mapper tests and verify the new assertions fail**

Run:

```bash
npx jest src/lib/__tests__/mapProductToItemCard.test.js --runInBand
```

Expected: FAIL because `mapBlogToItemCard` does not yet return `shortDescription`, `tag`, or `additionalTagCount`.

- [ ] **Step 3: Implement minimal normalization in `mapBlogToItemCard`**

Replace the category selection with first-valid-category normalization, then add valid-tag normalization and extend the returned contract:

```js
const categoryFromList = Array.isArray(blog.categories) ? blog.categories.map((item) => normalizeText(item?.category_name) || normalizeText(item?.name)).find(Boolean) : null;
const category = categoryFromList || normalizeText(blog.category?.category_name) || normalizeText(blog.category?.name) || normalizeText(blog.category);
const tags = Array.isArray(blog.tags)
  ? blog.tags.map((item) => normalizeText(item?.tag_name) || normalizeText(item?.name) || normalizeText(typeof item === 'string' ? item : null)).filter(Boolean)
  : [];

return {
  id: blog.id,
  href: slug ? `/blogs/${slug}` : null,
  image,
  title: normalizeText(blog.name) || 'Untitled',
  category,
  shortDescription: normalizeText(blog.excerpt),
  tag: tags[0] || null,
  additionalTagCount: Math.max(tags.length - 1, 0),
};
```

Update the JSDoc return contract above `mapBlogToItemCard` to list the three new properties.

- [ ] **Step 4: Run the mapper tests and verify they pass**

Run:

```bash
npx jest src/lib/__tests__/mapProductToItemCard.test.js --runInBand
```

Expected: PASS with all mapper tests green, including the first valid category, object tag, string tag, blank tag, and missing metadata cases.

- [ ] **Step 5: Run the post-change quality and browser checkpoint**

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible --headed open http://localhost:3000
agent-browser --session weelp-visible wait --load networkidle
```

Load `error-handling-patterns` before these commands and confirm malformed optional metadata cannot throw. Expected: type-check and lint exit 0, and the existing homepage renders without a runtime error. Do not commit yet.

### Task 2: Render the approved editorial-card content and height contract

**Files:**

- Modify: `src/app/components/ui/__tests__/ItemCard.test.jsx`
- Modify: `src/app/components/ui/item-card.jsx`

- [ ] **Step 1: Replace the old editorial-content test with failing approved-content assertions**

Replace `limits editorial cards to image, category, and title` with:

```jsx
it('renders the shared editorial hierarchy without product-only content', () => {
  const { container } = render(
    <ItemCard
      href="/blogs/paris"
      image="/paris.jpg"
      title="A Paris guide"
      category="City guide"
      shortDescription="Quiet streets, local cafés, and neighborhood walks."
      tag="Local tips"
      additionalTagCount={2}
      price="$100"
      rating="5"
      attributes={[{ slug: 'duration', name: 'Duration', attribute_value: '2 hours' }]}
      variant="editorial"
    />,
  );

  expect(screen.getByRole('link', { name: 'Read A Paris guide' })).toHaveAttribute('href', '/blogs/paris');
  expect(screen.getByText('City guide')).toBeVisible();
  expect(screen.getByRole('heading', { name: 'A Paris guide' })).toHaveClass('line-clamp-2');
  expect(screen.getByText('Quiet streets, local cafés, and neighborhood walks.')).toHaveClass('line-clamp-2');
  expect(screen.getByText('Local tips')).toBeVisible();
  expect(screen.getByText('+2')).toBeVisible();
  expect(screen.queryByText('$100')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /wishlist/i })).not.toBeInTheDocument();
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).not.toBeInTheDocument();
});

it('omits optional editorial metadata without empty placeholders', () => {
  render(<ItemCard href="/blogs/paris" image="/paris.jpg" title="A Paris guide" variant="editorial" />);

  expect(screen.queryByTestId('editorial-description')).not.toBeInTheDocument();
  expect(screen.queryByTestId('editorial-tags')).not.toBeInTheDocument();
});
```

In the existing editorial-height test, replace the editorial assertions with:

```js
expect(screen.getByTestId('editorial-item-card')).toHaveClass('h-full', 'rounded-[24px]');
expect(screen.getByTestId('editorial-item-card')).not.toHaveClass(...fixedHeightClasses);
```

Rename that test to `keeps product fixed heights while editorial cards fill their row`.

- [ ] **Step 2: Run the ItemCard tests and verify the new assertions fail**

Run:

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx --runInBand
```

Expected: FAIL because the editorial variant omits excerpt/tag metadata and its article does not yet have `h-full`.

- [ ] **Step 3: Implement the editorial props, layout, and full-height surface**

Change the editorial function signature to:

```jsx
function EditorialItemCard({ href, image, title, category, shortDescription = null, tag = null, additionalTagCount = 0, className = '', style, LinkComponent = NavigationLink }) {
```

Add `h-full` to the editorial article and replace its content container with:

```jsx
<div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-4">
  {category ? <span className="w-fit rounded-md bg-weelp-sage-deep/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-weelp-copy">{category}</span> : null}
  <h3 className="line-clamp-2 text-xl font-medium leading-snug tracking-tight text-foreground">{title}</h3>
  {shortDescription ? (
    <p data-testid="editorial-description" className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
      {shortDescription}
    </p>
  ) : null}
  {tag ? (
    <div data-testid="editorial-tags" className="mt-auto flex items-center gap-2 pt-1">
      <span className="w-fit rounded-full border border-[var(--weelp-card-border)] bg-weelp-sage-wash px-2 py-0.5 text-xs font-medium text-weelp-copy">{tag}</span>
      {additionalTagCount > 0 ? <span className="text-xs font-medium text-muted-foreground">+{additionalTagCount}</span> : null}
    </div>
  ) : null}
</div>
```

Keep the existing image, accessible link name, card radius, hover, and focus behavior unchanged.

- [ ] **Step 4: Run the ItemCard tests and verify they pass**

Run:

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx --runInBand
```

Expected: PASS with the new editorial hierarchy, optional-field, and height assertions green.

- [ ] **Step 5: Run the post-change quality and visible-card checkpoint**

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible open http://localhost:3000
agent-browser --session weelp-visible wait --load networkidle
agent-browser --session weelp-visible snapshot -i
```

Load `error-handling-patterns` first. Expected: type-check and lint exit 0, and visible homepage blog cards contain the approved category, title, excerpt, and tag hierarchy without overflow. Do not commit yet.

### Task 3: Lock website-wide propagation and grid stretching

**Files:**

- Modify: `src/app/components/ui/__tests__/BlogSection.test.jsx`
- Modify: `src/app/components/ui/__tests__/ProductSliderSection.test.jsx`
- Modify: `src/app/components/ui/ProductSliderSection.jsx`
- Modify: `src/app/components/Pages/FRONT_END/Global/BlogFilter/__tests__/BlogFilter.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/Global/BlogFilter/BlogFilter.jsx`

- [ ] **Step 1: Write failing shared-surface assertions**

Add tags to the `blog` fixture in `BlogSection.test.jsx`:

```js
tags: [{ tag_name: 'Walking' }, { tag_name: 'Food' }],
```

Extend its expected mapped item with:

```js
shortDescription: 'Must not become the title',
tag: 'Walking',
additionalTagCount: 1,
```

In the blog fixture inside `BlogFilter.test.jsx`, add:

```js
tags: [{ tag_name: 'Safety' }, { tag_name: 'Planning' }],
```

Extend the expected `ItemCard` props with:

```js
shortDescription: 'How to stay safe',
tag: 'Safety',
additionalTagCount: 1,
```

Then add this assertion after rendering the result:

```js
expect(screen.getByTestId('item-card').closest('li')).toHaveClass('h-full');
```

In `ProductSliderSection.test.jsx`, extend `forwards an editorial variant without changing product carousel geometry` with:

```js
expect(carouselProps.slideClassName).toBe('!h-auto self-start sm:self-stretch');
```

Add this product-card regression assertion to `renders product carousel navigation on mobile-sized layouts`:

```js
expect(mockCarouselShell.mock.calls.at(-1)[0].slideClassName).toBe('!h-auto');
```

- [ ] **Step 2: Run the shared-surface tests and verify the grid-height assertion fails**

Run:

```bash
npx jest src/app/components/ui/__tests__/BlogSection.test.jsx src/app/components/ui/__tests__/ProductSliderSection.test.jsx src/app/components/Pages/FRONT_END/Global/BlogFilter/__tests__/BlogFilter.test.jsx --runInBand
```

Expected: `BlogSection` propagation passes once Task 1 exists, while the `/blogs` grid assertion and editorial slide-class assertion FAIL because neither height contract is implemented yet.

- [ ] **Step 3: Make each `/blogs` grid item fill its row track**

Change `ProductSliderSection`'s `CarouselShell` prop to keep one-card mobile slides content-sized and stretch editorial slides from the two-card `sm` breakpoint upward:

```jsx
slideClassName={itemVariant === 'editorial' ? '!h-auto self-start sm:self-stretch' : '!h-auto'}
```

Then change the result wrapper in `BlogFilter.jsx` to:

```jsx
<li key={blog.id || blog.slug} className="h-full">
  <ItemCard {...item} variant="editorial" LinkComponent={NavigationLink} />
</li>
```

No page-specific blog content markup should be added; the shared mapper and editorial card remain responsible for content.

- [ ] **Step 4: Run the shared-surface tests and verify they pass**

Run:

```bash
npx jest src/app/components/ui/__tests__/BlogSection.test.jsx src/app/components/ui/__tests__/ProductSliderSection.test.jsx src/app/components/Pages/FRONT_END/Global/BlogFilter/__tests__/BlogFilter.test.jsx --runInBand
```

Expected: PASS with normalized excerpt/tag props reaching both carousel and grid surfaces, desktop/tablet editorial slides stretching, mobile editorial slides retaining natural height, product slide geometry unchanged, and each grid item filling its row track.

- [ ] **Step 5: Run the post-change quality and responsive-browser checkpoint**

```bash
npm run type-check
npm run lint
agent-browser --session weelp-visible open http://localhost:3000
agent-browser --session weelp-visible set viewport 1440 1000
agent-browser --session weelp-visible wait --load networkidle
agent-browser --session weelp-visible set viewport 390 844
agent-browser --session weelp-visible wait --load networkidle
```

Load `error-handling-patterns` first. Expected: type-check and lint exit 0; desktop editorial cards stretch evenly; the single visible mobile slide is content-sized and does not show clipped metadata. Do not commit yet.

### Task 4: Verify behavior, review, simplify, and publish `main`

**Files:**

- Review only: all files changed in Tasks 1–3
- Modify only if review or simplify identifies a concrete issue

- [ ] **Step 1: Review changed error paths and optional data handling**

Load `error-handling-patterns` and inspect the mapper and component boundaries. Confirm malformed or absent `tags`, blank excerpts, missing categories, and absent URLs remain safe and do not throw. Expected: no new error UI is needed because all added fields are optional display metadata.

- [ ] **Step 2: Run focused regression tests**

Run:

```bash
npx jest src/lib/__tests__/mapProductToItemCard.test.js src/app/components/ui/__tests__/ItemCard.test.jsx src/app/components/ui/__tests__/BlogSection.test.jsx src/app/components/ui/__tests__/ProductSliderSection.test.jsx src/app/components/Pages/FRONT_END/Global/BlogFilter/__tests__/BlogFilter.test.jsx --runInBand
```

Expected: all five suites PASS.

- [ ] **Step 3: Run repository verification**

Run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit 0 with no TypeScript errors, lint warnings, or whitespace errors.

- [ ] **Step 4: Verify desktop and mobile UI in the required visible browser**

Use the named local headed session:

```bash
agent-browser --session weelp-visible open http://localhost:3000
agent-browser --session weelp-visible set viewport 1440 1000
agent-browser --session weelp-visible wait --load networkidle
agent-browser --session weelp-visible eval "Object.values(Array.from(document.querySelectorAll('[data-testid=editorial-item-card]')).reduce((rows,card)=>{const top=Math.round(card.getBoundingClientRect().top);(rows[top]??=[]).push(Math.round(card.getBoundingClientRect().height));return rows},{}))"
agent-browser --session weelp-visible open http://localhost:3000/home-gold
agent-browser --session weelp-visible wait --load networkidle
agent-browser --session weelp-visible eval "Object.values(Array.from(document.querySelectorAll('[data-testid=editorial-item-card]')).reduce((rows,card)=>{const top=Math.round(card.getBoundingClientRect().top);(rows[top]??=[]).push(Math.round(card.getBoundingClientRect().height));return rows},{}))"
agent-browser --session weelp-visible open http://localhost:3000/cities/dubai
agent-browser --session weelp-visible wait --load networkidle
agent-browser --session weelp-visible eval "Object.values(Array.from(document.querySelectorAll('[data-testid=editorial-item-card]')).reduce((rows,card)=>{const top=Math.round(card.getBoundingClientRect().top);(rows[top]??=[]).push(Math.round(card.getBoundingClientRect().height));return rows},{}))"
agent-browser --session weelp-visible open http://localhost:3000/blogs
agent-browser --session weelp-visible wait --load networkidle
agent-browser --session weelp-visible eval "Object.values(Array.from(document.querySelectorAll('[data-testid=editorial-item-card]')).reduce((rows,card)=>{const top=Math.round(card.getBoundingClientRect().top);(rows[top]??=[]).push(Math.round(card.getBoundingClientRect().height));return rows},{}))"
agent-browser --session weelp-visible set viewport 390 844
agent-browser --session weelp-visible snapshot -i
```

Expected on desktop: every returned row array contains one repeated height value; different row arrays may have different heights. Homepage, Home Gold, Dubai's city page, Latest Blogs, and `/blogs` visibly use the same category/title/excerpt/tag composition wherever blog data exists. If a local surface has no blog data, its existing empty/omitted state remains correct and propagation is covered by the passing shared tests. Expected on mobile: a single-column card uses its natural content height without overflow or clipped metadata.

- [ ] **Step 5: Run the mandatory code-review and simplify loop**

Dispatch the `code-reviewer` agent against the approved spec, plan, and implementation diff. Fix every critical issue and re-review until none remain. Then load `simplify` and apply only behavior-preserving clarity or reuse improvements. After both gates finish, always rerun Steps 2–4 in that order, even when neither gate changes a file; only those post-review results authorize the commit.

- [ ] **Step 6: Stage the named implementation files, commit once, and push `main`**

Review `git status --short` and stage only this feature's files:

```bash
git add src/lib/mapProductToItemCard.js src/lib/__tests__/mapProductToItemCard.test.js src/app/components/ui/item-card.jsx src/app/components/ui/__tests__/ItemCard.test.jsx src/app/components/ui/ProductSliderSection.jsx src/app/components/ui/__tests__/ProductSliderSection.test.jsx src/app/components/ui/__tests__/BlogSection.test.jsx src/app/components/Pages/FRONT_END/Global/BlogFilter/BlogFilter.jsx src/app/components/Pages/FRONT_END/Global/BlogFilter/__tests__/BlogFilter.test.jsx
git diff --cached --check
git diff --cached --stat
git commit -m "feat: enrich blog cards across public pages"
```

Then verify and publish the required branch:

```bash
git branch --show-current
git status --short
git push origin main
```

Expected: branch is `main`, the worktree is clean, and `origin/main` contains the verified website-wide blog-card changes.
