/** This File Will Handle Itinerary Page under City context */
import dynamic from 'next/dynamic';
import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import { notFound } from 'next/navigation';
import { getSingleItinerary, getRandomSimilarItineraries } from '@/lib/services/itineraries';

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

export default async function IterenaryPage({ params }) {
  const { city, itinerary } = await params;

  const iterenaryData = await getSingleItinerary(itinerary);

  if (iterenaryData.length === 0) {
    notFound();
  }

  const { data, id } = iterenaryData;
  const { name, seo, media_gallery = [], review_summary, locations = [] } = data;

  // Fetch similar itineraries using the city param
  const similarItineraries = city ? await getRandomSimilarItineraries(city, id) : [];

  let schemaJson = {};
  try {
    schemaJson = seo?.schema_data ? JSON.parse(seo.schema_data) : {};
  } catch (error) {
    console.error('Invalid JSON schema_data:', error);
  }

  return (
    <>
      <BannerSection activityName={name} media_gallery={media_gallery} reviewSummary={review_summary} />
      <SingleProductTabSection productType="itinerary" productId={id} productData={data} itinerarySlug={itinerary} similarActivities={similarItineraries} />

      {schemaJson && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }} />}
    </>
  );
}
