import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getCreatorItineraryDiff } from '@/lib/actions/creatorItineraries';
import DiffViewClient from './DiffViewClient';

export const metadata = {
  title: 'Review Edit Changes - Weelp Admin',
  description: 'Review creator itinerary edit changes',
};

export default async function DiffPage({ params }) {
  const session = await auth();
  if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
    redirect('/dashboard/admin');
  }

  const { id } = await params;
  const result = await getCreatorItineraryDiff(id);

  if (!result.success) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#142A38] mb-4">Review Edit Changes</h1>
        <p className="text-[#5A5A5A]">{result.message || 'No pending edit found for this itinerary.'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#142A38]">Review Edit Changes</h1>
        <p className="text-[#5A5A5A] mt-1">Compare the approved version with proposed changes.</p>
      </div>
      <DiffViewClient approved={result.data.approved} draft={result.data.draft} itineraryId={id} />
    </div>
  );
}
