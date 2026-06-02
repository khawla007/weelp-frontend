export const dynamic = 'force-dynamic';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getAllCitiesListPublic } from '@/lib/services/cities';
import { getAllTransfersCreator } from '@/lib/services/transfers';
import CreatorItineraryFormShell from '@/app/components/Pages/FRONT_END/creator-itinerary-form/CreatorItineraryFormShell';

export const metadata = {
  title: 'Create Itinerary - Weelp',
  description: 'Build a new itinerary for review',
};

export default async function CreateItineraryPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/user/login');
  }

  // Building an itinerary is creator-only (this page fetches /api/creator/transfers).
  // Match the sibling creator pages (earnings/payouts/analytics) and send non-creators
  // back to their dashboard instead of letting the creator-only fetch 403.
  if (!session.user.is_creator) {
    redirect('/dashboard/customer');
  }

  const [citiesRes, transfers] = await Promise.all([getAllCitiesListPublic(), getAllTransfersCreator()]);

  const locations = citiesRes?.data || [];

  return <CreatorItineraryFormShell mode="create" locations={locations} alltransfers={transfers} />;
}
