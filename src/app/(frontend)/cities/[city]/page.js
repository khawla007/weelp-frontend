/** City Page — matches designs/citypage.pen */
import CityHeroBanner from '@/app/components/Pages/FRONT_END/city/CityHeroBanner';
import CitySection from '@/app/components/Pages/FRONT_END/Global/CitySection';
import { whiteCardData } from '@/app/Data/ShopData';
import { getAllBlogs } from '@/lib/services/blogs';
import BreakSection from '@/app/components/BreakSection';
import { ReviewSectionCity } from '@/app/components/Pages/FRONT_END/Global/ReviewSection';
import CityActivitiesSlider from '@/app/components/Pages/FRONT_END/city/CityActivitiesSlider';
import CityToursHeader from '@/app/components/Pages/FRONT_END/city/CityToursHeader';
import CityFilterSection from '@/app/components/Pages/FRONT_END/city/CityFilterSection';
import CityBlogSlider from '@/app/components/Pages/FRONT_END/city/CityBlogSlider';
import { notFound } from 'next/navigation';
import { getCityData } from '@/lib/services/cities';
import { getFeaturedActivitiesByCity } from '@/lib/services/activites';
import { getFeaturedItinerariesByCity } from '@/lib/services/itineraries';
import { getPackageDataByCity } from '@/lib/services/package';

export async function generateMetadata({ params }) {
  const { city } = await params;
  const response = await getCityData(city);

  if (!response?.success || !response?.data) {
    return { title: 'City Not Found' };
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
  const activitiesResponse = await getFeaturedActivitiesByCity(city);
  const itineraryResponse = await getFeaturedItinerariesByCity(city);
  const packageResponse = await getPackageDataByCity(city);
  const blogsResponse = await getAllBlogs();

  const { data: citydata = [] } = cityResponse;
  const { data: activitesData = [] } = activitiesResponse;
  const { data: itineraryData = [] } = itineraryResponse;
  const { data: packageData = [] } = packageResponse;
  const blogsData = blogsResponse?.data || [];

  if (!citydata || Object.keys(citydata).length === 0) {
    notFound();
  }

  const jsonLd = citydata?.seo?.schema_data || '';
  const hasAnyProducts = activitesData?.length > 0 || itineraryData?.length > 0 || packageData?.length > 0;

  return (
    <>
      {/* Hero Banner — always shows (city always has basic data) */}
      <CityHeroBanner city={citydata} />

      {/* Category Icon Cards — static data, always shows */}
      <CitySection data={whiteCardData} />

      {/* Top Activities Slider — only if activities exist */}
      {activitesData?.length > 0 && (
        <CityActivitiesSlider
          title="Top activities"
          subtitle={`Discover the best activities in ${citydata?.name || city}`}
          items={activitesData}
          navigationId="city-activities"
        />
      )}

      {/* Top Itineraries Slider — only if itineraries exist */}
      {itineraryData?.length > 0 && (
        <CityActivitiesSlider
          title="Top Itineraries"
          subtitle={`Curated itineraries for ${citydata?.name || city}`}
          items={itineraryData}
          navigationId="city-itineraries"
        />
      )}

      {/* Divider — only if there are products above AND below */}
      {(activitesData?.length > 0 || itineraryData?.length > 0) && packageData?.length > 0 && (
        <BreakSection marginTop="m-0 p-0" />
      )}

      {/* City Tours Header + Tours Slider — only if packages exist */}
      {packageData?.length > 0 && (
        <>
          <CityToursHeader cityName={citydata?.name || city} citySlug={city} />
          <CityActivitiesSlider
            title="Top Tours"
            subtitle={`Curated tour packages in ${citydata?.name || city}`}
            items={packageData}
            navigationId="city-tours"
          />
        </>
      )}

      {/* Divider before filter section */}
      {hasAnyProducts && <BreakSection />}

      {/* Filter Section (tabs, sort, sidebar, grid, pagination) — only if any product data */}
      {hasAnyProducts && (
        <CityFilterSection cityName={citydata?.name} />
      )}

      {/* Reviews + What About + FAQ — only if city data is a valid object */}
      {typeof citydata === 'object' && citydata?.location_details && (
        <ReviewSectionCity cityData={citydata} />
      )}

      {/* Blogs Slider — only if blogs exist */}
      {blogsData.length > 0 && (
        <CityBlogSlider blogs={blogsData} />
      )}

      {/* JSON-LD Schema */}
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
    </>
  );
}
