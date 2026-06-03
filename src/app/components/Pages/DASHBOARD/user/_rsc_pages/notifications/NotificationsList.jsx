'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchNotifications, markAsRead, markUnread } from '@/lib/services/notifications';
import NotificationRow from '@/app/components/Layout/NotificationRow';
import NotificationDetailModal from '@/app/components/Layout/NotificationDetailModal';

export default function NotificationsList() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await fetchNotifications(p);
      const payload = res?.data;
      const rows = payload?.data || [];
      setItems((prev) => (p === 1 ? rows : [...prev, ...rows]));
      setLastPage(payload?.last_page || 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetchNotifications(1);
      if (!active) return;
      const payload = res?.data;
      setItems(payload?.data || []);
      setLastPage(payload?.last_page || 1);
    })();
    return () => {
      active = false;
    };
  }, []);

  const openNotif = (notif) => {
    setSelectedNotif(notif);
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
      <h1 className="text-lg font-semibold text-[#18181b] px-4 mb-3">Notifications</h1>
      <div className="rounded-xl border border-[#e4e4e7] overflow-hidden bg-white">
        {items.length === 0 && !loading ? (
          <div className="p-8 text-center text-sm text-[#71717a]">No notifications yet</div>
        ) : (
          items.map((n) => <NotificationRow key={n.id} notif={n} onOpen={openNotif} onToggleRead={toggleNotifRead} />)
        )}
      </div>
      {page < lastPage && (
        <div className="text-center mt-4">
          <button onClick={loadMore} disabled={loading} className="text-sm text-[#588f7a] hover:underline disabled:opacity-50">
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
      <NotificationDetailModal notif={selectedNotif} onClose={() => setSelectedNotif(null)} />
    </div>
  );
}
