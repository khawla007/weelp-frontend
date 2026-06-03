'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSWRConfig } from 'swr';
import { fetchPopupNotifications, markAsRead } from '@/lib/services/notifications';
import { fetchPopupAnnouncements } from '@/lib/services/announcements';
import { getDismissedIds, dismissIds } from '@/lib/announcements/readState';
import NotificationDetailModal from '@/app/components/Layout/NotificationDetailModal';

function announcementToNotif(a) {
  return {
    id: a.id,
    title: a.title,
    message: a.message,
    type: a.type,
    display_style: 'popup',
    action_url: a.link || null,
    created_at: a.created_at,
    data: { images: a.image_url ? [a.image_url] : [], coupon_code: a.coupon_code || null },
  };
}

export default function NotificationPopupHost() {
  const { data: session } = useSession();
  const { mutate } = useSWRConfig();
  const userId = session?.user?.id;
  const [item, setItem] = useState(null); // { source, notif, liveIds? }

  useEffect(() => {
    let active = true;
    (async () => {
      const anns = await fetchPopupAnnouncements();
      const dismissed = new Set(getDismissedIds());
      const liveIds = anns.map((a) => a.id);
      const candidates = anns.filter((a) => !dismissed.has(a.id)).map((a) => ({ source: 'announcement', notif: announcementToNotif(a), liveIds }));

      if (userId) {
        const rows = await fetchPopupNotifications();
        rows.forEach((n) => candidates.push({ source: 'personal', notif: n }));
      }

      candidates.sort((a, b) => new Date(b.notif.created_at) - new Date(a.notif.created_at));
      if (active && candidates.length > 0) setItem(candidates[0]);
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const close = () => {
    if (item) {
      if (item.source === 'announcement') {
        dismissIds([item.notif.id], item.liveIds);
      } else {
        markAsRead(item.notif.id);
        mutate(['notifications-unread', userId]);
      }
    }
    setItem(null);
  };

  if (!item) return null;
  return <NotificationDetailModal notif={item.notif} onClose={close} />;
}
