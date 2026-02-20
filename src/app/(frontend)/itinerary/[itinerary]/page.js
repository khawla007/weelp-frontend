import BannerSection from '@/app/components/Pages/FRONT_END/singleproduct/BannerSection';
import { TabSectionIterenary } from '@/app/components/Pages/FRONT_END/singleproduct/TabSection';
import { notFound } from 'next/navigation';
import { getSingleItinerary } from '@/lib/services/itineraries';

//  Dynamic SEO Itinerary
export async function generateMetadata({ params }) {
  const { itinerary } = await params;

  const iterenaryData = await getSingleItinerary(itinerary);

  // itinerary data check
  if (!iterenaryData || iterenaryData.length === 0) {
    return {
      title: 'Itinerary Not Found',
    };
  }

  const { data } = iterenaryData;

  // Destructure SEO fields from your SEO object structure
  const { meta_title, meta_description, keywords, schema_type, schema_data } = data.seo || {};

  return {
    title: meta_title || data.name || 'Default Title',
    description: meta_description || 'Default description for itinerary page',
    keywords: keywords || undefined,
  };
}

/** This File Will Handle Itinerary Page (Single Product) */
export default async function IterenaryPage({ params }) {
  const { itinerary } = await params;

  const iterenaryData = await getSingleItinerary(itinerary);

  // if activity not found
  if (iterenaryData.length === 0) {
    notFound();
  }

  const { data, id } = iterenaryData;
  const { name, seo, media_gallery = [] } = data; //data

  // Parse schema_data safely
  let schemaJson = {};
  try {
    schemaJson = seo?.schema_data ? JSON.parse(seo.schema_data) : {};
  } catch (error) {
    console.error('Invalid JSON schema_data:', error);
  }

  return (
    <>
      <BannerSection activityName={name} media_gallery={media_gallery} />
      <TabSectionIterenary productData={data} />

      {/* Inject JSON-LD schema */}
      {schemaJson && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }} />}
    </>
  );
}
