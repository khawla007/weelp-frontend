'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { notificationLink } from '@/lib/notifications/link';
import { timeAgo } from '@/lib/utils';

export default function NotificationDetailModal({ notif, onClose }) {
  const open = Boolean(notif);
  const href = notif ? notificationLink(notif.type, notif.data) : null;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-[480px]">
        {notif && (
          <>
            <DialogHeader>
              <DialogTitle className="text-[#18181b]">{notif.title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-[#3f3f46] whitespace-pre-wrap">{notif.message}</p>
            <p className="text-xs text-[#71717a] mt-2">{timeAgo(notif.created_at)}</p>
            {href && (
              <DialogFooter>
                <NavigationLink
                  href={href}
                  onClick={onClose}
                  className="inline-flex items-center rounded-md bg-[#588f7a] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a7a68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40"
                >
                  View details
                </NavigationLink>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
