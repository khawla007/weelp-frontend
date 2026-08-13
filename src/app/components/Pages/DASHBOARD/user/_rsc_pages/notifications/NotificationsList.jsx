'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { fetchNotifications, markAsRead, markUnread } from '@/lib/services/notifications';
import NotificationRow from '@/app/components/Layout/NotificationRow';
import NotificationDetailModal from '@/app/components/Layout/NotificationDetailModal';

export default function NotificationsList() {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const initialLoadInFlightRef = useRef(false);
  const mountedRef = useRef(false);

  const loadInitial = useCallback(async () => {
    if (initialLoadInFlightRef.current) return;
    initialLoadInFlightRef.current = true;
    setLoading(true);
    try {
      const res = await fetchNotifications(1);
      if (!mountedRef.current) return;
      const payload = res?.data;
      if (res?.success === false || !payload || !Array.isArray(payload.data)) {
        setError(true);
        return;
      }
      setItems(payload.data);
      setLastPage(payload.last_page || 1);
      setPage(1);
      setError(false);
    } catch {
      if (mountedRef.current) setError(true);
    } finally {
      initialLoadInFlightRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const load = useCallback(async (p) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetchNotifications(p);
      const payload = res?.data;
      if (res?.success === false || !payload || !Array.isArray(payload.data)) {
        setError(true);
        return false;
      }
      const rows = payload?.data || [];
      setItems((prev) => [...prev, ...rows]);
      setLastPage(payload?.last_page || 1);
      return true;
    } catch {
      setError(true);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadInitial();
    return () => {
      mountedRef.current = false;
    };
  }, [loadInitial]);

  const openNotif = async (notif) => {
    if (notif.display_style === 'popup') setSelectedNotif(notif);
    if (!notif.read_at) {
      const result = await markAsRead(notif.id);
      if (result?.success === true) {
        setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)));
      }
      return result;
    }
    return { success: true };
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

  const loadMore = async () => {
    const next = page + 1;
    if (await load(next)) setPage(next);
  };

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="text-lg font-semibold text-foreground px-4 mb-3">Notifications</h1>
      <div className="rounded-xl border border-border overflow-hidden bg-background">
        {error && items.length === 0 ? (
          <div className="space-y-3 p-8 text-center" role="alert">
            <p className="text-sm text-destructive">Notifications could not be loaded. Please try again.</p>
            <button
              type="button"
              onClick={loadInitial}
              disabled={loading}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Retry'}
            </button>
          </div>
        ) : loading && items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground" role="status">
            Loading notifications…
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          items.map((n) => <NotificationRow key={n.id} notif={n} onOpen={openNotif} onToggleRead={toggleNotifRead} role={session?.user?.role} />)
        )}
      </div>
      {error && items.length > 0 && (
        <p className="mt-3 text-center text-sm text-destructive" role="alert">
          More notifications could not be loaded. Please try again.
        </p>
      )}
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
