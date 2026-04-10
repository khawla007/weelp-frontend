import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import DraftEditorClient from './DraftEditorClient';

export const metadata = {
  title: 'Edit Itinerary Draft - Weelp',
  description: 'Edit your itinerary draft before submitting for review',
};

export default async function DraftEditPage({ params }) {
  const session = await auth();
  if (!session?.user) {
    redirect('/user/login');
  }

  const { id } = await params;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#142A38]">Edit Draft</h1>
        <p className="text-[#5A5A5A] mt-1">Modify your itinerary and submit for admin review.</p>
      </div>
      <DraftEditorClient draftId={id} />
    </div>
  );
}
