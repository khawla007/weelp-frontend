'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { NavMain } from './nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail, useSidebar } from '@/components/ui/sidebar';
import { DashboardAdminNav } from '@/constants/navigations/AdminNavigation';
import { useSession } from 'next-auth/react';

const { adminRoutes } = DashboardAdminNav;

export function AppSidebar({ ...props }) {
  const { state, open, toggleSidebar, isMobile } = useSidebar();
  const { data: session } = useSession(); //getsssion

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border border-r-0 h-16 px-1 mx-1 flex flex-row justify-start items-center">
        <div className={`flex w-full items-center gap-4 ${open ? 'px-6' : 'justify-center'}`}>
          <Menu onClick={toggleSidebar} className="hover:bg-gray-100 cursor-pointer" />
          {state !== 'collapsed' ? <img src="/assets/images/SiteLogo.png" alt="Logo" className="h-10" /> : ''}
        </div>
      </SidebarHeader>

      <SidebarContent className={isMobile ? '' : 'tfc_scroll'}>
        <NavMain items={adminRoutes} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
