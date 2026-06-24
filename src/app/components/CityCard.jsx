import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { IMAGE_BLUR_DATA_URL } from '@/lib/imagePlaceholder';

export default function CityCard({ city, className = '', subtitleMode = 'count' }) {
  const image = city.featured_image || city.feature_image || city.image || '/assets/Card.webp';
  const activitiesCount = city.activities_count ?? city.activitiesCount ?? 0;
  const hasPrice = city.starting_price != null;

  let subtitle = null;
  if (subtitleMode === 'price') {
    if (hasPrice) {
      subtitle = `Starting at ${formatCurrency(city.starting_price, city.currency)}`;
    }
  } else if (subtitleMode === 'blogs') {
    subtitle = activitiesCount > 0 ? `${activitiesCount} Blogs` : 'Blogs';
  } else {
    subtitle = `${activitiesCount} Activities`;
  }

  return (
    <Link
      href={`/cities/${city.slug}`}
      className={`group relative block h-[360px] overflow-hidden rounded-lg bg-background border border-border transition-shadow duration-300 hover:shadow-[0_1px_2px_rgba(24,24,27,0.06),0_4px_12px_rgba(24,24,27,0.08)] hover:border-transparent ${className}`}
    >
      <Image
        src={image}
        alt={city.name}
        fill
        sizes="(max-width: 640px) 65vw, (max-width: 1024px) 40vw, (max-width: 1440px) 25vw, 20vw"
        placeholder="blur"
        blurDataURL={IMAGE_BLUR_DATA_URL}
        className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-16">
        <span className="block text-[18px] leading-[1.59] text-white drop-shadow-md" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}>
          {city.name}
        </span>
        {subtitle && (
          <span className="text-[14px] text-white/95 drop-shadow-md" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 400 }}>
            {subtitle}
          </span>
        )}
      </div>
    </Link>
  );
}
