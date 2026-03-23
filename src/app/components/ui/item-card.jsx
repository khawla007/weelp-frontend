import Link from 'next/link';

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
export default function ItemCard({ href, image, title, category, excerpt, price, originalPrice, rating, reviewCount, discount, variant = 'full', className = '' }) {
  const isFull = variant === 'full';

  // Apply defaults for full variant when values are not explicitly provided
  const displayRating = isFull ? (rating ?? FULL_DEFAULTS.rating) : rating;
  const displayReviewCount = isFull ? (reviewCount ?? FULL_DEFAULTS.reviewCount) : reviewCount;
  const displayDiscount = isFull ? (discount ?? FULL_DEFAULTS.discount) : discount;

  return (
    <Link
      href={href}
      className={`group flex h-full flex-col overflow-hidden rounded-[8.5px] bg-white p-[17px] shadow-[0_2.8px_7.2px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-lg ${className}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden rounded-[6px]">
        <img src={image} alt={title} className="h-[217px] w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-[5.7px] pt-[15.6px]">
        {/* Rating row — full variant */}
        {isFull && displayRating && (
          <div className="flex items-center gap-1">
            <span className="text-[14px] leading-[1.38] text-[#759c8d]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}>
              {displayRating}
            </span>
            {displayReviewCount && (
              <span className="text-[14px] leading-[1.38] text-[#5a5a5a]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 400 }}>
                ({displayReviewCount})
              </span>
            )}
          </div>
        )}

        {/* Category badge — compact variant */}
        {!isFull && category && <span className="w-fit rounded-md bg-[#759c8d]/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#759c8d]">{category}</span>}

        {/* Title */}
        <h3 className="text-[18px] leading-[1.59] text-[#142a38] line-clamp-2" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}>
          {title}
        </h3>

        {isFull && excerpt && <p className="text-sm leading-relaxed text-[#5a5a5a] line-clamp-2">{excerpt}</p>}

        {/* Divider + Price row — full variant */}
        {isFull && price && (
          <>
            <div className="mt-auto" style={{ borderTop: '1.42px solid #e3e3e3' }} />
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col">
                <span className="text-[15.6px] leading-[1.37] text-[#5a5a5a]" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 400 }}>
                  From
                </span>
                <span className="text-[15.6px] leading-[1.37] text-[#5a5a5a]" style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 400 }}>
                  {price}
                </span>
              </div>
              {displayDiscount && (
                <span className="weelp-city-discount-badge rounded-[4px] px-3 py-1.5 text-[12.8px]" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}>
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
