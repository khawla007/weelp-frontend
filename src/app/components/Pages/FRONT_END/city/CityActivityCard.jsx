import Link from 'next/link';

export default function CityActivityCard({
  href,
  image,
  title,
  rating,
  reviewCount,
  price,
  discount,
  className = '',
}) {
  return (
    <div
      className={`group flex h-full w-full flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] ${className}`}
      style={{ border: '1px solid #f0f2f4' }}
    >
      {/* Image */}
      <Link href={href} className="relative overflow-hidden block">
        <img
          src={image}
          alt={title}
          className="h-[200px] w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-[14px] px-4 pb-4 pt-3">
        {/* Rating row */}
        {rating && (
          <div className="flex items-center gap-1">
            <span
              className="text-[14px] leading-[1.38] text-[#759c8d]"
              style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}
            >
              {rating}
            </span>
            {reviewCount && (
              <span
                className="text-[14px] leading-[1.38] text-[#5a5a5a]"
                style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 400 }}
              >
                ({reviewCount})
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <Link href={href}>
          <h3
            className="text-[17px] leading-[1.4] text-[#142a38] line-clamp-2"
            style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 700 }}
          >
            {title}
          </h3>
        </Link>

        {/* Price + Discount */}
        <div className="flex items-center justify-between mt-auto">
          {price && (
            <span
              className="text-[16px] leading-[1.37] text-[#1a2e3d]"
              style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 600 }}
            >
              From {price}
            </span>
          )}
          {discount && (
            <span
              className="rounded-[4px] px-3 py-1.5 text-[12.8px] text-[#ff725e]"
              style={{
                fontFamily: 'var(--font-interTight), Inter Tight, sans-serif',
                fontWeight: 600,
                backgroundColor: '#ff725e0a',
                border: '0.8px solid #ff725e',
              }}
            >
              {discount}
            </span>
          )}
        </div>

        {/* CTA Button */}
        <Link
          href={href}
          className="flex items-center justify-center w-full h-[40px] rounded-[10px] bg-[#143042] text-white transition hover:bg-[#1a3d52]"
          style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600, fontSize: '14px' }}
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
