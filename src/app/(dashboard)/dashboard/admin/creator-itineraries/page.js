import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getAdminCreatorItineraries } from '@/lib/actions/creatorItineraries';
import CreatorItinerariesClientWrapper from './CreatorItinerariesClientWrapper';

export const metadata = {
  title: 'Creator Itineraries - Weelp Admin',
  description: 'Review and manage creator itineraries',
};

export default async function CreatorItinerariesPage() {
  const session = await auth();

  if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
    redirect('/dashboard/admin');
  }

  const result = await getAdminCreatorItineraries();
  const itineraries = result.success ? result.data?.data || [] : [];
  const lastPage = result.success ? result.data?.last_page || 1 : 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#142A38]">Creator Itineraries</h1>
          <p className="text-[#5A5A5A] mt-1">Review and manage creator-submitted itineraries.</p>
        </div>
      </div>

      <CreatorItinerariesClientWrapper initialItineraries={itineraries} initialLastPage={lastPage} />
    </div>
  );
}
