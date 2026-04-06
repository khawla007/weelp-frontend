'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { Badge } from '@/components/ui/badge';
import { fetchUnreadCount, fetchNotifications, markAsRead, markAllAsRead } from '@/lib/services/notifications';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { timeAgo } from '@/lib/utils';

export default function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const dropdownRef = useRef(null);

  const userId = session?.user?.id;

  // Poll unread count every 30s
  const { data: countData, mutate: mutateCount } = useSWR(userId ? ['notifications-unread', userId] : null, () => fetchUnreadCount(), { refreshInterval: 30000 });

  const unreadCount = countData?.count || 0;

  // Load notifications when dropdown opens
  useEffect(() => {
    if (!open || !userId) return;
    const load = async () => {
      setLoadingNotifs(true);
      const res = await fetchNotifications(1);
      setNotifications(res?.data?.data || []);
      setLoadingNotifs(false);
    };
    load();
  }, [open, userId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!session) return null;

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
    mutateCount();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    mutateCount();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button type="button" className="relative flex items-center justify-center text-[#0c2536] transition hover:text-[#142a38]" onClick={() => setOpen(!open)}>
        <Bell className="size-5" strokeWidth={1.5} />
        {unreadCount > 0 && <Badge className="absolute -right-3 -top-2 scale-75 bg-red-500 text-white border-0">{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-[360px] bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#0c2536]">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-[#57947d] hover:underline flex items-center gap-1">
                <CheckCheck size={14} /> Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[320px] overflow-y-auto">
            {loadingNotifs ? (
              <div className="p-6 text-center text-sm text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No notifications yet</div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => !notif.read_at && handleMarkAsRead(notif.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.read_at ? 'bg-[#57947d]/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.read_at ? 'bg-[#57947d]' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0c2536] truncate">{notif.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 text-center">
            <NavigationLink href="/dashboard/customer/settings/notifications" className="text-xs text-[#57947d] hover:underline" onClick={() => setOpen(false)}>
              View All
            </NavigationLink>
          </div>
        </div>
      )}
    </div>
  );
}
