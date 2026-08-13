'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { Badge } from '@/components/ui/badge';
import { fetchUnreadCount, fetchNotifications, markAsRead, markAllAsRead, markSeen, markUnread } from '@/lib/services/notifications';
import { fetchAnnouncements } from '@/lib/services/announcements';
import { getDismissedIds, dismissIds, getReadAnnouncementIds, markAnnouncementRead, markAnnouncementUnread } from '@/lib/announcements/readState';
import { mergeFeed } from '@/lib/announcements/merge';
import { announcementToModalNotif } from '@/lib/announcements/modalAdapter';
import { useIsClient } from '@/hooks/useIsClient';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import NotificationRow from '@/app/components/Layout/NotificationRow';
import AnnouncementRow from '@/app/components/Layout/AnnouncementRow';
import NotificationDetailModal from '@/app/components/Layout/NotificationDetailModal';

export default function NotificationBell({ overHero = false }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [dismissed, setDismissed] = useState([]);
  const [readAnnouncements, setReadAnnouncements] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);
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

  // Hydrate dismissed + read ids from localStorage on mount (client-only).
  useEffect(() => {
    setDismissed(getDismissedIds()); // eslint-disable-line react-hooks/set-state-in-effect -- syncing client-only localStorage into state on mount
    setReadAnnouncements(getReadAnnouncementIds());
  }, []);

  const readAnnouncementsSet = new Set(readAnnouncements);

  const openAnnouncementDetail = (a) => {
    setSelectedNotif(announcementToModalNotif(a));
  };

  const toggleAnnouncementRead = (a, nextRead) => {
    const liveIds = announcementsRef.current.map((x) => x.id);
    if (nextRead) {
      markAnnouncementRead(a.id, liveIds);
    } else {
      markAnnouncementUnread(a.id);
    }
    setReadAnnouncements(getReadAnnouncementIds());
  };

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

  useEffect(() => {
    const handleHeaderDropdownOpen = (event) => {
      if (event.detail?.source !== 'notifications') {
        setOpen(false);
      }
    };

    window.addEventListener('weelp-header-dropdown-open', handleHeaderDropdownOpen);
    return () => window.removeEventListener('weelp-header-dropdown-open', handleHeaderDropdownOpen);
  }, []);

  const handleMarkAsRead = async (id) => {
    const result = await markAsRead(id);
    if (result?.success === true) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
      mutateCount();
    }
    return result;
  };

  const openNotif = async (notif) => {
    if (notif.display_style === 'popup') setSelectedNotif(notif);
    if (!notif.read_at) return handleMarkAsRead(notif.id);
    return { success: true };
  };

  const toggleNotifRead = async (notif) => {
    if (notif.read_at) {
      await markUnread(notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read_at: null } : n)));
    } else {
      await markAsRead(notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)));
    }
    mutateCount();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    mutateCount();
  };

  const feed = mergeFeed({ announcements, personal: notifications });
  const showBadge = isClient && unreadCount > 0;
  const displayCount = unreadCount > 99 ? '99+' : unreadCount;
  const notificationsHref = session?.user?.role === 'admin' || session?.user?.role === 'super_admin' ? '/dashboard/admin/notifications' : '/dashboard/customer/notifications';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label={showBadge ? `Notifications ${displayCount}` : 'Notifications'}
        aria-expanded={open}
        aria-controls="notifications-popover"
        className={`relative flex h-11 w-11 items-center justify-center ${overHero ? 'text-foreground dark:text-white focus-visible:ring-offset-white' : 'text-foreground focus-visible:ring-offset-background'} rounded-full transition hover:text-weelp-sage-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2`}
        onClick={() => {
          const willOpen = !open;
          if (willOpen) {
            window.dispatchEvent(new CustomEvent('weelp-header-dropdown-open', { detail: { source: 'notifications' } }));
          }
          setOpen(willOpen);
        }}
      >
        <Bell className="size-5" strokeWidth={1.5} />
        {/* Gate the badge on isClient so the server render (no badge) matches the
            first client render, then reveal once data + localStorage resolve. */}
        {showBadge && <Badge className="absolute -right-3 -top-2 scale-75 bg-weelp-discount text-white border-0">{displayCount}</Badge>}
      </button>

      {open && (
        <div
          id="notifications-popover"
          role="region"
          aria-label="Notifications"
          className="absolute right-0 top-full mt-1 w-[360px] bg-popover text-popover-foreground rounded-xl shadow-[0_14px_30px_rgba(24,24,27,0.1)] dark:shadow-none border border-border z-[9999] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {userId && personalUnread > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-weelp-copy hover:text-weelp-sage-text hover:underline flex items-center gap-1">
                <CheckCheck size={14} /> Mark all as read
              </button>
            )}
          </div>

          {/* Feed list */}
          <div className="max-h-[320px] overflow-y-auto">
            {loadingNotifs ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>
            ) : feed.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet</div>
            ) : (
              feed.slice(0, 8).map((item) => {
                if (item.source === 'announcement') {
                  return (
                    <AnnouncementRow key={`a-${item.id}`} announcement={item} isRead={readAnnouncementsSet.has(item.id)} onOpenDetail={openAnnouncementDetail} onToggleRead={toggleAnnouncementRead} />
                  );
                }

                return <NotificationRow key={`p-${item.id}`} notif={item} onOpen={openNotif} onToggleRead={toggleNotifRead} role={session?.user?.role} />;
              })
            )}
          </div>

          {/* Footer */}
          {userId && (
            <div className="px-4 py-2 border-t border-border text-center">
              <NavigationLink
                href={notificationsHref}
                className="text-xs text-weelp-copy hover:text-weelp-sage-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm"
                onClick={() => setOpen(false)}
              >
                View All
              </NavigationLink>
            </div>
          )}
        </div>
      )}

      <NotificationDetailModal notif={selectedNotif} onClose={() => setSelectedNotif(null)} />
    </div>
  );
}
