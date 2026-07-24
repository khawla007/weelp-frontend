'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchNotifications, markAsRead, markUnread } from '@/lib/services/notifications';
import NotificationRow from '@/app/components/Layout/NotificationRow';
import NotificationDetailModal from '@/app/components/Layout/NotificationDetailModal';

export default function NotificationsList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await fetchNotifications(p);
      const payload = res?.data;
      const rows = payload?.data || [];
      setItems((prev) => [...prev, ...rows]);
      setLastPage(payload?.last_page || 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetchNotifications(1);
        if (!active) return;
        const payload = res?.data;
        setItems(payload?.data || []);
        setLastPage(payload?.last_page || 1);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const openNotif = (notif) => {
    if (notif.display_style === 'popup') setSelectedNotif(notif);
    if (!notif.read_at) {
      markAsRead(notif.id);
      setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)));
    }
  };

  const toggleNotifRead = async (notif) => {
    if (notif.read_at) {
      await markUnread(notif.id);
      setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read_at: null } : n)));
    } else {
      await markAsRead(notif.id);
      setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)));
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next);
  };

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="text-lg font-semibold text-foreground px-4 mb-3">Notifications</h1>
      <div className="rounded-xl border border-border overflow-hidden bg-background">
        {items.length === 0 && !loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          items.map((n) => <NotificationRow key={n.id} notif={n} onOpen={openNotif} onToggleRead={toggleNotifRead} />)
        )}
      </div>
      {page < lastPage && (
        <div className="text-center mt-4">
          <button onClick={loadMore} disabled={loading} className="text-sm text-weelp-sage-text hover:underline disabled:opacity-50">
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
      <NotificationDetailModal notif={selectedNotif} onClose={() => setSelectedNotif(null)} />
    </div>
  );
}
