# Home Gold Top Activities Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild only the `/home-gold` Top Activities cards to match `image copy 5.png` in light and dark mode without changing shared card or slider modules.

**Architecture:** Replace `/home-gold`'s homepage re-export with a route-local page composition that preserves the canonical homepage data sources and all non-target sections. A route-local carousel section renders a route-local image-overlay card and wishlist control while reusing stable lower-level utilities such as `CarouselShell`, `SectionHeader`, `Reveal`, `mapProductToItemCard`, and existing wishlist hooks.

**Tech Stack:** Next.js 16 App Router, React 19, JavaScript/JSX, Tailwind CSS, Swiper, NextAuth, SWR wishlist hooks, Jest, Testing Library, agent-browser.

---

## File structure

- Create `src/app/(frontend)/home-gold/GoldActivityWishlistButton.jsx`: icon-only wishlist behavior scoped to the new card.
- Create `src/app/(frontend)/home-gold/GoldActivityCard.jsx`: reference-shaped image card and accessible detail link.
- Create `src/app/(frontend)/home-gold/GoldTopActivitiesSection.jsx`: route-local section header, carousel, and raw-activity mapping.
- Create route-local tests beside the components.
- Modify `src/app/(frontend)/home-gold/page.js`: preserve homepage orchestration but substitute only the first product section.
- Modify `src/app/(frontend)/home-gold/__tests__/page.test.jsx`: prove route isolation and unchanged cache behavior.
- Do not modify `src/app/(frontend)/page.js`, `src/app/components/ui/item-card.jsx`, or `src/app/components/ui/ProductSliderSection.jsx`.

### Task 1: Route-local wishlist control

**Files:**
- Create: `src/app/(frontend)/home-gold/GoldActivityWishlistButton.jsx`
- Create: `src/app/(frontend)/home-gold/__tests__/GoldActivityWishlistButton.test.jsx`

- [ ] **Step 1: Write the failing wishlist-control test**

Mock `useSession`, `useWishlistItems`, `useAuthModalStore`, and `useToast`. Render the control with an activity payload and assert that it is icon-only, exposes `aria-pressed`, opens authentication for a guest, invokes `addItem` for an authenticated customer with the existing `Saved to wishlist` confirmation, invokes `removeItemByIdentity` for a saved item with the existing `Removed from wishlist` confirmation, stays disabled while session or wishlist data is loading, hides for unsupported authenticated roles, and reports API errors through the existing toast pattern.

```jsx
render(<GoldActivityWishlistButton item={activity} />);
const button = screen.getByRole('button', { name: /save desert safari adventure to wishlist/i });
expect(button).toHaveAttribute('aria-pressed', 'false');
expect(button).toHaveClass('rounded-full');
expect(button).not.toHaveTextContent('Save to Wishlist');
fireEvent.click(button);
expect(openAuthModal).toHaveBeenCalled();
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npx jest 'src/app/(frontend)/home-gold/__tests__/GoldActivityWishlistButton.test.jsx' --runInBand
```

Expected: FAIL because `GoldActivityWishlistButton.jsx` does not exist.

- [ ] **Step 3: Implement the minimal icon-only control**

Create a client component that normalizes the activity with `normalizeWishlistPayload`, enables `useWishlistItems` only for customer sessions, reuses the existing guest auth callback, applies optimistic add/remove through the existing hook, and renders only a `Heart` icon.

```jsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';
import { useWishlistItems } from '@/hooks/api/customer/wishlist';
import { useToast } from '@/hooks/use-toast';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import { normalizeWishlistPayload } from '@/lib/wishlist/normalizeWishlistItem';

export default function GoldActivityWishlistButton({ item }) {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModalStore();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const payload = useMemo(() => normalizeWishlistPayload(item), [item]);
  const isCustomer = status === 'authenticated' && session?.user?.role === 'customer';
  const { items, isLoading, addItem, removeItemByIdentity } = useWishlistItems({ enabled: isCustomer });
  const isSaved = Boolean(payload && items.some((entry) => String(entry.item_type) === payload.item_type && String(entry.item_id) === String(payload.item_id)));
  const isDisabled = !payload || status === 'loading' || isPending || (isCustomer && isLoading);

  const update = useCallback(async () => {
    if (!payload || isPending) return;
    setIsPending(true);
    try {
      if (isSaved) {
        await removeItemByIdentity(payload.item_type, payload.item_id);
        toast({ title: 'Removed from wishlist', description: `${payload.title || 'This item'} has been removed from your wishlist.` });
      } else {
        await addItem(payload);
        toast({ title: 'Saved to wishlist', description: `${payload.title || 'This item'} has been added to your wishlist.` });
      }
    } catch (error) {
      toast({ title: 'Unable to update wishlist', description: error?.response?.data?.message || error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setIsPending(false);
    }
  }, [addItem, isPending, isSaved, payload, removeItemByIdentity, toast]);

  if (status === 'authenticated' && !isCustomer) return null;

  const handleClick = () => {
    if (isDisabled) return;
    if (!session?.user) return openAuthModal({ onSuccess: update });
    void update();
  };

  return (
    <button type="button" aria-label={`${isSaved ? 'Remove' : 'Save'} ${payload?.title || 'activity'} ${isSaved ? 'from' : 'to'} wishlist`} aria-pressed={isSaved} onClick={handleClick} disabled={isDisabled} className="grid size-10 place-items-center rounded-full border border-white/45 bg-[oklch(0.97_0.015_80/0.88)] text-[oklch(0.55_0.2_28)] shadow-sm backdrop-blur-md transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/50 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none motion-reduce:hover:scale-100 dark:border-[oklch(0.72_0.08_80/0.55)] dark:bg-[oklch(0.2_0.035_155/0.9)]">
      <Heart aria-hidden="true" className={`size-[18px] ${isSaved ? 'fill-current' : ''}`} />
    </button>
  );
}
```

- [ ] **Step 4: Run the wishlist-control test and verify GREEN**

Run the Step 2 command. Expected: PASS with no warnings.

### Task 2: Reference-shaped activity card

**Files:**
- Create: `src/app/(frontend)/home-gold/GoldActivityCard.jsx`
- Create: `src/app/(frontend)/home-gold/__tests__/GoldActivityCard.test.jsx`

- [ ] **Step 1: Write the failing card test**

Mock `next/image` and the route-local wishlist control. Assert the city-aware link, full-bleed image, discount, rating/category row, title, current and original prices, `per person`, Explore affordance, and route-local test identifier. Also assert that the wishlist button has no anchor ancestor. In a second render without rating or review data, assert that the star, review parentheses, and separator are omitted while the `Activity` category remains.

```jsx
render(<GoldActivityCard item={mappedItem} wishlistItem={rawActivity} />);
expect(screen.getByTestId('home-gold-activity-card')).toBeInTheDocument();
expect(screen.getByRole('link', { name: /explore desert safari adventure/i })).toHaveAttribute('href', '/cities/dubai/activities/desert-safari');
expect(screen.getByText('40% OFF')).toBeVisible();
expect(screen.getByText('$130.00')).toBeVisible();
expect(screen.getByText('$216.00')).toHaveClass('line-through');
expect(screen.getByText('per person')).toBeVisible();
expect(screen.getByRole('button', { name: /wishlist/i }).closest('a')).toBeNull();
```

- [ ] **Step 2: Run the test and verify RED**

```bash
npx jest 'src/app/(frontend)/home-gold/__tests__/GoldActivityCard.test.jsx' --runInBand
```

Expected: FAIL because `GoldActivityCard.jsx` does not exist.

- [ ] **Step 3: Implement the card hierarchy from the supplied image**

Use an `article` outer frame so the wishlist button is a sibling of, rather than nested within, the required `NavigationLink`. The detail link contains an absolute full-card `Image`, subtle lower image shade, and inset bottom information panel. A pointer-transparent upper-left control row is also a sibling; only its wishlist wrapper restores pointer events.

```jsx
<article data-testid="home-gold-activity-card" className="group relative min-h-[300px] overflow-hidden rounded-[22px] border border-[oklch(0.72_0.055_75/0.45)] bg-[oklch(0.96_0.02_80)] shadow-[0_18px_35px_rgba(76,53,31,0.16)] dark:border-[oklch(0.7_0.075_78/0.48)] dark:bg-[oklch(0.17_0.03_155)] dark:shadow-[0_18px_38px_rgba(0,0,0,0.42)]">
  <NavigationLink href={item.href} aria-label={`Explore ${item.title}`} className="block min-h-[300px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-weelp-sage-deep/60">
    <Image fill src={item.image} alt={item.title} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 33vw, (max-width: 1440px) 25vw, 20vw" className="object-cover transition-transform duration-500 ease-[var(--weelp-ease-out)] group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
    <div className="absolute inset-x-3 bottom-3 rounded-[16px] border border-white/35 bg-[oklch(0.28_0.035_50/0.72)] p-3.5 text-[oklch(0.97_0.01_80)] shadow-[0_10px_24px_rgba(34,23,15,0.3)] backdrop-blur-md dark:border-[oklch(0.78_0.06_80/0.38)] dark:bg-[oklch(0.15_0.035_155/0.82)]">
      <div className="flex min-w-0 items-center gap-1.5 text-xs">
        {item.rating && <><span className="text-[oklch(0.8_0.13_80)]">★</span><span>{item.rating}</span>{item.reviewCount && <span>({item.reviewCount})</span>}</>}
        {item.rating && item.category && <span aria-hidden="true">·</span>}
        <span className="truncate">{item.category || 'Activity'}</span>
      </div>
      <h3 className="mt-1 line-clamp-1 text-lg font-semibold leading-tight">{item.title}</h3>
      <div className="mt-3 flex items-end justify-between gap-2"><div className="min-w-0 text-xs"><span className="text-white/75">From </span><strong className="text-base">{item.price}</strong>{item.originalPrice && <span className="ml-1.5 line-through text-white/55">{item.originalPrice}</span>}<span className="ml-1 text-white/65">per person</span></div><span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-transparent bg-[oklch(0.96_0.015_80)] px-2.5 py-1.5 font-semibold text-[oklch(0.3_0.025_50)] transition-colors group-hover:bg-[oklch(0.91_0.035_80)] dark:border-[oklch(0.72_0.08_80/0.6)] dark:bg-[oklch(0.72_0.08_80)] dark:text-[oklch(0.17_0.03_155)] dark:group-hover:bg-[oklch(0.78_0.09_80)]">Explore <span aria-hidden="true">→</span></span></div>
    </div>
  </NavigationLink>
  <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2">
    <span className="rounded-lg bg-weelp-discount px-3 py-2 text-xs font-bold text-white">{item.discount || '40% OFF'}</span>
    <div className="pointer-events-auto"><GoldActivityWishlistButton item={wishlistItem} /></div>
  </div>
</article>
```

- [ ] **Step 4: Run the card test and verify GREEN**

Run the Step 2 command. Expected: PASS.

### Task 3: Route-local Top Activities carousel

**Files:**
- Create: `src/app/(frontend)/home-gold/GoldTopActivitiesSection.jsx`
- Create: `src/app/(frontend)/home-gold/__tests__/GoldTopActivitiesSection.test.jsx`

- [ ] **Step 1: Write the failing section test**

Mock `CarouselShell` to call `renderSlide`, then assert that raw activities are mapped into `GoldActivityCard` props, section navigation labels remain `Previous Top activities item` and `Next Top activities item`, and an empty list renders nothing.

```jsx
const { rerender } = render(<GoldTopActivitiesSection activities={[rawActivity]} />);
expect(screen.getByRole('heading', { name: 'Top activities' })).toBeVisible();
expect(screen.getByTestId('home-gold-activity-card')).toBeVisible();
expect(screen.getByRole('button', { name: 'Previous Top activities item' })).toBeVisible();
rerender(<GoldTopActivitiesSection activities={[]} />);
expect(screen.queryByRole('heading', { name: 'Top activities' })).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the test and verify RED**

```bash
npx jest 'src/app/(frontend)/home-gold/__tests__/GoldTopActivitiesSection.test.jsx' --runInBand
```

Expected: FAIL because the section does not exist.

- [ ] **Step 3: Implement the local section without changing carousel density**

Use the same `PRODUCT_BREAKPOINTS`, section spacing, `SectionHeader`, slider navigation classes, and `CarouselShell` configuration as the canonical section. Map each raw activity with `mapProductToItemCard(activity)` and pass the raw activity separately as `wishlistItem`.

```jsx
const cards = activities.map((activity) => ({
  ...mapProductToItemCard(activity),
  wishlistItem: activity,
}));

<CarouselShell
  items={cards}
  navigationPrefix="top-activities"
  breakpoints={PRODUCT_BREAKPOINTS}
  slideClassName="!h-auto"
  showMobilePagination
  renderSlide={(card) => <GoldActivityCard item={card} wishlistItem={card.wishlistItem} />}
/>
```

- [ ] **Step 4: Run the section and card suites and verify GREEN**

```bash
npx jest 'src/app/(frontend)/home-gold/__tests__/GoldActivityWishlistButton.test.jsx' 'src/app/(frontend)/home-gold/__tests__/GoldActivityCard.test.jsx' 'src/app/(frontend)/home-gold/__tests__/GoldTopActivitiesSection.test.jsx' --runInBand
```

Expected: all route-local component suites PASS.

### Task 4: Wire only `/home-gold`

**Files:**
- Modify: `src/app/(frontend)/home-gold/page.js`
- Modify: `src/app/(frontend)/home-gold/__tests__/page.test.jsx`

- [ ] **Step 1: Replace the re-export assertion with a failing isolation test**

Mock the homepage data services, route-local Top Activities section, and every non-target child section. Call `GoldHomePage()` and assert the route is no longer the same function as `HomePage`, `revalidate` remains `60`, only the route-local section receives featured activities, the remaining child sequence is unchanged, destinations retain `cardTextTone="theme"` and section spacing, and blogs retain `navigationId="guide-blog"`.

```jsx
expect(GoldHomePage).not.toBe(HomePage);
expect(goldRevalidate).toBe(60);
const ui = await GoldHomePage();
render(ui);
expect(screen.getByTestId('gold-top-activities-stub')).toHaveTextContent('Desert Safari Adventure');
expect(screen.getAllByTestId(/home-section-/).map((node) => node.dataset.testid)).toEqual([
  'home-section-hero',
  'home-section-gold-top-activities',
  'home-section-destinations',
  'home-section-testimonials',
  'home-section-wanderers',
  'home-section-ai',
  'home-section-blog',
  'home-section-recommendations',
]);
expect(BrowseDestinationsSection).toHaveBeenCalledWith(expect.objectContaining({ cardTextTone: 'theme', className: 'pb-12 md:pb-16 lg:pb-24' }), undefined);
expect(BlogSection).toHaveBeenCalledWith(expect.objectContaining({ navigationId: 'guide-blog', className: 'pb-12 md:pb-16 lg:pb-24' }), undefined);
```

- [ ] **Step 2: Run the page test and verify RED**

```bash
npx jest 'src/app/(frontend)/home-gold/__tests__/page.test.jsx' --runInBand
```

Expected: FAIL because `/home-gold` still re-exports the canonical homepage.

- [ ] **Step 3: Implement the isolated page composition**

Use the canonical page's service calls and non-target section composition in `home-gold/page.js`, retaining `revalidate = 60`, the same loading fallbacks, and the same section order. The target branch is the only substitution:

```jsx
<ProductSliderSection items={featuredActivities.map((activity) => mapProductToItemCard(activity))} title="Top activities" navigationId="top-activities" />
```

with:

```jsx
<GoldTopActivitiesSection activities={featuredActivities} />
```

Do not import or edit `ProductSliderSection` or `ItemCard` in the route-local implementation.

The resulting page module has these imports and render order:

```jsx
export const revalidate = 60;

import dynamic from 'next/dynamic';
import HeroSection from '../../components/Pages/FRONT_END/home/HeroSection';
import WeelpRecommendations from '@/app/components/Pages/FRONT_END/home/WeelpRecommendations';
import SectionFallback from '@/app/components/ui/SectionFallback';
import GoldTopActivitiesSection from './GoldTopActivitiesSection';
import { getAllFeaturedActivities } from '@/lib/services/activites';
import { getAllFeaturedCities } from '@/lib/services/cities';
import { getPublicReviews } from '@/lib/services/reviews';
import { publicApi } from '@/lib/axiosInstance';

const BrowseDestinationsSection = dynamic(() => import('../../components/Pages/FRONT_END/home/BrowseDestinationsSection'));
const TestimonialSection = dynamic(() => import('../../components/Pages/FRONT_END/Global/TestimonialSection'));
const AiSection = dynamic(() => import('../../components/Pages/FRONT_END/home/AiSection'));
const WanderersBanner = dynamic(() => import('../../components/Pages/FRONT_END/home/WanderersBanner'));
const BlogSection = dynamic(() => import('@/app/components/ui/BlogSection'));

const fetchBlogs = () =>
  publicApi
    .get('/api/blogs?per_page=10', { headers: { Accept: 'application/json' } })
    .then((res) => ({ ok: true, data: Array.isArray(res.data?.data) ? res.data.data : [] }))
    .catch(() => ({ ok: false, data: [] }));

export default async function GoldHomePage() {
  const [activitiesResult, citiesResult, blogsResult, reviewsResult] = await Promise.all([
    getAllFeaturedActivities(),
    getAllFeaturedCities(),
    fetchBlogs(),
    getPublicReviews(),
  ]);
  const activities = Array.isArray(activitiesResult) ? activitiesResult : (activitiesResult?.data ?? []);
  const cities = Array.isArray(citiesResult) ? citiesResult : (citiesResult?.data ?? []);
  const reviews = Array.isArray(reviewsResult?.data) ? reviewsResult.data : [];
  const citiesOk = citiesResult?.success !== false;

  return (
    <>
      <HeroSection />
      {activities.length ? <GoldTopActivitiesSection activities={activities} /> : <SectionFallback eyebrow="Top activities" message="The concierge is between picks right now. Browse the Dubai catalog while we line up the next set." pivotHref="/cities/dubai" pivotLabel="Browse Dubai experiences" />}
      {cities.length ? <BrowseDestinationsSection cities={cities} cardTextTone="theme" className="pb-12 md:pb-16 lg:pb-24" /> : <SectionFallback eyebrow="Top destinations" message={citiesOk ? "We're shaping a fresh set of cities for the season. Jump straight to the catalog in the meantime." : "We couldn't load destinations just now. Refresh, or browse the full catalog."} variant={citiesOk ? 'empty' : 'error'} pivotHref="/cities" pivotLabel="See all cities" />}
      {reviews.length ? <TestimonialSection reviews={reviews} /> : <SectionFallback eyebrow="From travelers" message="The first reviews of this season are still coming in. Yours could be the one we open with." pivotHref="/cities" pivotLabel="Plan a trip worth reviewing" />}
      <WanderersBanner />
      <AiSection />
      {blogsResult.data.length ? <BlogSection blogs={blogsResult.data} navigationId="guide-blog" className="pb-12 md:pb-16 lg:pb-24" /> : <SectionFallback eyebrow="Your guide" message={blogsResult.ok ? 'New stories from our editors are on the way. The catalog has plenty to wander in the meantime.' : "We couldn't pull the editors' latest just now. Refresh to try again."} variant={blogsResult.ok ? 'empty' : 'error'} pivotHref="/blogs" pivotLabel="Read all stories" />}
      <WeelpRecommendations />
    </>
  );
}
```

- [ ] **Step 4: Run the route-local page and component tests**

```bash
npx jest 'src/app/(frontend)/home-gold/__tests__' --runInBand
```

Expected: all `/home-gold` suites PASS.

### Task 5: Required quality and browser verification

**Files:**
- Verify only; adjust route-local files if a failure is directly caused by this change.

- [ ] **Step 1: Run formatting and static checks**

```bash
npx prettier 'src/app/(frontend)/home-gold/**/*.{js,jsx}' --write
npm run type-check
npm run lint
git diff --check
```

Expected: each command exits successfully with no warnings or whitespace errors.

- [ ] **Step 2: Run focused and regression tests**

```bash
npx jest 'src/app/(frontend)/home-gold/__tests__' 'src/app/components/ui/__tests__/ProductSliderSection.test.jsx' --runInBand
```

Expected: all suites PASS, proving the shared slider remains unchanged.

- [ ] **Step 3: Verify the UI in the already-visible headed browser**

Open or refresh `http://localhost:3000/home-gold`, scroll Top Activities into view, and verify:

- card outer radius, full image, badge/wishlist placement, inset information panel, and price/Explore placement match `image copy 5.png`;
- the carousel still shows the existing responsive slide count;
- light and dark modes both retain readable contrast;
- mobile width does not clip the panel or price row;
- keyboard focus is visible;
- wishlist clicks do not navigate, while the card and Explore affordance do;
- `/home` retains the original shared card design.

- [ ] **Step 4: Complete the mandatory review and simplify loop**

Dispatch the code-reviewer agent on the final diff. Resolve critical findings and re-review. Then run the simplify skill over the route-local files, rerun focused tests, type-check, lint, and browser checks.

- [ ] **Step 5: Commit and push verified code to `main`**

```bash
git add 'src/app/(frontend)/home-gold'
git commit -m "feat: redesign home gold activity cards"
git push origin main
```

Expected: the verified route-local implementation is committed and pushed to the frontend repository's `main` branch.
