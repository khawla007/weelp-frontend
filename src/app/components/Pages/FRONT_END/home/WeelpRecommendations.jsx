import Link from 'next/link';
import SectionFallback from '@/app/components/ui/SectionFallback';
import Reveal from '@/app/components/ui/Reveal';
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
    <Reveal as="section" initialHidden className="w-full bg-surface-tint pb-10 pt-10 md:pb-16 md:pt-16 lg:pb-24 lg:pt-24">
      <div className="w-full px-4 lg:px-[60px]">
        <Reveal variant="lift">
          <h3 className="text-[20px] text-foreground mb-4">Weelp Recommendations</h3>
          <div className="mb-4 border-t border-border" />
        </Reveal>
        <Reveal stagger={45} variant="lift" className="grid grid-cols-2 gap-x-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {itineraries.map((itinerary) => {
            const { name, slug, city_slug } = itinerary;
            const href = city_slug ? `/cities/${city_slug}/itineraries/${slug}` : `/cities/itineraries/${slug}`;

            return (
              <Link
                key={`${slug}-${city_slug}`}
                href={href}
                className="text-[16px] text-muted-foreground bg-gradient-to-r from-foreground to-foreground bg-[length:0%_1px] bg-no-repeat bg-[position:0_100%] transition-[color,background-size] duration-300 ease-[var(--weelp-ease-out)] hover:text-foreground hover:bg-[length:100%_1px] motion-reduce:transition-none"
                style={{ fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px', lineHeight: 2.06 }}
              >
                {name}
              </Link>
            );
          })}
        </Reveal>
      </div>
    </Reveal>
  );
};

export default WeelpRecommendations;
