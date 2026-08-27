# Public Card System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage Top activities `ItemCard` the canonical card for every active public activity, itinerary, package, and blog listing while preserving non-listing layouts and standardizing public outer card radii at `24px`.

**Architecture:** `ItemCard` keeps one product composition and gains an explicit editorial composition over the same surface and image primitives. Raw product, creator-itinerary, and blog payloads are normalized before rendering; active public sections own only grid/carousel layout. A shared radius class is imported by public cards whose layouts remain distinct, without changing dashboard/admin components or the global shadcn `Card` primitive.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Tailwind CSS, Zustand/NextAuth behavior already used by creator likes and wishlists, Jest, React Testing Library, agent-browser.

---

## Mandatory execution workflow

Before Task 1, invoke `executing-plans`, `test-driven-development`, `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Keep implementation changes uncommitted until the code-review, simplify, error-handling, type-check, lint, focused/full tests, build, and visible-browser gates pass.

Reuse the already-open named headed browser when available. Otherwise run:

```bash
npm run dev
agent-browser --session weelp-visible --headed --args "--no-sandbox" open http://localhost:3000/
```

After each code-changing task, apply the `error-handling-patterns` review, then run:

```bash
npm run type-check
npm run lint
```

Use the visible `weelp-visible` session for a focused localhost smoke check after each task. Do not test production. The reviewed plan is committed separately before Task 1; the implementation is committed only after both review gates, simplify, and final verification.

## File map

- Create `src/app/components/ui/cardStyles.js` — shared `24px` public-card and `16px` media radius classes.
- Create `src/app/__tests__/publicCardRadius.test.js` — source contract for included public cards and dashboard exclusion.
- Modify `src/app/components/ui/item-card.jsx` — share surface/image primitives, retain the full product composition, add explicit `editorial` composition, and accept an optional product corner action.
- Modify `src/app/components/ui/__tests__/ItemCard.test.jsx` — lock product regression, editorial content limits, shared geometry, and corner-action semantics.
- Modify `src/lib/mapProductToItemCard.js` — normalize blog and creator-itinerary payloads through dedicated mappers.
- Modify `src/lib/__tests__/mapProductToItemCard.test.js` — cover blog and creator mappings without invented values.
- Modify `src/lib/attributeIcons.js` — support creator views/creator metadata icons when those fields are present.
- Modify `src/app/components/ui/ProductSliderSection.jsx` — accept an explicit `itemVariant`, defaulting to `full`.
- Modify `src/app/components/ui/__tests__/ProductSliderSection.test.jsx` — prove product defaults and editorial forwarding share identical carousel geometry.
- Modify `src/app/components/ui/BlogSection.jsx` — delegate to the canonical product slider with editorial items.
- Modify `src/app/components/ui/__tests__/BlogSection.test.jsx` — lock shared-slider delegation and image/category/title-only content.
- Modify `src/app/components/Pages/FRONT_END/Global/BlogFilter/BlogFilter.jsx` — render editorial `ItemCard` in the blog grid.
- Modify `src/app/components/Pages/FRONT_END/Global/BlogFilter/__tests__/BlogFilter.test.jsx` — replace date assertions with editorial card assertions.
- Modify `src/app/components/Pages/FRONT_END/Global/GuideSection.jsx` — route legacy region/single-blog recommendation data through `BlogSection`.
- Create `src/app/components/Pages/FRONT_END/Global/__tests__/GuideSection.test.jsx` — directly cover legacy recommendation delegation, including slugless data.
- Modify `src/app/components/Pages/FRONT_END/Global/__tests__/BlogSliderSection.test.jsx` — prove latest/recommended blog wrappers retain normalized shared cards.
- Modify `src/app/components/Pages/FRONT_END/shop/SearchPage.jsx` — map active search results directly to the canonical card.
- Modify `src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx` — prove mixed product results use normalized canonical cards and city-aware links.
- Modify `src/app/components/Home/TravelBuddyWidget.jsx` — render featured activities as the full canonical product card.
- Modify `src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx` — lock the full variant and one-card carousel density.
- Modify `src/app/components/Pages/FRONT_END/explore/CreatorItineraryCard.jsx` — retain creator like/auth behavior while delegating the visual body to `ItemCard`.
- Modify `src/app/components/Pages/FRONT_END/explore/__tests__/CreatorItineraryCard.test.jsx` — preserve like, count, URL, and auth behavior on the canonical card.
- Modify `src/app/components/CityCard.jsx`, `src/app/components/Testimonial.jsx`, `src/app/components/ReviewCard.jsx`, `src/app/components/Faq.jsx`, `src/app/components/WhatAbout.jsx`, `src/app/components/MiniCartProductCard.jsx`, `src/app/components/MiniCartReviewCard.jsx`, `src/app/components/Pages/FRONT_END/checkout/CheckoutCards.jsx`, `src/app/components/Pages/FRONT_END/checkout/CheckoutResultState.jsx`, `src/app/components/Pages/FRONT_END/transfer/TransferResultCard.jsx`, `src/app/components/Pages/FRONT_END/Global/ReviewSection.jsx`, `src/app/components/Pages/FRONT_END/singleproduct/SingleProductReview.jsx`, `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx`, `src/app/components/Pages/FRONT_END/About/AboutOffer.jsx`, `src/app/components/Pages/FRONT_END/home/AiSection.jsx`, and `src/app/components/Home/TravelBuddyWidget.jsx` — consume the shared outer radius without changing their non-listing layouts.
- Modify focused tests beside those components where runtime coverage already exists.
- Modify `Reports/daily-work-report.md` from the workspace root after final verification.

### Task 1: Establish the shared card geometry and editorial composition

**Files:**
- Create: `src/app/components/ui/cardStyles.js`
- Modify: `src/app/components/ui/item-card.jsx`
- Test: `src/app/components/ui/__tests__/ItemCard.test.jsx`

- [ ] **Step 1: Write failing shared-geometry and editorial tests**

Add tests that render a product and an editorial card and assert the exact shared surface/image classes while limiting editorial content:

```jsx
it('uses one full-card geometry for product and editorial compositions', () => {
  const { rerender } = render(<ItemCard {...richProduct} variant="full" />);
  expect(screen.getByTestId('product-item-card')).toHaveClass('rounded-[24px]', 'h-[400px]');
  expect(screen.getByAltText('Desert Safari Adventure').parentElement).toHaveClass('rounded-[16px]', 'aspect-[5/3]', 'sm:aspect-[4/3]');

  rerender(<ItemCard href="/blogs/paris" image="/paris.jpg" title="A Paris guide" category="City guide" variant="editorial" />);
  expect(screen.getByTestId('editorial-item-card')).toHaveClass('rounded-[24px]', 'h-[400px]');
  expect(screen.getByAltText('A Paris guide').parentElement).toHaveClass('rounded-[16px]', 'aspect-[5/3]', 'sm:aspect-[4/3]');
});

it('limits editorial cards to image, category, and title', () => {
  render(
    <ItemCard
      href="/blogs/paris"
      image="/paris.jpg"
      title="A Paris guide"
      category="City guide"
      price="$100"
      rating="5"
      shortDescription="Should not render"
      attributes={[{ slug: 'duration', name: 'Duration', attribute_value: '2 hours' }]}
      variant="editorial"
    />,
  );

  expect(screen.getByRole('link', { name: 'Read A Paris guide' })).toHaveAttribute('href', '/blogs/paris');
  expect(screen.getByText('City guide')).toBeVisible();
  expect(screen.getByRole('heading', { name: 'A Paris guide' })).toBeVisible();
  expect(screen.queryByText('$100')).not.toBeInTheDocument();
  expect(screen.queryByText('Should not render')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /wishlist/i })).not.toBeInTheDocument();
  expect(document.querySelector('[itemtype="https://schema.org/Product"]')).not.toBeInTheDocument();
});

it('renders a custom product corner action outside the detail link', () => {
  render(<ItemCard {...richProduct} wishlistItem={null} cornerAction={<button aria-label="Like itinerary">Like</button>} />);
  expect(screen.getByTestId('product-item-card')).toContainElement(screen.getByRole('button', { name: 'Like itinerary' }));
  expect(screen.getByRole('link', { name: /explore desert safari/i })).not.toContainElement(screen.getByRole('button', { name: 'Like itinerary' }));
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run:

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx --runInBand
```

Expected: FAIL because `editorial`, shared exported radius classes, and `cornerAction` do not exist.

- [ ] **Step 3: Add shared radius constants and compose both cards from the same primitives**

Create:

```js
export const PUBLIC_CARD_RADIUS_CLASS = 'rounded-[24px]';
export const PUBLIC_CARD_MEDIA_RADIUS_CLASS = 'rounded-[16px]';
```

In `item-card.jsx`, use those constants in the existing product surface/image. Extract focused internal surface and image helpers, then add an explicit editorial composition with this contract:

```jsx
function EditorialItemCard({ href, image, title, category, className = '', style, LinkComponent = NavigationLink }) {
  const CardRoot = href ? LinkComponent : 'div';
  const cardRootProps = href ? { href, 'aria-label': `Read ${title}` } : {};

  return (
    <article data-testid="editorial-item-card" className={cn('flex flex-col', PRODUCT_CARD_SURFACE_CLASS, PRODUCT_CARD_HOVER_CLASS, FEATURE_CARD_HEIGHT_CLASS, className)} style={style}>
      <CardRoot {...cardRootProps} className={cn('group/card-link flex h-full flex-col', PRODUCT_CARD_FOCUS_CLASS)}>
        <SharedCardImage image={image} title={title} />
        <div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-4">
          {category ? <span className="w-fit rounded-md bg-weelp-sage-deep/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-weelp-copy">{category}</span> : null}
          <h3 className="line-clamp-2 text-xl font-medium leading-snug tracking-tight text-foreground">{title}</h3>
        </div>
      </CardRoot>
    </article>
  );
}
```

Render `cornerAction` in the same absolute wrapper used by the wishlist, with custom action taking precedence. Keep existing product/schema behavior unchanged. Route variants explicitly:

```jsx
if (variant === 'editorial') return <EditorialItemCard {...props} />;
if (variant === 'product-compact') return <ProductCompactItemCard {...props} />;
return variant === 'full' ? <FullItemCard {...props} /> : <CompactItemCard {...props} />;
```

- [ ] **Step 4: Run focused tests and the per-task gates**

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx --runInBand
npm run type-check
npm run lint
```

Expected: PASS with the existing product tests unchanged and the new editorial tests green.

### Task 2: Normalize blog and creator-itinerary content

**Files:**
- Modify: `src/lib/mapProductToItemCard.js`
- Modify: `src/lib/attributeIcons.js`
- Test: `src/lib/__tests__/mapProductToItemCard.test.js`

- [ ] **Step 1: Write failing mapper tests**

```js
test('maps a blog to image, category, title, and canonical blog URL only', () => {
  expect(
    mapBlogToItemCard({
      id: 14,
      name: 'Wildfire Safety',
      slug: 'wildfire-safety',
      excerpt: 'Not part of the editorial card',
      published_at: '2026-08-04T06:58:08.000000Z',
      categories: [{ category_name: 'Nature' }],
      media_gallery: [{ is_featured: true, url: '/wildfire.jpg' }],
    }),
  ).toEqual({ id: 14, href: '/blogs/wildfire-safety', image: '/wildfire.jpg', title: 'Wildfire Safety', category: 'Nature' });
});

test('uses Untitled instead of excerpt when the blog name is blank', () => {
  expect(mapBlogToItemCard({ name: '  ', excerpt: 'Must not become the card title' })).toEqual(
    expect.objectContaining({ title: 'Untitled', category: null }),
  );
});

test('maps creator itineraries into the canonical product contract', () => {
  const card = mapCreatorItineraryToItemCard({
    id: 8,
    name: 'Creator Dubai route',
    slug: 'creator-dubai-route',
    display_price: '240',
    display_currency: 'AED',
    views_count: 21,
    likes_count: 4,
    creator: { name: 'Nora Field Notes' },
    locations: [{ city: { slug: 'dubai' } }],
  });

  expect(card).toMatchObject({
    itemType: 'itinerary',
    href: '/cities/dubai/itineraries/creator-dubai-route',
    title: 'Creator Dubai route',
    category: 'Itinerary',
    shortDescription: 'By Nora Field Notes',
    priceValue: 240,
    priceCurrency: 'AED',
    attributes: [
      { slug: 'views', name: 'Views', attribute_value: '21' },
      { slug: 'likes', name: 'Likes', attribute_value: '4' },
    ],
  });
});

test.each([
  [{}, []],
  [{ views_count: null, likes_count: 'bad' }, []],
  [{ views_count: 0, likes_count: 0 }, [
    { slug: 'views', name: 'Views', attribute_value: '0' },
    { slug: 'likes', name: 'Likes', attribute_value: '0' },
  ]],
])('only maps creator engagement counts supplied as valid non-negative numbers', (counts, expected) => {
  const card = mapCreatorItineraryToItemCard({
    id: 9,
    name: 'Creator route',
    slug: 'creator-route',
    locations: [{ city: { slug: 'dubai' } }],
    ...counts,
  });
  expect(card.attributes).toEqual(expected);
});
```

- [ ] **Step 2: Run mapper tests and verify failure**

```bash
npx jest src/lib/__tests__/mapProductToItemCard.test.js --runInBand
```

Expected: FAIL because the blog mapper still returns publication data/excerpt-first title and the creator mapper is absent.

- [ ] **Step 3: Implement dedicated normalization**

Keep `mapProductToItemCard` as the product source of truth. Make `mapBlogToItemCard` return only `{ id, href, image, title, category }`, with `title = normalizeText(blog.name) || 'Untitled'` (never use `excerpt` as the title), `href` set only when a non-blank slug exists, and legacy `blog.category` accepted after the normal API category shape so active region recommendations remain readable. When neither the API category nor legacy `blog.category` exists, return `category: null` rather than inventing a label. Add `mapCreatorItineraryToItemCard` as a thin adapter into `mapProductToItemCard`:

```js
export function mapCreatorItineraryToItemCard(itinerary = {}) {
  const creatorName = normalizeText(itinerary.creator?.name);
  const attributes = [];
  const views = toNumber(itinerary.views_count);
  const likes = toNumber(itinerary.likes_count);
  if (Number.isInteger(views) && views >= 0) attributes.push({ slug: 'views', name: 'Views', attribute_value: String(views) });
  if (Number.isInteger(likes) && likes >= 0) attributes.push({ slug: 'likes', name: 'Likes', attribute_value: String(likes) });

  return mapProductToItemCard({
    ...itinerary,
    item_type: 'itinerary',
    city_slug: itinerary.locations?.[0]?.city?.slug,
    schedule_total_price: itinerary.display_price,
    schedule_total_currency: itinerary.display_currency,
    short_description: creatorName ? `By ${creatorName}` : null,
    categories: itinerary.categories?.length ? itinerary.categories : [{ name: 'Itinerary' }],
    attributes,
  });
}
```

Add `Eye` and `Heart` mappings for `views` and `likes` in `attributeIcons.js`.

- [ ] **Step 4: Run focused tests and gates**

```bash
npx jest src/lib/__tests__/mapProductToItemCard.test.js --runInBand
npm run type-check
npm run lint
```

Expected: PASS.

### Task 3: Put every active blog surface on the editorial shared card

**Files:**
- Modify: `src/app/components/ui/ProductSliderSection.jsx`
- Modify: `src/app/components/ui/__tests__/ProductSliderSection.test.jsx`
- Modify: `src/app/components/ui/BlogSection.jsx`
- Modify: `src/app/components/ui/__tests__/BlogSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/Global/BlogFilter/BlogFilter.jsx`
- Modify: `src/app/components/Pages/FRONT_END/Global/BlogFilter/__tests__/BlogFilter.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/Global/GuideSection.jsx`
- Create: `src/app/components/Pages/FRONT_END/Global/__tests__/GuideSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/Global/__tests__/BlogSliderSection.test.jsx`

- [ ] **Step 1: Write failing shared-slider and blog-grid tests**

Update ProductSliderSection tests to assert:

```jsx
render(<ProductSliderSection items={[blogItem]} title="Your Guide" navigationId="guide-blog" itemVariant="editorial" />);
const props = mockCarouselShell.mock.calls.at(-1)[0];
expect(props.breakpoints).toEqual(expectedProductBreakpoints);
expect(props.renderSlide(blogItem).props).toEqual({ ...blogItem, variant: 'editorial' });
```

Update BlogSection tests to mock ProductSliderSection and assert it receives normalized items, `itemVariant="editorial"`, `carouselEntrance="stagger-right"`, the original title/navigation ID, and className. In BlogFilter tests, mock `ItemCard` and assert `variant="editorial"`, category/title/image, and no published date. Add mapper cases for blank slug, missing category/media/title, and specifically a blank `name` with a non-empty `excerpt`; confirm safe non-navigation, `category: null`, the existing image fallback, and the strict `Untitled` title fallback.

Create a direct GuideSection test:

```jsx
render(<GuideSection sectionTitle="Recommended" className="pb-0" data={[{ id: 1, name: 'Legacy guide', category: 'Travel', image: '/legacy.jpg' }]} />);
expect(mockBlogSection).toHaveBeenCalledWith(
  expect.objectContaining({
    title: 'Recommended',
    className: 'pb-0',
    blogs: [{ id: 1, name: 'Legacy guide', category: 'Travel', image: '/legacy.jpg' }],
  }),
  undefined,
);
const mapped = mapBlogToItemCard(mockBlogSection.mock.calls[0][0].blogs[0]);
expect(mapped).toMatchObject({ href: null, title: 'Legacy guide', category: 'Travel', image: '/legacy.jpg' });
```

- [ ] **Step 2: Run focused tests and verify failure**

```bash
npx jest src/app/components/ui/__tests__/ProductSliderSection.test.jsx src/app/components/ui/__tests__/BlogSection.test.jsx src/app/components/Pages/FRONT_END/Global/BlogFilter/__tests__/BlogFilter.test.jsx src/app/components/Pages/FRONT_END/Global/__tests__/GuideSection.test.jsx --runInBand
```

Expected: FAIL on the new variant and delegation contract.

- [ ] **Step 3: Delegate all blog collections to canonical rendering**

Add `itemVariant = 'full'` to ProductSliderSection and forward it:

```jsx
renderSlide={(card) => <ItemCard {...card} variant={itemVariant} />}
```

Reduce BlogSection to normalized delegation:

```jsx
export default function BlogSection({ blogs = [], title = 'Your Guide', navigationId = 'blog-section', className = '' }) {
  const items = blogs.map(mapBlogToItemCard);
  return items.length ? (
    <ProductSliderSection
      items={items}
      title={title}
      navigationId={navigationId}
      itemVariant="editorial"
      carouselEntrance="stagger-right"
      className={className}
    />
  ) : null;
}
```

Render `<ItemCard {...item} variant="editorial" LinkComponent={NavigationLink} />` in BlogFilter. Make GuideSection delegate its `data` to BlogSection so active region and single-blog recommendation routes stop using `PostSlider`/`singleproductguide`.

- [ ] **Step 4: Run focused tests and gates**

```bash
npx jest src/app/components/ui/__tests__/ProductSliderSection.test.jsx src/app/components/ui/__tests__/BlogSection.test.jsx src/app/components/Pages/FRONT_END/Global/BlogFilter/__tests__/BlogFilter.test.jsx src/app/components/Pages/FRONT_END/Global/__tests__/BlogSliderSection.test.jsx src/app/components/Pages/FRONT_END/Global/__tests__/GuideSection.test.jsx --runInBand
npm run type-check
npm run lint
```

Expected: PASS.

### Task 4: Remove active product-card visual duplication

**Files:**
- Modify: `src/app/components/Pages/FRONT_END/shop/SearchPage.jsx`
- Modify: `src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx`
- Modify: `src/app/components/Home/TravelBuddyWidget.jsx`
- Modify: `src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx`

- [ ] **Step 1: Write failing search and Buddy tests**

Mock the mapper and ItemCard in SearchPage, then assert each mixed result is rendered through `mapProductToItemCard(product, selectedLocation?.slug)` and `<ItemCard {...mapped} variant="full" />`. Include a product with no `city_slug`, select a location with slug `dubai`, and assert the mapper receives `dubai` and the rendered link is `/cities/dubai/activities/desert-safari`. Update the Buddy test:

```jsx
expect(card).toHaveAttribute('data-variant', 'full');
expect(card).not.toHaveAttribute('data-image-class');
expect(mockCarouselProps.breakpoints).toEqual({ 0: { slidesPerView: 1, spaceBetween: 12 } });
```

- [ ] **Step 2: Run focused tests and verify failure**

```bash
npx jest src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx --runInBand
```

Expected: FAIL because SearchPage still renders `GlobalCard` and Buddy uses `product-compact` with two slides.

- [ ] **Step 3: Migrate active surfaces**

In SearchPage, replace the manual legacy prop mapping with:

```jsx
const card = mapProductToItemCard(product, selectedLocation?.slug);
return <ItemCard key={card.id || `${product.item_type}-${index}`} {...card} variant="full" />;
```

In TravelBuddyWidget, use one card and the full variant:

```js
const BUDDY_SLIDER_BREAKPOINTS = { 0: { slidesPerView: 1, spaceBetween: 12 } };
```

```jsx
renderSlide={(card) => <ItemCard {...card} variant="full" />}
```

Leave inactive legacy card modules unchanged. The active `/search` route no longer imports them, and the final call-site audit records any remaining references from unreachable legacy wrappers rather than rewriting dead code.

- [ ] **Step 4: Run focused tests and gates**

```bash
npx jest src/app/components/Pages/FRONT_END/shop/__tests__/SearchPage.test.jsx src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx src/app/components/ui/__tests__/ItemCard.test.jsx --runInBand
npm run type-check
npm run lint
```

Expected: PASS.

### Task 5: Migrate creator itineraries without losing like behavior

**Files:**
- Modify: `src/app/components/Pages/FRONT_END/explore/CreatorItineraryCard.jsx`
- Modify: `src/app/components/Pages/FRONT_END/explore/__tests__/CreatorItineraryCard.test.jsx`

- [ ] **Step 1: Replace visual-implementation assertions with canonical-card behavior assertions**

Mock ItemCard as a prop recorder and assert:

```jsx
expect(mockItemCard).toHaveBeenCalledWith(
  expect.objectContaining({
    variant: 'full',
    href: '/cities/dubai/itineraries/long-creator-route',
    title: 'A long creator itinerary title for mobile travelers',
    itemType: 'itinerary',
    cornerAction: expect.anything(),
  }),
  undefined,
);
```

Render the recorded `cornerAction` and retain the existing tests for guest auth, logged-in API updates, like counts, and no index-page view recording.

- [ ] **Step 2: Run the focused creator test and verify failure**

```bash
npx jest src/app/components/Pages/FRONT_END/explore/__tests__/CreatorItineraryCard.test.jsx --runInBand
```

Expected: FAIL because CreatorItineraryCard still owns separate card markup.

- [ ] **Step 3: Delegate the body while preserving state/actions**

Keep the current `handleLike` state machine. Build `card = mapCreatorItineraryToItemCard({ ...itinerary, likes_count: likesCount })`, then render:

```jsx
return (
  <ItemCard
    {...card}
    variant="full"
    wishlistItem={null}
    cornerAction={
      <button type="button" onClick={handleLike} aria-label={`${liked ? 'Unlike' : 'Like'} ${title}. ${formatCount(likesCount)} likes`} className="weelp-creator-like-button grid size-11 place-items-center rounded-full border border-border bg-background text-weelp-discount shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-discount/50">
        <Heart aria-hidden="true" className={`size-5 ${liked ? 'fill-current' : ''}`} />
      </button>
    }
  />
);
```

- [ ] **Step 4: Run focused tests and gates**

```bash
npx jest src/app/components/Pages/FRONT_END/explore/__tests__/CreatorItineraryCard.test.jsx src/app/components/Pages/FRONT_END/explore/__tests__/SectionCreatorFilter.test.jsx --runInBand
npm run type-check
npm run lint
```

Expected: PASS.

### Task 6: Standardize public outer card radii without changing layouts

**Files:**
- Create: `src/app/__tests__/publicCardRadius.test.js`
- Modify: `src/app/components/CityCard.jsx`
- Modify: `src/app/components/Testimonial.jsx`
- Modify: `src/app/components/ReviewCard.jsx`
- Modify: `src/app/components/Faq.jsx`
- Modify: `src/app/components/WhatAbout.jsx`
- Modify: `src/app/components/MiniCartProductCard.jsx`
- Modify: `src/app/components/MiniCartReviewCard.jsx`
- Modify: `src/app/components/Pages/FRONT_END/checkout/CheckoutCards.jsx`
- Modify: `src/app/components/Pages/FRONT_END/checkout/CheckoutResultState.jsx`
- Modify: `src/app/components/Pages/FRONT_END/transfer/TransferResultCard.jsx`
- Modify: `src/app/components/Pages/FRONT_END/Global/ReviewSection.jsx`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/SingleProductReview.jsx`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutOffer.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/AboutPage.module.css`
- Modify: `src/app/components/Pages/FRONT_END/home/AiSection.jsx`
- Modify: `src/app/components/Home/TravelBuddyWidget.jsx`
- Modify: `src/app/components/__tests__/Faq.test.jsx`
- Modify: `src/app/components/__tests__/Testimonial.test.jsx`
- Create: `src/app/components/__tests__/ReviewCard.test.jsx`
- Create: `src/app/components/__tests__/WhatAbout.test.jsx`
- Create: `src/app/components/__tests__/MiniCartReviewCard.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/Global/__tests__/ReviewSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/checkout/__tests__/CheckoutCards.test.jsx`
- Create: `src/app/components/Pages/FRONT_END/checkout/__tests__/CheckoutResultState.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductReview.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarHelp.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx`
- Modify: `src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx`

- [ ] **Step 1: Freeze the active public-card inventory**

Record these outer surfaces in the source-contract test. The expected count is per surface, not merely per file:

```js
const publicCardInventory = [
  ['src/app/components/CityCard.jsx', ['weelp-destination-card']],
  ['src/app/components/Testimonial.jsx', ['data-public-card="testimonial"']],
  ['src/app/components/ReviewCard.jsx', ['data-public-card="review"', 'data-public-card="review-gallery"', 'data-public-card="single-review"']],
  ['src/app/components/Faq.jsx', ['data-public-card="faq-item"']],
  ['src/app/components/WhatAbout.jsx', ['data-public-card="city-facts"', 'data-public-card="region-facts"']],
  ['src/app/components/MiniCartProductCard.jsx', ['data-public-card="mini-cart-item"']],
  ['src/app/components/MiniCartReviewCard.jsx', ['data-public-card="mini-cart-recommendation"']],
  ['src/app/components/Pages/FRONT_END/checkout/CheckoutCards.jsx', ['data-public-card="checkout-total"', 'data-public-card="checkout-transfer"', 'data-public-card="checkout-item"', 'data-public-card="checkout-item-skeleton"']],
  ['src/app/components/Pages/FRONT_END/checkout/CheckoutResultState.jsx', ['data-public-card="checkout-result"']],
  ['src/app/components/Pages/FRONT_END/transfer/TransferResultCard.jsx', ['data-public-card="transfer-result"']],
  ['src/app/components/Pages/FRONT_END/Global/ReviewSection.jsx', ['data-public-card="city-review-panel"', 'data-public-card="region-review-panel"']],
  ['src/app/components/Pages/FRONT_END/singleproduct/SingleProductReview.jsx', ['data-public-card="review-summary"', 'data-public-card="review-empty"', 'data-public-card="review-entry"', 'data-public-card="review-skeleton"']],
  ['src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx', ['data-public-card="booking-support"']],
  ['src/app/components/Pages/FRONT_END/About/AboutOffer.jsx', ['data-public-card="about-image"', 'data-public-card="about-copy"']],
  ['src/app/components/Pages/FRONT_END/home/AiSection.jsx', ['data-public-card="ai-savings"', 'data-public-card="ai-personalised"']],
  ['src/app/components/Home/TravelBuddyWidget.jsx', ['data-public-card="ai-chat"', 'data-public-card="ai-map"']],
];
```

Explicit exclusions remain: dashboard/admin cards, creator statistic tiles, itinerary schedule-day/activity/transfer rows, form controls, dialogs, avatars, image thumbnails, skeleton-only layout containers outside a matched live card, and intentionally pill-shaped controls.

- [ ] **Step 2: Write failing source and runtime radius tests**

```js
import fs from 'node:fs';
import path from 'node:path';

test.each(publicCardInventory)('%s marks every inventoried outer public card', (relativePath, surfaceMarkers) => {
  const source = fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
  for (const marker of surfaceMarkers) expect(source).toContain(marker);
  expect(source).toContain('PUBLIC_CARD_RADIUS_CLASS');
});

test('dashboard card primitives are not coupled to the public radius', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'src/app/components/DashboardShared/ListingCard/ListingCard.jsx'), 'utf8');
  expect(source).not.toContain('PUBLIC_CARD_RADIUS_CLASS');
});
```

Add/adjust component tests to query every `data-public-card` surface rendered by that fixture and assert `rounded-[24px]`. For conditional files, render separate fixtures that expose every branch: city/region ReviewSection, standard/transfer/total/skeleton checkout, populated/empty/skeleton SingleProductReview, and the ProductSidebar support card. Direct ReviewCard, WhatAbout, MiniCartReviewCard, AiSection, and TravelBuddyWidget tests cover their own markers rather than relying on the file-level source check. AboutOffer tests assert all `about-image` and `about-copy` nodes use the class without changing their masonry layout.

- [ ] **Step 3: Run radius tests and verify failure**

```bash
npx jest src/app/__tests__/publicCardRadius.test.js src/app/components/__tests__/CityCard.test.jsx src/app/components/__tests__/Faq.test.jsx src/app/components/__tests__/Testimonial.test.jsx src/app/components/__tests__/ReviewCard.test.jsx src/app/components/__tests__/WhatAbout.test.jsx src/app/components/__tests__/MiniCartProductCard.test.jsx src/app/components/__tests__/MiniCartReviewCard.test.jsx src/app/components/Pages/FRONT_END/Global/__tests__/ReviewSection.test.jsx src/app/components/Pages/FRONT_END/checkout/__tests__/CheckoutCards.test.jsx src/app/components/Pages/FRONT_END/checkout/__tests__/CheckoutResultState.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductReview.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarHelp.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx src/app/components/Pages/FRONT_END/transfer/__tests__/TransferResultsDropdown.test.jsx --runInBand
```

Expected: FAIL because most public cards still use local `rounded-lg`, `rounded-xl`, or `rounded-2xl` classes.

- [ ] **Step 4: Apply only the shared outer radius**

Import `PUBLIC_CARD_RADIUS_CLASS` and combine it with each named outer card via `cn()` or a template string. Examples:

```jsx
<Card className={cn('group overflow-hidden border border-border p-0', PUBLIC_CARD_RADIUS_CLASS)}>
```

```jsx
<div className={cn('flex h-full flex-col border border-border bg-background p-4', PUBLIC_CARD_RADIUS_CLASS)}>
```

```js
const SHARED_CARD = cn('relative flex flex-col overflow-hidden bg-card shadow-sm ring-1 ring-border dark:shadow-none', PUBLIC_CARD_RADIUS_CLASS);
```

Add the matching `data-public-card` marker and shared class to every inventoried surface. For `ReviewCard.jsx`, update only `ReviewCard`, `ReviewCard2`, and `SingleProductReviewCard`; leave `UserDashboardReviewCard` unchanged. In ProductSidebar, update only the separate Questions/help support card; the booking-detail panel remains excluded and unchanged. In checkout, update order-total, transfer item, standard item, result state, and matching card skeleton surfaces. In `AboutPage.module.css`, remove only the outer `border-radius` declarations attached to `masonryVisual`, `masonryImage`, and `masonryCopyCard`, then apply the shared class in AboutOffer; retain the grid, overlays, and responsive adjacency. Preserve every horizontal/transactional layout and every inner radius.

- [ ] **Step 5: Run radius tests and gates**

```bash
npx jest src/app/__tests__/publicCardRadius.test.js src/app/components/__tests__/CityCard.test.jsx src/app/components/__tests__/Faq.test.jsx src/app/components/__tests__/Testimonial.test.jsx src/app/components/__tests__/ReviewCard.test.jsx src/app/components/__tests__/WhatAbout.test.jsx src/app/components/__tests__/MiniCartProductCard.test.jsx src/app/components/__tests__/MiniCartReviewCard.test.jsx src/app/components/Pages/FRONT_END/Global/__tests__/ReviewSection.test.jsx src/app/components/Pages/FRONT_END/checkout/__tests__/CheckoutCards.test.jsx src/app/components/Pages/FRONT_END/checkout/__tests__/CheckoutResultState.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductReview.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarHelp.test.jsx src/app/components/Pages/FRONT_END/About/__tests__/AboutPageSections.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx src/app/components/Pages/FRONT_END/transfer/__tests__/TransferResultsDropdown.test.jsx --runInBand
npm run type-check
npm run lint
```

Expected: PASS, with dashboard source unchanged.

### Task 7: Audit active call sites and complete verification

**Files:**
- Modify tests only if the audit exposes an uncovered active call site.
- Modify: `Reports/daily-work-report.md` from the workspace root after all gates pass.

- [ ] **Step 1: Run static duplication and active-call-site audits**

```bash
rg -n "<ItemCard|<GlobalCard|<SingleProductCard|<CreatorItineraryCard|<Singleproductguide" src/app --glob '*.{js,jsx,ts,tsx}' --glob '!**/dashboard/**' --glob '!**/__tests__/**'
rg -n "variant=\"compact\"|variant=\"product-compact\"" src/app --glob '*.{js,jsx,ts,tsx}' --glob '!**/dashboard/**' --glob '!**/__tests__/**'
```

Expected: active activity/itinerary/package call sites resolve to full `ItemCard`; active blog call sites resolve to editorial `ItemCard`; no active compact product/blog listing remains. Legacy files may remain only when no active route imports them.

- [ ] **Step 2: Run the complete automated gate**

```bash
npm run type-check
npm run lint
npm run test:ci -- --runInBand
npm run build
git diff --check
```

Expected: all commands exit `0`. If the known cumulative Jest heap behavior recurs, run suites in deterministic groups and record the exact passing commands; do not increase memory indefinitely.

- [ ] **Step 3: Verify representative routes in the visible browser**

Using `agent-browser --session weelp-visible`, check localhost in light and dark modes at desktop and mobile widths:

```text
/
/blogs
/search
/special
/explore-creators
/cities/dubai
/cities/dubai/activities
/cities/dubai/itineraries
/cities/dubai/packages
/transfers
/checkout
```

Populate each state rather than inspecting empty pages:

- On `/search`, select Dubai (or another location with results), run the search, and open one result to verify the city-aware URL.
- On `/transfers`, choose valid pickup/drop-off locations, date/time, and passengers, submit, and inspect an expanded horizontal result.
- From a valid activity or itinerary detail page, select required booking options and add one item to the cart. Inspect the mini-cart card, then continue to `/checkout` so the checkout item and total are visible.
- On `/blogs`, wait for the latest carousel and filtered grid data; on `/`, inspect Your Guide and the AI featured-activity card.
- Use existing local API data for city/package/itinerary routes. If a named route has no seeded items, verify the same component on another locally returned city and record the exact route.

Verify product-card geometry is identical, blog cards contain only image/category/title, horizontal transfer layout is preserved, destination/testimonial/cart/review/FAQ/supporting layouts are preserved with `24px` outer radius, links are city-aware, wishlist/creator-like controls remain independently operable, carousel arrows work, text clamps, focus is visible, and no console/runtime errors appear.

- [ ] **Step 4: Run the mandatory final review loop**

Dispatch the required `code-reviewer` agent over the implementation diff. Fix critical/high findings and re-review until clear. Invoke `simplify`, apply only behavior-preserving clarity improvements, then repeat type-check, lint, focused/full tests, build, visible-browser verification, and `git diff --check`.

- [ ] **Step 5: Update the daily report, commit, and push main**

Append a concise dated entry to `Reports/daily-work-report.md` describing the shared product/editorial card migration, public radius standardization, exclusions, and verification evidence. Commit verified frontend changes on `main`, then push `main` to `origin` as required by the project workflow.
