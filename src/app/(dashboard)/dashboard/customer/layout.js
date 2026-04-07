'use client';

import { Toaster } from '@/components/ui/toaster';
import { DashboardContentWrapper } from '@/app/components/Pages/DASHBOARD/DashboardContentWrapper';
import Header from '@/app/components/Layout/header';
import Footer from '@/app/components/Layout/footer';
import { PanelLeft } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { DashboardUserNav } from '@/app/Data/userData';

export default function UserLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user || {};

  const { name = '', avatar, is_creator } = user;

  // Generate initials from name for fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const userInitials = getInitials(name);
  const avatarSrc = avatar;

  const isActive = (path) => {
    if (path === '/dashboard/customer') return pathname === path;
    return pathname.startsWith(path);
  };

  // Filter routes based on creator status
  const visibleRoutes = DashboardUserNav.userRoutes.filter((item) => {
    return !item.creatorOnly || is_creator;
  });

  // Icon component map
  const IconComponent = ({ icon: Icon }) => <Icon />;

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
              {/* User Profile Section */}
              <div
                className={`
                bg-white rounded-lg shadow-sm border border-gray-200/50
                transition-all duration-300 ease-in-out
                ${sidebarCollapsed ? 'p-2' : 'p-3'}
                mb-5
              `}
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                  {/* Avatar */}
                  <Avatar className="h-10 w-10 rounded-full border-2 border-white shadow-sm flex-shrink-0">
                    {avatarSrc && <AvatarImage src={avatarSrc} alt={name || 'user'} />}
                    <AvatarFallback className="text-white font-semibold rounded-full" style={{ backgroundColor: '#568f7c' }}>
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Name - only show when expanded */}
                  {!sidebarCollapsed && <span className="text-sm font-medium text-gray-900 truncate">{name || 'User'}</span>}
                </div>
              </div>

              {/* Dynamic Navigation Items from userData.js */}
              {visibleRoutes.map((route) => (
                <Link
                  key={route.url}
                  href={route.url}
                  className={`flex items-center gap-2 px-3 py-2 text-md transition-colors rounded-md ${isActive(route.url) ? 'bg-secondaryDark text-white' : 'text-black hover:bg-gray-100'}`}
                >
                  <route.icon strokeWidth={2} className="size-5" />
                  {!sidebarCollapsed && <span>{route.title}</span>}
                </Link>
              ))}
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
