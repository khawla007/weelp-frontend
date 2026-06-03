'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Tag, Megaphone, Newspaper } from 'lucide-react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { Badge } from '@/components/ui/badge';
import { fetchUnreadCount, fetchNotifications, markAsRead, markAllAsRead, markSeen } from '@/lib/services/notifications';
import { fetchAnnouncements } from '@/lib/services/announcements';
import { getDismissedIds, dismissIds } from '@/lib/announcements/readState';
import { mergeFeed } from '@/lib/announcements/merge';
import { useIsClient } from '@/hooks/useIsClient';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { timeAgo } from '@/lib/utils';

function isInternalLink(href) {
  return typeof href === 'string' && href.startsWith('/');
}

const TYPE_ICON = {
  offer: Tag,
  update: Megaphone,
  news: Newspaper,
};

export default function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [dismissed, setDismissed] = useState([]);
  const dropdownRef = useRef(null);
  const announcementsRef = useRef([]);
  const isClient = useIsClient();

  const userId = session?.user?.id;

  // Public announcements — fetched for everyone.
  const { data: announcements = [] } = useSWR('announcements-public', fetchAnnouncements, { refreshInterval: 60000 });

  // Keep a ref to the latest list so the open-effect (keyed on `open` only)
  // can read fresh data without re-running on every SWR refresh. Synced in an
  // effect rather than during render (refs must not be written while rendering).
  useEffect(() => {
    announcementsRef.current = announcements;
  }, [announcements]);

  // Personal unread count — only when logged in.
  const { data: countData, mutate: mutateCount } = useSWR(userId ? ['notifications-unread', userId] : null, () => fetchUnreadCount(), { refreshInterval: 30000 });
  const personalUnread = countData?.count || 0;

  // Hydrate dismissed ids from localStorage on mount (client-only).
  useEffect(() => {
    setDismissed(getDismissedIds()); // eslint-disable-line react-hooks/set-state-in-effect -- syncing client-only localStorage into state on mount
  }, []);

  const dismissedSet = new Set(dismissed);
  const announcementUnread = announcements.filter((a) => !dismissedSet.has(a.id)).length;
  const unreadCount = personalUnread + announcementUnread;

  // Load personal notifications when the dropdown opens (logged in only),
  // and mark them "seen" so the badge zeroes without touching per-item read_at.
  useEffect(() => {
    if (!open || !userId) return;
    const load = async () => {
      setLoadingNotifs(true);
      const res = await fetchNotifications(1);
      setNotifications(res?.data?.data || []);
      setLoadingNotifs(false);
      await markSeen();
      mutateCount();
    };
    load();
  }, [open, userId]);

  // Mark announcements visible AT OPEN TIME as read locally. Keyed on `open`
  // ONLY (reads the latest list via ref), so a background SWR refresh while the
  // dropdown stays open does NOT silently dismiss newly-arrived announcements.
  useEffect(() => {
    if (!open) return;
    const liveIds = announcementsRef.current.map((a) => a.id);
    if (liveIds.length === 0) return;
    dismissIds(liveIds, liveIds);
    setDismissed(getDismissedIds()); // eslint-disable-line react-hooks/set-state-in-effect -- reflecting the localStorage write back into state when the dropdown opens
  }, [open]);

  // Close dropdown on outside click.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

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

  const feed = mergeFeed({ announcements, personal: notifications });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex items-center justify-center text-[#18181b] transition hover:text-[#588f7a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm"
        onClick={() => setOpen(!open)}
      >
        <Bell className="size-5" strokeWidth={1.5} />
        {/* Gate the badge on isClient so the server render (no badge) matches the
            first client render, then reveal once data + localStorage resolve. */}
        {isClient && unreadCount > 0 && <Badge className="absolute -right-3 -top-2 scale-75 bg-[#ff725e] text-white border-0">{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-[360px] bg-white rounded-xl shadow-[0_14px_30px_rgba(24,24,27,0.1)] border border-[#e4e4e7] z-[9999] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#eaeaea]">
            <h3 className="text-sm font-semibold text-[#18181b]">Notifications</h3>
            {userId && personalUnread > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-[#588f7a] hover:underline flex items-center gap-1">
                <CheckCheck size={14} /> Mark all as read
              </button>
            )}
          </div>

          {/* Feed list */}
          <div className="max-h-[320px] overflow-y-auto">
            {loadingNotifs ? (
              <div className="p-6 text-center text-sm text-[#71717a]">Loading...</div>
            ) : feed.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#71717a]">No notifications yet</div>
            ) : (
              feed.slice(0, 8).map((item) => {
                if (item.source === 'announcement') {
                  const Icon = TYPE_ICON[item.type] || Megaphone;
                  const body = (
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 size-4 flex-shrink-0 text-[#588f7a]" strokeWidth={1.5} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#18181b] truncate">{item.title}</p>
                        <p className="text-xs text-[#71717a] line-clamp-2 mt-0.5">{item.message}</p>
                        <p className="text-xs text-[#71717a] mt-1">{timeAgo(item.created_at)}</p>
                      </div>
                    </div>
                  );
                  const rowClass = 'block px-4 py-3 border-b border-[#eaeaea] hover:bg-[#f4f4f5] transition-colors';
                  if (!item.link) {
                    return (
                      <div key={`a-${item.id}`} className="px-4 py-3 border-b border-[#eaeaea]">
                        {body}
                      </div>
                    );
                  }
                  // Internal deep-links go through NavigationLink (loading states,
                  // per CLAUDE.md); external/absolute links use a plain anchor.
                  return isInternalLink(item.link) ? (
                    <NavigationLink key={`a-${item.id}`} href={item.link} className={rowClass} onClick={() => setOpen(false)}>
                      {body}
                    </NavigationLink>
                  ) : (
                    <a key={`a-${item.id}`} href={item.link} target="_blank" rel="noopener noreferrer" className={rowClass}>
                      {body}
                    </a>
                  );
                }

                return (
                  <button
                    key={`p-${item.id}`}
                    onClick={() => !item.read_at && handleMarkAsRead(item.id)}
                    className={`w-full text-left px-4 py-3 border-b border-[#eaeaea] hover:bg-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#588f7a]/40 transition-colors ${!item.read_at ? 'bg-[#588f7a]/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!item.read_at ? 'bg-[#588f7a]' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#18181b] truncate">{item.title}</p>
                        <p className="text-xs text-[#71717a] line-clamp-2 mt-0.5">{item.message}</p>
                        <p className="text-xs text-[#71717a] mt-1">{timeAgo(item.created_at)}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {userId && (
            <div className="px-4 py-2 border-t border-[#eaeaea] text-center">
              <NavigationLink
                href="/dashboard/customer/settings/notifications"
                className="text-xs text-[#588f7a] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm"
                onClick={() => setOpen(false)}
              >
                View All
              </NavigationLink>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
