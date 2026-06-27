'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PanelLeft } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const STORAGE_KEY = 'dashboard_sidebar_collapsed';
const COMPACT_BREAKPOINT = 1024;

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

export default function DashboardSidebar({ nav, user, accent = 'text-foreground' }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [compactTop, setCompactTop] = useState(160);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${COMPACT_BREAKPOINT - 1}px)`);

    const syncSidebar = (matches) => {
      setIsCompact(matches);

      if (matches) {
        setCollapsed(true);
        return;
      }

      const stored = sessionStorage.getItem(STORAGE_KEY);
      setCollapsed(stored !== null ? stored === 'true' : false);
    };

    syncSidebar(mql.matches);

    const onChange = (e) => {
      syncSidebar(e.matches);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;

      if (!isCompact) {
        sessionStorage.setItem(STORAGE_KEY, String(next));
      }

      return next;
    });
  };

  const visible = filterNav(nav, !!user?.is_creator);
  const initials = getInitials(user?.name);

  const isOpen = !collapsed;

  useEffect(() => {
    const handleDashboardSidebarToggle = (event) => {
      if (typeof event?.detail?.offset === 'number') {
        setCompactTop(event.detail.offset);
      }

      toggle();
    };

    window.addEventListener('dashboard-sidebar-toggle', handleDashboardSidebarToggle);
    return () => window.removeEventListener('dashboard-sidebar-toggle', handleDashboardSidebarToggle);
  }, [toggle]);

  return (
    <>
      {isCompact && isOpen && (
        <button type="button" aria-label="Close sidebar overlay" onClick={toggle} className="fixed inset-x-0 bottom-0 z-[90] bg-foreground/40 lg:hidden" style={{ top: compactTop }} />
      )}

      <aside
        aria-hidden={isCompact && !isOpen ? true : undefined}
        inert={isCompact && !isOpen ? '' : undefined}
        className={`bg-background border-r border-border flex flex-col transition-[width,transform] duration-300 ease-in-out motion-reduce:transition-none ${
          isCompact ? `fixed bottom-0 left-0 z-[100] w-72 max-w-[85vw] shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}` : `${collapsed ? 'w-16' : 'w-64'} shrink-0`
        }`}
        style={isCompact ? { top: compactTop } : undefined}
      >
        <div className={isCompact ? 'flex h-full flex-col' : 'sticky top-[112px] h-[calc(100vh-112px)] flex flex-col'}>
          <div className="flex-1 py-4 px-2 space-y-2 overflow-y-auto">
            <div
              className={`bg-card rounded-xl shadow-md dark:shadow-none border border-border/60 transition-[background-color,border-color,box-shadow] duration-300 ease-in-out motion-reduce:transition-none ${collapsed ? 'p-2' : 'p-3'} mb-5`}
            >
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                <Avatar className="h-11 w-11 rounded-full border-2 border-background shadow-sm dark:shadow-none flex-shrink-0">
                  {user?.avatar && <AvatarImage src={user.avatar} alt={user.name || 'user'} />}
                  <AvatarFallback className="text-white font-semibold rounded-full text-base bg-weelp-sage-deep">{initials}</AvatarFallback>
                </Avatar>
                {!collapsed && <span className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</span>}
              </div>
            </div>

            {visible.map((route) => {
              const active = isActive(pathname, route.url);
              return (
                <Link
                  key={route.url}
                  href={route.url}
                  data-active={active ? 'true' : 'false'}
                  className={`flex items-center gap-2 px-3 py-2 text-md transition-colors duration-200 ease-out rounded-full ${active ? accent : 'text-foreground hover:text-foreground/70'}`}
                >
                  <route.icon strokeWidth={2} className="size-5" />
                  {!collapsed && <span>{route.title}</span>}
                </Link>
              );
            })}
          </div>

          <div className="p-2 border-t border-border">
            <button
              type="button"
              onClick={toggle}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-2.5 w-full flex justify-center text-foreground hover:text-foreground/70 rounded-md transition-colors duration-200 ease-out min-h-[40px]"
            >
              <PanelLeft size={20} className={collapsed ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
