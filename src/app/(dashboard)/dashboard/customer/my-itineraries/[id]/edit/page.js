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

  const { id } = await params;

  const [draftResult, citiesRes, transfers] = await Promise.all([
    getDraftItinerary(id),
    getAllCitiesListPublic(),
    getAllTransfersCreator(),
  ]);

  if (!draftResult.success || !draftResult.data) {
    notFound();
  }

  const initialData = reshapeDraftForForm(draftResult.data);
  const locations = citiesRes?.data || [];

  return (
    <CreatorItineraryFormShell
      mode="edit"
      draftId={id}
      initialData={initialData}
      locations={locations}
      alltransfers={transfers}
    />
  );
}
