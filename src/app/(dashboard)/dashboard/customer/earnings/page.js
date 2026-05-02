import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getCreatorEarnings } from '@/lib/actions/creatorItineraries';
import EarningsClient from './EarningsClient';

export const metadata = {
  title: 'Earnings - Weelp',
};

const EMPTY_STATE = {
  summary: { lifetime: 0, current_period: 0, pending: 0 },
  rows: [],
  pagination: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
};

export default async function EarningsPage() {
  const session = await auth();
  if (!session?.user?.is_creator) redirect('/dashboard/customer');

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const initial = await getCreatorEarnings({
    status: 'all',
    from: firstOfMonth.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
    page: 1,
    per_page: 20,
  });

  return <EarningsClient initial={initial.success ? initial.data : EMPTY_STATE} />;
}
