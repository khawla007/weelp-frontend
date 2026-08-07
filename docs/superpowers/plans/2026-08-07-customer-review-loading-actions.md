# Customer Review Loading and Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the customer review spinner with review-shaped skeletons, confirm destructive review removal, and repair the Next.js 16 edit route.

**Architecture:** Keep the work inside the existing customer-review frontend boundary. Add one presentational skeleton component, let `ReviewsPage` select loading/error/list content, let `CustomerReviewList` own one controlled confirmation dialog, and await the dynamic route parameters before fetching an editable review.

**Tech Stack:** Next.js 16 App Router, React 19, SWR, Radix Alert Dialog, Tailwind CSS, Jest, React Testing Library

---

### Task 0: Load the required implementation guidance

**Files:**
- Review only; no source changes

- [ ] **Step 1: Load the required Next.js and React skills**

Before editing application code, read and apply `next-best-practices`, `vercel-react-best-practices`, and `vercel-composition-patterns`. In particular, follow the Next.js 16 async-params rule, preserve the Server/Client Component boundary, keep the skeleton presentational, and avoid creating a generalized abstraction for two structurally different card types.

- [ ] **Step 2: Use test-driven development for every behavior change**

Load `test-driven-development`. For each task below, write the focused test first, run it to observe the expected failure, implement only the behavior required to pass, and rerun the test before continuing.

### Task 1: Add review-card loading coverage and skeleton component

**Files:**
- Create: `src/app/components/ReviewCardSkeleton.jsx`
- Create: `src/app/components/__tests__/ReviewCardSkeleton.test.jsx`
- Modify: `src/app/(dashboard)/dashboard/customer/reviews/page.js`
- Create: `src/app/(dashboard)/dashboard/customer/reviews/__tests__/page.test.jsx`

- [ ] **Step 1: Write failing skeleton and page-loading tests**

Create `src/app/components/__tests__/ReviewCardSkeleton.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';

import ReviewCardSkeleton from '../ReviewCardSkeleton';

it('mirrors the review card sections', () => {
  render(<ReviewCardSkeleton />);

  expect(screen.getByTestId('review-card-skeleton')).toBeInTheDocument();
  expect(screen.getByTestId('review-card-skeleton-header')).toBeInTheDocument();
  expect(screen.getByTestId('review-card-skeleton-body')).toBeInTheDocument();
  expect(screen.getByTestId('review-card-skeleton-actions')).toBeInTheDocument();
});
```

Create `src/app/(dashboard)/dashboard/customer/reviews/__tests__/page.test.jsx` with the review hook mocked to return `isLoading: true`, `CustomerReviewList` mocked to a stable marker, and `ReviewCardSkeleton` mocked to `<div data-testid="review-card-skeleton" />`. Render `ReviewsPage` and assert:

```jsx
expect(screen.getAllByTestId('review-card-skeleton')).toHaveLength(6);
expect(screen.queryByTestId('customer-review-list')).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused tests and confirm they fail**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/__tests__/ReviewCardSkeleton.test.jsx 'src/app/(dashboard)/dashboard/customer/reviews/__tests__/page.test.jsx'
```

Expected: FAIL because `ReviewCardSkeleton` and the page skeleton grid do not exist.

- [ ] **Step 3: Implement the review-shaped skeleton**

Create `src/app/components/ReviewCardSkeleton.jsx` using the same outer `Card`, header spacing, divider, bordered review panel, and two footer action positions as `UserDashboardReviewCard`:

```jsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const ReviewCardSkeleton = () => (
  <Card aria-hidden="true" data-testid="review-card-skeleton" className="flex w-full min-w-0 flex-col rounded-lg border-border/80 bg-background shadow-sm">
    <CardHeader data-testid="review-card-skeleton-header" className="flex w-full flex-col gap-3 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <Skeleton className="h-6 w-3/5 sm:h-7" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-32" />
      </div>
    </CardHeader>
    <Separator className="mx-auto w-11/12" />
    <CardContent className="space-y-3 p-4">
      <div data-testid="review-card-skeleton-body" className="space-y-3 rounded-md border border-border/70 bg-muted/30 p-3">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div data-testid="review-card-skeleton-actions" className="flex justify-end gap-2 pt-1">
        <Skeleton className="size-9 rounded-md" />
        <Skeleton className="size-9 rounded-md" />
      </div>
    </CardContent>
  </Card>
);

export default ReviewCardSkeleton;
```

- [ ] **Step 4: Replace the spinner branch with six skeleton cards**

In `reviews/page.js`, import `ReviewCardSkeleton`, define:

```js
const REVIEW_SKELETON_SLOTS = Array.from({ length: 6 }, (_, index) => index);
```

Use the same success-state heading and sage content wrapper for loading. Inside a `grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3`, render:

```jsx
{REVIEW_SKELETON_SLOTS.map((slot) => (
  <ReviewCardSkeleton key={slot} />
))}
```

Remove the spinner markup. Preserve the existing error, loaded-list, and pagination behavior.

- [ ] **Step 5: Run the focused loading tests**

Run the Step 2 command again.

Expected: PASS.

### Task 2: Confirm review removal before mutation

**Files:**
- Modify: `src/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/CustomerReviewList.jsx`
- Create: `src/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/__tests__/CustomerReviewList.test.jsx`

- [ ] **Step 1: Write failing confirmation-flow tests**

Mock `UserDashboardReviewCard`, `deleteReviewCustomer`, and `useToast`. Render one review and cover these behaviors:

```jsx
fireEvent.click(screen.getByRole('button', { name: 'Request delete 17' }));
expect(screen.getByRole('alertdialog')).toBeInTheDocument();
expect(deleteReviewCustomer).not.toHaveBeenCalled();

fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
expect(deleteReviewCustomer).not.toHaveBeenCalled();
```

Open the dialog again, click **Remove**, and assert `deleteReviewCustomer(17)` and `mutate()` each run once after a `{ status: 200 }` response. Add a deferred-promise test asserting **Remove** is disabled and reads `Removing...` while pending. Add a rejection/non-200 test asserting the card remains and `mutate` is not called.

Also reopen the dialog, press Escape, and assert the dialog closes without calling `deleteReviewCustomer`. For the failed-delete test, assert the destructive toast is shown, the dialog remains open for retry or cancellation, and `mutate` is not called.

- [ ] **Step 2: Run the focused list test and confirm it fails**

Run:

```bash
npm run test:ci -- --runInBand src/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/__tests__/CustomerReviewList.test.jsx
```

Expected: FAIL because deletion currently starts directly and no alert dialog is rendered.

- [ ] **Step 3: Add controlled confirmation state and imports**

Import `useState` and the existing alert-dialog primitives. Add:

```js
const [reviewIdToDelete, setReviewIdToDelete] = useState(null);
const [isDeleting, setIsDeleting] = useState(false);
```

Change each card's `onDelete` callback to set the selected ID. Rename the current mutation handler to `handleConfirmDelete`, read `reviewIdToDelete`, and wrap the existing action/toast/mutate behavior in `setIsDeleting(true)` and `finally { setIsDeleting(false); }`. Clear `reviewIdToDelete` only after a successful deletion.

- [ ] **Step 4: Render one shared confirmation dialog**

Place a controlled dialog next to the review grid:

```jsx
<AlertDialog
  open={reviewIdToDelete !== null}
  onOpenChange={(open) => {
    if (!open && !isDeleting) setReviewIdToDelete(null);
  }}
>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Remove this review?</AlertDialogTitle>
      <AlertDialogDescription>Are you sure you want to remove this review? This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
      <AlertDialogAction
        disabled={isDeleting}
        onClick={(event) => {
          event.preventDefault();
          void handleConfirmDelete();
        }}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-primary dark:text-background dark:hover:bg-primary/90"
      >
        {isDeleting ? 'Removing...' : 'Remove'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Preventing the default Radix action close keeps the dialog mounted while the asynchronous request runs. Success closes it through state; failure leaves it open for a retry or cancellation.

In the test, assert the action includes `bg-destructive`, `text-destructive-foreground`, `dark:bg-primary`, and `dark:text-background`. These classes cover the explicit light-mode danger treatment and the contrast-safe dark-mode override.

- [ ] **Step 5: Run the focused confirmation tests**

Run the Step 2 command again.

Expected: PASS.

### Task 3: Repair the Next.js 16 customer review edit route

**Files:**
- Modify: `src/app/(dashboard)/dashboard/customer/reviews/[id]/page.js`
- Create: `src/app/(dashboard)/dashboard/customer/reviews/[id]/__tests__/page.test.jsx`

- [ ] **Step 1: Write a failing route regression test**

Mock `getSingleReviewByCustomer`, `CustomerEditReviewForm`, and `notFound`. Resolve the page with promised parameters:

```jsx
getSingleReviewByCustomer.mockResolvedValue({
  success: true,
  status: 200,
  data: { review: { id: 27, rating: 5, review_text: 'Excellent trip' } },
});

const ui = await ReviewPage({ params: Promise.resolve({ id: '27' }) });
render(ui);

expect(getSingleReviewByCustomer).toHaveBeenCalledWith('27');
expect(screen.getByTestId('customer-edit-review-form')).toHaveTextContent('Excellent trip');
```

Keep a second test returning `{ success: false, status: 404 }` and assert the mocked `notFound` function runs.

- [ ] **Step 2: Run the route test and confirm it fails**

Run:

```bash
npm run test:ci -- --runInBand 'src/app/(dashboard)/dashboard/customer/reviews/[id]/__tests__/page.test.jsx'
```

Expected: FAIL because the service receives `undefined` instead of `27`.

- [ ] **Step 3: Await dynamic route parameters**

Change the page entry to:

```js
const ReviewPage = async ({ params }) => {
  const { id } = await params;
```

Do not change the service contract, form submission, or not-found behavior.

- [ ] **Step 4: Run the route test**

Run the Step 2 command again.

Expected: PASS.

### Task 4: Complete verification and visible UI checks

**Files:**
- Verify only; no planned source changes

- [ ] **Step 1: Run all focused review tests together**

```bash
npm run test:ci -- --runInBand src/app/components/__tests__/ReviewCardSkeleton.test.jsx 'src/app/(dashboard)/dashboard/customer/reviews/__tests__/page.test.jsx' src/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/__tests__/CustomerReviewList.test.jsx 'src/app/(dashboard)/dashboard/customer/reviews/[id]/__tests__/page.test.jsx' src/app/components/Pages/DASHBOARD/user/_rsc_pages/reviews/forms/__tests__/CustomerReviewForm.test.jsx src/lib/actions/customer/__tests__/reviews.test.js
```

Expected: PASS.

- [ ] **Step 2: Run required static verification**

Load and apply `error-handling-patterns` before verification. Confirm the delete handler distinguishes expected non-200 results from thrown failures, preserves a useful destructive toast, never refreshes on failure, and always resets pending state in `finally`. Then run:

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit 0 and the dark-mode guard reports no new findings.

- [ ] **Step 3: Review the implementation, address findings, and simplify**

Dispatch the required code-review agent against the final diff. Fix critical or important findings and re-run the focused tests. Then apply the available simplification pass manually if the named `simplify` skill is unavailable, preserving behavior and tests.

- [ ] **Step 4: Open and verify in a visible local browser**

First ensure the named session is a headed browser on the local reviews route:

```bash
XDG_RUNTIME_DIR=/run/user/1000 agent-browser --session weelp-review-visible --headed --args "--no-sandbox" open http://localhost:3000/dashboard/customer/reviews
```

If the command reports that headed options were ignored because a daemon is already running, confirm that `weelp-review-visible` is the visible headed session opened during investigation; otherwise close only that named session and reopen it with the command above. Then confirm:

- loading uses six review-shaped cards rather than a spinner;
- the trash action opens the confirmation dialog;
- Cancel leaves the review unchanged;
- Remove is destructive red in light mode and matches normal dashboard buttons in dark mode;
- the edit action opens the requested review form instead of not-found.

Expected: all behaviors work at desktop width without layout shift or console errors.
