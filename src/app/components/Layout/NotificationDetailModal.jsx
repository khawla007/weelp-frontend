'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { resolveNotificationCta } from '@/lib/notifications/link';
import { timeAgo } from '@/lib/utils';

export default function NotificationDetailModal({ notif, onClose }) {
  const open = Boolean(notif);
  const cta = notif ? resolveNotificationCta(notif) : null;
  const images = notif?.data?.images || [];

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
            {images.length > 0 && (
              <div className="flex flex-col gap-2">
                {images.map((src, i) => (
                  <img key={i} src={src} alt={notif.title} className="w-full rounded-md object-cover" />
                ))}
              </div>
            )}
            <DialogDescription className="text-sm text-[#3f3f46] whitespace-pre-wrap">{notif.message}</DialogDescription>
            <p className="text-xs text-[#71717a] mt-2">{timeAgo(notif.created_at)}</p>
            {cta && (
              <DialogFooter>
                {cta.external ? (
                  <a
                    href={cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="inline-flex items-center rounded-md bg-[#588f7a] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a7a68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40"
                  >
                    View details
                  </a>
                ) : (
                  <NavigationLink
                    href={cta.href}
                    onClick={onClose}
                    className="inline-flex items-center rounded-md bg-[#588f7a] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a7a68] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40"
                  >
                    View details
                  </NavigationLink>
                )}
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
