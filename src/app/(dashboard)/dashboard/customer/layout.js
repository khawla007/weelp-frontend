'use client';

import { Toaster } from '@/components/ui/toaster';
import { DashboardContentWrapper } from '@/app/components/Pages/DASHBOARD/DashboardContentWrapper';
import Header from '@/app/components/Layout/header';
import Footer from '@/app/components/Layout/footer';
import DashboardSidebar from '@/app/components/Layout/DashboardSidebar';
import { useSession } from 'next-auth/react';
import { DashboardUserNav } from '@/app/Data/userData';
import { PanelLeft } from 'lucide-react';

function DashboardMobileBar({ user }) {
  const firstName = user?.name?.trim()?.split(' ')?.[0] || 'Customer';

  const toggleSidebar = () => {
    const bar = document.querySelector('[data-dashboard-mobile-bar="true"]');
    const offset = Math.round(bar?.getBoundingClientRect().bottom || 48);
    window.dispatchEvent(new CustomEvent('dashboard-sidebar-toggle', { detail: { offset } }));
  };

  return (
    <div data-dashboard-mobile-bar="true" className="sticky top-[115px] z-[80] flex h-12 items-center justify-center border-y border-border bg-background/95 px-4 shadow-sm backdrop-blur lg:hidden">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="absolute left-4 flex size-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted hover:text-foreground/70"
      >
        <PanelLeft size={20} className="rotate-180" />
      </button>
      <p className="max-w-[calc(100%-6rem)] truncate text-center text-sm font-semibold text-foreground">Welcome {firstName}</p>
    </div>
  );
}

export default function UserLayout({ children }) {
  const { data: session } = useSession();
  const user = session?.user || {};

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="sticky top-0 z-[90] lg:static">
        <Header />
      </div>
      <div className="flex flex-1 min-w-0 flex-col bg-muted/40 dark:bg-background">
        <DashboardMobileBar user={user} />
        <div className="flex flex-1 relative min-w-0">
          <DashboardSidebar nav={DashboardUserNav.userRoutes} user={user} />
          <main className="min-w-0 flex-1 w-full overflow-x-hidden bg-background">
            <DashboardContentWrapper>{children}</DashboardContentWrapper>
            <Toaster />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
