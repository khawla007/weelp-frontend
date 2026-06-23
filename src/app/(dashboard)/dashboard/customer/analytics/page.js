import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Analytics - Weelp',
  description: 'View your creator performance metrics',
};

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user?.is_creator) {
    redirect('/dashboard/customer');
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your creator performance metrics.</p>
      </div>

      <div className="text-center py-16 border border-dashed border-border rounded-lg">
        <p className="text-lg font-semibold text-foreground">Coming Soon</p>
        <p className="text-muted-foreground mt-2">Detailed analytics dashboard is under development.</p>
      </div>
    </div>
  );
}
