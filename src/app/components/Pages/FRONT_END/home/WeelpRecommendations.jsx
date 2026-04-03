import Link from 'next/link';
import { getFeaturedItineraries } from '@/lib/services/itineraries';

const fontIT = 'var(--font-interTight), Inter Tight, sans-serif';

function getRandomItems(array, count) {
  if (array.length <= count) return array;
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const WeelpRecommendations = async () => {
  const response = await getFeaturedItineraries();

  // Hide section if no data or error
  if (!response?.success || !response?.data?.length) {
    return null;
  }

  // Get up to 32 random itineraries
  const itineraries = getRandomItems(response.data, 32);

  return (
    <div className="w-full bg-[#f3f5f6]">
      <div className="w-full px-[60px] py-10">
        <h3 className="text-[18px] text-[#243141] mb-2" style={{ fontFamily: fontIT, fontWeight: 600, letterSpacing: '-0.38px' }}>
          Weelp Recommendations
        </h3>
        <div className="mb-6" style={{ borderTop: '1.3px solid #e3e3e3a6' }} />
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
