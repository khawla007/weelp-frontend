import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/components/Pages/DASHBOARD/admin/app-sidebar';
import AdminHeader from '@/app/components/Pages/DASHBOARD/admin/header';
import { Toaster } from '@/components/ui/toaster';
import { auth } from '@/lib/auth/auth';
import { LoginForm } from '@/app/components/Form/LoginForm';
import { DashboardContentWrapper } from '@/app/components/Pages/DASHBOARD/DashboardContentWrapper';

const AdminLayout = async ({ children }) => {
  const session = await auth();

  // console.log(session);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50 w-full">
        <div>
          <AppSidebar />
        </div>
        <div className="flex flex-col w-full">
          <>
            <AdminHeader />
          </>
          <main className="flex-1 overflow-auto tfc_scroll">
            <DashboardContentWrapper>
              <div className="container mx-auto p-8 sm:p-12 w-full">{children}</div>
            </DashboardContentWrapper>
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
