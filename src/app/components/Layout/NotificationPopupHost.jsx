'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { fetchPopupNotifications, markAsRead } from '@/lib/services/notifications';
import NotificationDetailModal from '@/app/components/Layout/NotificationDetailModal';

export default function NotificationPopupHost() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [popup, setPopup] = useState(null);

  // On load (logged in), fetch unread popup notifications and auto-show the latest one.
  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      const rows = await fetchPopupNotifications();
      if (active && rows.length > 0) setPopup(rows[0]); // latest first from the API
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const close = () => {
    if (popup) markAsRead(popup.id); // dismiss = read → won't auto-show next load
    setPopup(null);
  };

  if (!popup) return null;
  return <NotificationDetailModal notif={popup} onClose={close} />;
}
