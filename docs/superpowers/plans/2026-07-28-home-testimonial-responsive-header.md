# Home Testimonial Responsive Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the home testimonial header with the approved Option B layout so long traveler and item names keep the card’s full width at every slider breakpoint.

**Architecture:** Keep the change inside the existing presentational `Testimonial` component. Split its header into a fixed top metadata row and a separate full-width identity block, preserving the slider’s data flow and equal-height behavior.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Lucide React, Jest 30, React Testing Library

Run every command in this plan from the frontend repository root:
`/run/media/ashish-khawla/Website data/Fanatic Developement/weelp/frontend`.

---

### Task 1: Lock the responsive header contract with component tests

**Files:**

- Create: `src/app/components/__tests__/Testimonial.test.jsx`
- Reference: `src/app/components/Testimonial.jsx:4-34`

- [ ] **Step 1: Write the failing long-content layout test**

Create `src/app/components/__tests__/Testimonial.test.jsx` with:

```jsx
import { render, screen } from '@testing-library/react';
import Testimonial from '../Testimonial';

describe('Testimonial', () => {
  it('groups metadata above a full-width identity block for long names', () => {
    render(
      <Testimonial
        username="Gurmeet Singh With A Long Traveler Name"
        itemName="Burj Khalifa At The Top Experience with Sky Views and Dinner"
        title="The entry timing was clear and the view was exactly what we hoped for."
        rating={5}
        date="2026-07-04"
      />,
    );

    const metadataGroup = screen.getByRole('group', { name: 'Review metadata' });
    const identityGroup = screen.getByRole('group', {
      name: 'Traveler and reviewed item',
    });
    const avatar = screen.getByRole('img', {
      name: 'Gurmeet Singh With A Long Traveler Name avatar',
    });
    const travelerName = screen.getByRole('heading', {
      name: /Gurmeet Singh With A Long Traveler Name/i,
    });
    const itemName = screen.getByText(
      'Burj Khalifa At The Top Experience with Sky Views and Dinner',
    );
    const reviewText = screen.getByText(
      'The entry timing was clear and the view was exactly what we hoped for.',
    );

    expect(metadataGroup).toHaveClass('justify-between');
    expect(metadataGroup).toContainElement(avatar);
    expect(metadataGroup).toContainElement(
      screen.getByRole('img', { name: '5 out of 5 stars' }),
    );
    expect(metadataGroup).toContainElement(screen.getByText('2026-07-04'));
    expect(metadataGroup).not.toContainElement(travelerName);
    expect(identityGroup).toContainElement(travelerName);
    expect(identityGroup).toContainElement(itemName);
    expect(identityGroup).toHaveClass('w-full', 'min-w-0');
    expect(metadataGroup.nextElementSibling).toBe(identityGroup);
    expect(travelerName).toHaveClass('break-words');
    expect(travelerName).not.toHaveClass('line-clamp-1');
    expect(travelerName).not.toHaveClass('line-clamp-2');
    expect(itemName).toHaveClass('break-words');
    expect(itemName).not.toHaveClass('line-clamp-1');
    expect(itemName).not.toHaveClass('line-clamp-2');
    expect(reviewText).toHaveClass('line-clamp-3');
  });

  it('keeps fallback content usable when optional metadata is missing', () => {
    render(<Testimonial />);

    expect(screen.getByRole('img', { name: 'Anonymous avatar' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Anonymous/i })).toBeInTheDocument();
    expect(screen.getByText('Great experience!')).toHaveClass('line-clamp-3');
    expect(screen.queryByRole('img', { name: /out of 5 stars/i })).not.toBeInTheDocument();
  });

  it('normalizes ratings before rendering the label and filled stars', () => {
    const { rerender } = render(<Testimonial rating={4.5} />);

    const roundedRating = screen.getByRole('img', { name: '5 out of 5 stars' });
    expect(roundedRating.querySelectorAll('svg')).toHaveLength(5);

    rerender(<Testimonial rating={3.2} />);
    const standardRating = screen.getByRole('img', { name: '3 out of 5 stars' });
    expect(standardRating.querySelectorAll('svg')).toHaveLength(3);

    rerender(<Testimonial rating={12} />);
    const cappedRating = screen.getByRole('img', { name: '5 out of 5 stars' });
    expect(cappedRating.querySelectorAll('svg')).toHaveLength(5);

    rerender(<Testimonial rating="not-a-rating" />);
    expect(screen.queryByRole('img', { name: /out of 5 stars/i })).not.toBeInTheDocument();

    rerender(<Testimonial rating={-2} />);
    expect(screen.queryByRole('img', { name: /out of 5 stars/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the contract fails**

Run:

```bash
npx jest src/app/components/__tests__/Testimonial.test.jsx --runInBand
```

Expected: FAIL because the current avatar has the generic `testimonial` alternative text, the rating has no accessible label, and the name still shares the wrapping header row.

### Task 2: Implement the approved Option B card hierarchy

**Files:**

- Modify: `src/app/components/Testimonial.jsx:1-35`
- Test: `src/app/components/__tests__/Testimonial.test.jsx`

- [ ] **Step 1: Replace the wrapping header with two explicit groups**

Update `src/app/components/Testimonial.jsx` to:

```jsx
import React from 'react';
import Image from 'next/image';
import { BadgeCheck, Star } from 'lucide-react';

const Testimonial = ({ username, title, date, itemName, rating }) => {
  const displayName = username || 'Anonymous';
  const numericRating = Number(rating);
  const safeRating = Number.isFinite(numericRating)
    ? Math.max(0, Math.min(5, Math.round(numericRating)))
    : 0;

  return (
    <div className="flex h-full flex-col gap-4 rounded-lg border border-border bg-background p-4">
      <div
        role="group"
        aria-label="Review metadata"
        className="flex items-start justify-between gap-4"
      >
        <Image
          src="/assets/testimonial.png"
          alt={`${displayName} avatar`}
          width={64}
          height={64}
          sizes="64px"
          className="size-16 shrink-0 rounded-full object-cover"
        />

        {(safeRating > 0 || date) && (
          <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
            {safeRating > 0 && (
              <div
                className="flex gap-0.5"
                role="img"
                aria-label={`${safeRating} out of 5 stars`}
              >
                {Array.from({ length: safeRating }).map((_, index) => (
                  <Star
                    key={index}
                    aria-hidden="true"
                    className="size-4 fill-yellow-400 stroke-none"
                  />
                ))}
              </div>
            )}
            {date && (
              <span className="whitespace-nowrap text-base font-normal uppercase text-muted-foreground">
                {date}
              </span>
            )}
          </div>
        )}
      </div>

      <div
        role="group"
        aria-label="Traveler and reviewed item"
        className="w-full min-w-0"
      >
        <h3 className="flex items-center gap-2 break-words text-xl font-semibold text-foreground">
          <span>{displayName}</span>
          <BadgeCheck
            aria-hidden="true"
            className="size-5 shrink-0 fill-sky-500 text-white"
          />
        </h3>
        {itemName && (
          <span className="block break-words font-normal text-muted-foreground">
            {itemName}
          </span>
        )}
      </div>

      <p className="mb-3 line-clamp-3 text-base font-normal text-foreground">
        {title || 'Great experience!'}
      </p>
    </div>
  );
};

export default Testimonial;
```

- [ ] **Step 2: Run the focused component test**

Run:

```bash
npx jest src/app/components/__tests__/Testimonial.test.jsx --runInBand
```

Expected: PASS with 3 tests.

### Task 3: Verify code quality and the rendered home page

**Files:**

- Verify: `src/app/components/Testimonial.jsx`
- Verify: `src/app/components/__tests__/Testimonial.test.jsx`

- [ ] **Step 1: Invoke the `error-handling-patterns` skill**

Use the skill to review invalid rating values, missing optional values,
inaccessible repeated icons, and layout assumptions. Confirm `safeRating`
normalizes invalid values to the supported zero-to-five whole-star range and
optional metadata does not leave empty wrappers.

- [ ] **Step 2: Run type-check**

Run:

```bash
npm run type-check
```

Expected: exit code 0 with no TypeScript errors.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: exit code 0 and `Dark-mode guard: no new hardcoded color findings.`

- [ ] **Step 4: Run focused tests once more**

Run:

```bash
npx jest src/app/components/__tests__/Testimonial.test.jsx --runInBand
```

Expected: PASS with 3 tests.

- [ ] **Step 5: Inspect the local home page in the visible browser**

Start the frontend if it is not already running:

```bash
npm run dev
```

Open `http://localhost:3000` using the named visible browser session:

```bash
agent-browser --session weelp-visible --headed open http://localhost:3000
```

Set the visible browser to each required viewport:

```bash
agent-browser --session weelp-visible set viewport 320 900
agent-browser --session weelp-visible set viewport 768 900
agent-browser --session weelp-visible set viewport 1280 900
```

Before evaluating the layout, locate the existing home-page testimonial for
`Gurmeet Singh` and `Burj Khalifa At The Top Experience`. This is the long
seeded case shown in the original bug screenshot. If the local API does not
return it, stop the visual check and report the missing fixture instead of
substituting a shorter testimonial or committing temporary product data.

At each width, confirm:

- the avatar is on the left of the top row;
- rating and date remain right-aligned;
- the full traveler and item names render below using the card width;
- neither name moves under or overlaps the avatar;
- there is no horizontal overflow;
- testimonial cards remain equal-height within the visible slider row.

- [ ] **Step 6: Run the mandatory code-review loop**

Dispatch the code-reviewer agent against the plan, design spec, final diff, and
verification output. Address every blocking critical or major finding, re-run
the affected checks, and send the updated diff back to the reviewer until it
approves. After every review-driven code edit, invoke `error-handling-patterns`
and rerun type-check, lint, the focused test, and all three visible-browser
viewport checks before requesting re-review.

- [ ] **Step 7: Run the simplification gate**

Invoke the required `simplify` skill to check the approved implementation for
clarity, reuse, and unnecessary complexity. Keep the scope confined to the
testimonial component and its focused test.

The named `simplify` skill is not present in the current Codex skill catalog or
local skill directories. If it remains unavailable at execution time, state
that limitation explicitly and use the available `karpathy-guidelines` skill as
the closest surgical simplification fallback. Do not claim that the named
skill ran.

- [ ] **Step 8: Re-run post-simplification verification**

If simplify changes code, invoke `error-handling-patterns` again. Whether it
changes code or not, rerun:

```bash
npm run type-check
npm run lint
npx jest src/app/components/__tests__/Testimonial.test.jsx --runInBand
```

Expected: all three commands pass. Reopen the named visible browser session and
repeat the 320px, 768px, and 1280px checks from Step 5 so no post-review change
can invalidate the responsive audit.

- [ ] **Step 9: Commit the reviewed and verified change**

```bash
git add \
  docs/superpowers/plans/2026-07-28-home-testimonial-responsive-header.md \
  src/app/components/Testimonial.jsx \
  src/app/components/__tests__/Testimonial.test.jsx
git commit -m "fix: make testimonial headers responsive"
```

- [ ] **Step 10: Push the verified main branch**

```bash
git push origin main
```

Expected: the frontend repository’s `main` branch is updated on GitHub.
