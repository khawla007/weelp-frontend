'use client';

import { useRef } from 'react';
import { Mail, MailOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { resolveNotificationCta } from '@/lib/notifications/link';
import { timeAgo } from '@/lib/utils';

export default function NotificationRow({ notif, onOpen, onToggleRead, role }) {
  const router = useRouter();
  const activationRef = useRef(null);
  const isUnread = !notif.read_at;
  const isPopup = notif.display_style === 'popup';
  // Envelope = read status: closed (Mail) while unread, open (MailOpen) once read.
  const ToggleIcon = isUnread ? Mail : MailOpen;
  const toggleLabel = isUnread ? 'Mark as read' : 'Mark as unread';
  // Inline tier shows a Visit link + the whole row navigates; popup tier opens the modal.
  const cta = isPopup ? null : resolveNotificationCta(notif, role);
  const cancellationRequestId = notif.data?.cancellation_request_id;
  const isCancellationNavigation = Number.isInteger(cancellationRequestId) && cancellationRequestId > 0 && Boolean(cta) && !cta.external;

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleRead(notif);
  };

  const handleToggleKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    e.stopPropagation();
    onToggleRead(notif);
  };

  const markReadBestEffort = () => {
    let result;
    try {
      result = onOpen(notif);
    } catch {
      return;
    }
    Promise.resolve(result).catch(() => {});
  };

  const goToLegacyCta = () => {
    if (!cta) return;
    if (!cta.external) {
      router.push(cta.href);
      return;
    }
    try {
      window.open(cta.href, '_blank', 'noopener,noreferrer');
    } catch {
      // Browser popup failures are contained; the read attempt remains best-effort.
    }
  };

  const activateCancellation = () => {
    if (activationRef.current) return activationRef.current;
    let activation;
    activation = (async () => {
      try {
        try {
          await onOpen(notif);
        } catch {
          // Read state is best-effort; its failure must not strand the user.
        } finally {
          router.push(cta.href);
        }
      } finally {
        if (activationRef.current === activation) activationRef.current = null;
      }
    })();
    activationRef.current = activation;
    return activation;
  };

  const activate = () => {
    if (isCancellationNavigation) return activateCancellation();
    markReadBestEffort();
    goToLegacyCta();
    return null;
  };

  const handleVisit = (e) => {
    e.stopPropagation();
    if (isCancellationNavigation) {
      e.preventDefault();
      activateCancellation();
      return;
    }
    markReadBestEffort();
  };

  const handleVisitKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (isCancellationNavigation) {
      handleVisit(e);
      return;
    }
    e.stopPropagation();
  };

  const handleMainKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    activate();
  };

  return (
    <div className={`flex w-full items-start border-b border-border text-left transition-colors hover:bg-muted ${isUnread ? 'bg-weelp-sage-deep/5' : ''}`}>
      <button
        type="button"
        onClick={activate}
        onKeyDown={handleMainKeyDown}
        className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-weelp-sage-deep/40"
      >
        <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${isUnread ? 'bg-weelp-sage-deep' : 'bg-transparent'}`} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{notif.title}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
          <span className="mt-1 block text-xs text-muted-foreground">{timeAgo(notif.created_at)}</span>
        </span>
      </button>
      <div className="flex flex-shrink-0 items-center gap-2 py-3 pr-4">
        {isPopup && (
          <button
            type="button"
            onClick={handleVisit}
            onKeyDown={handleVisitKeyDown}
            className="inline-flex items-center text-xs font-medium text-weelp-copy hover:text-weelp-sage-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40"
          >
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
              onKeyDown={handleVisitKeyDown}
              className="inline-block text-xs font-medium text-weelp-copy hover:text-weelp-sage-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40"
            >
              Visit
            </a>
          ) : (
            <NavigationLink
              href={cta.href}
              onClick={handleVisit}
              onKeyDown={handleVisitKeyDown}
              className="inline-block text-xs font-medium text-weelp-copy hover:text-weelp-sage-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40"
            >
              Visit
            </NavigationLink>
          ))}
        <button
          type="button"
          aria-label={toggleLabel}
          onClick={handleToggle}
          onKeyDown={handleToggleKeyDown}
          className="rounded-sm p-1 text-muted-foreground hover:text-weelp-sage-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40"
        >
          <ToggleIcon className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
