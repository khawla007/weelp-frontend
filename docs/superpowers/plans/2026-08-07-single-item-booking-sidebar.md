# Single-Item Booking Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the single-item booking controls and cart action available while customers read long activity, itinerary, and package pages on desktop and mobile.

**Architecture:** Preserve one `ProductSidebar` form provider and one `SingleProductForm`, but separate the reusable price/action row into `BookingAction`. Reorder the shared tab layout responsively, constrain stickiness to a compact booking card below both headers, place optional pricing and add-ons in accessible disclosures, and show a mobile fixed action only when the inline action is outside the viewport.

**Tech Stack:** Next.js 16 App Router, React 19, React Hook Form, Radix Accordion, Tailwind CSS, Jest, React Testing Library.

---

### Task 1: Reorder and rebalance the shared single-item layout

**Files:**
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx:234-306`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx`

- [ ] **Step 1: Write the failing responsive-order test**

Update the `ProductSidebar` mock so it renders a discoverable element, then add this test:

```jsx
jest.mock('../ProductSidebar', () => {
  const MockProductSidebar = () => <aside data-testid="product-sidebar">Booking controls</aside>;
  MockProductSidebar.displayName = 'MockProductSidebar';
  return MockProductSidebar;
});

it('places booking controls before long content on narrow screens and keeps the desktop 60/40 split', () => {
  render(
    <SingleProductTabSection
      productType="activity"
      productId={1}
      productData={{
        description: 'Activity description',
        inclusions_exclusions: [],
        review_summary: { total_reviews: 0 },
        faqs: [],
      }}
    />,
  );

  const layout = screen.getByTestId('single-product-layout');
  const content = screen.getByTestId('single-product-content');
  const booking = screen.getByTestId('single-product-booking-column');

  expect(layout).toHaveClass('flex-col', 'xl:flex-row');
  expect(content).toHaveClass('order-2', 'xl:order-1', 'xl:w-[60%]');
  expect(booking).toHaveClass('order-1', 'xl:order-2', 'xl:w-[40%]', 'xl:self-stretch');
  expect(booking.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});

it('keeps mobile Similar Experiences after primary content', () => {
  render(
    <SingleProductTabSection
      productType="activity"
      productId={1}
      productData={{ description: 'Activity description', inclusions_exclusions: [], review_summary: { total_reviews: 0 }, faqs: [] }}
      similarActivities={[{ id: 10, name: 'Desert Safari' }]}
    />,
  );

  const content = screen.getByTestId('single-product-content');
  const mobileSimilar = screen.getByTestId('mobile-similar-experiences');
  expect(content.compareDocumentPosition(mobileSimilar)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});
```

- [ ] **Step 2: Run the focused test and confirm the new contract fails**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx --runInBand
```

Expected: FAIL because the layout test IDs, physical ordering, stretched boundary, 60/40 widths, and final mobile Similar Experiences region do not exist yet.

- [ ] **Step 3: Implement the responsive layout contract**

Physically render the booking column before the content column so visual and keyboard order agree on narrow screens. Use CSS order only to restore content-first presentation on desktop. Stretch the booking column to the full height of the flex row; do not retain `xl:self-start`:

```jsx
<div data-testid="single-product-layout" className="flex flex-col xl:flex-row">
  <Reveal
    variant="lift"
    delay={120}
    data-testid="single-product-booking-column"
    className="relative order-1 w-full bg-surface-tint xl:order-2 xl:w-[40%] xl:self-stretch"
  >
    {/* existing decorative image and ProductSidebar */}
  </Reveal>

  <div data-testid="single-product-content" className="order-2 w-full xl:order-1 xl:w-[60%]">
    <div className="xl:pr-6">{/* existing tab sections */}</div>
  </div>
</div>

<Reveal data-testid="mobile-similar-experiences" variant="lift" className="md:hidden">
  <SimilarExperiences activities={similarActivities} />
</Reveal>
```

Remove `mobileSimilarActivities` from the `ProductSidebar` call and component API. Keep desktop Similar Experiences inside the content column, and render the mobile copy only after the two-column region. Preserve all other product props, optional sections, and the edit action bar.

- [ ] **Step 4: Run the focused tab-section test**

Run the command from Step 2.

Expected: PASS for the new layout case and all existing inclusion/tab behavior.

- [ ] **Step 5: Record an uncommitted layout checkpoint**

Run `git diff --check` and `git status --short`. Expected: only the Task 1 files are modified, with no whitespace errors. Do not commit before the mandatory final review, simplification, and verification gate.

### Task 2: Extract one reusable booking action

**Files:**
- Create: `src/app/components/Pages/FRONT_END/singleproduct/BookingAction.jsx`
- Create: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/BookingAction.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx:451-506`

- [ ] **Step 1: Write failing action-state tests**

Create `BookingAction.test.jsx`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react';
import BookingAction from '../BookingAction';

describe('BookingAction', () => {
  it('submits the shared booking form and shows the supplied total', () => {
    render(<BookingAction formId="booking-form-41" primaryPrice="$475.00" />);

    expect(screen.getByText('$475.00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select' })).toHaveAttribute('form', 'booking-form-41');
    expect(screen.getByRole('button', { name: 'Select' })).toHaveAttribute('type', 'submit');
  });

  it('renders update and show-cart states without duplicating state logic', () => {
    const onShowCart = jest.fn();
    const { rerender } = render(<BookingAction formId="booking-form-41" primaryPrice="$475.00" isEditing />);
    expect(screen.getByRole('button', { name: 'Update booking' })).toBeInTheDocument();

    rerender(<BookingAction formId="booking-form-41" primaryPrice="$475.00" isInCart onShowCart={onShowCart} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show Cart' }));
    expect(onShowCart).toHaveBeenCalledTimes(1);
  });

  it('supports the compact mobile presentation', () => {
    render(<BookingAction formId="booking-form-41" primaryPrice="$475.00" secondaryPrice="Total" compact />);
    expect(screen.getByTestId('booking-action')).toHaveClass('rounded-none', 'sm:rounded-xl');
  });

  it('wraps long prices and translated actions instead of clipping them', () => {
    render(<BookingAction formId="booking-form-41" primaryPrice="USD 123,456,789.00" secondaryPrice="Total for your selected experience" isEditing />);
    expect(screen.getByText('USD 123,456,789.00')).toHaveClass('break-words');
    expect(screen.getByTestId('booking-action')).toHaveClass('flex-col', 'min-[360px]:flex-row');
    expect(screen.getByRole('button', { name: 'Update booking' })).toHaveClass('w-full', 'min-[360px]:w-auto');
  });
});
```

- [ ] **Step 2: Run the new test and confirm the component is missing**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/BookingAction.test.jsx --runInBand
```

Expected: FAIL with `Cannot find module '../BookingAction'`.

- [ ] **Step 3: Implement the presentational component**

Create `BookingAction.jsx` with one semantic price/action surface:

```jsx
'use client';

import React from 'react';

const BookingAction = React.forwardRef(
  ({ formId, primaryPrice, secondaryPrice, isEditing = false, isInCart = false, onShowCart, compact = false }, ref) => (
    <div
      ref={ref}
      data-testid="booking-action"
      className={`flex flex-col items-stretch justify-between gap-4 border border-border bg-background p-5 min-[360px]:flex-row min-[360px]:items-center ${compact ? 'rounded-none sm:rounded-xl' : 'rounded-xl'}`}
    >
      <div className="min-w-0 break-words">
        {secondaryPrice ? <p className="text-sm font-medium text-weelp-copy">{secondaryPrice}</p> : null}
        <p className="break-words text-lg font-bold text-foreground">{primaryPrice}</p>
      </div>
      {isInCart && !isEditing ? (
        <button type="button" onClick={onShowCart} className="min-h-11 w-full rounded-md bg-weelp-sage-deep px-6 py-3 text-center font-medium text-white hover:bg-weelp-sage-hover min-[360px]:w-auto">
          Show Cart
        </button>
      ) : (
        <button type="submit" form={formId} className="min-h-11 w-full rounded-md bg-weelp-sage-deep px-6 py-3 text-center font-medium text-white hover:bg-weelp-sage-hover min-[360px]:w-auto">
          {isEditing ? 'Update booking' : 'Select'}
        </button>
      )}
    </div>
  ),
);

BookingAction.displayName = 'BookingAction';

export default BookingAction;
```

Rely on the project-wide focus ring, but preserve the existing disabled and explicit focus-visible utilities when integrating if the global control styling does not cover the surface.

- [ ] **Step 4: Replace the existing Select Card markup**

In `ProductSidebar`, derive stable text values from the calculations already present:

```jsx
const actionPrimaryPrice = productType === 'activity' && pricing?.headcount >= 1
    ? formatCurrency(pricing.final, pricing.currency)
    : formatCurrency(basePrice + addonsTotal, productData?.pricing?.currency ?? productData?.schedule_total_currency ?? 'USD');

const actionSecondaryPrice = isInCart && !isEditingCartItem
  ? 'Item in cart'
  : activeSelectedAddons.length > 0
    ? `Includes ${formatCurrency(addonsTotal, productData?.pricing?.currency ?? productData?.schedule_total_currency ?? 'USD')} in add-ons`
    : 'Total';
```

Render `BookingAction` with `formId`, `isEditingCartItem`, `isInCart`, and `setMiniCartOpen`. Remove only the replaced action markup; do not change pricing formulas.

- [ ] **Step 5: Run action, cart-edit, and help tests**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/BookingAction.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarCartEdit.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarHelp.test.jsx --runInBand
```

Expected: PASS.

- [ ] **Step 6: Record an uncommitted action checkpoint**

Run `git diff --check` and inspect `git diff --stat`. Expected: the new component, its test, and the intentional sidebar replacement are present. Do not commit yet.

### Task 3: Build the compact sticky card and disclosures

**Files:**
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx:1-540`
- Modify: `src/app/globals.css`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarCartEdit.test.jsx`

- [ ] **Step 1: Write failing compact-card tests**

Add tests asserting the sticky boundary and disclosure behavior:

```jsx
it('sticks only the compact booking card below the header and tabs', () => {
  render(<ProductSidebar productId={3} productType="activity" productData={{ id: 3, pricing: { regular_price: 244, currency: 'USD' }, addons: [] }} />);

  const layout = screen.getByTestId('product-sidebar-layout');
  const stickyCard = screen.getByTestId('booking-sticky-card');
  const questions = screen.getByRole('heading', { name: 'Questions?' }).closest('[data-testid="booking-support"]');

  expect(layout).toHaveClass('h-full', 'px-6', 'xl:px-10');
  expect(stickyCard).toHaveClass('weelp-booking-sticky');
  expect(stickyCard).not.toContainElement(questions);
});

it('defines a width-and-height-gated sticky boundary without nested scrolling', () => {
  const css = readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');
  expect(css).toMatch(/@media \(min-width: 1280px\) and \(min-height: 760px\)/);
  expect(css).toMatch(/\.weelp-booking-sticky\s*{[^}]*position:\s*sticky;[^}]*top:\s*142px;/s);
  expect(css).not.toMatch(/\.weelp-booking-sticky\s*{[^}]*overflow-y:\s*(auto|scroll)/s);
});

it('starts optional price details and add-ons collapsed with useful summaries', () => {
  render(
    <ProductSidebar
      productId={3}
      productType="activity"
      productData={{
        id: 3,
        pricing: { regular_price: 244, currency: 'USD' },
        addons: [{ addon_id: 7, addon_name: 'Photography Package', addon_price: 40 }],
      }}
    />,
  );

  const priceTrigger = screen.getByRole('button', { name: /price details/i });
  const addonTrigger = screen.getByRole('button', { name: /add-ons.*none selected/i });
  expect(priceTrigger).toHaveAttribute('aria-expanded', 'false');
  expect(addonTrigger).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(addonTrigger);
  fireEvent.click(screen.getByRole('checkbox', { name: /photography package/i }));
  expect(screen.getByRole('button', { name: /add-ons.*1 selected/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused sidebar tests and confirm failure**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarCartEdit.test.jsx --runInBand
```

Expected: FAIL because the sticky/support wrappers and accordion triggers are absent.

- [ ] **Step 3: Limit stickiness to a compact card**

Import the shared Radix accordion primitives and move the existing regions into this structure:

```jsx
<div data-testid="product-sidebar-layout" className="relative z-[1] h-full px-6 py-8 xl:px-10 xl:pb-12 xl:pt-10">
  <div data-testid="booking-sticky-card" className="weelp-booking-sticky relative z-[2]">
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      {/* base price */}
      {/* SingleProductForm */}
      <Accordion type="multiple" className="mt-2">
        {/* price details when activity pricing exists */}
        {/* add-ons when addons.length > 0 */}
      </Accordion>
      <div className="mt-4">{/* BookingAction */}</div>
    </div>
  </div>

  <div data-testid="booking-support" className="relative z-[1] mt-6">
    {/* existing Questions card */}
  </div>
</div>
```

Use `AccordionItem`, `AccordionTrigger`, and `AccordionContent` from `@/components/ui/accordion`. The price trigger label is `Price details`; the add-on trigger label is `Add-ons · None selected` or `Add-ons · N selected`. Put the existing breakdown, discount hints, and checkbox rows inside their respective content without changing calculation or selection handlers.

Add the sticky rule to `globals.css` so short desktop viewports stay in normal flow:

```css
@media (min-width: 1280px) and (min-height: 760px) {
  .weelp-booking-sticky {
    position: sticky;
    top: 142px;
  }
}
```

- [ ] **Step 4: Preserve edit-state add-on visibility in tests**

Update the cart-edit test to open the Add-ons disclosure before querying its checkboxes:

```jsx
fireEvent.click(screen.getByRole('button', { name: /add-ons.*1 selected/i }));
expect(screen.getByRole('checkbox', { name: /photography package/i })).toHaveAttribute('aria-checked', 'true');
```

Repeat that explicit open after the help panel closes only if Radix unmounts the disclosure content; otherwise assert the trigger summary and preserved checkbox state directly.

- [ ] **Step 5: Run all sidebar tests**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/BookingAction.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarCartEdit.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarHelp.test.jsx --runInBand
```

Expected: PASS with calculations, cart editing, and help state preserved.

- [ ] **Step 6: Record an uncommitted sticky-card checkpoint**

Run `git diff --check` and the focused tests once more. Expected: clean diff and passing sidebar suites. Do not commit yet.

### Task 4: Add the mobile action and validation return path

**Files:**
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx`
- Modify: `src/app/components/Form/SingleProductForm.jsx:114-127,228-270`
- Modify: `src/app/components/Form/__tests__/SingleProductFormResponsive.test.jsx`
- Modify: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx`
- Create: `src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarMobileAction.test.jsx`

- [ ] **Step 1: Write failing mobile visibility tests**

Capture the observer callback in `SidebarLayering.test.jsx`, then test both states:

```jsx
let actionObserverCallback;

beforeEach(() => {
  window.IntersectionObserver = jest.fn((callback) => {
    actionObserverCallback = callback;
    return { observe: jest.fn(), disconnect: jest.fn() };
  });
});

it('shows one mobile booking bar only while the inline action is outside the viewport', () => {
  render(<ProductSidebar productId={3} productType="activity" productData={{ id: 3, pricing: { regular_price: 244, currency: 'USD' }, addons: [] }} />);

  act(() => actionObserverCallback([{ isIntersecting: false, intersectionRatio: 0 }]));
  expect(screen.getByTestId('mobile-booking-bar')).toBeInTheDocument();
  expect(screen.getByTestId('mobile-booking-bar')).toHaveClass('fixed', 'bottom-0', 'xl:hidden');
  expect(screen.getByTestId('mobile-booking-bar').parentElement).toBe(document.body);

  act(() => actionObserverCallback([{ isIntersecting: true, intersectionRatio: 1 }]));
  expect(screen.queryByTestId('mobile-booking-bar')).not.toBeInTheDocument();
});

it('omits the enhancement when IntersectionObserver is unavailable', () => {
  delete window.IntersectionObserver;
  render(<ProductSidebar productId={3} productType="activity" productData={{ id: 3, pricing: { regular_price: 244, currency: 'USD' }, addons: [] }} />);
  expect(screen.queryByTestId('mobile-booking-bar')).not.toBeInTheDocument();
  expect(screen.getByTestId('booking-action')).toBeInTheDocument();
});

it('disconnects the action observer on unmount', () => {
  const disconnect = jest.fn();
  window.IntersectionObserver = jest.fn(() => ({ observe: jest.fn(), disconnect }));
  const { unmount } = render(<ProductSidebar productId={3} productType="activity" productData={{ id: 3, pricing: { regular_price: 244, currency: 'USD' }, addons: [] }} />);
  unmount();
  expect(disconnect).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Write the failing invalid-submit focus test**

In `SingleProductFormResponsive.test.jsx`, import `zodResolver` and `bookingSchema`, update `Wrapper` to call `useForm({ resolver: zodResolver(bookingSchema), defaultValues })`, then mock `scrollIntoView` and assert the required date control receives focus:

```jsx
it('returns an invalid external submit to the required date control', async () => {
  const scrollIntoView = jest.fn();
  Element.prototype.scrollIntoView = scrollIntoView;

  render(<SingleProductForm productData={{ id: 2 }} formId="booking-form-2" />, { wrapper: Wrapper });

  const externalSubmit = document.createElement('button');
  externalSubmit.type = 'submit';
  externalSubmit.setAttribute('form', 'booking-form-2');
  document.body.appendChild(externalSubmit);
  fireEvent.click(externalSubmit);

  const dateButton = await screen.findByRole('button', { name: 'When?' });
  await waitFor(() => expect(dateButton).toHaveFocus());
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  externalSubmit.remove();
});
```

Restore the prototype mock after the test.

- [ ] **Step 3: Write failing valid-submission and selector-layer tests**

Create `ProductSidebarMobileAction.test.jsx` with the real `SingleProductForm`, a captured observer callback, and mocked cart store. Render an itinerary with a valid `defaultDateRange`, trigger the out-of-view callback, click the portaled Select action, and assert `addItem` runs exactly once with the itinerary ID. In a second test, open Travelers and When? in turn and assert the mobile bar is absent while either selector is open, then returns after the selector closes.

```jsx
it('submits the existing valid form exactly once from the portaled mobile action', async () => {
  render(
    <ProductSidebar
      productId={9}
      productType="itinerary"
      productData={{ id: 9, item_type: 'itinerary', name: 'Dubai days', schedule_total_price: 300, schedule_total_currency: 'USD', addons: [] }}
      defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }}
      scheduleCount={1}
    />,
  );

  act(() => actionObserverCallback([{ isIntersecting: false, intersectionRatio: 0 }]));
  fireEvent.click(within(screen.getByTestId('mobile-booking-bar')).getByRole('button', { name: 'Select' }));
  await waitFor(() => expect(mockAddItem).toHaveBeenCalledTimes(1));
  expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({ id: 9, type: 'itinerary' }));
});

it('suppresses the mobile action while traveler or date selectors are open', async () => {
  render(
    <ProductSidebar
      productId={9}
      productType="itinerary"
      productData={{ id: 9, item_type: 'itinerary', schedule_total_price: 300, schedule_total_currency: 'USD', addons: [] }}
      defaultDateRange={{ from: new Date('2026-09-10'), to: new Date('2026-09-10') }}
      scheduleCount={1}
    />,
  );
  act(() => actionObserverCallback([{ isIntersecting: false, intersectionRatio: 0 }]));
  expect(screen.getByTestId('mobile-booking-bar')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: '1 Travelers' }));
  await waitFor(() => expect(screen.queryByTestId('mobile-booking-bar')).not.toBeInTheDocument());
  fireEvent.mouseLeave(screen.getByRole('dialog', { name: 'Traveler selector' }));
  await waitFor(() => expect(screen.getByTestId('mobile-booking-bar')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /sep 10 - sep 10/i }));
  await waitFor(() => expect(screen.queryByTestId('mobile-booking-bar')).not.toBeInTheDocument());
});
```

- [ ] **Step 4: Run the focused test files and confirm failure**

Run:

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarMobileAction.test.jsx src/app/components/Form/__tests__/SingleProductFormResponsive.test.jsx --runInBand
```

Expected: FAIL because no mobile visibility observer/portal exists, selector visibility is not reported upward, and invalid submission only shows a toast.

- [ ] **Step 5: Observe the inline action and portal the mobile bar**

Import `createPortal` from `react-dom`. In `ProductSidebar`, add `inlineActionRef`, `actionVisibilityKnown`, `inlineActionVisible`, and `selectorOpen`. Observe the inline action with a `0.95` threshold and disconnect on cleanup:

```jsx
useEffect(() => {
  const action = inlineActionRef.current;
  if (!action || typeof IntersectionObserver === 'undefined') return undefined;

  const observer = new IntersectionObserver(
    ([entry]) => {
      setActionVisibilityKnown(true);
      setInlineActionVisible(entry.isIntersecting && entry.intersectionRatio >= 0.95);
    },
    { threshold: [0, 0.95, 1] },
  );

  observer.observe(action);
  return () => observer.disconnect();
}, []);
```

Attach the ref to the inline `BookingAction`. When visibility is known, the action is not visible, no selector is open, and `document` exists, portal another `BookingAction` outside the transformed `Reveal` ancestor:

```jsx
{actionVisibilityKnown && !inlineActionVisible && !selectorOpen && typeof document !== 'undefined'
  ? createPortal(
  <div
    data-testid="mobile-booking-bar"
    className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 shadow-[0_-4px_16px_rgba(24,24,27,0.08)] xl:hidden"
  >
    <div className="container-page">
      <BookingAction {...sharedActionProps} compact />
    </div>
  </div>,
  document.body,
) : null}
```

Add `pb-28 xl:pb-0` to the single-product section while the mobile enhancement is eligible so final controls remain reachable, and assert the responsive padding class in the layout test. Suppressing the portal while a selector is open prevents it from covering the form layer; `z-40` stays below the site header, mini cart, contextual help, and toast layers.

- [ ] **Step 6: Report selector state and focus the first invalid inline control**

Add an optional `onSelectorOpenChange` prop, refs to the traveler and date buttons, and an effect that reports `showCalendar || showHowMany` upward with a `false` cleanup. In `onError`, select the relevant ref, then move it into view and focus it on the next animation frame:

```jsx
const travelerButtonRef = useRef(null);
const dateButtonRef = useRef(null);

useEffect(() => {
  onSelectorOpenChange?.(showCalendar || showHowMany);
  return () => onSelectorOpenChange?.(false);
}, [onSelectorOpenChange, showCalendar, showHowMany]);

const onError = (formErrors) => {
  const target = formErrors.dateRange ? dateButtonRef.current : formErrors.howMany ? travelerButtonRef.current : null;
  toast({
    title: formErrors.dateRange ? 'Please select a date' : 'Please select at least one adult',
    variant: 'destructive',
  });
  if (target) {
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      target.focus();
    });
  }
};
```

Attach `travelerButtonRef` and `dateButtonRef` to their existing buttons. Keep their current toggle, error-border, and `aria-controls` behavior.

- [ ] **Step 7: Run mobile and form tests**

Run the command from Step 4, including `ProductSidebarMobileAction.test.jsx`.

Expected: PASS for observer-driven visibility, external submission focus, existing responsive controls, and cart submission metadata.

- [ ] **Step 8: Record an uncommitted mobile checkpoint**

Run `git diff --check`, the mobile integration suite, and the responsive form suite. Expected: clean diff and passing tests. Do not commit yet.

### Task 5: Harden and verify the complete single-item flow

**Files:**
- Modify if a failure requires it: files changed in Tasks 1-4

- [ ] **Step 1: Run focused single-item tests together**

```bash
npx jest src/app/components/Pages/FRONT_END/singleproduct/__tests__/BookingAction.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarMobileAction.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarCartEdit.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarHelp.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx src/app/components/Form/__tests__/SingleProductFormResponsive.test.jsx --runInBand
```

Expected: all suites PASS with no unhandled React warnings.

- [ ] **Step 2: Apply the required error-handling review**

Verify these fallback contracts directly in code and tests:

- invalid date/traveler state never dereferences a missing control ref;
- long totals and action labels use `min-w-0`, wrapping, or shrinking without horizontal overflow;
- disclosures preserve selections when closed;
- fixed bar does not outrank mini cart, contextual help, toast, or header overlays.

If any contract is absent, add a focused failing test, make the smallest correction, and rerun Step 1.

- [ ] **Step 3: Run static verification**

```bash
npm run type-check
npm run lint
git diff --check
```

Expected: all commands exit 0 with no warnings or whitespace errors.

- [ ] **Step 4: Run the visible local browser matrix**

Use the required named headed session and localhost routes:

```bash
agent-browser --session weelp-visible --headed open http://localhost:3000/cities/dubai/activities/dubai-desert-safari-with-bbq
```

Check 320×844, 390×844, 768×900, 1280×700, 1280×900, and 1440×900. At each applicable width, verify:

- booking controls precede long content on narrow screens;
- the bottom bar appears only when the inline action is out of view;
- Select returns an incomplete booking to When?;
- date, travelers, add-ons, price, and total remain synchronized;
- the desktop card stays below both sticky bars from Overview through FAQs;
- the card releases before Similar Experiences/footer;
- the 1280×700 short viewport uses normal flow with no nested sidebar scrolling;
- no nested sidebar scrollbar or horizontal overflow appears;
- dark and light themes preserve border, text, and CTA contrast.
- both disclosure triggers work with Tab plus Enter and Space.

Repeat the key desktop/mobile checks on one itinerary route and one package route.

- [ ] **Step 5: Run the mandatory code-review and simplify loop**

Dispatch the code-reviewer agent over the complete diff. Fix every blocking finding, rerun the focused tests and static checks, re-review every correction, and rerun the affected headed-browser cases after each UI change. Then invoke the simplify skill over the reviewed diff, keeping behavior and test coverage unchanged. Rerun Step 1 plus Step 3, recheck every viewport affected by simplification, and finally repeat the complete headed-browser matrix from Step 4 on the stable diff before committing.

- [ ] **Step 6: Commit the reviewed and verified implementation**

After review, re-review, simplification, tests, static checks, and headed-browser verification all pass:

```bash
git add src/app/globals.css src/app/components/Pages/FRONT_END/singleproduct/BookingAction.jsx src/app/components/Pages/FRONT_END/singleproduct/ProductSidebar.jsx src/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/BookingAction.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarMobileAction.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/ProductSidebarCartEdit.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/SidebarLayering.test.jsx src/app/components/Pages/FRONT_END/singleproduct/__tests__/SingleProductTabSectionInclusions.test.jsx src/app/components/Form/SingleProductForm.jsx src/app/components/Form/__tests__/SingleProductFormResponsive.test.jsx
git commit -m "feat: keep single-item booking actions visible"
```

- [ ] **Step 7: Push the verified main branch**

```bash
git push origin main
```

Expected: `origin/main` advances to the verified local commit with a clean worktree.
