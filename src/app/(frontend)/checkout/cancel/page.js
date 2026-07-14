import CheckoutResultState, { ResultActionLink } from '@/app/components/Pages/FRONT_END/checkout/CheckoutResultState';

export default function PaymentCancelledPage() {
  return (
    <CheckoutResultState
      title="Payment was cancelled"
      description="Your booking has not been confirmed and no completed payment was recorded. Your booking details are still available if you want to try again."
      tone="warning"
      actions={
        <>
          <ResultActionLink href="/checkout" emphasis="primary">
            Return to checkout
          </ResultActionLink>
          <ResultActionLink href="/booking">Review booking</ResultActionLink>
        </>
      }
    />
  );
}
