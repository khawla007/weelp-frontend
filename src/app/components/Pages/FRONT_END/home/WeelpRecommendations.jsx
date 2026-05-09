import Link from 'next/link';
import SectionFallback from '@/app/components/ui/SectionFallback';
import { getFeaturedItineraries } from '@/lib/services/itineraries';

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

function getRandomItems(array, count) {
  if (array.length <= count) return array;
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const WeelpRecommendations = async () => {
  const response = await getFeaturedItineraries();
  const items = Array.isArray(response?.data) ? response.data : [];

  if (!items.length) {
    const ok = response?.success !== false;
    return (
      <SectionFallback
        eyebrow="Weelp recommends"
        message={
          ok
            ? 'Our editors are between picks for you. Browse the catalog and save the ones you love for next time.'
            : "We couldn't pull this week's picks just now. Refresh, or browse the full catalog."
        }
        variant={ok ? 'empty' : 'error'}
        pivotHref="/cities"
        pivotLabel="Browse all cities"
      />
    );
  }

  const itineraries = getRandomItems(items, 32);

  return (
    <div className="w-full bg-[#f3f5f6]">
      <div className="w-full px-4 py-10 lg:px-[60px]">
        <h3 className="text-[18px] text-[#243141] mb-4" style={{ fontFamily: fontIT, fontWeight: 600, letterSpacing: '-0.38px' }}>
          Weelp Recommendations
        </h3>
        <div className="mb-4" style={{ borderTop: '1.3px solid #e3e3e3a6' }} />
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {itineraries.map((itinerary) => {
            const { name, slug, city_slug } = itinerary;
            const href = city_slug ? `/cities/${city_slug}/itineraries/${slug}` : `/cities/itineraries/${slug}`;

            return (
              <Link
                key={`${slug}-${city_slug}`}
                href={href}
                className="text-[16px] text-[#6f7680] transition hover:text-[#243141]"
                style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px', lineHeight: 2.06 }}
              >
                {name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeelpRecommendations;
