# Transfer Reviews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed approved transfer reviews, expose them through the existing public featured-review endpoint, and show the complete review section on `/transfers` only when reviews exist.

**Architecture:** Extend the existing featured-review query with a validated `item_type` filter and add an additive, idempotent Laravel seeder that associates reviews with existing transfers and customer users. The existing client-side transfers page will fetch the filtered review list with SWR, conditionally compose the review heading and slider as one unit, and keep the FAQ section independent.

**Tech Stack:** Laravel 12, PHP 8.2, Eloquent, PHPUnit 11, Next.js 16, React 19, SWR, Jest, React Testing Library.

---

## File map

### Backend

- Create `database/seeders/TransferReviewSeeder.php`: deterministic,
  idempotent transfer-review fixtures.
- Modify `database/seeders/DatabaseSeeder.php`: run the new seeder after
  `ReviewSeeder`.
- Modify `app/Http/Controllers/Guest/PublicReviewController.php`: validate and
  apply the optional featured-review item-type filter.
- Modify `tests/Feature/Public/ReviewEndpointTest.php`: cover transfer filtering
  and invalid filters.
- Create `tests/Feature/TransferReviewSeederTest.php`: cover idempotency and
  missing dependencies.

### Frontend

- Modify `src/lib/services/reviews.js`: add the focused transfer review
  fetcher.
- Create `src/lib/services/__tests__/reviews.test.js`: cover the transfer URL
  and error fallback.
- Modify `src/app/(frontend)/transfers/page.js`: fetch reviews and conditionally
  compose the review block.
- Modify `src/app/(frontend)/transfers/__tests__/page.test.jsx`: cover empty and
  populated review states.
- Modify `src/app/components/Faq.jsx`: correct the pathname comparison.
- Create `src/app/components/__tests__/Faq.test.jsx`: cover the independent FAQ
  heading.

## Task 1: Filter the public featured-review endpoint

**Files:**

- Modify: `backend/tests/Feature/Public/ReviewEndpointTest.php`
- Modify: `backend/app/Http/Controllers/Guest/PublicReviewController.php`

- [ ] **Step 1: Write the failing transfer-filter tests**

Add the `Transfer` import:

```php
use App\Models\Transfer;
```

Add these tests to `ReviewEndpointTest`:

```php
public function test_featured_reviews_can_be_filtered_to_transfers(): void
{
    $user = User::factory()->create();
    $transfer = Transfer::factory()->create([
        'name' => 'DXB to Dubai Marina',
        'slug' => 'dxb-to-dubai-marina',
    ]);
    $activity = Activity::factory()->create();

    $transferReview = Review::factory()->create([
        'user_id' => $user->id,
        'item_type' => 'transfer',
        'item_id' => $transfer->id,
        'item_name_snapshot' => $transfer->name,
        'item_slug_snapshot' => $transfer->slug,
        'status' => 'approved',
        'is_featured' => true,
    ]);

    Review::factory()->create([
        'user_id' => $user->id,
        'item_type' => 'activity',
        'item_id' => $activity->id,
        'item_name_snapshot' => $activity->name,
        'item_slug_snapshot' => $activity->slug,
        'status' => 'approved',
        'is_featured' => true,
    ]);

    $pendingTransferReview = Review::factory()->create([
        'user_id' => $user->id,
        'item_type' => 'transfer',
        'item_id' => $transfer->id,
        'item_name_snapshot' => $transfer->name,
        'item_slug_snapshot' => $transfer->slug,
        'status' => 'pending',
        'is_featured' => true,
    ]);

    $response = $this->getJson('/api/reviews/featured-reviews?item_type=transfer');

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('summary.total_reviews', 1)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $transferReview->id)
        ->assertJsonPath('data.0.item.type', 'transfer')
        ->assertJsonPath('data.0.item.slug', 'dxb-to-dubai-marina');

    $this->assertNotContains(
        $pendingTransferReview->id,
        collect($response->json('data'))->pluck('id')->all()
    );
}

public function test_featured_reviews_reject_an_invalid_item_type(): void
{
    $this->getJson('/api/reviews/featured-reviews?item_type=hotel')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('item_type');
}
```

Replace the existing unfiltered `test_featured_reviews()` with:

```php
public function test_featured_reviews(): void
{
    $user = User::factory()->create();
    $activity = Activity::factory()->create();
    $transfer = Transfer::factory()->create();

    Review::factory()->create([
        'user_id' => $user->id,
        'item_type' => 'activity',
        'item_id' => $activity->id,
        'status' => 'approved',
    ]);
    Review::factory()->create([
        'user_id' => $user->id,
        'item_type' => 'transfer',
        'item_id' => $transfer->id,
        'status' => 'approved',
    ]);

    $response = $this->getJson('/api/reviews/featured-reviews');

    $response
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonCount(2, 'data');

    $this->assertEqualsCanonicalizing(
        ['activity', 'transfer'],
        collect($response->json('data'))->pluck('item.type')->all()
    );
}
```

This protects existing calls that do not pass `item_type`.

- [ ] **Step 2: Run the endpoint tests and verify RED**

Run:

```bash
cd backend
php artisan test tests/Feature/Public/ReviewEndpointTest.php --filter='featured_reviews_(can_be_filtered_to_transfers|reject_an_invalid_item_type)'
```

Expected:

- The transfer-filter test returns unrelated reviews or the wrong summary.
- The invalid-filter test returns `200` instead of `422`.

- [ ] **Step 3: Implement the optional filter**

In `getFeaturedReviews()`, extend validation and read the filter:

```php
request()->validate([
    'city' => 'nullable|string|max:255',
    'item_type' => 'nullable|string|in:activity,package,itinerary,transfer',
]);

$citySlug = request()->query('city');
$itemType = request()->query('item_type');
```

After constructing `$query` and before cloning it for the summary, apply:

```php
if ($itemType) {
    $query->where('item_type', $itemType);
}
```

Leave calls without `item_type` unchanged.

Update the method docblock to document:

```php
*   ?item_type=type — optional activity, package, itinerary, or transfer filter
```

`city` and `item_type=transfer` are not combined by the transfers page.
Transfers do not currently have the city-location relationships used by
`applyCityFilter()`, so that combination intentionally returns no results and
is outside this task.

- [ ] **Step 4: Run the endpoint tests and verify GREEN**

Run:

```bash
cd backend
php artisan test tests/Feature/Public/ReviewEndpointTest.php
```

Expected: all `ReviewEndpointTest` tests pass.

## Task 2: Add the idempotent transfer-review seeder

**Files:**

- Create: `backend/tests/Feature/TransferReviewSeederTest.php`
- Create: `backend/database/seeders/TransferReviewSeeder.php`
- Modify: `backend/database/seeders/DatabaseSeeder.php`

- [ ] **Step 1: Write the failing seeder tests**

Create `TransferReviewSeederTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\Review;
use App\Models\Transfer;
use App\Models\User;
use Database\Seeders\TransferReviewSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class TransferReviewSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_fixtures_idempotently_without_overwriting_existing_reviews(): void
    {
        $customers = User::factory()->count(3)->customer()->create();
        $transfers = Transfer::factory()->count(2)->create();
        $genuineReview = Review::create([
            'user_id' => $customers->first()->id,
            'order_id' => null,
            'item_type' => 'transfer',
            'item_id' => $transfers->first()->id,
            'item_name_snapshot' => $transfers->first()->name,
            'item_slug_snapshot' => $transfers->first()->slug,
            'rating' => 2,
            'review_text' => 'This is a genuine existing transfer review.',
            'status' => 'pending',
            'is_featured' => false,
        ]);
        $unrelatedReviews = collect(['activity', 'package', 'itinerary'])
            ->map(fn (string $type, int $index) => $this->createUnrelatedReview(
                $customers->last(),
                $type,
                9000 + $index
            ));

        $this->seed(TransferReviewSeeder::class);

        $fixtures = Review::query()
            ->where('item_type', 'transfer')
            ->whereIn('review_text', TransferReviewSeeder::REVIEW_TEXTS)
            ->orderBy('id')
            ->get();
        $fixtureTimestamps = $fixtures->mapWithKeys(fn (Review $review) => [
            $review->id => [
                $review->created_at?->toISOString(),
                $review->updated_at?->toISOString(),
            ],
        ]);

        $this->assertCount(2, $fixtures);
        $this->assertTrue($fixtures->every(
            fn (Review $review) => $review->status === 'approved'
        ));
        $this->assertTrue($fixtures->contains(
            fn (Review $review) => $review->is_featured
        ));
        $this->assertSame(2, $fixtures->pluck('item_id')->unique()->count());
        $this->assertSame(
            ['2026-07-20 10:00:00', '2026-07-19 10:00:00'],
            $fixtures
                ->pluck('created_at')
                ->map(fn ($timestamp) => $timestamp?->format('Y-m-d H:i:s'))
                ->all()
        );
        $this->assertDatabaseHas('reviews', [
            'id' => $genuineReview->id,
            'review_text' => 'This is a genuine existing transfer review.',
            'rating' => 2,
            'status' => 'pending',
            'is_featured' => false,
        ]);
        $unrelatedReviews->each(
            fn (Review $review) => $this->assertDatabaseHas('reviews', ['id' => $review->id])
        );
        $unrelatedReviews->each(
            fn (Review $review) => $this->assertDatabaseHas('reviews', ['id' => $review->id])
        );

        $this->seed(TransferReviewSeeder::class);

        $fixturesAfterRerun = Review::query()
            ->where('item_type', 'transfer')
            ->whereIn('review_text', TransferReviewSeeder::REVIEW_TEXTS)
            ->orderBy('id')
            ->get();

        $this->assertCount($fixtures->count(), $fixturesAfterRerun);
        $this->assertSame(
            $fixtureTimestamps->all(),
            $fixturesAfterRerun->mapWithKeys(fn (Review $review) => [
                $review->id => [
                    $review->created_at?->toISOString(),
                    $review->updated_at?->toISOString(),
                ],
            ])->all()
        );
        $this->assertDatabaseHas('reviews', [
            'id' => $genuineReview->id,
            'review_text' => 'This is a genuine existing transfer review.',
            'rating' => 2,
            'status' => 'pending',
            'is_featured' => false,
        ]);
    }

    public function test_it_skips_without_transfers_and_preserves_existing_reviews(): void
    {
        $customer = User::factory()->customer()->create();
        $existingReview = $this->createUnrelatedReview($customer, 'activity', 9100);

        $this->seed(TransferReviewSeeder::class);

        $this->assertDatabaseCount('reviews', 1);
        $this->assertDatabaseHas('reviews', ['id' => $existingReview->id]);
    }

    public function test_it_skips_without_customers_and_preserves_existing_reviews(): void
    {
        $admin = User::factory()->admin()->create();
        Transfer::factory()->create();
        $existingReview = $this->createUnrelatedReview($admin, 'activity', 9200);

        $this->seed(TransferReviewSeeder::class);

        $this->assertDatabaseCount('reviews', 1);
        $this->assertDatabaseHas('reviews', ['id' => $existingReview->id]);
    }

    public function test_it_does_not_mutate_an_existing_review_that_matches_a_fixture_identity(): void
    {
        $customer = User::factory()->customer()->create();
        $transfer = Transfer::factory()->create();
        $review = Review::create([
            'user_id' => $customer->id,
            'order_id' => null,
            'item_type' => 'transfer',
            'item_id' => $transfer->id,
            'item_name_snapshot' => 'Original customer snapshot',
            'item_slug_snapshot' => 'original-customer-snapshot',
            'rating' => 2,
            'review_text' => TransferReviewSeeder::REVIEW_TEXTS[0],
            'status' => 'pending',
            'is_featured' => false,
        ]);
        $createdAt = Carbon::parse('2026-01-02 09:00:00');
        $updatedAt = Carbon::parse('2026-01-03 10:00:00');

        Review::query()->whereKey($review->id)->update([
            'created_at' => $createdAt,
            'updated_at' => $updatedAt,
        ]);

        $this->seed(TransferReviewSeeder::class);

        $review->refresh();

        $this->assertDatabaseCount('reviews', 1);
        $this->assertSame('Original customer snapshot', $review->item_name_snapshot);
        $this->assertSame('original-customer-snapshot', $review->item_slug_snapshot);
        $this->assertSame(2, $review->rating);
        $this->assertSame('pending', $review->status);
        $this->assertFalse($review->is_featured);
        $this->assertTrue($review->created_at?->equalTo($createdAt));
        $this->assertTrue($review->updated_at?->equalTo($updatedAt));
    }

    private function createUnrelatedReview(User $user, string $type, int $itemId): Review
    {
        return Review::create([
            'user_id' => $user->id,
            'order_id' => null,
            'item_type' => $type,
            'item_id' => $itemId,
            'item_name_snapshot' => "Existing {$type}",
            'item_slug_snapshot' => "existing-{$type}",
            'rating' => 4,
            'review_text' => "Existing {$type} review.",
            'status' => 'approved',
            'is_featured' => false,
        ]);
    }
}
```

The fixture-scoped assertions avoid imposing a one-review-per-transfer rule on
genuine data. The same-user/same-transfer review proves that fixture identity
includes its stable text and cannot overwrite a customer-authored review.

- [ ] **Step 2: Run the seeder test and verify RED**

Run:

```bash
cd backend
php artisan test tests/Feature/TransferReviewSeederTest.php
```

Expected: FAIL because `TransferReviewSeeder` does not exist.

- [ ] **Step 3: Implement the seeder**

Create `TransferReviewSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Transfer;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class TransferReviewSeeder extends Seeder
{
    public const REVIEW_TEXTS = [
        'The airport pickup was on time, the driver found us quickly, and the car was spotless.',
        'Our driver handled the luggage and made the ride to the hotel calm after a long flight.',
        'Clear pickup instructions, a comfortable vehicle, and no surprise charges at the end.',
        'The transfer was easy to book and the driver kept us updated before arriving.',
        'A smooth ride across Dubai with enough room for our family and all of our bags.',
    ];

    private const RATINGS = [5, 5, 5, 4, 5];

    public function run(): void
    {
        $customers = User::query()
            ->where('role', 'customer')
            ->orderBy('id')
            ->get();
        $transfers = Transfer::query()
            ->orderBy('id')
            ->get();

        if ($customers->isEmpty()) {
            $this->command?->warn('TransferReviewSeeder skipped: no customer users found.');

            return;
        }

        if ($transfers->isEmpty()) {
            $this->command?->warn('TransferReviewSeeder skipped: no transfers found.');

            return;
        }

        $baseDate = Carbon::parse('2026-07-20 10:00:00');
        $reviewCount = min($transfers->count(), count(self::REVIEW_TEXTS));

        for ($index = 0; $index < $reviewCount; $index++) {
            $transfer = $transfers[$index];
            $customer = $customers[$index % $customers->count()];
            $reviewText = self::REVIEW_TEXTS[$index];

            $review = Review::firstOrCreate(
                [
                    'user_id' => $customer->id,
                    'item_type' => 'transfer',
                    'item_id' => $transfer->id,
                    'review_text' => $reviewText,
                ],
                [
                    'order_id' => null,
                    'item_name_snapshot' => $transfer->name,
                    'item_slug_snapshot' => $transfer->slug,
                    'rating' => self::RATINGS[$index],
                    'status' => 'approved',
                    'is_featured' => $index < 3,
                ]
            );

            if (! $review->wasRecentlyCreated) {
                continue;
            }

            $timestamp = $baseDate->copy()->subDays($index);

            Review::query()
                ->whereKey($review->id)
                ->update([
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);
        }
    }
}
```

- [ ] **Step 4: Register the seeder after the truncating review seeder**

In `DatabaseSeeder`, insert:

```php
ReviewSeeder::class,
TransferReviewSeeder::class,
```

`TransferReviewSeeder` must be after `ReviewSeeder` because `ReviewSeeder`
truncates the shared review tables.

- [ ] **Step 5: Run the seeder tests and verify GREEN**

Run:

```bash
cd backend
php artisan test tests/Feature/TransferReviewSeederTest.php
```

Expected: all four seeder tests pass.

- [ ] **Step 6: Run backend formatting and focused regression tests**

Run:

```bash
cd backend
./vendor/bin/pint --test database/seeders/TransferReviewSeeder.php database/seeders/DatabaseSeeder.php app/Http/Controllers/Guest/PublicReviewController.php tests/Feature/Public/ReviewEndpointTest.php tests/Feature/TransferReviewSeederTest.php
php artisan test tests/Feature/Public/ReviewEndpointTest.php tests/Feature/TransferReviewSeederTest.php
```

Expected: formatting check and both feature-test files pass.

## Task 3: Add the frontend transfer-review service

**Files:**

- Create: `frontend/src/lib/services/__tests__/reviews.test.js`
- Modify: `frontend/src/lib/services/reviews.js`

- [ ] **Step 1: Write the failing service tests**

Create `reviews.test.js`:

```js
import { publicApi } from '@/lib/axiosInstance';

import { getTransferFeaturedReviews } from '../reviews';

jest.mock('@/lib/axiosInstance', () => ({
  createAuthenticatedServerApi: jest.fn(),
  publicApi: {
    get: jest.fn(),
  },
}));

describe('getTransferFeaturedReviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the transfer review list from the filtered endpoint', async () => {
    const reviews = [{ id: 7, review_text: 'Smooth pickup.' }];
    publicApi.get.mockResolvedValue({
      data: { success: true, data: reviews },
    });

    await expect(getTransferFeaturedReviews()).resolves.toEqual(reviews);
    expect(publicApi.get).toHaveBeenCalledWith('/api/reviews/featured-reviews?item_type=transfer', { headers: { Accept: 'application/json' } });
  });

  it('returns an empty list for unsuccessful and failed responses', async () => {
    publicApi.get.mockResolvedValueOnce({
      data: { success: false, data: [] },
    });
    await expect(getTransferFeaturedReviews()).resolves.toEqual([]);

    publicApi.get.mockRejectedValueOnce(new Error('offline'));
    await expect(getTransferFeaturedReviews()).resolves.toEqual([]);
  });
});
```

- [ ] **Step 2: Run the service tests and verify RED**

Run:

```bash
cd frontend
npx jest src/lib/services/__tests__/reviews.test.js --runInBand
```

Expected: FAIL because `getTransferFeaturedReviews` is not exported.

- [ ] **Step 3: Implement the focused service**

Add to `reviews.js`:

```js
/**
 * Get featured approved transfer reviews.
 * Used on: Transfers page featured review slider.
 * @returns {Promise<any[]>} Transfer reviews or an empty array
 */
export async function getTransferFeaturedReviews() {
  try {
    const response = await publicApi.get('/api/reviews/featured-reviews?item_type=transfer', {
      headers: { Accept: 'application/json' },
    });

    if (response?.data?.success !== true || !Array.isArray(response.data.data)) {
      return [];
    }

    return response.data.data;
  } catch (error) {
    return [];
  }
}
```

- [ ] **Step 4: Run the service tests and verify GREEN**

Run:

```bash
cd frontend
npx jest src/lib/services/__tests__/reviews.test.js --runInBand
```

Expected: both service tests pass.

## Task 4: Conditionally compose the transfers review section

**Files:**

- Modify: `frontend/src/app/(frontend)/transfers/__tests__/page.test.jsx`
- Modify: `frontend/src/app/(frontend)/transfers/page.js`

- [ ] **Step 1: Add failing empty/populated review tests**

At the top of `page.test.jsx`, add:

```jsx
import { getTransferFeaturedReviews } from '@/lib/services/reviews';

const mockUseSWR = jest.fn();

jest.mock('swr', () => ({
  __esModule: true,
  default: (...args) => mockUseSWR(...args),
}));
```

Replace the ReviewSlider mock with:

```jsx
jest.doMock(srcPath('app/components/sliders/ReviewSlider.jsx'), () => ({
  __esModule: true,
  default: function ReviewSliderMock({ reviews = [] }) {
    return <div data-testid="review-slider">{reviews.map((review) => review.id).join(',')}</div>;
  },
}));
```

Add a default SWR response:

```jsx
beforeEach(() => {
  mockUseSWR.mockReset();
  mockUseSWR.mockReturnValue({ data: [] });
});
```

Add these tests:

```jsx
it('hides the complete featured review block when there are no transfer reviews', () => {
  const TransfersPage = require('../page').default;
  const { queryByRole, queryByTestId, getByTestId } = render(<TransfersPage />);

  expect(queryByRole('heading', { name: 'Featured Reviews' })).not.toBeInTheDocument();
  expect(queryByTestId('review-slider')).not.toBeInTheDocument();
  expect(getByTestId('faq-accordion')).toBeInTheDocument();
  expect(mockUseSWR).toHaveBeenCalledWith('transfer-featured-reviews', getTransferFeaturedReviews, { revalidateOnFocus: false });
});

it('shows the heading and passes populated transfer reviews to the slider', () => {
  mockUseSWR.mockReturnValue({
    data: [{ id: 17, review_text: 'Easy airport pickup.' }],
  });
  const TransfersPage = require('../page').default;
  const { getByRole, getByTestId } = render(<TransfersPage />);

  expect(getByRole('heading', { name: 'Featured Reviews' })).toBeInTheDocument();
  expect(getByTestId('review-slider')).toHaveTextContent('17');
});
```

- [ ] **Step 2: Run the page tests and verify RED**

Run:

```bash
cd frontend
npx jest "src/app/(frontend)/transfers/__tests__/page.test.jsx" --runInBand
```

Expected:

- The empty test finds the current unconditional heading/slider.
- The populated test does not receive reviews in the slider.

- [ ] **Step 3: Fetch and conditionally render transfer reviews**

Add imports:

```jsx
import useSWR from 'swr';
import { getTransferFeaturedReviews } from '@/lib/services/reviews';
```

Inside `TransfersPage`, add:

```jsx
const { data: featuredReviews = [] } = useSWR('transfer-featured-reviews', getTransferFeaturedReviews, {
  revalidateOnFocus: false,
});
const hasFeaturedReviews = featuredReviews.length > 0;
```

Replace the current combined review/FAQ wrapper with:

```jsx
<div className="container-page productSlider space-y-8 pb-10 md:pb-16 lg:pb-24">
  {hasFeaturedReviews ? (
    <Reveal as="section" initialHidden className="relative space-y-8">
      <Reveal as="h2" variant="lift" className="text-3xl font-semibold text-foreground">
        Featured Reviews
      </Reveal>
      <Reveal variant="lift" delay={120}>
        <ReviewSlider reviews={featuredReviews} />
      </Reveal>
    </Reveal>
  ) : null}

  <Reveal as="section" initialHidden variant="lift" delay={hasFeaturedReviews ? 200 : 0}>
    <Accordion items={faqItems} />
  </Reveal>
</div>
```

Use the ternary exactly as shown so the React render contract is explicit.

- [ ] **Step 4: Run the page tests and verify GREEN**

Run:

```bash
cd frontend
npx jest "src/app/(frontend)/transfers/__tests__/page.test.jsx" --runInBand
```

Expected: all transfers page tests pass.

## Task 5: Restore the independent FAQ heading

**Files:**

- Create: `frontend/src/app/components/__tests__/Faq.test.jsx`
- Modify: `frontend/src/app/components/Faq.jsx`

- [ ] **Step 1: Write the failing FAQ heading tests**

Create `Faq.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import Accordion from '../Faq';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const items = [{ title: 'How does pickup work?', content: 'Meet your driver at the selected location.' }];

describe('Accordion heading', () => {
  it('shows the FAQ heading on the transfers page', () => {
    usePathname.mockReturnValue('/transfers');

    render(<Accordion items={items} />);

    expect(screen.getByRole('heading', { name: 'FAQs' })).toBeInTheDocument();
  });

  it('keeps the FAQ heading hidden on the booking page', () => {
    usePathname.mockReturnValue('/booking');

    render(<Accordion items={items} />);

    expect(screen.queryByRole('heading', { name: 'FAQs' })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the FAQ test and verify RED**

Run:

```bash
cd frontend
npx jest src/app/components/__tests__/Faq.test.jsx --runInBand
```

Expected: FAIL because `!pathName === '/booking'` never renders the heading.

- [ ] **Step 3: Correct the pathname comparison**

Replace:

```jsx
{!pathName === '/booking' && (
```

with:

```jsx
{
  pathName !== '/booking' ? <h2 className="text-lg md:text-2xl lg:text-[28px] font-extrabold tracking-[-0.04em] text-[var(--weelp-home-ink)] py-6">FAQs</h2> : null;
}
```

Remove the old inline heading expression.

- [ ] **Step 4: Run the FAQ and page tests and verify GREEN**

Run:

```bash
cd frontend
npx jest src/app/components/__tests__/Faq.test.jsx "src/app/(frontend)/transfers/__tests__/page.test.jsx" --runInBand
```

Expected: both suites pass.

## Task 6: Error-handling, static, and browser verification

**Files:**

- Verify all files changed in Tasks 1–5.

- [ ] **Step 1: Run the error-handling review**

Use the `error-handling-patterns` skill and confirm:

- The seeder exits before writes when customers or transfers are missing.
- Rerunning the seeder creates no duplicates and never mutates an existing row,
  even when transfer, user, and text all match a fixture identity.
- Invalid API filters fail validation.
- Frontend request failures normalize to `[]`.
- Empty and failure states omit the whole review block without affecting FAQs.

- [ ] **Step 2: Format and verify the backend**

Run:

```bash
cd backend
./vendor/bin/pint database/seeders/TransferReviewSeeder.php database/seeders/DatabaseSeeder.php app/Http/Controllers/Guest/PublicReviewController.php tests/Feature/Public/ReviewEndpointTest.php tests/Feature/TransferReviewSeederTest.php
php artisan test tests/Feature/Public/ReviewEndpointTest.php tests/Feature/TransferReviewSeederTest.php
```

Expected: Pint completes and all focused backend tests pass.

- [ ] **Step 3: Format and verify the frontend**

Run:

```bash
cd frontend
npx prettier --write src/lib/services/reviews.js src/lib/services/__tests__/reviews.test.js "src/app/(frontend)/transfers/page.js" "src/app/(frontend)/transfers/__tests__/page.test.jsx" src/app/components/Faq.jsx src/app/components/__tests__/Faq.test.jsx docs/superpowers/plans/2026-07-25-transfer-reviews.md
npx jest src/lib/services/__tests__/reviews.test.js "src/app/(frontend)/transfers/__tests__/page.test.jsx" src/app/components/__tests__/Faq.test.jsx --runInBand
npm run type-check
npm run lint
git diff --check
```

Expected: formatting completes, all focused tests pass, and type-check, lint,
dark-mode guard, and whitespace checks succeed.

- [ ] **Step 4: Seed local transfer reviews**

Run only against the verified local development database:

```bash
cd backend
php artisan db:seed --class=TransferReviewSeeder
```

Before running, inspect the active database connection and confirm it is not
the production Aiven database. Do not run this seeder against production as
part of this task.

Expected: the seeder completes and approved transfer reviews exist.

- [ ] **Step 5: Verify the page in a visible headed browser**

With frontend and backend development servers running, open:

```bash
agent-browser --session weelp-transfer-reviews-visible --headed --args '--no-sandbox' open http://localhost:3000/transfers
```

Exercise the empty state without mutating the database by routing only the
local browser session's filtered review request to an empty JSON response:

```bash
agent-browser --session weelp-transfer-reviews-visible network route "**/api/reviews/featured-reviews*" --body '{"success":true,"data":[]}'
agent-browser --session weelp-transfer-reviews-visible reload
agent-browser --session weelp-transfer-reviews-visible wait --load networkidle
agent-browser --session weelp-transfer-reviews-visible snapshot
```

Verify “Featured Reviews” and the slider are absent while “FAQs” remains.
Restore real local responses, reload, and inspect the seeded state:

```bash
agent-browser --session weelp-transfer-reviews-visible network unroute "**/api/reviews/featured-reviews*"
agent-browser --session weelp-transfer-reviews-visible reload
agent-browser --session weelp-transfer-reviews-visible wait --load networkidle
agent-browser --session weelp-transfer-reviews-visible snapshot
```

Verify:

- “Featured Reviews” and review cards render.
- FAQ has its own “FAQs” heading.
- Review cards show transfer item labels.
- Desktop and mobile layouts have no new overflow.

Measure representative mobile and desktop viewports:

```bash
agent-browser --session weelp-transfer-reviews-visible set viewport 320 800
agent-browser --session weelp-transfer-reviews-visible eval "({ viewport: innerWidth, documentWidth: document.documentElement.scrollWidth })"
agent-browser --session weelp-transfer-reviews-visible set viewport 1440 900
agent-browser --session weelp-transfer-reviews-visible eval "({ viewport: innerWidth, documentWidth: document.documentElement.scrollWidth })"
```

Expected: `documentWidth` does not exceed the browser viewport at either size.

## Task 7: Mandatory review, simplification, and delivery

**Files:**

- Review all frontend and backend changes.

- [ ] **Step 1: Run the mandatory code-review gate**

Dispatch a `code-reviewer` agent to compare the implementation with:

- `frontend/docs/superpowers/specs/2026-07-25-transfer-reviews-design.md`
- `frontend/docs/superpowers/plans/2026-07-25-transfer-reviews.md`

Require Critical/Major/Minor findings and an APPROVE or REQUEST CHANGES
verdict. Address Critical and Major findings, rerun focused verification, and
repeat review until approved.

- [ ] **Step 2: Run simplification**

Invoke the `simplify` skill. If it is unavailable, state that explicitly and
perform a focused manual pass for duplicated review-fetching logic, unnecessary
state/effects, and seeder complexity. Any code change requires rerunning the
relevant tests.

- [ ] **Step 3: Run final verification**

Use `verification-before-completion`, then rerun:

```bash
cd backend
./vendor/bin/pint --test database/seeders/TransferReviewSeeder.php database/seeders/DatabaseSeeder.php app/Http/Controllers/Guest/PublicReviewController.php tests/Feature/Public/ReviewEndpointTest.php tests/Feature/TransferReviewSeederTest.php
php artisan test tests/Feature/Public/ReviewEndpointTest.php tests/Feature/TransferReviewSeederTest.php

cd ../frontend
npx jest src/lib/services/__tests__/reviews.test.js "src/app/(frontend)/transfers/__tests__/page.test.jsx" src/app/components/__tests__/Faq.test.jsx --runInBand
npm run type-check
npm run lint
git diff --check
```

Repeat the visible browser checks after any post-review production change.

- [ ] **Step 4: Commit and push both repositories to `main`**

Confirm each repository is on `main` and contains only expected changes.
Commit the backend and frontend separately:

```bash
cd backend
git add app/Http/Controllers/Guest/PublicReviewController.php database/seeders/DatabaseSeeder.php database/seeders/TransferReviewSeeder.php tests/Feature/Public/ReviewEndpointTest.php tests/Feature/TransferReviewSeederTest.php
git commit -m "feat: seed and expose transfer reviews"
git push origin main

cd ../frontend
git add docs/superpowers/plans/2026-07-25-transfer-reviews.md src/lib/services/reviews.js src/lib/services/__tests__/reviews.test.js "src/app/(frontend)/transfers/page.js" "src/app/(frontend)/transfers/__tests__/page.test.jsx" src/app/components/Faq.jsx src/app/components/__tests__/Faq.test.jsx
git commit -m "feat: show seeded transfer reviews"
git push origin main
```

Expected:

- Both pushes succeed.
- Both worktrees are clean.
- `origin/main...main` reports `0 0` in both repositories.
