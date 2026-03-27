'use client';

import { AppSidebar } from '@/app/components/Pages/DASHBOARD/user/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { DashboardContentWrapper } from '@/app/components/Pages/DASHBOARD/DashboardContentWrapper';
import Header from '@/app/components/Layout/header';
import Footer from '@/app/components/Layout/footer';
import { PanelLeft } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function UserLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === '/dashboard/customer') return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header stays at top, full width */}
      <Header />

      {/* Customer Dashboard Content Area */}
      <div className="flex flex-1 relative bg-[#F5F9FA]">
        {/* Sidebar - Stretches full height, content is sticky */}
        <aside
          className={`
            bg-white border-r border-gray-200 flex flex-col
            transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? 'w-16' : 'w-64'}
            shrink-0
          `}
        >
          {/* Sticky wrapper to keep content visible while scrolling the page */}
          <div className="sticky top-[112px] h-[calc(100vh-112px)] flex flex-col">
            {/* Sidebar Content */}
            <div className="flex-1 py-4 px-2 space-y-2 overflow-y-auto">
              <Link
                href="/dashboard/customer"
                className={`flex items-center gap-2 px-3 py-2 text-md transition-colors rounded-md ${isActive('/dashboard/customer') ? 'bg-secondaryDark text-white' : 'text-black hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8" />
                  <path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9" />
                  <path d="M19 13v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6" />
                </svg>
                {!sidebarCollapsed && <span>Bookings</span>}
              </Link>
              <Link
                href="/dashboard/customer/reviews"
                className={`flex items-center gap-2 px-3 py-2 text-md transition-colors rounded-md ${isActive('/dashboard/customer/reviews') ? 'bg-secondaryDark text-white' : 'text-black hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {!sidebarCollapsed && <span>Reviews</span>}
              </Link>
              <Link
                href="/dashboard/customer/help-center"
                className={`flex items-center gap-2 px-3 py-2 text-md transition-colors rounded-md ${isActive('/dashboard/customer/help-center') ? 'bg-secondaryDark text-white' : 'text-black hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
                {!sidebarCollapsed && <span>Help Center</span>}
              </Link>
              <Link
                href="/dashboard/customer/settings"
                className={`flex items-center gap-2 px-3 py-2 text-md transition-colors rounded-md ${isActive('/dashboard/customer/settings') ? 'bg-secondaryDark text-white' : 'text-black hover:bg-gray-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15.09a2 2 0 0 0 .73 2.73l-.22.38a2 2 0 0 0-2.73.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {!sidebarCollapsed && <span>Settings</span>}
              </Link>
            </div>

            {/* Collapse Button */}
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 w-full flex justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <PanelLeft size={20} className={sidebarCollapsed ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Takes natural height, making the page scroll */}
        <main className="flex-1 w-full dark:bg-black">
          <DashboardContentWrapper>{children}</DashboardContentWrapper>
          <Toaster />
        </main>
      </div>

      {/* Footer is now completely full-width and sits at the very bottom of the page */}
      <Footer />
    </div>
  );
}
