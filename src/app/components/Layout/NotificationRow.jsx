'use client';

import { Mail, MailOpen } from 'lucide-react';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { resolveNotificationCta } from '@/lib/notifications/link';
import { timeAgo } from '@/lib/utils';

export default function NotificationRow({ notif, onOpen, onToggleRead }) {
  const isUnread = !notif.read_at;
  const isPopup = notif.display_style === 'popup';
  const ToggleIcon = isUnread ? Mail : MailOpen;
  const toggleLabel = isUnread ? 'Mark as read' : 'Mark as unread';
  // Inline tier shows a Visit button in-row; popup tier carries its CTA in the modal.
  const cta = isPopup ? null : resolveNotificationCta(notif);

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleRead(notif);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(notif)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(notif);
        }
      }}
      className={`flex items-start gap-3 w-full text-left px-4 py-3 border-b border-[#eaeaea] hover:bg-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#588f7a]/40 transition-colors cursor-pointer ${isUnread ? 'bg-[#588f7a]/5' : ''}`}
    >
      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${isUnread ? 'bg-[#588f7a]' : 'bg-transparent'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#18181b] truncate">{notif.title}</p>
        <p className="text-xs text-[#71717a] line-clamp-2 mt-0.5">{notif.message}</p>
        <p className="text-xs text-[#71717a] mt-1">{timeAgo(notif.created_at)}</p>
        {cta &&
          (cta.external ? (
            <a href={cta.href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-medium text-[#588f7a] hover:underline">
              Visit
            </a>
          ) : (
            <NavigationLink href={cta.href} className="mt-2 inline-block text-xs font-medium text-[#588f7a] hover:underline">
              Visit
            </NavigationLink>
          ))}
      </div>
      <button
        type="button"
        aria-label={toggleLabel}
        onClick={handleToggle}
        className="flex-shrink-0 text-[#71717a] hover:text-[#588f7a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40 rounded-sm p-1"
      >
        <ToggleIcon className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
