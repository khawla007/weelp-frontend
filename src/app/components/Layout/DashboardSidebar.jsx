'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeft } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const STORAGE_KEY = 'dashboard_sidebar_collapsed';
const MOBILE_BREAKPOINT = 768;

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function filterNav(nav, isCreator) {
  return nav.filter((item) => {
    if (item.creatorOnly && !isCreator) return false;
    if (item.nonCreatorOnly && isCreator) return false;
    return true;
  });
}

function isActive(pathname, url) {
  if (url === '/dashboard/customer') return pathname === url;
  return pathname.startsWith(url);
}

export default function DashboardSidebar({ nav, user, accent = 'bg-secondaryDark text-white' }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const initial = stored !== null ? stored === 'true' : typeof window !== 'undefined' && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring persisted/responsive collapse on mount; SSR-safe alternative would require useSyncExternalStore
    setCollapsed(initial);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      sessionStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const visible = filterNav(nav, !!user?.is_creator);
  const initials = getInitials(user?.name);

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'} shrink-0`}>
      <div className="sticky top-[112px] h-[calc(100vh-112px)] flex flex-col">
        <div className="flex-1 py-4 px-2 space-y-2 overflow-y-auto">
          <div className={`bg-white rounded-xl shadow-md border border-gray-200/60 transition-all duration-300 ease-in-out ${collapsed ? 'p-2' : 'p-3'} mb-5`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
              <Avatar className="h-11 w-11 rounded-full border-2 border-white shadow-sm flex-shrink-0">
                {user?.avatar && <AvatarImage src={user.avatar} alt={user.name || 'user'} />}
                <AvatarFallback className="text-white font-semibold rounded-full text-base" style={{ backgroundColor: '#568f7c' }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && <span className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</span>}
            </div>
          </div>

          {visible.map((route) => {
            const active = isActive(pathname, route.url);
            return (
              <Link
                key={route.url}
                href={route.url}
                data-active={active ? 'true' : 'false'}
                className={`flex items-center gap-2 px-3 py-2 text-md transition-colors rounded-full ${active ? accent : 'text-black hover:bg-gray-100'}`}
              >
                <route.icon strokeWidth={2} className="size-5" />
                {!collapsed && <span>{route.title}</span>}
              </Link>
            );
          })}
        </div>

        <div className="p-2 border-t border-gray-100">
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-2.5 w-full flex justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors min-h-[40px]"
          >
            <PanelLeft size={20} className={collapsed ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        </div>
      </div>
    </aside>
  );
}
