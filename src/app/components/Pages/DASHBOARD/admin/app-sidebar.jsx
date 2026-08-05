'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { NavMain } from './nav-main';
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail, useSidebar } from '@/components/ui/sidebar';
import { DashboardAdminNav } from '@/constants/navigations/AdminNavigation';
import { getLogoUrl } from '@/lib/config/brand';

const { adminRoutes } = DashboardAdminNav;

export function AppSidebar({ session, ...props }) {
  const { state, open, toggleSidebar, isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border border-r-0 h-16 px-1 mx-1 flex flex-row justify-start items-center">
        <div className={`flex w-full items-center gap-4 ${open ? 'px-6' : 'justify-center'}`}>
          <Menu onClick={toggleSidebar} className="hover:bg-muted cursor-pointer" />
          {state !== 'collapsed' ? (
            <div className="flex items-center gap-3">
              <img src={getLogoUrl()} alt="Weelp" className="h-9 w-auto" />
              <span className="text-[18px] font-semibold text-foreground" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}>
                Weelp.
              </span>
            </div>
          ) : null}
        </div>
      </SidebarHeader>

      <SidebarContent className={isMobile ? '' : 'tfc_scroll'}>
        <NavMain items={adminRoutes} />
      </SidebarContent>

      <SidebarRail className="after:hidden" />
    </Sidebar>
  );
}
