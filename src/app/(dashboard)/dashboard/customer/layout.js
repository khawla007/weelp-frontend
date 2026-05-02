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
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex flex-1 relative bg-[#F5F9FA]">
        <DashboardSidebar nav={DashboardUserNav.userRoutes} user={user} />
        <main className="flex-1 w-full dark:bg-black">
          <DashboardContentWrapper>{children}</DashboardContentWrapper>
          <Toaster />
        </main>
      </div>
      <Footer />
    </div>
  );
}
