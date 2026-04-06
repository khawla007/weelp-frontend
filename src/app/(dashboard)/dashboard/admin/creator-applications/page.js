import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getCreatorApplications } from '@/lib/services/creatorApplications';
import ApplicationsClientWrapper from './ApplicationsClientWrapper';

export const metadata = {
  title: 'Creator Applications - Weelp Admin',
  description: 'Manage creator applications',
};

export default async function CreatorApplicationsPage() {
  const session = await auth();

  if (!session?.user?.role || !['admin', 'super_admin'].includes(session.user.role)) {
    redirect('/dashboard/admin');
  }

  const result = await getCreatorApplications();
  const applications = result?.data?.data || result?.data || [];
  const lastPage = result?.data?.last_page || result?.last_page || 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#142A38]">Creator Applications</h1>
          <p className="text-[#5A5A5A] mt-1">Review and manage creator applications.</p>
        </div>
      </div>

      <ApplicationsClientWrapper initialApplications={applications} initialLastPage={lastPage} />
    </div>
  );
}
