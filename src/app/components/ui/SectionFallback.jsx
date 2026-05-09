'use client';

import Link from 'next/link';
import { ArrowRight, RotateCcw } from 'lucide-react';

const fontJakarta = 'var(--font-plus-jakarta), Plus Jakarta Sans, sans-serif';
const fontInterTight = 'var(--font-interTight), Inter Tight, sans-serif';

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
export default function SectionFallback({ eyebrow, message, pivotHref, pivotLabel, variant = 'empty', className = 'pt-14 pb-10 md:pt-20 md:pb-14 lg:pt-24 lg:pb-16' }) {
  const handleRetry = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  return (
    <section className={`mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8 ${className}`}>
      {eyebrow && (
        <span className="text-[13px] uppercase tracking-[0.08em] text-[#52525b]" style={{ fontFamily: fontInterTight, fontWeight: 600 }}>
          {eyebrow}
        </span>
      )}

      <div className="flex flex-col gap-5 border-t border-[#eaeaea] pt-8">
        <p className="max-w-[60ch] text-[18px] sm:text-[20px] text-[#18181b]" style={{ fontFamily: fontJakarta, fontWeight: 500, lineHeight: 1.4, letterSpacing: '-0.005em' }}>
          {message}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {pivotHref && pivotLabel && (
            <Link
              href={pivotHref}
              className="inline-flex items-center gap-2 text-[15px] text-[#588f7a] hover:text-[#4d8069] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40 rounded-sm"
              style={{ fontFamily: fontInterTight, fontWeight: 600 }}
            >
              {pivotLabel}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}

          {variant === 'error' && (
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#e4e4e7] bg-white px-3.5 py-2 text-[14px] text-[#18181b] hover:bg-[#f4f4f5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#588f7a]/40"
              style={{ fontFamily: fontInterTight, fontWeight: 600 }}
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
