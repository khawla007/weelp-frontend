'use client';

import { Mail, MailOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { resolveNotificationCta } from '@/lib/notifications/link';
import { timeAgo } from '@/lib/utils';

export default function NotificationRow({ notif, onOpen, onToggleRead }) {
  const router = useRouter();
  const isUnread = !notif.read_at;
  const isPopup = notif.display_style === 'popup';
  // Envelope = read status: closed (Mail) while unread, open (MailOpen) once read.
  const ToggleIcon = isUnread ? Mail : MailOpen;
  const toggleLabel = isUnread ? 'Mark as read' : 'Mark as unread';
  // Inline tier shows a Visit link + the whole row navigates; popup tier opens the modal.
  const cta = isPopup ? null : resolveNotificationCta(notif);

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleRead(notif);
  };

  const goToCta = () => {
    if (!cta) return;
    if (cta.external) window.open(cta.href, '_blank', 'noopener,noreferrer');
    else router.push(cta.href);
  };

  // Clicking anywhere on the row marks it read (via onOpen) and, for inline
  // notifications with a target, navigates to the same page the Visit link uses.
  // Popup rows have no cta — onOpen opens the modal instead.
  const handleRowClick = () => {
    onOpen(notif);
    goToCta();
  };

  // The Visit link marks read + navigates via its own href; stopPropagation keeps
  // the row handler from navigating a second time.
  const handleVisit = (e) => {
    e.stopPropagation();
    onOpen(notif);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleRowClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
      className={`flex items-start gap-3 w-full text-left px-4 py-3 border-b border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-weelp-sage-deep/40 transition-colors cursor-pointer ${isUnread ? 'bg-weelp-sage-deep/5' : ''}`}
    >
      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${isUnread ? 'bg-weelp-sage-deep' : 'bg-transparent'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{notif.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo(notif.created_at)}</p>
        {isPopup && (
          <button type="button" onClick={handleVisit} className="mt-2 inline-flex items-center text-xs font-medium text-weelp-copy hover:text-weelp-sage-deep hover:underline">
            View detail
          </button>
        )}
        {cta &&
          (cta.external ? (
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleVisit}
              className="mt-2 inline-block text-xs font-medium text-weelp-copy hover:text-weelp-sage-deep hover:underline"
            >
              Visit
            </a>
          ) : (
            <NavigationLink href={cta.href} onClick={handleVisit} className="mt-2 inline-block text-xs font-medium text-weelp-copy hover:text-weelp-sage-deep hover:underline">
              Visit
            </NavigationLink>
          ))}
      </div>
      <button
        type="button"
        aria-label={toggleLabel}
        onClick={handleToggle}
        className="flex-shrink-0 text-muted-foreground hover:text-weelp-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 rounded-sm p-1"
      >
        <ToggleIcon className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
