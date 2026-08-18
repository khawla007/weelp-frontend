import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/components/Pages/DASHBOARD/admin/app-sidebar';
import AdminHeader from '@/app/components/Pages/DASHBOARD/admin/header';
import { Toaster } from '@/components/ui/toaster';
import { auth } from '@/lib/auth/auth';
import { DashboardContentWrapper } from '@/app/components/Pages/DASHBOARD/DashboardContentWrapper';

const AdminLayout = async ({ children }) => {
  const session = await auth();

  // console.log(session);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full min-w-0 bg-muted dark:bg-background">
        <div>
          <AppSidebar session={session} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <>
            <AdminHeader session={session} />
          </>
          <main className="min-w-0 flex-1">
            <DashboardContentWrapper>
              <div className="mx-auto w-full max-w-[1600px] min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10">{children}</div>
            </DashboardContentWrapper>
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
