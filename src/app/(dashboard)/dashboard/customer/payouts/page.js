import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getCreatorPayouts } from '@/lib/actions/creatorItineraries';
import PayoutsClient from './PayoutsClient';

export const metadata = {
  title: 'Payouts - Weelp',
};

const EMPTY_STATE = {
  summary: { lifetime: 0, current_period: 0 },
  rows: [],
  pagination: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
};

export default async function PayoutsPage() {
  const session = await auth();
  if (!session?.user?.is_creator) redirect('/dashboard/customer');

  const today = new Date();
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
  const initial = await getCreatorPayouts({
    from: threeMonthsAgo.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
    page: 1,
    per_page: 20,
  });

  return <PayoutsClient initial={initial.success ? initial.data : EMPTY_STATE} />;
}
