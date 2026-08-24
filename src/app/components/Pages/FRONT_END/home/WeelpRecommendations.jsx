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

const WeelpRecommendations = async ({ entrance } = {}) => {
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
  const usesRuleLedCascade = entrance === 'rule-led-cascade';
  const HeadingRoot = usesRuleLedCascade ? 'div' : Reveal;
  const GridRoot = usesRuleLedCascade ? 'div' : Reveal;
  const sectionEntranceProps = usesRuleLedCascade ? { 'data-recommendations-section-entrance': 'rule-led-cascade' } : {};
  const headingProps = usesRuleLedCascade ? { 'data-recommendations-heading': '' } : { variant: 'lift' };
  const gridProps = usesRuleLedCascade ? { 'data-recommendations-grid': '' } : { stagger: 45, variant: 'lift' };

  return (
    <Reveal as="section" initialHidden className="w-full bg-surface-tint py-10 md:py-16 lg:py-24" {...sectionEntranceProps}>
      <div className="w-full px-4 lg:px-[60px]">
        <HeadingRoot {...headingProps}>
          <h3 className="text-[20px] text-foreground mb-5">Weelp Recommendations</h3>
          <div className="mb-4 border-t border-border" {...(usesRuleLedCascade ? { 'data-recommendations-rule': '' } : {})} />
        </HeadingRoot>
        <GridRoot {...gridProps} className="grid grid-cols-2 gap-x-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {itineraries.map((itinerary, index) => {
            const { name, slug, city_slug } = itinerary;
            const href = city_slug ? `/cities/${city_slug}/itineraries/${slug}` : `/cities/itineraries/${slug}`;
            const recommendationMotionProps = usesRuleLedCascade
              ? {
                  'data-recommendations-link': '',
                  style: {
                    fontFamily: fontIT,
                    fontWeight: 500,
                    letterSpacing: '-0.38px',
                    lineHeight: 2.06,
                    '--weelp-recommendations-index': Math.min(index, 7),
                  },
                }
              : {
                  style: { fontFamily: fontIT, fontWeight: 500, letterSpacing: '-0.38px', lineHeight: 2.06 },
                };

            return (
              <Link
                key={`${slug}-${city_slug}`}
                href={href}
                className="text-[16px] text-muted-foreground bg-gradient-to-r from-foreground to-foreground bg-[length:0%_1px] bg-no-repeat bg-[position:0_100%] transition-[color,background-size] duration-300 ease-[var(--weelp-ease-out)] hover:text-foreground hover:bg-[length:100%_1px] motion-reduce:transition-none"
                {...recommendationMotionProps}
              >
                {name}
              </Link>
            );
          })}
        </GridRoot>
      </div>
    </Reveal>
  );
};

export default WeelpRecommendations;
