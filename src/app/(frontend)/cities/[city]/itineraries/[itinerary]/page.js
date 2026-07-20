/** This File Will Handle Itinerary Page under City context */
import dynamic from 'next/dynamic';
import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import { notFound } from 'next/navigation';
import { getSingleItinerary, getRandomSimilarItineraries } from '@/lib/services/itineraries';
import AffiliateTracker from '@/app/components/AffiliateTracker';
import CreatorItineraryViewRecorder from '@/app/components/Pages/FRONT_END/explore/CreatorItineraryViewRecorder';
import { auth } from '@/lib/auth/auth';
import SeoBodyScripts from '@/app/components/SEO/SeoBodyScripts';
import SeoFooterScripts from '@/app/components/SEO/SeoFooterScripts';
import SeoHeadScripts from '@/app/components/SEO/SeoHeadScripts';
import SeoStructuredData from '@/app/components/SEO/SeoStructuredData';
import { buildSeoMetadata } from '@/lib/seo/seoMetadata';
import { withGeneratedSchema } from '@/lib/seo/dynamicSchema';

const SingleProductTabSection = dynamic(() => import('@/app/components/Pages/FRONT_END/singleproduct/SingleProductTabSection'));

export async function generateMetadata({ params }) {
  const { itinerary } = await params;

  const iterenaryData = await getSingleItinerary(itinerary);

  if (!iterenaryData || iterenaryData.length === 0) {
    return {
      title: 'Itinerary Not Found',
    };
  }

  const { data } = iterenaryData;

  return buildSeoMetadata({
    seo: data.seo,
    fallbackTitle: data.name || 'Default Title',
    fallbackDescription: 'Default description for itinerary page',
  });
}

export default async function IterenaryPage({ params, searchParams }) {
  const { city, itinerary } = await params;
  const { ref } = await searchParams;
  const session = await auth();

  const iterenaryData = await getSingleItinerary(itinerary);

  if (iterenaryData.length === 0) {
    notFound();
  }

  const { data } = iterenaryData;
  const id = data?.id;
  const { name, media_gallery = [], review_summary, locations = [], schedules = [] } = data;
  const itinerarySeo = withGeneratedSchema({
    itemType: 'itinerary',
    seo: data.seo,
    values: data,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  });
  const itineraryHeadScripts = { ...itinerarySeo, schema_data: null };

  // Get primary location (first location with city)
  // API returns: locations[0] = { city_id, city: "City Name", state, country, ... }
  const firstLocation = locations?.[0] || null;
  const locationCity = city; // Use route param for city slug since API doesn't provide it in location
  const primaryLocation = firstLocation ? { city: firstLocation.city, location_label: null } : null;

  // Calculate day/night from schedules (e.g., 3 days = 2 nights)
  const totalDays = schedules?.length || 0;
  const totalNights = totalDays > 0 ? totalDays - 1 : 0;
  const scheduleDisplay = totalDays > 0 ? `${totalDays} Day${totalDays > 1 ? 's' : ''} ${totalNights} Night${totalNights !== 1 ? 's' : ''}` : null;

  // Fetch similar itineraries using the city param
  const similarItineraries = locationCity ? await getRandomSimilarItineraries(locationCity, id) : [];

  return (
    <>
      <SeoStructuredData seo={itinerarySeo} id="itinerary-structured-data" />
      <CreatorItineraryViewRecorder itineraryId={id} enabled={!!data?.is_creator_itinerary} />
      <SeoHeadScripts seo={itineraryHeadScripts} />
      <AffiliateTracker creatorId={ref} />
      <SeoBodyScripts seo={itinerarySeo} />
      <BannerSection
        activityName={name}
        media_gallery={media_gallery}
        reviewSummary={review_summary}
        primaryLocation={primaryLocation}
        city={locationCity}
        scheduleDisplay={scheduleDisplay}
        itemId={id}
        itemType="itinerary"
        slug={itinerary}
        citySlug={city}
        cityName={primaryLocation?.city}
        price={data?.price}
        currency={data?.currency}
      />
      <SingleProductTabSection productType="itinerary" productId={id} productData={data} itinerarySlug={itinerary} similarActivities={similarItineraries} session={session} itinerary={data} />
      <SeoFooterScripts seo={itinerarySeo} />
    </>
  );
}
