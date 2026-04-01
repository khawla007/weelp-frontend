import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import CreatorSidebar from '@/app/components/Dashboard/Creator/CreatorSidebar';

export default async function CreatorDashboardLayout({ children }) {
  const session = await auth();

  // Access control: only creators can access
  if (!session?.user?.is_creator) {
    redirect('/explore');
  }

  return (
    <div className="flex min-h-screen bg-[#F5F9FA]">
      <CreatorSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
