import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import CreatorStatCards from '@/app/components/Pages/FRONT_END/explore/CreatorStatCards';
import QuickActions from '@/app/components/Dashboard/Creator/QuickActions';
import ActivityFeed from '@/app/components/Dashboard/Creator/ActivityFeed';
import NotificationWidget from '@/app/components/Dashboard/NotificationWidget';

export const metadata = {
  title: 'Dashboard Overview - Weelp',
  description: 'View your account activity and statistics',
};

export default async function OverviewPage() {
  const session = await auth();

  if (!session?.user?.is_creator) {
    redirect('/dashboard/customer');
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#142A38]">Dashboard Overview</h1>
        <p className="text-[#5A5A5A] mt-1">Here&apos;s what&apos;s happening with your content.</p>
      </div>

      <section className="mb-8">
        <CreatorStatCards className="" />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-[#142A38] mb-4">Quick Actions</h2>
        <QuickActions />
      </section>

      <section className="mb-8">
        <NotificationWidget />
      </section>

      <section>
        <ActivityFeed limit={5} />
      </section>
    </div>
  );
}
