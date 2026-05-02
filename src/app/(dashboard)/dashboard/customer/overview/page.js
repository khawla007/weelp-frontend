import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import CreatorStatCards from '@/app/components/Pages/FRONT_END/explore/CreatorStatCards';
import QuickActions from '@/app/components/Dashboard/Creator/QuickActions';
import ActivityFeed from '@/app/components/Dashboard/Creator/ActivityFeed';
import NotificationWidget from '@/app/components/Dashboard/NotificationWidget';

export const metadata = {
  title: 'Dashboard Overview - Weelp',
  description: 'View your account activity and statistics',
};

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 rounded-xl bg-white border border-[#435a6742] animate-pulse" />
      ))}
    </div>
  );
}

export default async function OverviewPage() {
  const session = await auth();

  if (!session?.user?.is_creator) {
    redirect('/dashboard/customer');
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#142A38]">Dashboard Overview</h1>
        <p className="text-[#5A5A5A] mt-1">Here&apos;s what&apos;s happening with your content.</p>
      </div>

      <section className="mb-6 sm:mb-8">
        <Suspense fallback={<StatCardsSkeleton />}>
          <CreatorStatCards />
        </Suspense>
      </section>

      <section className="mb-6 sm:mb-8">
        <h2 className="text-lg font-semibold text-[#142A38] mb-4">Quick Actions</h2>
        <QuickActions />
      </section>

      <section className="mb-6 sm:mb-8">
        <NotificationWidget session={session} />
      </section>

      <section>
        <ActivityFeed limit={5} />
      </section>
    </div>
  );
}
