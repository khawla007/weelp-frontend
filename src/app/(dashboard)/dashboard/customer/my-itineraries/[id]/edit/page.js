import { auth } from '@/lib/auth/auth';
import { redirect, notFound } from 'next/navigation';
import { getDraftItinerary } from '@/lib/actions/creatorItineraries';
import { getAllCitiesListPublic } from '@/lib/services/cities';
import { getAllTransfersCreator } from '@/lib/services/transfers';
import CreatorItineraryFormShell from '@/app/components/Pages/FRONT_END/creator-itinerary-form/CreatorItineraryFormShell';
import { reshapeDraftForForm } from '@/app/components/Pages/FRONT_END/creator-itinerary-form/reshapeDraftForForm';

export const metadata = {
  title: 'Edit Itinerary - Weelp',
  description: 'Edit your itinerary draft',
};

export default async function EditItineraryDraftPage({ params }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/user/login');
  }

  // Editing an itinerary is creator-only (this page fetches /api/creator/transfers).
  // Match the sibling creator pages (earnings/payouts/analytics) and send non-creators
  // back to their dashboard instead of letting the creator-only fetch 403.
  if (!session.user.is_creator) {
    redirect('/dashboard/customer');
  }

  const { id } = await params;

  const [draftResult, citiesRes, transfers] = await Promise.all([getDraftItinerary(id), getAllCitiesListPublic(), getAllTransfersCreator()]);

  if (!draftResult.success || !draftResult.data) {
    notFound();
  }

  const initialData = reshapeDraftForForm(draftResult.data);
  const locations = citiesRes?.data || [];

  return <CreatorItineraryFormShell mode="edit" draftMode={draftResult.data.draft_mode || 'edit'} draftId={id} initialData={initialData} locations={locations} alltransfers={transfers} />;
}
