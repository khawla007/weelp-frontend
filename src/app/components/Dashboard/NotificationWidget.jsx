'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, CheckCheck, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import { fetchNotifications, markAllAsRead } from '@/lib/services/notifications';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { timeAgo } from '@/lib/utils';

const TYPE_ICONS = {
  application_approved: CheckCircle,
  application_rejected: XCircle,
  itinerary_approved: CheckCircle,
  itinerary_rejected: XCircle,
  new_booking: ShoppingCart,
};

const TYPE_COLORS = {
  application_approved: 'text-green-600',
  application_rejected: 'text-red-500',
  itinerary_approved: 'text-green-600',
  itinerary_rejected: 'text-red-500',
  new_booking: 'text-blue-500',
};

export default function NotificationWidget() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    if (!session?.user) return;
    fetchNotifications(1).then((res) => {
      setNotifications(res?.data?.data?.slice(0, 5) || []);
    });
  }, [session?.user]);

  const loading = notifications === null;

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
  };

  const unreadCount = (notifications || []).filter((n) => !n.read_at).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-[#0c2536]" />
          <h3 className="text-base font-semibold text-[#0c2536]">Notifications</h3>
          {unreadCount > 0 && <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">{unreadCount}</span>}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-xs text-[#57947d] hover:underline flex items-center gap-1">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
      ) : (notifications || []).length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No notifications yet</p>
      ) : (
        <div className="space-y-3">
          {(notifications || []).map((notif) => {
            const IconComponent = TYPE_ICONS[notif.type] || Bell;
            const iconColor = TYPE_COLORS[notif.type] || 'text-gray-400';
            return (
              <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-lg ${!notif.read_at ? 'bg-[#57947d]/5' : 'bg-gray-50'}`}>
                <IconComponent size={18} className={`mt-0.5 flex-shrink-0 ${iconColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0c2536]">{notif.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 text-center">
        <NavigationLink href="/dashboard/customer/settings/notifications" className="text-xs text-[#57947d] hover:underline">
          View All Notifications
        </NavigationLink>
      </div>
    </div>
  );
}
