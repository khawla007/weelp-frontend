'use client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, UserIcon, Settings, Users, ChevronDown, Home } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function UserMenu({ session }) {
  const user = session?.user || {};

  const { name = '', email = '', role = '', avatar, avatar_url } = user; // destructure data with default

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
  const avatarSrc = avatar || avatar_url;

  // Format role for display
  const formatRole = (role) => {
    if (!role) return '';
    return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* suppressHydrationWarning prevents React hydration mismatch for Radix UI generated IDs */}
        <DropdownMenu>
          <div suppressHydrationWarning>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className={cn('data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground', 'gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors')}
              >
                <Avatar className="h-9 w-9 rounded-lg border-2 border-white shadow-sm">
                  {avatarSrc && <AvatarImage src={avatarSrc} alt={name || 'user'} />}
                  <AvatarFallback className="text-white font-semibold rounded-lg" style={{ backgroundColor: '#568f7c' }}>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-gray-900 dark:text-gray-100">{name || 'User'}</span>
                  <span className="text-muted-foreground truncate text-xs flex items-center gap-1">
                    {formatRole(role)}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="w-56 rounded-lg shadow-lg border-gray-200 dark:border-gray-700" side="bottom" align="end" sideOffset={8}>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>Back to Site</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <Link href="/dashboard/admin/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                <Link href="/dashboard/admin/users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 focus:text-red-600"
              onClick={() => {
                signOut({ callbackUrl: '/' });
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
