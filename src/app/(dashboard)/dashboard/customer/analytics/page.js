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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#142A38]">Analytics</h1>
        <p className="text-[#5A5A5A] mt-1">Track your creator performance metrics.</p>
      </div>

      <div className="text-center py-16 border border-dashed border-[#435a6742] rounded-lg">
        <p className="text-lg text-[#142A38]">Coming Soon</p>
        <p className="text-[#5A5A5A] mt-2">Detailed analytics dashboard is under development.</p>
      </div>
    </div>
  );
}
