/** This File Will Handle City Page */
import BannerSection from '@/app/components/Pages/FRONT_END/city/BannerSection';
import CitySection from '@/app/components/Pages/FRONT_END/Global/CitySection';
import { whiteCardData, fakeData } from '@/app/Data/ShopData';
import BreakSection from '@/app/components/BreakSection';
import { TourSection } from '@/app/components/Pages/FRONT_END/Global/TourSection';
import { ReviewSectionCity } from '@/app/components/Pages/FRONT_END/Global/ReviewSection';
import GuideSection from '@/app/components/Pages/FRONT_END/Global/GuideSection';
import ProductSliderSection from '@/app/components/Pages/FRONT_END/Global/ProductSliderSection';
import { notFound } from 'next/navigation';
import { CityFilter } from '@/app/components/Pages/FRONT_END/city/city_filter';
import { getCityData } from '@/lib/services/cities';
import { getActivitisDataByCity } from '@/lib/services/activites';
import { getItineraryDataByCity } from '@/lib/services/itineraries';
import { getPackageDataByCity } from '@/lib/services/package';

// seo
export async function generateMetadata({ params }) {
  const { city } = await params;
  const response = await getCityData(city);

  if (!response?.success || !response?.data) {
    return { title: 'City Not Found' }; // Fallback if city data is unavailable
  }

  const { seo } = response.data;

  return {
    title: seo?.meta_title || 'Default Title',
    description: seo?.meta_description || 'Default description',
    keywords: seo?.keywords || '',
    openGraph: {
      title: seo?.meta_title,
      description: seo?.meta_description,
      images: seo?.og_image_url ? [seo.og_image_url] : [],
      url: seo?.canonical_url || '',
    },
    alternates: {
      canonical: seo?.canonical_url || '',
    },
  };
}

export default async function CityPage({ params }) {
  const { city } = await params;

  const cityResponse = await getCityData(city);
  const activitiesResponse = await getActivitisDataByCity(city);
  const itineraryResponse = await getItineraryDataByCity(city);
  const packageResponse = await getPackageDataByCity(city);

  const { data: citydata = [] } = cityResponse;
  const { data: activitesData = [] } = activitiesResponse;
  const { data: itineraryData = [] } = itineraryResponse;
  const { data: packageData = [], tag_list = [] } = packageResponse;

  // If city data doesn't exist, show 404
  if (!citydata || Object.keys(citydata).length === 0) {
    notFound();
  }

  //dynamic schema
  const jsonLd = citydata?.seo?.schema_data || '';

  return (
    <>
      <BannerSection bannerTitle={city} />

      <CitySection data={whiteCardData} />

      {activitesData?.length > 0 ? (
        <ProductSliderSection sliderTitle={'Top Activities'} destinations={activitesData} />
      ) : (
        <div className="py-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Top Activities</h2>
          <p className="text-gray-600">No activities available in {citydata?.name || city} yet</p>
        </div>
      )}

      {itineraryData.length > 0 ? (
        <ProductSliderSection sliderTitle={'Top Itenerary'} destinations={itineraryData} />
      ) : (
        <div className="py-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Top Itenerary</h2>
          <p className="text-gray-600">No itineraries available in {citydata?.name || city} yet</p>
        </div>
      )}

      {packageData?.length > 0 ? (
        <>
          <BreakSection marginTop={'m-0 p-0'} />
          <TourSection taglist={tag_list} items={packageData} />
        </>
      ) : (
        <div className="py-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Top Tours</h2>
          <p className="text-gray-600">No packages available in {citydata?.name || city} yet</p>
        </div>
      )}
      <BreakSection />

      <CityFilter hasAnyData={activitesData?.length > 0 || itineraryData?.length > 0 || packageData?.length > 0} />

      {typeof citydata === 'object' && <ReviewSectionCity cityData={citydata} />}

      <GuideSection sectionTitle={'Blogs'} data={fakeData} />

      {/* Add schema in  page */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
