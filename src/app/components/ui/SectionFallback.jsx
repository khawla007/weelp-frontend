'use client';

import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';

/**
 * Quiet editorial placeholder for sections whose data isn't available.
 *
 * Replaces the silent `return null` pattern: travelers land on a homepage
 * that acknowledges the gap and points them somewhere useful instead of
 * watching a section disappear. Keep copy short, concierge-voice, second
 * person.
 *
 * @param {object}  props
 * @param {string}  [props.eyebrow]      Section eyebrow (e.g. "Top activities")
 * @param {string}  props.message        Editorial copy. One sentence, warm, exact.
 * @param {string}  [props.pivotHref]    Optional pivot link target (e.g. /cities/dubai)
 * @param {string}  [props.pivotLabel]   Optional pivot link label
 * @param {'empty'|'error'} [props.variant='empty']
 *                                       'error' renders the Try again button.
 * @param {string}  [props.className]    Wrapper override; defaults match other sections.
 */
export default function SectionFallback({ eyebrow, message, pivotHref, pivotLabel, variant = 'empty', className = '' }) {
  const handleRetry = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  return (
    <section className={`container-page flex flex-col gap-6 pb-10 md:pb-16 lg:pb-24 ${className}`}>
      {eyebrow && <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-copy">{eyebrow}</span>}

      <div className="flex flex-col gap-5 border-t border-border pt-8">
        <p className="max-w-[60ch] text-[18px] font-medium leading-[1.4] text-foreground sm:text-[20px]">{message}</p>

        <div className="flex flex-wrap items-center gap-3">
          {pivotHref && pivotLabel && (
            <Link
              href={pivotHref}
              className="inline-flex items-center gap-2 rounded-sm text-[15px] font-semibold text-weelp-sage-deep transition-colors hover:text-weelp-sage-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40"
            >
              {pivotLabel}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}

          {variant === 'error' && (
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-background px-3.5 py-2 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
