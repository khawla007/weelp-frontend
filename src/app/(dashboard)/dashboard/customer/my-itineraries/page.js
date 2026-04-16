import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getMyItineraries } from '@/lib/actions/customerItineraries';
import MyItinerariesClientWrapper from './MyItinerariesClientWrapper';

export const metadata = {
  title: 'My Itineraries - Weelp',
  description: 'View your saved and customized itineraries',
};

export default async function MyItinerariesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/user/login');
  }

  const result = await getMyItineraries();
  const itineraries = result.success ? result.data?.data || [] : [];
  const lastPage = result.success ? result.data?.last_page || 1 : 1;

  const isCreator = !!session?.user?.is_creator;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#142A38]">My Itineraries</h1>
          <p className="text-[#5A5A5A] mt-1">Your saved and customized travel itineraries.</p>
        </div>
      </div>

      <MyItinerariesClientWrapper initialItineraries={itineraries} lastPage={lastPage} isCreator={isCreator} />
    </div>
  );
}
