import React from 'react';
import BannerSection from '@/app/components/Pages/FRONT_END/special/BannerSection';
import ProductSliderSection from '@/app/components/ui/ProductSliderSection';
import SharedFilterSection from '@/app/components/Pages/FRONT_END/shared/SharedFilterSection';
import SectionFallback from '@/app/components/ui/SectionFallback';
import BreakSection from '@/app/components/BreakSection';
import { getFeaturedItineraries } from '@/lib/services/itineraries';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';

const SPECIAL_CITY_SLUG = 'dubai';

const SpecialPage = async () => {
  const featuredResponse = await getFeaturedItineraries(SPECIAL_CITY_SLUG);
  const featuredItineraries = Array.isArray(featuredResponse?.data) ? featuredResponse.data : [];
  const featuredCards = featuredItineraries.slice(0, 8).map((itinerary) => mapProductToItemCard(itinerary, itinerary.city_slug || SPECIAL_CITY_SLUG));
  const featuredFailed = featuredResponse?.success === false;

  return (
    <>
      <BannerSection />
      {featuredCards.length > 0 ? (
        <ProductSliderSection items={featuredCards} title={"You can't miss"} navigationId="special-cant-miss" />
      ) : (
        <SectionFallback
          eyebrow="You can't miss"
          message={
            featuredFailed
              ? "We couldn't load these special picks just now. Refresh, or browse the destination listings below."
              : 'Special picks are being refreshed. Browse the destination listings below for available trips.'
          }
          variant={featuredFailed ? 'error' : 'empty'}
          pivotHref={`/cities/${SPECIAL_CITY_SLUG}`}
          pivotLabel="Browse Dubai"
        />
      )}
      <BreakSection className={'mb-8 border-1'} />
      <SharedFilterSection scope="city" slug={SPECIAL_CITY_SLUG} variant="home" />
    </>
  );
};

export default SpecialPage;
