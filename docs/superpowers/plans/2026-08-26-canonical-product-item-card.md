# Canonical Product Item Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every full product `ItemCard` with the existing `/home-gold` product-card design while preserving compact editorial cards, trustworthy pricing/schema data, semantic wishlist interaction, and route-scoped gold styling.

**Architecture:** `mapProductToItemCard()` remains the API-to-view adapter and gains raw semantic values plus a wishlist payload. The shared `item-card.jsx` owns both the unchanged compact variant and the canonical full-product variant, delegating card wishlist behavior to a focused shared client component. `/home-gold` returns to the same `ProductSliderSection` path as `/`, with theme tokens—not route-local JSX—owning its gold border.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Tailwind CSS, NextAuth.js, SWR wishlist hooks, Jest, React Testing Library, agent-browser.

---

## Mandatory execution workflow

Before Task 1, invoke `executing-plans`, `test-driven-development`, `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. Keep all production changes uncommitted through implementation, the per-task quality gates, visible-browser verification, code review, simplify, and final verification.

Before Task 1, also confirm localhost is serving the current frontend and open the required named headed browser:

```bash
npm run dev
agent-browser --session weelp-visible --headed open http://localhost:3000/
```

If port 3000 is already serving the current source, reuse it instead of starting a duplicate server. If Chromium requires the container flag, close only `weelp-visible` and reopen it with `--args "--no-sandbox"`. Keep this visible session open for every per-task smoke check and the final browser matrix.

After every task that changes code, run this batch gate before starting the next task:

```bash
npm run type-check
npm run lint
```

Then use the named visible `weelp-visible` browser session to smoke-test the affected localhost surface. Apply the `error-handling-patterns` review to changed runtime paths before the batch is considered complete. Focused red/green tests remain inside each task and the complete test/build/browser suite runs again at the final gate.

The reviewed plan document is committed separately before Task 1. No implementation commit is allowed until the code-review, simplify, and final-verification gates are green.

## File map

- Modify `src/lib/mapProductToItemCard.js` — expose display fields, raw schema values, availability, and wishlist identity from one adapter.
- Modify `src/lib/__tests__/mapProductToItemCard.test.js` — lock real pricing, rating, category, availability, and wishlist mapping.
- Create `src/app/components/Wishlist/ItemCardWishlistButton.jsx` — shared icon-only wishlist behavior for full product cards.
- Create `src/app/components/Wishlist/__tests__/ItemCardWishlistButton.test.jsx` — cover guest, authenticated, loading, unsupported payload, save/remove, and API failure paths.
- Modify `src/app/components/ui/item-card.jsx` — adopt the `/home-gold` full-card structure, semantic Product/Offer/Rating markup, neutral theme background, and sibling wishlist control while preserving compact cards.
- Create in Task 1, then expand in Task 3: `src/app/components/ui/__tests__/ItemCard.test.jsx` — first lock null-link compatibility, then visual structure, schema conditions, semantic link/button relationship, mobile sizing classes, and compact regression behavior.
- Modify `src/app/components/ui/CarouselShell.jsx` — accept a product-specific base `slidesPerView` without changing other carousel defaults.
- Modify `src/app/components/ui/__tests__/CarouselShell.test.jsx` — lock the default peek and the product-specific one-card base.
- Modify `src/app/components/ui/ProductSliderSection.jsx` — use one full card at the base viewport and the canonical 1/2/2/3/4 carousel density.
- Modify `src/app/components/ui/__tests__/ProductSliderSection.test.jsx` — lock canonical breakpoints and full-card prop forwarding.
- Modify `src/app/components/Pages/FRONT_END/shared/SharedFilterSection.jsx` — pass the complete mapped card contract.
- Modify `src/app/components/Pages/FRONT_END/shared/__tests__/SharedFilterSection.test.jsx` — prove semantic and wishlist fields reach filtered cards.
- Modify `src/app/components/Pages/FRONT_END/shared/SharedToursSection.jsx` — pass the complete mapped card contract and cap city grids at four columns.
- Modify `src/app/components/Pages/FRONT_END/shared/__tests__/SharedToursSection.test.jsx` — replace the obsolete five-column expectation.
- Modify `src/app/(frontend)/home-gold/page.js` — render the shared product carousel from mapped activities.
- Modify `src/app/(frontend)/home-gold/__tests__/page.test.jsx` — prove `/home-gold` uses the shared section and retains its route-specific non-card choices.
- Modify `src/app/(frontend)/__tests__/page.test.jsx` — prove the main homepage forwards the complete shared-card identity contract.
- Delete `src/app/(frontend)/home-gold/GoldActivityCard.jsx`.
- Delete `src/app/(frontend)/home-gold/GoldActivityWishlistButton.jsx`.
- Delete `src/app/(frontend)/home-gold/GoldTopActivitiesSection.jsx`.
- Delete their three route-local test files after equivalent shared coverage is green.
- Modify `src/app/__tests__/deepForestTheme.test.js` — add a source contract for the shared card token while preserving the existing dark-only `/home-gold` token contract.
- Modify `Reports/daily-work-report.md` from the workspace root after implementation and verification are complete.

### Task 1: Expand the product-card mapper contract

**Files:**
- Modify: `src/lib/mapProductToItemCard.js`
- Test: `src/lib/__tests__/mapProductToItemCard.test.js`
- Modify: `src/app/components/ui/item-card.jsx` — add the temporary null-link compatibility guard before the mapper can return `href: null`.
- Create: `src/app/components/ui/__tests__/ItemCard.test.jsx` — begin with the null-link compatibility regression; Task 3 expands this file.

- [ ] **Step 1: Write failing tests for raw semantic and wishlist data**

Append these cases inside `describe('mapProductToItemCard', ...)`:

```js
test('keeps display values separate from raw schema values', () => {
  const card = mapProductToItemCard({
    id: 4,
    name: 'Family Package',
    slug: 'family-package',
    item_type: 'package',
    city_slug: 'dubai',
    listing_price: '100.50',
    discount_percentage: 25,
    average_rating: '4.666',
    reviews_count: 1200,
    base_pricing: { currency: 'AED' },
    stock_status: 'in_stock',
  });

  expect(card).toMatchObject({
    price: 'AED 100.50',
    priceValue: 100.5,
    priceCurrency: 'AED',
    originalPrice: 'AED 134.00',
    rating: '4.7',
    ratingValue: 4.666,
    reviewCount: '1.2K',
    reviewCountValue: 1200,
    availability: 'https://schema.org/InStock',
  });
});

test('maps a valid identity, first API category, city-aware URL, and minimal wishlist payload', () => {
  const product = {
    id: 9,
    name: 'Dune Ride',
    slug: 'dune-ride',
    item_type: 'activity',
    city_slug: 'dubai',
    categories: [{ name: 'Outdoor adventure' }],
  };

  const card = mapProductToItemCard(product);

  expect(card.category).toBe('Outdoor adventure');
  expect(card).toMatchObject({
    productId: 9,
    itemType: 'activity',
    slug: 'dune-ride',
    citySlug: 'dubai',
    href: '/cities/dubai/activities/dune-ride',
    hasRealImage: false,
    wishlistItem: {
      item_type: 'activity',
      item_id: 9,
      title: 'Dune Ride',
      slug: 'dune-ride',
      city_slug: 'dubai',
      image_url: '/assets/Card.webp',
      price: null,
      currency: null,
    },
  });
});

test('uses the explicit city argument in the URL and wishlist payload', () => {
  const card = mapProductToItemCard(
    { id: 11, name: 'Paris Walk', slug: 'paris-walk', item_type: 'activity' },
    'paris',
  );

  expect(card.href).toBe('/cities/paris/activities/paris-walk');
  expect(card.citySlug).toBe('paris');
  expect(card.wishlistItem.city_slug).toBe('paris');
});

test('does not create a flat URL, Product identity, or wishlist payload when routing identity is incomplete', () => {
  const card = mapProductToItemCard({ id: 12, name: 'Unplaced Activity', slug: 'unplaced', item_type: 'activity' });

  expect(card.href).toBeNull();
  expect(card.hasValidIdentity).toBe(false);
  expect(card.wishlistItem).toBeNull();
});

test('does not treat the generic fallback image as schema-eligible product media', () => {
  const card = mapProductToItemCard({ id: 13, name: 'Fallback Image', slug: 'fallback-image', item_type: 'activity', city_slug: 'dubai' });
  expect(card.image).toBe('/assets/Card.webp');
  expect(card.hasRealImage).toBe(false);
});

test('marks a missing or blank API name as a display fallback, not a real schema title', () => {
  const card = mapProductToItemCard({
    id: 18,
    name: '   ',
    slug: 'unnamed-activity',
    item_type: 'activity',
    city_slug: 'dubai',
  });

  expect(card.title).toBe('Untitled');
  expect(card.hasRealTitle).toBe(false);
  expect(card.wishlistItem.title).toBeNull();
});

test('does not invent pricing, discounts, availability, or schema values', () => {
  const card = mapProductToItemCard({
    id: 10,
    name: 'Ask the concierge',
    slug: 'ask-the-concierge',
    item_type: 'activity',
    city_slug: 'dubai',
  });

  expect(card).toMatchObject({
    price: '',
    priceValue: null,
    priceCurrency: null,
    originalPrice: null,
    discount: null,
    ratingValue: null,
    reviewCountValue: null,
    availability: null,
  });
});

test.each([
  { listing_price: 100, base_pricing: { currency: 'US' } },
  { listing_price: 100, base_pricing: { currency: 'US1' } },
  { listing_price: 100, base_pricing: { currency: 'ZZZ' } },
  { listing_price: 'not-a-number', base_pricing: { currency: 'USD' } },
])('omits display and Offer data for malformed price/currency input %#', (pricing) => {
  const card = mapProductToItemCard({
    id: 14,
    name: 'Malformed Price',
    slug: 'malformed-price',
    item_type: 'activity',
    city_slug: 'dubai',
    ...pricing,
  });

  expect(card.price).toBe('');
  expect(card.priceCurrency).toBeNull();
});

test('normalizes a lowercase padded ISO currency safely', () => {
  const card = mapProductToItemCard({
    id: 17,
    name: 'Normalized Currency',
    slug: 'normalized-currency',
    item_type: 'activity',
    city_slug: 'dubai',
    listing_price: 100,
    base_pricing: { currency: ' usd ' },
  });

  expect(card.priceCurrency).toBe('USD');
  expect(card.price).toBe('$100.00');
});

test('accepts a genuine zero price with a valid currency', () => {
  const card = mapProductToItemCard({
    id: 15,
    name: 'Free Museum Day',
    slug: 'free-museum-day',
    item_type: 'activity',
    city_slug: 'paris',
    listing_price: 0,
    base_pricing: { currency: 'EUR' },
  });

  expect(card.priceValue).toBe(0);
  expect(card.priceCurrency).toBe('EUR');
  expect(card.price).toContain('0.00');
});

test('rejects impossible rating, review, discount, availability, and malformed attributes', () => {
  const card = mapProductToItemCard({
    id: 16,
    name: 'Boundary Product',
    slug: 'boundary-product',
    item_type: 'activity',
    city_slug: 'dubai',
    average_rating: 7,
    reviews_count: 2.5,
    discount_percentage: 100,
    availability: 'https://schema.org/Discontinued',
    attributes: [null, { slug: 'duration', name: 'Duration', attribute_value: '2 Hours' }, { name: '', attribute_value: '' }],
  });

  expect(card).toMatchObject({
    rating: null,
    ratingValue: null,
    reviewCount: null,
    reviewCountValue: null,
    discount: null,
    originalPrice: null,
    availability: null,
    attributes: [{ slug: 'duration', name: 'Duration', attribute_value: '2 Hours' }],
  });
});
```

- [ ] **Step 2: Run the mapper tests and confirm the new contract fails**

Run:

```bash
npx jest src/lib/__tests__/mapProductToItemCard.test.js --runInBand
```

Expected: FAIL because `priceValue`, `priceCurrency`, numeric rating fields, normalized availability, category precedence, and `wishlistItem` are not returned yet.

- [ ] **Step 3: Make the old full card null-link safe, then implement the mapper contract**

Before changing the mapper to emit `href: null`, add this regression to the new `ItemCard.test.jsx`:

```jsx
it('does not pass a null href to the link component during the mapper transition', () => {
  render(<ItemCard variant="full" href={null} image="/assets/Card.webp" title="Unplaced activity" />);
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
```

Confirm it fails against the old full-card branch, then add this temporary compatibility guard immediately after the compact branch in `item-card.jsx`:

```jsx
if (!href) return null;
```

Run `npx jest src/app/components/ui/__tests__/ItemCard.test.jsx --runInBand` and require PASS before applying the mapper changes below. Task 3 removes this guard when it implements the final nonlinked full-card rendering.

Then implement the raw/display mapping contract.

Add these helpers near the existing number and formatting helpers:

```js
const SCHEMA_AVAILABILITY = {
  in_stock: 'https://schema.org/InStock',
  instock: 'https://schema.org/InStock',
  out_of_stock: 'https://schema.org/OutOfStock',
  outofstock: 'https://schema.org/OutOfStock',
  preorder: 'https://schema.org/PreOrder',
  pre_order: 'https://schema.org/PreOrder',
};

const SUPPORTED_ITEM_TYPES = new Set(Object.keys(ITEM_TYPE_PLURAL));
const SUPPORTED_AVAILABILITY = new Set(Object.values(SCHEMA_AVAILABILITY));
const SUPPORTED_CURRENCIES = typeof Intl.supportedValuesOf === 'function' ? new Set(Intl.supportedValuesOf('currency')) : new Set();

const finiteNumber = (value) => {
  if (typeof value === 'string' && !value.trim()) return null;
  const number = toNumber(value);
  return number !== null ? number : null;
};

const normalizeCurrency = (value) => {
  if (typeof value !== 'string') return null;
  const currency = value.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency) || !SUPPORTED_CURRENCIES.has(currency)) return null;
  try {
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0);
    return currency;
  } catch {
    return null;
  }
};

const safeFormatCurrency = (amount, currency) => {
  if (amount === null || !currency) return '';
  try {
    return formatCurrency(amount, currency);
  } catch {
    return '';
  }
};

const normalizeAvailability = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const normalized = value.trim();
  if (SUPPORTED_AVAILABILITY.has(normalized)) return normalized;
  return SCHEMA_AVAILABILITY[normalized.toLowerCase().replaceAll(' ', '_')] ?? null;
};

const isValidAttribute = (attribute) =>
  Boolean(attribute && typeof attribute === 'object' && attribute.name && attribute.attribute_value !== undefined && attribute.attribute_value !== null && attribute.attribute_value !== '');
```

Replace the current `pluralType` / `resolvedCitySlug` / `href` calculation and the pricing/rating/category portion of `mapProductToItemCard()` with:

```js
const itemType = typeof product.item_type === 'string' ? product.item_type.trim().toLowerCase() : null;
const productId = product.id ?? null;
const slug = typeof product.slug === 'string' && product.slug.trim() ? product.slug.trim() : null;
const realTitle = typeof product.name === 'string' && product.name.trim() ? product.name.trim() : null;
const resolvedCitySlug = citySlug || product.city_slug || product.locations?.[0]?.city_slug || null;
const hasValidIdentity = Boolean(SUPPORTED_ITEM_TYPES.has(itemType) && productId !== null && productId !== '' && slug && resolvedCitySlug);
const href = hasValidIdentity ? `/cities/${resolvedCitySlug}/${ITEM_TYPE_PLURAL[itemType]}/${slug}` : null;

const rawPrice =
  product.listing_price ??
  (itemType === 'itinerary'
    ? (product.schedule_total_price ?? null)
    : (product.pricing?.regular_price ?? product.base_pricing?.variations?.[0]?.regular_price ?? null));
const parsedPrice = finiteNumber(rawPrice);
const priceValue = parsedPrice !== null && parsedPrice >= 0 ? parsedPrice : null;
const priceCurrency = normalizeCurrency(itemType === 'itinerary' ? product.schedule_total_currency : (product.pricing?.currency ?? product.base_pricing?.currency));
const price = priceValue !== null && priceCurrency ? safeFormatCurrency(priceValue, priceCurrency) : '';

const category = product.categories?.[0]?.name || (itemType ? itemType.charAt(0).toUpperCase() + itemType.slice(1) : '');
const parsedRating = finiteNumber(product.average_rating ?? product.rating_average ?? product.review_summary?.average_rating ?? product.reviewSummary?.averageRating);
const ratingValue = parsedRating !== null && parsedRating > 0 && parsedRating <= 5 ? parsedRating : null;
const parsedReviewCount = finiteNumber(product.reviews_count ?? product.review_count ?? product.review_summary?.total_reviews ?? product.reviewSummary?.totalReviews);
const reviewCountValue = parsedReviewCount !== null && Number.isInteger(parsedReviewCount) && parsedReviewCount > 0 ? parsedReviewCount : null;
const rating = formatRating(ratingValue);
const reviewCount = formatReviewCount(reviewCountValue);
const parsedDiscount = finiteNumber(product.discount_percentage);
const discountPercentage = parsedDiscount !== null && parsedDiscount > 0 && parsedDiscount < 100 ? parsedDiscount : null;
const discount = discountPercentage ? `${discountPercentage}% OFF` : null;

let originalPrice = null;
if (discountPercentage && priceValue !== null && priceCurrency) {
  const originalPriceValue = Math.round(priceValue / (1 - discountPercentage / 100));
  originalPrice = safeFormatCurrency(originalPriceValue, priceCurrency) || null;
}

const hasRealImage = image !== '/assets/Card.webp';
const wishlistItem = hasValidIdentity
  ? {
      item_type: itemType,
      item_id: productId,
      title: realTitle,
      slug,
      city_slug: resolvedCitySlug,
      image_url: image,
      price: priceValue,
      currency: priceCurrency,
    }
  : null;
```

Return the new fields with the existing display fields:

```js
return {
  id: productId,
  productId,
  itemType,
  slug,
  citySlug: resolvedCitySlug,
  hasValidIdentity,
  href,
  image,
  hasRealImage,
  title: realTitle || 'Untitled',
  hasRealTitle: Boolean(realTitle),
  category,
  price,
  priceValue,
  priceCurrency,
  originalPrice,
  rating,
  ratingValue,
  reviewCount,
  reviewCountValue,
  discount,
  availability: normalizeAvailability(product.availability ?? product.stock_status),
  shortDescription: product.short_description ?? null,
  attributes: Array.isArray(product.attributes) ? product.attributes.filter(isValidAttribute).slice(0, 3) : [],
  wishlistItem,
};
```

- [ ] **Step 4: Run mapper tests and correct only contract-specific failures**

Run:

```bash
npx jest src/lib/__tests__/mapProductToItemCard.test.js --runInBand
```

Expected: PASS. If the locale inserts a different Unicode spacing character, assert with `toContain('100.50')` and `toContain('AED')` rather than weakening any raw-value assertion.

- [ ] **Step 5: Run the mandatory Task 1 batch gate**

```bash
npm run type-check
npm run lint
```

Apply `error-handling-patterns` to malformed mapper inputs, then refresh the visible localhost homepage and confirm the current UI still renders while the mapper contract changes remain internal.

### Task 2: Create the shared icon wishlist control

**Files:**
- Create: `src/app/components/Wishlist/ItemCardWishlistButton.jsx`
- Create: `src/app/components/Wishlist/__tests__/ItemCardWishlistButton.test.jsx`

- [ ] **Step 1: Write the shared wishlist-control tests**

Create the new test by moving the behavioral setup from `home-gold/__tests__/GoldActivityWishlistButton.test.jsx`, then make the contract explicit with these cases:

```jsx
it('renders a 44px target around the 32px visible heart control', () => {
  render(<ItemCardWishlistButton item={activity} />);

  const button = screen.getByRole('button', { name: /save desert safari adventure to wishlist/i });
  expect(button).toHaveClass('size-11');
  expect(within(button).getByTestId('item-card-wishlist-visual')).toHaveClass('size-8');
  expect(button).toHaveAttribute('aria-pressed', 'false');
});

it('renders nothing for an invalid wishlist identity', () => {
  const { container } = render(<ItemCardWishlistButton item={{ title: 'Incomplete' }} />);
  expect(container).toBeEmptyDOMElement();
  expect(useWishlistItems).toHaveBeenCalledWith({ enabled: false });
});

it('opens authentication for a guest and resumes the save after login', async () => {
  sessionState = { data: null, status: 'unauthenticated' };
  render(<ItemCardWishlistButton item={activity} />);
  fireEvent.click(screen.getByRole('button', { name: /save desert safari adventure to wishlist/i }));

  expect(openAuthModal).toHaveBeenCalledWith({ onSuccess: expect.any(Function) });
  await act(async () => openAuthModal.mock.calls[0][0].onSuccess({ user: { id: 7 } }));
  expect(addItem).toHaveBeenCalledWith(expect.objectContaining({ item_type: 'activity', item_id: 42 }));
});

it('submits only one mutation while a save is pending', async () => {
  let resolveSave;
  addItem.mockReturnValue(new Promise((resolve) => { resolveSave = resolve; }));
  render(<ItemCardWishlistButton item={activity} />);

  const button = screen.getByRole('button', { name: /save desert safari adventure to wishlist/i });
  fireEvent.click(button);
  fireEvent.click(button);

  expect(addItem).toHaveBeenCalledTimes(1);
  expect(button).toBeDisabled();

  await act(async () => resolveSave({ success: true }));
});
```

Retain explicit tests for authenticated save, authenticated remove, session loading, wishlist loading, supported non-customer roles, and rejected API requests.

- [ ] **Step 2: Run the new test and confirm the component is missing**

Run:

```bash
npx jest src/app/components/Wishlist/__tests__/ItemCardWishlistButton.test.jsx --runInBand
```

Expected: FAIL because `ItemCardWishlistButton.jsx` does not exist.

- [ ] **Step 3: Implement the focused shared component**

Create `ItemCardWishlistButton.jsx` from the proven route-local logic, with this render contract:

```jsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';

import { useWishlistItems } from '@/hooks/api/customer/wishlist';
import { useToast } from '@/hooks/use-toast';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import { normalizeWishlistPayload } from '@/lib/wishlist/normalizeWishlistItem';

function isSameWishlistItem(item, payload) {
  return String(item?.item_type) === String(payload?.item_type) && String(item?.item_id) === String(payload?.item_id);
}

function getErrorMessage(error) {
  return error?.response?.data?.message || error?.message || 'Please try again.';
}

export default function ItemCardWishlistButton({ item }) {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModalStore();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const payload = useMemo(() => normalizeWishlistPayload(item), [item]);
  const isAuthenticated = status === 'authenticated';
  const { items, isLoading, addItem, removeItemByIdentity } = useWishlistItems({ enabled: Boolean(payload) && isAuthenticated });
  const isSaved = useMemo(() => Boolean(payload && items.some((wishlistItem) => isSameWishlistItem(wishlistItem, payload))), [items, payload]);

  const updateWishlist = useCallback(
    async (removeSavedItem) => {
      if (!payload || isPending) return;
      setIsPending(true);
      try {
        if (removeSavedItem) {
          await removeItemByIdentity(payload.item_type, payload.item_id);
          toast({ title: 'Removed from wishlist', description: `${payload.title || 'This item'} has been removed from your wishlist.` });
        } else {
          await addItem(payload);
          toast({ title: 'Saved to wishlist', description: `${payload.title || 'This item'} has been added to your wishlist.` });
        }
      } catch (error) {
        toast({ title: 'Unable to update wishlist', description: getErrorMessage(error), variant: 'destructive' });
      } finally {
        setIsPending(false);
      }
    },
    [addItem, isPending, payload, removeItemByIdentity, toast],
  );

  if (!payload) return null;

  const handleClick = () => {
    if (status === 'loading' || isPending || (isAuthenticated && isLoading)) return;
    if (!session?.user) {
      openAuthModal({ onSuccess: (authenticatedSession) => (authenticatedSession?.user ? updateWishlist(false) : undefined) });
      return;
    }
    void updateWishlist(isSaved);
  };

  const title = payload.title || 'item';
  const isDisabled = status === 'loading' || isPending || (isAuthenticated && isLoading);

  return (
    <button
      type="button"
      aria-label={`${isSaved ? 'Remove' : 'Save'} ${title} ${isSaved ? 'from' : 'to'} wishlist`}
      aria-pressed={isSaved}
      onClick={handleClick}
      disabled={isDisabled}
      className="grid size-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span
        data-testid="item-card-wishlist-visual"
        className="grid size-8 place-items-center rounded-full bg-background/90 text-destructive shadow-sm backdrop-blur-md transition-transform hover:scale-[1.04] motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <Heart aria-hidden="true" className={`size-[1.2rem] ${isSaved ? 'fill-current' : ''}`} />
      </span>
    </button>
  );
}
```

- [ ] **Step 4: Run the focused wishlist tests**

Run:

```bash
npx jest src/app/components/Wishlist/__tests__/ItemCardWishlistButton.test.jsx --runInBand
```

Expected: PASS.

- [ ] **Step 5: Run the mandatory Task 2 batch gate**

```bash
npm run type-check
npm run lint
```

Apply `error-handling-patterns` to pending, guest-login, and rejected-request paths. The component is not wired into the page yet, so use the visible browser only to confirm the existing homepage remains healthy.

### Task 3: Make the full `ItemCard` canonical

**Files:**
- Modify: `src/app/components/ui/item-card.jsx`
- Modify: `src/app/components/ui/__tests__/ItemCard.test.jsx`

- [ ] **Step 1: Write failing canonical-card tests**

Mock `next/image`, `NavigationLink`, and `ItemCardWishlistButton`, then cover the contract with concrete assertions:

```jsx
it('renders the home-gold composition with a sibling detail link and wishlist control', () => {
  render(<ItemCard {...richProduct} variant="full" />);

  const card = screen.getByTestId('product-item-card');
  const link = screen.getByRole('link', { name: /explore desert safari adventure/i });
  const wishlist = screen.getByRole('button', { name: /wishlist/i });

  expect(card).toHaveClass('rounded-[24px]', 'border-[var(--weelp-card-border)]', 'bg-background');
  expect(link).toHaveAttribute('href', '/cities/dubai/activities/desert-safari');
  expect(link).not.toContainElement(wishlist);
  expect(card).toContainElement(link);
  expect(card).toContainElement(wishlist);
  expect(screen.getByText('Ride the dunes at golden hour.')).toBeVisible();
  expect(screen.getAllByTestId('product-item-attribute')).toHaveLength(3);
});

it('renders only genuine discount and original-price claims', () => {
  const { rerender } = render(<ItemCard {...richProduct} discount={null} originalPrice={null} />);
  expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
  expect(screen.queryByText('$216.00')).not.toBeInTheDocument();

  rerender(<ItemCard {...richProduct} discount="40% OFF" originalPrice="$216.00" />);
  expect(screen.getByText('-40% OFF')).toBeVisible();
  expect(screen.getByText('$216.00')).toHaveClass('line-through');
});

it('emits valid Product, Offer, and AggregateRating raw values', () => {
  const { container } = render(<ItemCard {...richProduct} />);
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).toBeInTheDocument();
  expect(container.querySelector('[itemprop="price"]')).toHaveAttribute('content', '130');
  expect(container.querySelector('[itemprop="priceCurrency"]')).toHaveAttribute('content', 'USD');
  expect(container.querySelector('[itemprop="availability"]')).toHaveAttribute('href', 'https://schema.org/InStock');
  expect(container.querySelector('[itemprop="ratingValue"]')).toHaveAttribute('content', '4.8');
  expect(container.querySelector('[itemprop="reviewCount"]')).toHaveAttribute('content', '210');
});

it('omits Offer and AggregateRating markup when raw values are incomplete', () => {
  const { container } = render(<ItemCard {...richProduct} priceValue={null} priceCurrency={null} ratingValue={null} reviewCountValue={null} />);
  expect(container.querySelector('[itemtype="https://schema.org/Offer"]')).not.toBeInTheDocument();
  expect(container.querySelector('[itemtype="https://schema.org/AggregateRating"]')).not.toBeInTheDocument();
});

it('omits navigation, Product schema, and wishlist for an invalid product identity', () => {
  const { container } = render(
    <ItemCard
      {...richProduct}
      href={null}
      hasValidIdentity={false}
      wishlistItem={null}
    />,
  );

  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /wishlist/i })).not.toBeInTheDocument();
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).not.toBeInTheDocument();
});

it('omits Product schema when only the generic fallback image is available', () => {
  const { container } = render(<ItemCard {...richProduct} image="/assets/Card.webp" hasRealImage={false} />);
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).not.toBeInTheDocument();
});

it('omits Product schema when the title is only a display fallback', () => {
  const { container } = render(<ItemCard {...richProduct} title="Untitled" hasRealTitle={false} />);
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).not.toBeInTheDocument();
});

it('removes the entire attribute region when no valid attributes exist', () => {
  const { rerender } = render(<ItemCard {...richProduct} />);
  expect(screen.getByTestId('product-item-attributes')).toBeInTheDocument();

  rerender(<ItemCard {...richProduct} attributes={[]} />);
  expect(screen.queryByTestId('product-item-attributes')).not.toBeInTheDocument();
});

it('keeps the compact editorial structure free of product and wishlist markup', () => {
  const { container } = render(<ItemCard href="/blogs/a-guide" image="/guide.jpg" title="A guide" category="Travel" variant="compact" />);
  expect(screen.getByRole('link', { name: /a guide/i })).toBeInTheDocument();
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /wishlist/i })).not.toBeInTheDocument();
});
```

Use this fixture in the new test file:

```js
const richProduct = {
  id: 42,
  productId: 42,
  itemType: 'activity',
  slug: 'desert-safari',
  citySlug: 'dubai',
  hasValidIdentity: true,
  hasRealTitle: true,
  hasRealImage: true,
  href: '/cities/dubai/activities/desert-safari',
  image: '/desert-safari.jpg',
  title: 'Desert Safari Adventure',
  category: 'Outdoor adventure',
  price: '$130.00',
  priceValue: 130,
  priceCurrency: 'USD',
  originalPrice: '$216.00',
  discount: '40% OFF',
  rating: '4.8',
  ratingValue: 4.8,
  reviewCount: '210',
  reviewCountValue: 210,
  availability: 'https://schema.org/InStock',
  shortDescription: 'Ride the dunes at golden hour.',
  attributes: [
    { slug: 'duration', name: 'Duration', attribute_value: '4 Hours' },
    { slug: 'group-size', name: 'Group Size', attribute_value: '6-10' },
    { slug: 'age-restriction', name: 'Age Restriction', attribute_value: '12+' },
  ],
  wishlistItem: {
    item_type: 'activity',
    item_id: 42,
    title: 'Desert Safari Adventure',
    slug: 'desert-safari',
    city_slug: 'dubai',
    image_url: '/desert-safari.jpg',
    price: 130,
    currency: 'USD',
  },
};
```

- [ ] **Step 2: Run the new card tests and confirm the old full variant fails**

Run:

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx --runInBand
```

Expected: FAIL because the shared full card does not yet have the canonical structure, schema contract, attributes, or wishlist action.

- [ ] **Step 3: Split compact and full rendering without changing compact markup**

In `item-card.jsx`, change the default link component to `NavigationLink` and return this compact branch immediately when `variant !== 'full'`:

```jsx
if (variant !== 'full') {
  return (
    <LinkComponent
      href={href}
      style={style}
      className={`group flex h-full flex-col overflow-hidden rounded-[8.5px] border border-border bg-background transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${className}`}
    >
      <div className="px-3 pt-3">
        <div className={`relative h-[175px] w-full overflow-hidden rounded-lg bg-weelp-sage-wash sm:h-[185px] lg:h-[200px] ${imageClassName}`}>
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 33vw, (max-width: 1440px) 25vw, 20vw"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3 pb-3 pt-3 sm:px-4 sm:pb-4 lg:gap-[5.7px] lg:px-[17px] lg:pb-[17px] lg:pt-[15.6px]">
        {category ? <span className="w-fit rounded-md bg-weelp-sage-deep/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-weelp-copy">{category}</span> : null}
        <BlogPublishedDate date={publishedAt} className="text-xs text-muted-foreground" />
        <h3
          className="line-clamp-2 text-[15px] leading-[1.59] text-foreground sm:text-base lg:text-[18px]"
          style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}
        >
          {title}
        </h3>
      </div>
    </LinkComponent>
  );
}
```

- [ ] **Step 4: Implement the canonical full-card branch**

Import `ArrowRight`, `getAttributeIcon`, and `ItemCardWishlistButton`. Add these exact defaulted entries to the existing `ItemCard` parameter destructuring, retaining the compact early return from Step 3 immediately inside the function:

```js
productId = null,
itemType = null,
slug = null,
citySlug = null,
hasValidIdentity = false,
hasRealTitle = false,
hasRealImage = false,
priceValue = null,
priceCurrency = null,
originalPrice = null,
ratingValue = null,
reviewCountValue = null,
availability = null,
shortDescription = null,
attributes = [],
wishlistItem = null,
LinkComponent = NavigationLink,
```

After the compact early return, normalize the full-card inputs without inventing values:

```js

const safeAttributes = Array.isArray(attributes)
  ? attributes.filter((attribute) => attribute && attribute.name && attribute.attribute_value !== undefined && attribute.attribute_value !== null && attribute.attribute_value !== '')
  : [];
const discountLabel = discount?.trim() ? `-${discount.trim().replace(/^-+\s*/, '')}` : null;
const hasProductSchema = Boolean(hasValidIdentity && hasRealTitle && hasRealImage && productId !== null && itemType && slug && citySlug && title && image && href);
const hasSchemaCurrency = typeof priceCurrency === 'string' && SUPPORTED_SCHEMA_CURRENCIES.has(priceCurrency);
const hasOffer = hasProductSchema && Number.isFinite(priceValue) && priceValue >= 0 && hasSchemaCurrency;
const hasAggregateRating = hasProductSchema && Number.isFinite(ratingValue) && ratingValue > 0 && ratingValue <= 5 && Number.isInteger(reviewCountValue) && reviewCountValue > 0;
const ProductContentRoot = href ? LinkComponent : 'div';
const productContentProps = href
  ? { href, itemProp: hasProductSchema ? 'url' : undefined, 'aria-label': `Explore ${title}` }
  : {};
```

Define `SUPPORTED_SCHEMA_CURRENCIES` once at module scope using `Intl.supportedValuesOf('currency')`, with an empty `Set` fallback, so the render-time predicate remains cheap and never accepts arbitrary three-letter text.

Render the full branch with this hierarchy:

```jsx
<article
  itemScope={hasProductSchema || undefined}
  itemType={hasProductSchema ? 'https://schema.org/Product' : undefined}
  data-testid="product-item-card"
  className={`relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--weelp-card-border)] bg-background p-2 ${className}`}
  style={style}
>
  {hasProductSchema ? <meta itemProp="name" content={title} /> : null}
  {hasProductSchema ? <meta itemProp="image" content={image} /> : null}
  {hasProductSchema && category ? <meta itemProp="category" content={category} /> : null}

  <ProductContentRoot
    {...productContentProps}
    className="group/card-link flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2"
  >
    <div className="relative aspect-[8/5] w-full shrink-0 overflow-hidden rounded-[16px] bg-weelp-sage-wash sm:aspect-[4/3]">
      <Image
        fill
        src={image}
        alt={title}
        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
        placeholder="blur"
        blurDataURL={IMAGE_BLUR_DATA_URL}
        className="object-cover transition-transform duration-700 ease-out group-hover/card-link:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card-link:scale-100"
      />
      {discountLabel ? (
        <span className="absolute left-3 top-3 z-10 inline-flex rounded-full border border-weelp-sage-deep bg-weelp-sage-deep px-3 py-1 text-xs font-semibold text-white dark:border-border dark:bg-[var(--weelp-home-page)]">
          {discountLabel}
        </span>
      ) : null}
    </div>

    <div className="flex flex-1 flex-col px-2 pb-2 pt-3 sm:pt-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-xl font-medium leading-snug tracking-tight text-foreground">{title}</h3>
        {hasAggregateRating ? (
          <div itemScope itemProp="aggregateRating" itemType="https://schema.org/AggregateRating" className="flex shrink-0 items-center gap-1 font-semibold text-foreground">
            <meta itemProp="bestRating" content="5" />
            <meta itemProp="ratingValue" content={String(ratingValue)} />
            <meta itemProp="reviewCount" content={String(reviewCountValue)} />
            <span aria-hidden="true" className="text-sm text-amber-500">★</span>
            <span className="text-sm">{rating}</span>
            <span className="text-xs">({reviewCount})</span>
          </div>
        ) : null}
      </div>

      {shortDescription ? <p className="mt-1.5 line-clamp-2 text-sm text-foreground sm:mt-2">{shortDescription}</p> : null}

      {safeAttributes.length ? (
        <div data-testid="product-item-attributes" className="flex items-center py-2 sm:py-3">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground">
            {safeAttributes.map((attribute) => {
              const Icon = getAttributeIcon(attribute.slug);
              const label = `${attribute.name}: ${attribute.attribute_value}`;
              return (
                <li key={attribute.slug || attribute.name} data-testid="product-item-attribute" aria-label={label} title={label} className="inline-flex items-center gap-1.5">
                  <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
                  <span>{attribute.attribute_value}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto flex items-end justify-between gap-3">
        {price ? (
          hasOffer ? (
            <div itemScope itemProp="offers" itemType="https://schema.org/Offer" className="flex flex-col gap-0.5 text-foreground">
              <meta itemProp="priceCurrency" content={priceCurrency} />
              <meta itemProp="price" content={String(priceValue)} />
              {availability ? <link itemProp="availability" href={availability} /> : null}
              <span className="text-[10px] uppercase tracking-wider">From</span>
              <div className="flex items-baseline gap-1.5">
                <strong className="text-lg font-semibold tracking-tight">{price}</strong>
                {originalPrice ? <span className="text-xs line-through">{originalPrice}</span> : null}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 text-foreground"><span className="text-[10px] uppercase tracking-wider">From</span><strong className="text-lg font-semibold">{price}</strong></div>
          )
        ) : <div />}

        {href ? (
          <span className="inline-flex h-10 shrink-0 items-center gap-3 rounded-full border border-border bg-background pl-4 pr-1 text-sm font-medium text-foreground shadow-sm">
            Explore
            <span className="grid size-8 place-items-center rounded-full border border-border bg-background text-amber-500 transition-transform duration-300 group-hover/card-link:-rotate-45 motion-reduce:transition-none">
              <ArrowRight aria-hidden="true" className="size-4" strokeWidth={2.5} />
            </span>
          </span>
        ) : null}
      </div>
    </div>
  </ProductContentRoot>

  {wishlistItem ? <div className="absolute right-2.5 top-2.5 z-20"><ItemCardWishlistButton item={wishlistItem} /></div> : null}
</article>
```

- [ ] **Step 5: Run shared full and compact card tests**

Run:

```bash
npx jest src/app/components/ui/__tests__/ItemCard.test.jsx src/app/components/ui/__tests__/BlogSection.test.jsx --runInBand
```

Expected: PASS with no nested-interactive DOM warning.

- [ ] **Step 6: Run the mandatory Task 3 batch gate**

```bash
npm run type-check
npm run lint
```

Apply `error-handling-patterns` to missing identity, optional product fields, and wishlist failures. In the visible browser, smoke-test `/` at 390px and 1440px in light and dark themes before moving on.

### Task 4: Route all product surfaces through the complete shared contract

**Files:**
- Modify: `src/app/components/ui/ProductSliderSection.jsx`
- Modify: `src/app/components/ui/CarouselShell.jsx`
- Test: `src/app/components/ui/__tests__/CarouselShell.test.jsx`
- Modify: `src/app/components/ui/__tests__/ProductSliderSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/shared/SharedFilterSection.jsx`
- Modify: `src/app/components/Pages/FRONT_END/shared/SharedToursSection.jsx`
- Modify: `src/app/components/Pages/FRONT_END/shared/__tests__/SharedFilterSection.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/shared/__tests__/SharedToursSection.test.jsx`

- [ ] **Step 1: Write failing carousel-density and grid tests**

Add this assertion to `ProductSliderSection.test.jsx` after rendering the section:

```jsx
expect(mockCarouselShell.mock.calls.at(-1)[0].breakpoints).toEqual({
  450: { slidesPerView: 1, spaceBetween: 18 },
  640: { slidesPerView: 2, spaceBetween: 18 },
  768: { slidesPerView: 2, spaceBetween: 18 },
  1024: { slidesPerView: 3, spaceBetween: 18 },
  1440: { slidesPerView: 4, spaceBetween: 18 },
});
expect(mockCarouselShell.mock.calls.at(-1)[0].slidesPerView).toBe(1);
```

Change the `item-card` mock in that test to capture props, then add this forwarding assertion:

```jsx
const mockItemCard = jest.fn(({ title }) => <article>{title}</article>);

jest.mock('../item-card', () => ({
  __esModule: true,
  default: (props) => mockItemCard(props),
}));

test('forwards the complete mapped product contract to the shared card', () => {
  const product = {
    ...items[0],
    priceValue: 130,
    priceCurrency: 'USD',
    ratingValue: 4.8,
    reviewCountValue: 210,
    attributes: [{ slug: 'duration', name: 'Duration', attribute_value: '2 Hours' }],
    wishlistItem: { item_type: 'activity', item_id: 1 },
  };
  render(<ProductSliderSection items={[product]} title="Top activities" navigationId="top-activities" />);

  const slide = mockCarouselShell.mock.calls.at(-1)[0].renderSlide(product);
  render(slide);

  expect(mockItemCard).toHaveBeenCalledWith(expect.objectContaining(product));
});
```

Add this regression to `CarouselShell.test.jsx` so non-product carousels retain their peek while product sections can opt out:

```jsx
test('accepts an explicit base slide count without changing the default', () => {
  const { rerender } = render(<CarouselShell items={[{ id: 'a', title: 'A' }]} renderSlide={(item) => <article>{item.title}</article>} />);
  expect(latestSwiperProps.slidesPerView).toBe(1.08);

  rerender(<CarouselShell items={[{ id: 'a', title: 'A' }]} slidesPerView={1} renderSlide={(item) => <article>{item.title}</article>} />);
  expect(latestSwiperProps.slidesPerView).toBe(1);
});
```

Change the city-tour expectation in `SharedToursSection.test.jsx` to:

```jsx
it('uses four columns, ten items per page, and API-driven pagination for city tours', async () => {
  axios.get.mockResolvedValue(paginatedItineraryResponse(10, 3));
  render(<SharedToursSection scope="city" slug="dubai" title="Dubai" />);
  await flushFetch();

  expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('page=1&per_page=10'));
  expect(screen.getByRole('link', { name: 'Dubai itinerary 1' }).parentElement).toHaveClass('xl:grid-cols-4');
  expect(screen.getByRole('link', { name: 'Dubai itinerary 1' }).parentElement).not.toHaveClass('xl:grid-cols-5');
});
```

- [ ] **Step 2: Run the section tests and confirm the old five-card/five-column contracts fail**

Run:

```bash
npx jest src/app/components/ui/__tests__/ProductSliderSection.test.jsx src/app/components/Pages/FRONT_END/shared/__tests__/SharedToursSection.test.jsx --runInBand
```

Expected: FAIL on the base/768/1024/1440 carousel counts and city-tour grid class.

- [ ] **Step 3: Add the product-specific base slide count**

Replace the current `CarouselShell` function signature with this exact signature:

```jsx
export default function CarouselShell({ items = [], navigationPrefix, renderSlide, breakpoints, slidesPerView = 1.08, className = '', slideClassName = '', showMobilePagination = false, entrance, observeReveal = true }) {
```

Replace only the hardcoded Swiper line:

```jsx
slidesPerView={slidesPerView}
```

Pass the product-specific base from `ProductSliderSection`:

```jsx
<CarouselShell
  items={items}
  slidesPerView={1}
  navigationPrefix={headerAction === 'navigation' ? navigationId : undefined}
  breakpoints={PRODUCT_BREAKPOINTS}
  slideClassName="!h-auto"
  showMobilePagination
  entrance={usesStaggeredEntrance ? carouselEntrance : undefined}
  observeReveal={usesStaggeredEntrance ? false : undefined}
  renderSlide={(card) => <ItemCard {...card} variant="full" />}
/>
```

- [ ] **Step 4: Adopt the canonical carousel breakpoints**

Replace `PRODUCT_BREAKPOINTS` in `ProductSliderSection.jsx` with:

```js
const PRODUCT_BREAKPOINTS = {
  450: { slidesPerView: 1, spaceBetween: 18 },
  640: { slidesPerView: 2, spaceBetween: 18 },
  768: { slidesPerView: 2, spaceBetween: 18 },
  1024: { slidesPerView: 3, spaceBetween: 18 },
  1440: { slidesPerView: 4, spaceBetween: 18 },
};
```

- [ ] **Step 5: Forward the complete mapper result in filtered grids**

Replace the manually enumerated props in `SharedFilterSection.jsx` with:

```jsx
<ItemCard
  key={`${product.item_type}-${card.id}`}
  {...card}
  variant="full"
  className="weelp-fade-up"
  style={{
    '--weelp-motion-duration': '260ms',
    '--weelp-motion-delay': i < 8 ? `${i * 50}ms` : '0ms',
  }}
/>
```

Replace the manually enumerated props in `SharedToursSection.jsx` with:

```jsx
<ItemCard key={card.id || `${card.href}-${index}`} {...card} variant="full" />
```

Change its grid to:

```jsx
className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-[18px] xl:grid-cols-4`}
```

In both `SharedFilterSection.test.jsx` and `SharedToursSection.test.jsx`, replace the `item-card` mock with a `mockItemCard` capture and make each mapper mock return representative identity, schema, attribute, and wishlist fields. Add this assertion to one rendered-product test in each file:

```jsx
expect(mockItemCard).toHaveBeenCalledWith(
  expect.objectContaining({
    hasValidIdentity: true,
    hasRealTitle: true,
    hasRealImage: true,
    priceValue: 130,
    priceCurrency: 'USD',
    attributes: [{ slug: 'duration', name: 'Duration', attribute_value: '2 Hours' }],
    wishlistItem: expect.objectContaining({ item_type: expect.any(String), item_id: expect.any(Number) }),
  }),
);
```

- [ ] **Step 6: Run every shared-product surface test affected by prop or density changes**

Run:

```bash
npx jest \
  src/app/components/ui/__tests__/ProductSliderSection.test.jsx \
  src/app/components/ui/__tests__/CarouselShell.test.jsx \
  src/app/components/Pages/FRONT_END/shared/__tests__/SharedFilterSection.test.jsx \
  src/app/components/Pages/FRONT_END/shared/__tests__/SharedToursSection.test.jsx \
  src/app/components/Pages/FRONT_END/city/__tests__/CityItemsListing.test.jsx \
  --runInBand
```

Expected: PASS, with no full product grid using `xl:grid-cols-5`.

- [ ] **Step 7: Run the mandatory Task 4 batch gate**

```bash
npm run type-check
npm run lint
```

Apply `error-handling-patterns` to the filtered and paginated render paths. In the visible browser, smoke-test one product carousel and one affected filtered grid.

### Task 5: Remove the `/home-gold` duplicate card path

**Files:**
- Modify: `src/app/(frontend)/home-gold/page.js`
- Modify: `src/app/(frontend)/home-gold/__tests__/page.test.jsx`
- Delete: `src/app/(frontend)/home-gold/GoldActivityCard.jsx`
- Delete: `src/app/(frontend)/home-gold/GoldActivityWishlistButton.jsx`
- Delete: `src/app/(frontend)/home-gold/GoldTopActivitiesSection.jsx`
- Delete: `src/app/(frontend)/home-gold/__tests__/GoldActivityCard.test.jsx`
- Delete: `src/app/(frontend)/home-gold/__tests__/GoldActivityWishlistButton.test.jsx`
- Delete: `src/app/(frontend)/home-gold/__tests__/GoldTopActivitiesSection.test.jsx`

- [ ] **Step 1: Change the route test to demand the shared section**

Add `ProductSliderSection` to the names recognized by the `next/dynamic` mock, remove the `GoldTopActivitiesSection` import/mock, and replace the route-local section test with:

```jsx
it('renders featured activities through the shared canonical product section', async () => {
  const activities = [{ id: 1, item_type: 'activity', name: 'Desert safari', slug: 'desert-safari', city_slug: 'dubai' }];
  getAllFeaturedActivities.mockResolvedValue(activities);

  const children = await getGoldChildren();

  expect(children[1].type.sectionName).toBe('ProductSliderSection');
  expect(children[1].props).toMatchObject({
    title: 'Top activities',
    navigationId: 'top-activities',
    className: 'pb-12 md:pb-16 lg:pb-24',
  });
  expect(children[1].props.carouselEntrance).toBeUndefined();
  expect(children[1].props.items[0]).toMatchObject({
    id: 1,
    title: 'Desert safari',
    wishlistItem: {
      item_type: 'activity',
      item_id: 1,
      title: 'Desert safari',
      slug: 'desert-safari',
      city_slug: 'dubai',
    },
  });
});
```

- [ ] **Step 2: Run the route test and confirm it still sees the gold-only section**

Run:

```bash
npx jest 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' --runInBand
```

Expected: FAIL because the page still imports and renders `GoldTopActivitiesSection`.

- [ ] **Step 3: Render the shared section from `/home-gold`**

Replace the gold-only import with:

```js
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
```

Add the shared dynamic import beside the existing dynamic sections:

```js
const ProductSliderSection = dynamic(() => import('@/app/components/ui/ProductSliderSection'));
```

Replace the featured-activities branch with:

```jsx
{featuredActivities.length > 0 ? (
  <ProductSliderSection
    items={featuredActivities.map((activity) => mapProductToItemCard(activity))}
    title="Top activities"
    navigationId="top-activities"
    className="pb-12 md:pb-16 lg:pb-24"
  />
) : (
  <SectionFallback
    eyebrow="Top activities"
    message="The concierge is between picks right now. Browse the Dubai catalog while we line up the next set."
    pivotHref="/cities/dubai"
    pivotLabel="Browse Dubai experiences"
  />
)}
```

- [ ] **Step 4: Run both homepage composition tests**

Before running them, extend the existing main-home Top Activities test with:

```jsx
expect(activitiesSection.props.items[0]).toMatchObject({
  productId: 1,
  itemType: 'activity',
  slug: 'desert-safari',
  citySlug: 'dubai',
  hasValidIdentity: true,
  wishlistItem: {
    item_type: 'activity',
    item_id: 1,
    title: 'Desert safari',
    slug: 'desert-safari',
    city_slug: 'dubai',
    image_url: '/assets/Card.webp',
    price: null,
    currency: null,
  },
});
```

Run:

```bash
npx jest 'src/app/(frontend)/__tests__/page.test.jsx' 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' --runInBand
```

Expected: PASS. `/` keeps `carouselEntrance="stagger-right"`; `/home-gold` deliberately omits it and retains its existing non-card section options.

- [ ] **Step 5: Delete the route-local implementation and superseded tests**

Delete the six `GoldActivity*` / `GoldTopActivities*` files listed above. Verify there are no remaining references:

```bash
rg -n "GoldActivityCard|GoldActivityWishlistButton|GoldTopActivitiesSection" src
```

Expected: no output.

- [ ] **Step 6: Run shared replacement coverage after deletion**

Run:

```bash
npx jest \
  'src/app/(frontend)/__tests__/page.test.jsx' \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  src/app/components/ui/__tests__/ItemCard.test.jsx \
  src/app/components/Wishlist/__tests__/ItemCardWishlistButton.test.jsx \
  --runInBand
```

Expected: PASS.

- [ ] **Step 7: Run the mandatory Task 5 batch gate**

```bash
npm run type-check
npm run lint
```

Apply `error-handling-patterns` to the `/home-gold` loading and fallback paths. In the visible browser, smoke-test `/home-gold` in light and dark mode and confirm the route still renders after deleting its local card files.

### Task 6: Lock theme isolation and run the code-quality gate

**Files:**
- Test: `src/app/__tests__/deepForestTheme.test.js`
- Test: all files changed in Tasks 1–5

- [ ] **Step 1: Add the shared-card token source contract**

Add this source contract to the existing card-token test in `deepForestTheme.test.js`; do not add or change CSS:

```js
const itemCardSource = readSource('src/app/components/ui/item-card.jsx');
expect(itemCardSource).toContain('border-[var(--weelp-card-border)]');
expect(itemCardSource).toContain('bg-background');
expect(itemCardSource).not.toContain('oklch(0.72_0.055_75/0.45)');
expect(itemCardSource).not.toContain('oklch(0.96_0.02_80)');
```

- [ ] **Step 2: Run focused behavioral and theme tests**

Run:

```bash
npx jest \
  src/lib/__tests__/mapProductToItemCard.test.js \
  src/app/components/Wishlist/__tests__/ItemCardWishlistButton.test.jsx \
  src/app/components/ui/__tests__/ItemCard.test.jsx \
  src/app/components/ui/__tests__/BlogSection.test.jsx \
  src/app/components/ui/__tests__/ProductSliderSection.test.jsx \
  src/app/components/ui/__tests__/CarouselShell.test.jsx \
  src/app/components/Pages/FRONT_END/shared/__tests__/SharedFilterSection.test.jsx \
  src/app/components/Pages/FRONT_END/shared/__tests__/SharedToursSection.test.jsx \
  src/app/components/Pages/FRONT_END/city/__tests__/CityItemsListing.test.jsx \
  'src/app/(frontend)/__tests__/page.test.jsx' \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  src/app/__tests__/deepForestTheme.test.js \
  --runInBand
```

Expected: PASS.

- [ ] **Step 3: Apply the mandated error-handling review**

Read the final mapper, card, and wishlist component against the `error-handling-patterns` skill. Confirm:

- mapper failures degrade to absent optional fields;
- the card never renders invalid Offer data;
- wishlist requests have one pending guard and a `finally` reset;
- guest post-login failure resolves through the existing toast path;
- wishlist failure cannot block card navigation.

Make only findings-driven changes, then rerun the focused tests from Step 2.

- [ ] **Step 4: Run type checking and linting**

Run:

```bash
npm run type-check
npm run lint
```

Expected: both exit 0 with no warnings or new dark-mode findings.

- [ ] **Step 5: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js build completes successfully and generates the public routes.

- [ ] **Step 6: Run the mandatory Task 6 browser smoke check**

Refresh `/` and `/home-gold` in the named visible browser. Confirm the main route retains its standard card border/background and dark `/home-gold` retains only its route-scoped gold border.


### Task 7: Verify the canonical card in the visible browser

**Files:**
- No production file changes expected.

- [ ] **Step 1: Confirm the pre-opened visible localhost session is still active**

The frontend and required headed browser were started before Task 1. Reuse that same session and confirm its current URL:

```bash
agent-browser --session weelp-visible get url
```

If the dev server or named browser has stopped, restart only the missing process and reopen `http://localhost:3000/` with `agent-browser --session weelp-visible --headed`; if Chromium requires the container flag, use `--args "--no-sandbox"`.

- [ ] **Step 2: Verify main homepage and `/home-gold` theme boundaries**

At 1440×900, 768×900, and 390×844:

- `/` uses the canonical card with the standard `--weelp-card-border` value in light and dark themes;
- `/home-gold` uses the same card markup;
- dark `/home-gold` resolves the border to the gold route token;
- light `/home-gold` has no tinted content panel and matches the normal page/card background;
- no route outside `/home-gold` receives a gold border;
- the mobile card is approximately 10–15% shorter than the 435px baseline without clipped text or controls;
- no horizontal overflow appears during carousel entrance or interaction.

- [ ] **Step 3: Verify semantic interaction**

On a card with a valid wishlist identity:

- Tab reaches the card link and wishlist button as separate focus stops;
- Enter on the link navigates to the full city-aware URL;
- activating the heart does not navigate;
- a guest receives the auth modal;
- a signed-in user receives save/remove feedback;
- hovering the wishlist does not rotate the Explore arrow;
- the visible heart remains 32px while the button hit target measures at least 44×44px.

- [ ] **Step 4: Verify representative grids**

Open one city listing plus another full-product surface such as `/special` or Similar Experiences. Confirm full cards match the homepage, grids never exceed four columns, optional content collapses without blank blocks, and compact blog/AI cards remain unchanged.

- [ ] **Step 5: Inspect rendered structured data**

Use the visible browser session's DOM inspection to confirm:

- Product `name`, `image`, and URL match visible content;
- Offer exists only for numeric price plus real currency;
- no hardcoded `USD`, `InStock`, `40% OFF`, or derived original price appears for products lacking those API values;
- AggregateRating contains raw numeric values rather than display abbreviations;
- wishlist buttons are not descendants of anchors.

### Task 8: Review, simplify, document, and ship

**Files:**
- Modify: `/run/media/ashish-khawla/Website data/Fanatic Developement/weelp/Reports/daily-work-report.md`
- Modify: only frontend files named in concrete code-review or simplify findings.

- [ ] **Step 1: Run the mandatory code-review gate**

Dispatch the `code-reviewer` agent against the complete diff and approved design. Require findings to include severity, exact file/line, and a concrete fix. Address critical and high-confidence correctness/accessibility issues, rerun affected tests, then re-review until no blocking findings remain.

- [ ] **Step 2: Run the mandatory simplify gate**

Invoke the available simplify workflow on the reviewed diff. Remove duplication and confusing branches only when behavior and tests remain unchanged. Rerun focused tests after any simplification.

- [ ] **Step 3: Run final verification from a clean candidate state**

Format the exact changed frontend files first so the pre-commit hook cannot introduce unreviewed rewrites:

```bash
npx prettier --write \
  src/lib/mapProductToItemCard.js \
  src/lib/__tests__/mapProductToItemCard.test.js \
  src/app/components/Wishlist/ItemCardWishlistButton.jsx \
  src/app/components/Wishlist/__tests__/ItemCardWishlistButton.test.jsx \
  src/app/components/ui/item-card.jsx \
  src/app/components/ui/__tests__/ItemCard.test.jsx \
  src/app/components/ui/CarouselShell.jsx \
  src/app/components/ui/__tests__/CarouselShell.test.jsx \
  src/app/components/ui/ProductSliderSection.jsx \
  src/app/components/ui/__tests__/ProductSliderSection.test.jsx \
  src/app/components/Pages/FRONT_END/shared/SharedFilterSection.jsx \
  src/app/components/Pages/FRONT_END/shared/__tests__/SharedFilterSection.test.jsx \
  src/app/components/Pages/FRONT_END/shared/SharedToursSection.jsx \
  src/app/components/Pages/FRONT_END/shared/__tests__/SharedToursSection.test.jsx \
  'src/app/(frontend)/__tests__/page.test.jsx' \
  'src/app/(frontend)/home-gold/page.js' \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  src/app/__tests__/deepForestTheme.test.js
```

Run:

```bash
git diff --check
npm run type-check
npm run lint
npm run build
```

Run the focused Jest command from Task 6 again. Expected: every command exits 0.

- [ ] **Step 4: Update the daily report**

Move the August 24 upcoming item into a new August 26 completed-work entry that records:

- the shared canonical-card migration;
- removal of fake discount/original-price claims;
- sibling wishlist semantics and 44px target;
- neutral background plus `/home-gold`-only gold border behavior;
- trustworthy Product/Offer/Rating markup;
- responsive grid/card verification;
- focused tests, type check, lint, build, and visible browser results.

Replace Upcoming Work only with genuinely remaining work discovered during verification; do not leave the completed canonical-card task queued.

- [ ] **Step 5: Commit final reviewed code and report updates**

From `frontend`, inspect status before staging, then stage only the planned frontend paths (including deletions) and commit:

```bash
git status --short
git add \
  src/lib/mapProductToItemCard.js \
  src/lib/__tests__/mapProductToItemCard.test.js \
  src/app/components/Wishlist/ItemCardWishlistButton.jsx \
  src/app/components/Wishlist/__tests__/ItemCardWishlistButton.test.jsx \
  src/app/components/ui/item-card.jsx \
  src/app/components/ui/__tests__/ItemCard.test.jsx \
  src/app/components/ui/CarouselShell.jsx \
  src/app/components/ui/__tests__/CarouselShell.test.jsx \
  src/app/components/ui/ProductSliderSection.jsx \
  src/app/components/ui/__tests__/ProductSliderSection.test.jsx \
  src/app/components/Pages/FRONT_END/shared/SharedFilterSection.jsx \
  src/app/components/Pages/FRONT_END/shared/__tests__/SharedFilterSection.test.jsx \
  src/app/components/Pages/FRONT_END/shared/SharedToursSection.jsx \
  src/app/components/Pages/FRONT_END/shared/__tests__/SharedToursSection.test.jsx \
  'src/app/(frontend)/__tests__/page.test.jsx' \
  'src/app/(frontend)/home-gold/page.js' \
  'src/app/(frontend)/home-gold/__tests__/page.test.jsx' \
  'src/app/(frontend)/home-gold/GoldActivityCard.jsx' \
  'src/app/(frontend)/home-gold/GoldActivityWishlistButton.jsx' \
  'src/app/(frontend)/home-gold/GoldTopActivitiesSection.jsx' \
  'src/app/(frontend)/home-gold/__tests__/GoldActivityCard.test.jsx' \
  'src/app/(frontend)/home-gold/__tests__/GoldActivityWishlistButton.test.jsx' \
  'src/app/(frontend)/home-gold/__tests__/GoldTopActivitiesSection.test.jsx' \
  src/app/__tests__/deepForestTheme.test.js
git commit -m "feat(cards): standardize product cards sitewide"
```

Do not stage any path not listed above. Do not add the workspace report to the frontend repository because it lives outside that git root.

- [ ] **Step 6: Push frontend `main` and verify remote parity**

Run:

```bash
git branch --show-current
git push origin main
git status --short
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

Expected: branch is `main`, push succeeds, worktree is clean, and local HEAD equals remote `refs/heads/main`.

- [ ] **Step 7: Leave the visible browser on the verified local result**

Return the named headed session to the most representative verified page and viewport so the user can inspect the finished canonical card directly.
