# AI Featured Activity Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the AI Travel Buddy's Featured activities cards look like compact Top Activities product cards while showing only image, category, and name.

**Architecture:** Keep `ItemCard` as the single shared card entry point and add an explicit `product-compact` variant beside the existing full-product and compact-editorial variants. `TravelBuddyWidget` selects the new variant; blog consumers remain on `compact`, and product data continues to come from `mapProductToItemCard()`.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Tailwind CSS, Jest, React Testing Library, agent-browser.

---

## Mandatory execution workflow

Before Task 1, invoke `executing-plans`, `test-driven-development`, `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`.

After each task that changes code, apply `error-handling-patterns`, then run:

```bash
npm run type-check
npm run lint
```

Use the already-open named headed browser session at `http://localhost:3000` for a smoke check after each code task. Keep implementation changes uncommitted until focused tests, type-check, lint, build, visible-browser verification, code review, simplify, and final verification are complete.

## File map

- Modify `src/app/components/ui/item-card.jsx` — add the product-compact renderer while leaving full-product and compact-editorial behavior intact.
- Modify `src/app/components/ui/__tests__/ItemCard.test.jsx` — lock the product-compact visual/content contract and compact-editorial regression behavior.
- Modify `src/app/components/Home/TravelBuddyWidget.jsx` — select the product-compact shared card variant for Featured activities.
- Create `src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx` — prove the slider selects the shared product-compact card without changing carousel behavior.

### Task 1: Add the shared product-compact card variant

**Files:**

- Modify: `src/app/components/ui/item-card.jsx`
- Test: `src/app/components/ui/__tests__/ItemCard.test.jsx`

- [ ] **Step 1: Write the failing product-compact card test**

Append this test after the full-card layout tests:

```jsx
it('renders a compact product card with the full-card visual language and reduced content', () => {
  const { container } = render(<ItemCard {...richProduct} publishedAt="2026-08-01" variant="product-compact" imageClassName="h-[112px] sm:h-[185px] lg:h-[200px]" />);

  const card = screen.getByTestId('product-compact-item-card');
  const imageFrame = screen.getByAltText('Desert Safari Adventure').parentElement;
  const image = screen.getByAltText('Desert Safari Adventure');

  expect(card).toHaveClass(
    'rounded-[24px]',
    'border-[var(--weelp-card-border)]',
    'bg-background',
    'p-2',
    'hover:[box-shadow:var(--weelp-card-hover-shadow)]',
    'motion-reduce:transition-none',
    'focus-visible:ring-2',
    'focus-visible:ring-weelp-sage-deep/40',
  );
  expect(imageFrame).toHaveClass('rounded-[16px]', 'h-[112px]', 'sm:h-[185px]', 'lg:h-[200px]');
  expect(imageFrame).not.toHaveClass('h-[175px]');
  expect(image).toHaveClass('duration-700', 'group-hover/card-link:scale-105', 'motion-reduce:transition-none', 'motion-reduce:group-hover/card-link:scale-100');
  expect(screen.getByText('Outdoor adventure')).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Desert Safari Adventure' })).toHaveClass('line-clamp-2', 'font-medium', 'tracking-tight');
  expect(screen.getByRole('link')).toHaveAttribute('href', '/cities/dubai/activities/desert-safari');
  expect(screen.queryByText('Ride the dunes at golden hour.')).not.toBeInTheDocument();
  expect(screen.queryByText('$130.00')).not.toBeInTheDocument();
  expect(screen.queryByText('$216.00')).not.toBeInTheDocument();
  expect(screen.queryByText('-40% OFF')).not.toBeInTheDocument();
  expect(screen.queryByText('4.8')).not.toBeInTheDocument();
  expect(screen.queryByText('210')).not.toBeInTheDocument();
  expect(screen.queryByText('4 Hours')).not.toBeInTheDocument();
  expect(screen.queryByText('Published Aug 1, 2026')).not.toBeInTheDocument();
  expect(screen.queryByText('Explore')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /wishlist/i })).not.toBeInTheDocument();
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).not.toBeInTheDocument();
});

it('renders an invalid compact product as a non-interactive card', () => {
  render(<ItemCard {...richProduct} href={null} variant="product-compact" />);

  expect(screen.getByTestId('product-compact-item-card')).toBeVisible();
  expect(screen.getByText('Desert Safari Adventure')).toBeVisible();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Strengthen the existing editorial compact regression test**

Replace the existing compact-editorial test with:

```jsx
it('keeps the compact editorial card visually and semantically unchanged', () => {
  const { container } = render(<ItemCard href="/blogs/a-guide" image="/guide.jpg" title="A guide" category="Travel" publishedAt="2026-08-01" variant="compact" />);
  const card = screen.getByRole('link', { name: /a guide/i });

  expect(card).toHaveClass('rounded-[8.5px]', 'border-border');
  expect(card).not.toHaveClass('rounded-[24px]', 'border-[var(--weelp-card-border)]');
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /wishlist/i })).not.toBeInTheDocument();
  expect(screen.getByText('Travel')).toBeVisible();
  expect(screen.getByText('Published Aug 1, 2026')).toBeVisible();
});
```

- [ ] **Step 3: Run the focused test and verify the new case fails**

Run:

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx --runInBand
```

Expected: FAIL because `product-compact` still falls through to the editorial compact card and has no `product-compact-item-card` test id.

- [ ] **Step 4: Add the product-compact renderer**

Import `cn` and define the shared product-card visual tokens below the schema constants:

```jsx
import { cn } from '@/lib/utils';

const PRODUCT_CARD_SURFACE_CLASS = 'overflow-hidden rounded-[24px] border border-[var(--weelp-card-border)] bg-background p-2';
const PRODUCT_CARD_HOVER_CLASS = 'transition-shadow duration-300 hover:[box-shadow:var(--weelp-card-hover-shadow)] motion-reduce:transition-none';
const PRODUCT_CARD_FOCUS_CLASS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2';
const PRODUCT_CARD_IMAGE_MOTION_CLASS = 'object-cover transition-transform duration-700 ease-out group-hover/card-link:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card-link:scale-100';
```

Add this component between `CompactItemCard` and `FullItemCard` in `item-card.jsx`:

```jsx
function ProductCompactItemCard({ href, image, title, category, className = '', imageClassName = '', style, LinkComponent = NavigationLink }) {
  const CardRoot = href ? LinkComponent : 'div';
  const cardRootProps = href ? { href } : {};

  return (
    <CardRoot
      {...cardRootProps}
      style={style}
      data-testid="product-compact-item-card"
      className={cn('group/card-link flex h-full flex-col', PRODUCT_CARD_SURFACE_CLASS, PRODUCT_CARD_HOVER_CLASS, PRODUCT_CARD_FOCUS_CLASS, className)}
    >
      <div className={cn('relative h-[175px] w-full shrink-0 overflow-hidden rounded-[16px] bg-weelp-sage-wash sm:h-[185px] lg:h-[200px]', imageClassName)}>
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 1024px) 45vw, 20vw"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          className={PRODUCT_CARD_IMAGE_MOTION_CLASS}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 px-2 pb-2 pt-3">
        {category ? <span className="w-fit rounded-md bg-weelp-sage-deep/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-weelp-copy">{category}</span> : null}
        <h3 className="line-clamp-2 text-base font-medium leading-snug tracking-tight text-foreground sm:text-lg">{title}</h3>
      </div>
    </CardRoot>
  );
}
```

Replace the matching surface, hover, focus, and image-motion class fragments in `FullItemCard` with the same constants while leaving its structure and sizing classes unchanged:

```jsx
<article
  itemScope={hasProductSchema || undefined}
  itemType={hasProductSchema ? 'https://schema.org/Product' : undefined}
  data-testid="product-item-card"
  className={cn('relative flex flex-col', PRODUCT_CARD_SURFACE_CLASS, PRODUCT_CARD_HOVER_CLASS, FEATURE_CARD_HEIGHT_CLASS, className)}
  style={style}
>
```

Keep the existing full-card product link classes and express their shared focus treatment as:

```jsx
className={cn('group/card-link flex h-full flex-col', PRODUCT_CARD_FOCUS_CLASS)}
```

Use `className={PRODUCT_CARD_IMAGE_MOTION_CLASS}` on the full-card image.

Update the shared dispatcher to keep its existing fallback behavior while selecting the new variant explicitly:

```jsx
export default function ItemCard({ variant = 'full', ...props }) {
  if (variant === 'product-compact') {
    return <ProductCompactItemCard {...props} />;
  }

  return variant === 'full' ? <FullItemCard {...props} /> : <CompactItemCard {...props} />;
}
```

- [ ] **Step 5: Run the focused test and verify it passes**

Run:

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx --runInBand
```

Expected: PASS for the full, product-compact, and compact-editorial contracts.

- [ ] **Step 6: Apply the post-change quality gate**

Review missing category, long title, fallback image, missing URL, keyboard focus, and reduced-motion paths with `error-handling-patterns`. The missing-URL path must match the full card by rendering a non-interactive `div`. Then run `npm run type-check` and `npm run lint`.

Refresh the visible `weelp-visible` browser session and confirm Top Activities remains unchanged before continuing.

### Task 2: Use the product-compact card in Featured activities

**Files:**

- Modify: `src/app/components/Home/TravelBuddyWidget.jsx`
- Create: `src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx`

- [ ] **Step 1: Write the failing widget integration test**

Create `TravelBuddyWidget.test.jsx` with:

```jsx
import { render, screen } from '@testing-library/react';

import TravelBuddyWidget from '../TravelBuddyWidget';

let mockCarouselProps;

jest.mock('../BuddyChat', () => ({ __esModule: true, default: () => <div>Buddy chat</div> }));
jest.mock('../TravelBuddyMapClient', () => ({ __esModule: true, default: () => <div>Buddy map</div> }));
jest.mock('@/hooks/useBuddyChat', () => ({
  __esModule: true,
  default: () => ({ messages: [], isThinking: false, sendMessage: jest.fn(), presets: [], lastPayload: { markers: [], route: [], fitBounds: false } }),
}));
jest.mock('@/app/components/ui/item-card', () => ({
  __esModule: true,
  default: ({ variant, title, imageClassName }) => <div data-testid="shared-item-card" data-variant={variant} data-image-class={imageClassName}>{title}</div>,
}));
jest.mock('@/app/components/ui/CarouselShell', () => ({
  __esModule: true,
  default: (props) => {
    mockCarouselProps = props;
    return <div data-testid="featured-carousel">{props.items.map((item) => <div key={item.id}>{props.renderSlide(item)}</div>)}</div>;
  },
}));

it('renders featured activities through the shared product-compact card', () => {
  render(<TravelBuddyWidget items={[{ id: 42, title: 'Desert Safari Adventure' }]} />);

  const card = screen.getByTestId('shared-item-card');
  expect(card).toHaveAttribute('data-variant', 'product-compact');
  expect(card).toHaveAttribute('data-image-class', 'h-[112px] sm:h-[185px] lg:h-[200px]');
  expect(card).toHaveTextContent('Desert Safari Adventure');
  expect(mockCarouselProps.navigationPrefix).toBe('buddy-activities');
  expect(mockCarouselProps.breakpoints).toEqual({ 0: { slidesPerView: 2, spaceBetween: 12 } });
  expect(mockCarouselProps.slideClassName).toBe('!h-auto');
  expect(screen.getByRole('button', { name: 'Previous featured activities' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next featured activities' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the widget test and verify it fails**

Run:

```bash
npx jest src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx --runInBand
```

Expected: FAIL because the widget still passes `variant="compact"`.

- [ ] **Step 3: Select the product-compact shared variant**

Change only the `renderSlide` expression in `TravelBuddyWidget.jsx`:

```jsx
renderSlide={(card) => <ItemCard {...card} variant="product-compact" imageClassName="h-[112px] sm:h-[185px] lg:h-[200px]" />}
```

- [ ] **Step 4: Run both focused suites**

Run:

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx --runInBand
```

Expected: both suites PASS.

- [ ] **Step 5: Apply the post-change quality gate and visible smoke test**

Review empty items and missing optional card fields with `error-handling-patterns`. Run `npm run type-check` and `npm run lint`.

Refresh `/` in the visible `weelp-visible` browser, scroll to Your AI Travel Buddy, and confirm the slider uses the product-card shape while showing only image, category, and name. Exercise the next/previous controls and one activity link.

### Task 3: Complete responsive verification and ship

**Files:**

- Modify only files named by concrete review or simplification findings.

- [ ] **Step 1: Run the complete automated gate**

Run:

```bash
npm run type-check
npm run lint
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx src/app/components/Home/__tests__/TravelBuddyWidget.test.jsx src/app/components/Pages/FRONT_END/home/__tests__/AiSection.test.jsx --runInBand
npm run build
git diff --check
```

Expected: every command exits successfully with no new warnings or whitespace errors.

- [ ] **Step 2: Verify desktop and mobile in the required visible browser**

At the current desktop viewport and at 390px width, compare Top Activities with Featured activities on `http://localhost:3000` and confirm:

- shared 24px shell, semantic border, inset 16px media, hover shadow, and image zoom;
- only category and a two-line name appear in Featured activities;
- no clipping, horizontal page overflow, or carousel-control regression;
- focus is visible and activity navigation keeps the city-aware URL;
- reduced-motion disables the image transform.

- [ ] **Step 3: Run the mandatory code-review loop**

Dispatch the `code-reviewer` agent over the final diff. Fix every critical issue and re-run the focused tests, type-check, lint, and visible check. Re-dispatch review if the fix changes runtime behavior.

- [ ] **Step 4: Simplify and re-verify**

Invoke `simplify` on the reviewed diff. Accept only clarity or reuse improvements that preserve the approved three-variant card boundary. Re-run the complete automated gate and visible browser checks after any edit.

- [ ] **Step 5: Commit and push main**

Confirm the frontend is on `main`, stage only the approved implementation and plan files, commit with a focused message, and push `main` to the frontend repository.
