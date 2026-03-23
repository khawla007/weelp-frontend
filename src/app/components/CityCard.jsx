import Link from 'next/link';

export default function CityCard({ city, className = '' }) {
  const image = city.featured_image || city.image || '/assets/Card.webp';
  const activitiesCount = city.activities_count ?? city.activitiesCount ?? 0;

  return (
    <Link
      href={`/cities/${city.slug}`}
      className={`group relative block h-[360px] overflow-hidden rounded-lg bg-white shadow-[0_2.8px_7.2px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-lg ${className}`}
    >
      <img src={image} alt={city.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
        <span className="block text-[18px] leading-[1.59] text-white drop-shadow-sm" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 600 }}>
          {city.name}
        </span>
        <span className="text-[14px] text-white/80" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif', fontWeight: 400 }}>
          {activitiesCount} Activities
        </span>
      </div>
    </Link>
  );
}
