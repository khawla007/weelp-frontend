# Transfer Reviews Design

## Goal

Show genuine transfer reviews on `/transfers` without leaving an empty
“Featured Reviews” heading on the page. Seeded reviews must use the existing
review model and public review API rather than a parallel transfer-only review
system.

## Current behavior

The transfers page always renders the “Featured Review” heading but calls
`ReviewSlider` without review data. The slider returns `null` for an empty
array, leaving the heading by itself.

The FAQ accordion follows that empty review block. Its own heading is hidden by
an invalid pathname comparison, so the FAQ cards visually appear to belong to
the review section. The shared FAQ fixture also contains unrelated placeholder
copy.

The backend review model already supports `item_type = transfer`, and
`Transfer::reviews()` already defines the polymorphic relationship. The public
featured-reviews endpoint can transform transfer reviews, but it cannot
currently filter its results to transfers.

## Approach

Extend the existing featured-reviews endpoint with an optional validated
`item_type` filter. The transfers page will request
`item_type=transfer`, pass the returned reviews to `ReviewSlider`, and render
the entire review section only when the response contains reviews.

This keeps review selection and ordering on the server. Filtering the generic
ten-review response in the browser is rejected because unrelated featured
reviews could fill the limit before a transfer review is returned. A dedicated
transfer endpoint is also rejected because it would duplicate the existing
featured-review query and response transformation.

## Backend changes

### Featured review filtering

`PublicReviewController::getFeaturedReviews()` will accept:

- `item_type`: optional; one of `activity`, `package`, `itinerary`, or
  `transfer`.

When present, the query will apply an exact `reviews.item_type` filter before
calculating the summary and selecting the ten showcase reviews. Existing calls
without `item_type` will keep their current behavior.

### Transfer review seeder

Create `TransferReviewSeeder` as an additive, idempotent fixture seeder.

The seeder will:

- Find existing customer users and seeded transfers.
- Warn and return without writing when either dependency is missing.
- Seed realistic approved transfer reviews across available transfers.
- Mark a small subset as featured so `/transfers` has carousel content.
- Store transfer name and slug snapshots.
- Use deterministic timestamps and stable review text.
- Use `updateOrCreate` with a stable transfer/user/text identity so rerunning
  the seeder does not create duplicates.
- Avoid truncating the shared `reviews` table or deleting activity, package,
  or itinerary reviews.

Register it in `DatabaseSeeder` after `AdminTransferSeeder` and after the
existing `ReviewSeeder`. Running it separately with
`php artisan db:seed --class=TransferReviewSeeder` will also be supported.

## Frontend changes

Add a focused service function that calls:

```text
/api/reviews/featured-reviews?item_type=transfer
```

The service will normalize unsuccessful or empty responses to an empty review
array. The transfers page will load this list through the project’s existing
client-side data-fetching conventions.

The review presentation will follow one rule:

- One or more reviews: render the “Featured Reviews” heading and
  `ReviewSlider`.
- No reviews, loading failure, or empty response: render neither the heading
  nor the slider.

The FAQ block remains independent and always renders after the optional review
section. Its heading condition will be corrected so “FAQs” appears on
`/transfers`. Replacing the unrelated shared FAQ fixture is outside this change;
the content cleanup should be handled separately because the fixture is shared
with other pages.

## Data flow

1. `TransferReviewSeeder` associates approved reviews with existing transfer
   IDs and customer users.
2. The public featured-reviews endpoint filters approved reviews by
   `item_type=transfer`.
3. The frontend review service returns the endpoint’s `data` array.
4. `/transfers` passes the array to `ReviewSlider`.
5. The review wrapper, heading, and slider are omitted together when the array
   is empty.

## Failure paths

- Missing seeded customers or transfers: the seeder logs a warning and exits
  without partial writes.
- Invalid API `item_type`: Laravel returns a validation response.
- API unavailable or no transfer reviews: the frontend treats the result as an
  empty list and hides the complete review section.
- A review references a deleted transfer: the existing public transformer
  filters it out.

## Testing

Backend tests will verify:

- `item_type=transfer` returns approved transfer reviews and excludes other
  review types.
- An invalid `item_type` is rejected.
- Running `TransferReviewSeeder` twice does not duplicate its reviews.
- The seeder exits cleanly when required users or transfers are absent.

Frontend tests will verify:

- The heading and slider are absent for an empty or failed response.
- The heading and slider render when transfer reviews are returned.
- Returned reviews are passed to `ReviewSlider`.
- The FAQ heading is visible independently of review availability.

After automated checks, the local page will be inspected in a visible headed
browser in both empty and seeded-review states.

## Out of scope

- Customer review-submission changes.
- A new transfer-specific review model or endpoint.
- Review media seeding.
- Rewriting the shared FAQ fixture copy.
- Production database seeding.
