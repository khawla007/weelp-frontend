'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import UserMenu from '../UserMenu';
import { DashboardUserNav } from '@/app/Data/userData';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserMenu2 from './UserMenu2';

const { userRoutes } = DashboardUserNav;

export function AppSidebar() {
  const { state, open, toggleSidebar, isMobile } = useSidebar();
  const pathname = usePathname(); // pathname

  return (
    <>
      {!isMobile ? (
        <Sidebar variant={'inset'} collapsible="icon" className={'border border-x-1'}>
          <SidebarInset>
            <SidebarContent>
              <SidebarGroup className={'h-full justify-between'}>
                <SidebarGroupLabel className={'hidden'}>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className={'space-y-4'}>
                    {userRoutes.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`flex items-center gap-2 px-4 py-2 text-xl transition-colors text-black hover:bg-secondaryDark hover:text-white dark:hover:bg-white dark:hover:text-black
    ${pathname === item.url && 'bg-secondaryDark text-white dark:bg-white dark:text-black'}
  `}
                        >
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
                <SidebarFooter className={'px-0'}>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <UserMenu2 />
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarFooter>
              </SidebarGroup>
            </SidebarContent>
          </SidebarInset>
        </Sidebar>
      ) : (
        <Sidebar variant={'inset'} collapsible="icon">
          <SidebarInset>
            <SidebarContent>
              <SidebarGroup className={'h-full justify-between'}>
                <SidebarGroupLabel className={'hidden'}>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className={'space-y-2'}>
                    {userRoutes.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className={`font-medium hover:bg-secondaryDark hover:text-white text-sm ${pathname === item.url && 'bg-secondaryDark text-white dark:bg-white'}`}>
                          <Link href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
                <SidebarFooter>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <UserMenu2 />
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarFooter>
              </SidebarGroup>
            </SidebarContent>
          </SidebarInset>
        </Sidebar>
      )}
    </>
  );
}
