import Image from 'next/image';
import Link from 'next/link';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';

/** Default static values applied when variant="full" and no data is provided. */
const FULL_DEFAULTS = { rating: '4.5', reviewCount: '3.4K', discount: '40% OFF' };

/**
 * Shared content card used across the site.
 *
 * variant="full"    — image, rating, title, price, discount badge (default)
 * variant="compact" — image, category badge, title only
 *
 * For "full" variant, rating / reviewCount / discount default to static placeholder
 * values so every card looks complete even before API data is available.
 * Pass explicit values (or null) to override.
 */
export default function ItemCard({ href, image, title, category, excerpt, price, rating, reviewCount, discount, variant = 'full', className = '' }) {
  const isFull = variant === 'full';

  // Apply defaults for full variant when values are not explicitly provided
  const displayRating = isFull ? (rating ?? FULL_DEFAULTS.rating) : rating;
  const displayReviewCount = isFull ? (reviewCount ?? FULL_DEFAULTS.reviewCount) : reviewCount;
  const displayDiscount = isFull ? (discount ?? FULL_DEFAULTS.discount) : discount;

  return (
    <Link
      href={href}
      className={`group flex h-full flex-col overflow-hidden rounded-[8.5px] bg-white p-3 sm:p-4 lg:p-[17px] border border-[#e4e4e7] transition-shadow duration-300 hover:shadow-[0_14px_30px_rgba(24,24,27,0.1)] hover:border-transparent ${className}`}
    >
      {/* Image */}
      <div className="relative h-[190px] w-full overflow-hidden rounded-[6px] bg-[#f2f7f5] sm:h-[200px] lg:h-[217px]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 33vw, (max-width: 1440px) 25vw, 20vw"
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 pt-3 lg:gap-[5.7px] lg:pt-[15.6px]">
        {/* Rating row — full variant */}
        {isFull && displayRating && (
          <div className="flex items-center gap-1">
            <span className="text-[13px] lg:text-[14px] leading-[1.38] text-[#588f7a]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}>
              {displayRating}
            </span>
            {displayReviewCount && (
              <span className="text-[13px] lg:text-[14px] leading-[1.38] text-[#5a5a5a]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 400 }}>
                ({displayReviewCount})
              </span>
            )}
          </div>
        )}

        {/* Category badge — compact variant */}
        {!isFull && category && <span className="w-fit rounded-md bg-[#588f7a]/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#588f7a]">{category}</span>}

        {/* Title */}
        <h3 className="text-[15px] sm:text-base lg:text-[18px] leading-[1.59] text-[#142a38] line-clamp-2" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}>
          {title}
        </h3>

        {isFull && excerpt && <p className="text-sm leading-relaxed text-[#5a5a5a] line-clamp-2">{excerpt}</p>}

        {/* Divider + Price row — full variant */}
        {isFull && price && (
          <>
            <div className="mt-auto" style={{ borderTop: '1.42px solid #e3e3e3' }} />
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                <span className="text-sm lg:text-[15.6px] leading-[1.37] text-[#5a5a5a]" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 400 }}>
                  From
                </span>
                <span className="text-sm lg:text-[15.6px] leading-[1.37] text-[#5a5a5a]" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 400 }}>
                  {price}
                </span>
              </div>
              {displayDiscount && (
                <span
                  className="weelp-city-discount-badge rounded-[4px] px-3 py-1.5 text-[11px] lg:text-[12.8px]"
                  style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}
                >
                  {displayDiscount}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
