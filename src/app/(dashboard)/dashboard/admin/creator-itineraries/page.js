import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getAdminCreatorItineraries } from '@/lib/actions/creatorItineraries';
import CreatorItinerariesClientWrapper from './CreatorItinerariesClientWrapper';

export const metadata = {
  title: 'Creator Itineraries - Weelp Admin',
  description: 'Review and manage creator itineraries',
};

export default async function CreatorItinerariesPage({ searchParams = Promise.resolve({}) } = {}) {
  const session = await auth();

  if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
    redirect('/dashboard/admin');
  }

  const params = await searchParams;
  const view = params?.view === 'trash' ? 'trash' : 'active';
  const allowedStatuses = new Set(['pending', 'approved', 'rejected', 'draft']);
  const status = view === 'active' && allowedStatuses.has(params?.status) ? params.status : '';
  const page = Math.max(1, Number.parseInt(params?.page ?? '1', 10) || 1);
  const result = await getAdminCreatorItineraries({ view, status, page });
  const itineraries = result.success ? result.data?.data || [] : [];
  const lastPage = result.success ? result.data?.last_page || 1 : 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Creator Itineraries</h1>
          <p className="text-muted-foreground mt-1">Review and manage creator-submitted itineraries.</p>
        </div>
      </div>

      <CreatorItinerariesClientWrapper initialItineraries={itineraries} initialLastPage={lastPage} currentPage={page} activeView={view} activeStatus={status} />
    </div>
  );
}
