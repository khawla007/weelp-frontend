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

  const { data: citydata = [] } = await getCityData(city);
  const { data: activitesData = [] } = await getActivitisDataByCity(city);
  const { data: itineraryData = [] } = await getItineraryDataByCity(city);
  const { data: packageData = [], tag_list = [] } = await getPackageDataByCity(city);

  // If all are empty or null, trigger notFound()
  if ((!activitesData || activitesData.length === 0) && (!itineraryData || itineraryData.length === 0) && (!packageData || packageData.length === 0)) {
    notFound();
  }

  //dynamic schema
  const jsonLd = citydata?.seo?.schema_data || '';

  return (
    <>
      <BannerSection bannerTitle={city} />

      <CitySection data={whiteCardData} />

      {activitesData?.length > 0 && <ProductSliderSection sliderTitle={'Top Activities'} destinations={activitesData} />}

      {itineraryData.length > 0 && <ProductSliderSection sliderTitle={'Top Itenerary'} destinations={itineraryData} />}

      {packageData?.length > 0 && (
        <>
          <BreakSection marginTop={'m-0 p-0'} />
          <TourSection taglist={tag_list} items={packageData} />
        </>
      )}
      <BreakSection />

      <CityFilter />

      {typeof citydata === 'object' && <ReviewSectionCity cityData={citydata} />}

      <GuideSection sectionTitle={'Blogs'} data={fakeData} />

      {/* Add schema in  page */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
