'use client';

import { Toaster } from '@/components/ui/toaster';
import { DashboardContentWrapper } from '@/app/components/Pages/DASHBOARD/DashboardContentWrapper';
import Header from '@/app/components/Layout/header';
import Footer from '@/app/components/Layout/footer';
import DashboardSidebar from '@/app/components/Layout/DashboardSidebar';
import { useSession } from 'next-auth/react';
import { DashboardUserNav } from '@/app/Data/userData';

export default function UserLayout({ children }) {
  const { data: session } = useSession();
  const user = session?.user || {};

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex flex-1 relative bg-muted/40 dark:bg-background">
        <DashboardSidebar nav={DashboardUserNav.userRoutes} user={user} />
        <main className="flex-1 w-full bg-background">
          <DashboardContentWrapper>{children}</DashboardContentWrapper>
          <Toaster />
        </main>
      </div>
      <Footer />
    </div>
  );
}
