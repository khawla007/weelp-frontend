/** This File Will Handle Itinerary Page under City context */
import dynamic from 'next/dynamic';
import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import { notFound } from 'next/navigation';
import { getSingleItinerary, getRandomSimilarItineraries } from '@/lib/services/itineraries';
import AffiliateTracker from '@/app/components/AffiliateTracker';
import { auth } from '@/lib/auth/auth';

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
  const { meta_title, meta_description, keywords } = data.seo || {};

  return {
    title: meta_title || data.name || 'Default Title',
    description: meta_description || 'Default description for itinerary page',
    keywords: keywords || undefined,
  };
}

export default async function IterenaryPage({ params, searchParams }) {
  const { city, itinerary } = await params;
  const { ref } = await searchParams;
  const session = await auth();

  const iterenaryData = await getSingleItinerary(itinerary);

  if (iterenaryData.length === 0) {
    notFound();
  }

  const { data, id } = iterenaryData;
  const { name, seo, media_gallery = [], review_summary, locations = [], schedules = [] } = data;

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

  let schemaJson = {};
  try {
    schemaJson = seo?.schema_data ? JSON.parse(seo.schema_data) : {};
  } catch (error) {
    console.error('Invalid JSON schema_data:', error);
  }

  return (
    <>
      <AffiliateTracker creatorId={ref} />
      <BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={review_summary} primaryLocation={primaryLocation} city={locationCity} scheduleDisplay={scheduleDisplay} />
      <SingleProductTabSection productType="itinerary" productId={id} productData={data} itinerarySlug={itinerary} similarActivities={similarItineraries} session={session} itinerary={data} />

      {schemaJson && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }} />}
    </>
  );
}
