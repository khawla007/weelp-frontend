# Customer Cancellation Requests Design

## Why this change

The customer dashboard shows cancelled and refunded bookings, but customers cannot start a cancellation from their booking. Administrators can currently change order status and issue a full Stripe refund, yet that path does not capture a customer request, explain the expected deduction, or support a reviewed partial refund.

This change gives customers a clear request flow while keeping the final decision with an administrator. The first version uses one general time-based policy for activities, packages, and itineraries. The policy produces a suggested amount; it does not guarantee the refund or cancel the booking when the customer submits the request.

## The starting policy

The suggestion is based on the time between `requested_at` and the booking's `travel_date` plus `preferred_time`. Both values are interpreted in the application's configured business timezone. Because `preferred_time` is stored on every checkout selection, the calculation can use the actual scheduled time rather than treating every booking as an all-day event.

| Time remaining when requested                 | Suggested deduction | Suggested refund |
| --------------------------------------------- | ------------------: | ---------------: |
| 30 days or more                               |                 10% |              90% |
| 15 days to less than 30 days                  |                 25% |              75% |
| 7 days to less than 15 days                   |                 50% |              50% |
| 48 hours to less than 7 days                  |                 75% |              25% |
| Less than 48 hours, or travel already started |                100% |               0% |

Exact durations determine the band, so a request exactly 48 hours before travel receives the 25% suggestion and one exactly 7 days before travel receives the 50% suggestion. Percentages live in one backend cancellation-policy configuration rather than in React or controller conditionals. A later release can replace these defaults or introduce item-specific rules without changing the request lifecycle.

Money is calculated from the order payment's effective paid amount: `custom_amount` for a custom-amount payment, otherwise `total_amount`, falling back to `amount`. Calculations use decimal-safe arithmetic, round once to the currency's supported precision, and never produce a suggestion below zero or above the paid amount.

The request stores the policy version, time remaining, paid amount, deduction percentage, and suggested refund as a snapshot. Reviewing the request days later therefore does not silently change what the customer originally saw.

## Who may request cancellation

An authenticated customer may submit a request only for their own active booking. The booking must have a paid payment with a Stripe payment-intent reference and must not be completed, cancelled, refunded, soft-deleted, or past its travel start. A booking with an unresolved cancellation request cannot receive another request.

An ineligible booking does not show the request action. Its detail instead gives the relevant next step, such as contacting support. The backend repeats every eligibility check and remains authoritative if the booking changes between page load and submission.

This first release does not provide self-service cancellation for unpaid or pending payments. Those cases continue through support or the existing administrative workflow, keeping this feature focused on reviewed refunds.

## What the customer sees

An eligible customer booking detail includes a **Request cancellation** action. Selecting it opens a confirmation dialog containing:

- booking name, travel date, and time remaining;
- original paid amount and currency;
- applicable policy band and deduction percentage;
- estimated deduction and estimated refund;
- a required cancellation reason;
- a statement that the estimate is not a guarantee and the administrator chooses the final amount.

The reason accepts plain text, trims surrounding whitespace, and has bounded minimum and maximum lengths. The submit action is disabled while the request is in flight. Closing the dialog or a failed request leaves the booking unchanged.

After a successful submission, the detail replaces the action with a **Cancellation requested** panel. It shows the submitted reason, request date, captured estimate, and **Awaiting admin review**. The order's operational status remains unchanged, so creators and reporting do not treat the booking as cancelled prematurely.

If the administrator rejects the request, the panel shows **Request declined**, the decision date, and the administrator's customer-facing reason. The booking remains active. A rejected request does not automatically restore the request action; the customer contacts support if circumstances change.

If the administrator approves it, the panel shows the final refund, deduction, decision explanation, and refund outcome. The booking status becomes `cancelled`. A partial refund is labelled as such rather than presented as a full refund.

## What the administrator sees

The existing inline admin order detail gains a prominent cancellation panel when a request exists. A pending request shows:

- requester and request timestamp;
- customer reason;
- travel start and time remaining at submission;
- paid amount and currency;
- policy version and band;
- suggested deduction and suggested refund.

The administrator can reject the request or approve it with a final refund amount. The amount defaults to the policy suggestion but remains editable from zero through the unrefunded paid balance. A customer-facing explanation is always required for rejection and is required for approval whenever the final amount differs from the suggestion.

Before approval, a confirmation step restates the final refund and deduction. While approval is processing, both decision actions are disabled. The interface does not optimistically mark the request or booking as complete.

Rejecting records the decision without changing order or payment status. Approval with a positive amount attempts a Stripe refund. Approval with a zero amount skips Stripe and records a no-refund cancellation. In both cases, the order becomes `cancelled` only after the required operation succeeds.

## Request record and lifecycle

A dedicated cancellation-request record preserves the workflow separately from the order. It belongs to the order and requesting customer and records:

- lifecycle status: `pending`, `refund_processing`, `refund_failed`, `approved`, or `rejected`;
- customer reason and request timestamp;
- policy version and calculation snapshot;
- paid amount, currency, suggested deduction percentage, suggested refund, final refund, and final deduction;
- deciding administrator, decision explanation, and decision timestamp;
- Stripe refund ID, idempotency key, failure code, and a safe failure summary;
- refund completion timestamp.

The order exposes its latest cancellation request to customer and admin detail responses. The database keeps historical requests, while service-level locking prevents more than one unresolved request for an order. Creating a request locks the order before rechecking ownership, eligibility, and unresolved requests. Resolving one locks both the request and its order before validating the transition.

Allowed transitions are:

```text
pending -> rejected
pending -> refund_processing -> approved
pending -> refund_processing -> refund_failed
refund_failed -> refund_processing -> approved
refund_failed -> rejected
```

There is no customer withdrawal or administrator reopening flow in this release.

## Refund and payment consistency

The refund operation uses a stable idempotency key tied to the cancellation request, so a timeout or repeated click cannot create a second refund. Stripe receives the approved amount in the currency's correct minor unit. The amount may not exceed the original paid amount minus any refund already recorded by Stripe or Weelp.

External payment work cannot be held inside a database transaction. Approval therefore first commits `refund_processing` with the final decision snapshot, then calls Stripe, and finally commits the successful local state. A Stripe error moves the request to `refund_failed`; it does not cancel the order. An administrator can retry the same approved amount with the same idempotency identity or reject the unresolved request.

On successful resolution:

- a full refund sets payment status to `refunded`;
- a refund greater than zero but less than the paid amount sets payment status to `partially_refunded`;
- a zero refund leaves the payment status `paid`;
- every approved outcome sets the order status to `cancelled`.

The payment record also stores the cumulative refunded amount. This avoids treating a partial refund as a full refund and gives later refunds a reliable remaining-balance check. Stripe webhooks reconcile the same refund identity and amounts without overwriting a resolved request with stale events.

The existing admin status/refund shortcut must not bypass an unresolved customer request. Its refund work should use the same backend refund service so order, payment, request, email, and idempotency rules have one source of truth.

## API and component boundaries

Laravel owns eligibility, policy calculations, lifecycle transitions, authorization, money validation, and Stripe orchestration. A focused cancellation policy service returns a calculation snapshot. A cancellation request service owns creation and rejection, while a refund service owns the idempotent Stripe operation and reconciliation.

Authenticated customer endpoints provide a quote for the confirmation dialog and create a request for an order owned by the caller. The quote is informational; submission recalculates and stores a fresh server-side snapshot so a stale or edited browser value is never trusted.

Authenticated admin endpoints reject a pending or failed request, approve a pending request, and retry a failed refund. Responses return safe messages and the refreshed cancellation representation. They never expose Stripe secrets or raw exception details.

The Next.js customer booking detail owns the dialog and pending/resolved presentation. A focused cancellation dialog receives a server quote and submits the reason. The existing customer order hook revalidates after submission.

The existing admin order detail renders the review panel. A focused admin cancellation component owns the final amount, explanation, confirmation, decision actions, and request refresh. Existing order-list caches revalidate after resolution so returning to the list shows the cancelled status.

## Notifications

Submitting a request emails the customer an acknowledgement and alerts administrators that a review is waiting. Rejection emails the customer the decision explanation. Successful approval emails the customer the final refund and deduction and identifies partial, full, or zero refund accurately.

A failed Stripe attempt alerts administrators but does not send the customer an approval message. Customer-facing email is sent only after the approved outcome is recorded. Email delivery failures are logged and retried independently; they do not roll back a completed Stripe refund.

## Failure paths worth knowing

If the quote cannot be loaded, the dialog explains that the estimate is unavailable and does not allow submission. If request creation loses a race with another request or an order-state change, the customer sees the backend's current eligibility message and the detail refreshes.

Invalid admin amounts, missing explanations, stale request states, and unauthorized access are rejected before Stripe is called. A Stripe decline, timeout, or malformed response leaves the order active and the request visibly retryable as `refund_failed`. Raw provider messages are logged for operators but replaced with safe UI copy.

If Stripe succeeds but the final local update is interrupted, the stable refund ID and idempotency key allow the retry or webhook reconciliation path to finish the same request without issuing more money.

## Regression coverage

Backend unit and feature tests will verify:

- all five policy bands, including exact 48-hour, 7-day, 15-day, and 30-day boundaries;
- timezone handling, decimal rounding, custom amounts, and zero-decimal currencies;
- calculation snapshots remain unchanged after submission;
- ownership, paid-payment, travel-start, terminal-order, and soft-delete eligibility rules;
- one unresolved request under duplicate and concurrent submissions;
- required reasons and bounded text validation;
- admin authorization, final amount limits, and adjusted-amount explanations;
- every allowed and rejected lifecycle transition;
- rejection leaves order and payment untouched;
- zero, partial, and full refund outcomes update order and payment accurately;
- Stripe failures remain retryable and never cancel the order;
- idempotent retries and webhook reconciliation cannot duplicate a refund;
- notification dispatch for request, rejection, success, and failure paths.

Frontend tests will verify:

- eligible and ineligible customer actions;
- quote loading, every displayed calculation, reason validation, confirmation, and duplicate-submit protection;
- pending, rejected, approved, partial-refund, and failure presentations;
- admin suggested defaults, final-amount validation, explanation rules, confirmation, rejection, approval, retry, and disabled processing state;
- customer detail, admin detail, and cached lists revalidate after mutations;
- keyboard operation, focus return, accessible names, responsive stacking, long text, and currency formatting.

After implementation, focused Jest and Laravel tests run before full frontend type-check and lint. Final verification uses the required visible headed browser on local customer and admin dashboards, covering request creation, admin rejection, adjusted approval, refund failure/retry, responsive layouts, keyboard use, and horizontal-overflow checks.

## Out of scope

- Automatic approval or automatic refund when a customer submits a request.
- Customer withdrawal or editing of a submitted request.
- Multiple appeals after an administrator rejects a request.
- Different policies by activity, package, itinerary, creator, supplier, or promotional rate.
- Supplier penalties, credits, wallet balances, or refund methods other than the original Stripe payment.
- Cancelling individual travelers or part of a multi-item order.
- Admin changes to policy bands from the dashboard; the first policy is backend configuration.
