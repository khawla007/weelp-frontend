'use client';

import { Mail, MailOpen } from 'lucide-react';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { timeAgo } from '@/lib/utils';

function isInternalLink(href) {
  return typeof href === 'string' && href.startsWith('/');
}

// Decide which CTA an announcement gets.
//   - has page link + no coupon + not popup-tier -> Visit (navigates)
//   - popup OR coupon OR no link               -> View detail (opens modal)
function ctaMode(a) {
  const isPopup = a?.display_style === 'popup';
  const hasCoupon = Boolean(a?.coupon_code);
  const hasLink = Boolean(a?.link);
  if (!isPopup && !hasCoupon && hasLink) return 'visit';
  return 'detail';
}

export default function AnnouncementRow({ announcement, isRead, onOpenDetail, onToggleRead }) {
  const ToggleIcon = isRead ? MailOpen : Mail;
  const toggleLabel = isRead ? 'Mark as unread' : 'Mark as read';
  const mode = ctaMode(announcement);

  const markReadIfNeeded = () => {
    if (!isRead) onToggleRead(announcement, /* nextRead */ true);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleRead(announcement, !isRead);
  };

  const handleVisitClick = (e) => {
    e.stopPropagation();
    markReadIfNeeded();
  };

  const handleDetailClick = (e) => {
    e.stopPropagation();
    markReadIfNeeded();
    onOpenDetail(announcement);
  };

  const handleRowClick = () => {
    markReadIfNeeded();
    if (mode === 'detail') onOpenDetail(announcement);
    // visit-mode rows: the Visit button handles navigation explicitly; whole-row
    // click just marks read so the envelope flips without surprise navigation.
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
      className={`flex items-start gap-3 w-full text-left px-4 py-3 border-b border-[#eaeaea] hover:bg-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-weelp-sage-deep/40 transition-colors cursor-pointer ${!isRead ? 'bg-weelp-sage-deep/5' : ''}`}
    >
      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!isRead ? 'bg-weelp-sage-deep' : 'bg-transparent'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#18181b] truncate">{announcement.title}</p>
        <p className="text-xs text-[#71717a] line-clamp-2 mt-0.5">{announcement.message}</p>
        <p className="text-xs text-[#71717a] mt-1">{timeAgo(announcement.created_at)}</p>

        {mode === 'visit' &&
          (isInternalLink(announcement.link) ? (
            <NavigationLink href={announcement.link} onClick={handleVisitClick} className="mt-2 inline-block text-xs font-medium text-weelp-copy hover:text-weelp-sage-deep hover:underline">
              Visit
            </NavigationLink>
          ) : (
            <a
              href={announcement.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleVisitClick}
              className="mt-2 inline-block text-xs font-medium text-weelp-copy hover:text-weelp-sage-deep hover:underline"
            >
              Visit
            </a>
          ))}

        {mode === 'detail' && (
          <button type="button" onClick={handleDetailClick} className="mt-2 inline-flex items-center text-xs font-medium text-weelp-copy hover:text-weelp-sage-deep hover:underline">
            View detail
          </button>
        )}
      </div>

      <button
        type="button"
        aria-label={toggleLabel}
        onClick={handleToggle}
        className="flex-shrink-0 text-[#71717a] hover:text-weelp-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 rounded-sm p-1"
      >
        <ToggleIcon className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
