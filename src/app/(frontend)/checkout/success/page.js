import PaymentSuccessClient from './PaymentSuccessClient';

export default async function PaymentSuccessPage({ searchParams }) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const sessionId = resolvedSearchParams?.session_id ?? null;

  return <PaymentSuccessClient sessionId={sessionId} />;
}
