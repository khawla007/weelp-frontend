/** This File Will Handle City Page */
import BannerSection from '@/app/components/Pages/FRONT_END/city/BannerSection';
import CitySection from '@/app/components/Pages/FRONT_END/Global/CitySection';
import { whiteCardData } from '@/app/Data/ShopData';
import { getAllBlogs } from '@/lib/services/blogs';
import BreakSection from '@/app/components/BreakSection';
import { ReviewSectionCity } from '@/app/components/Pages/FRONT_END/Global/ReviewSection';
import CityGuideSection from '@/app/components/Pages/FRONT_END/city/CityGuideSection';
import CityProductSliderSection from '@/app/components/Pages/FRONT_END/city/CityProductSliderSection';
import { notFound } from 'next/navigation';
import { CityFilter } from '@/app/components/Pages/FRONT_END/city/city_filter';
import { getCityData } from '@/lib/services/cities';
import { getFeaturedActivitiesByCity } from '@/lib/services/activites';
import { getFeaturedItinerariesByCity } from '@/lib/services/itineraries';
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
  const activitiesResponse = await getFeaturedActivitiesByCity(city);
  const itineraryResponse = await getFeaturedItinerariesByCity(city);
  const packageResponse = await getPackageDataByCity(city);

  const blogsResponse = await getAllBlogs();

  const { data: citydata = [] } = cityResponse;
  const { data: activitesData = [] } = activitiesResponse;
  const { data: itineraryData = [] } = itineraryResponse;
  const { data: packageData = [], tag_list = [] } = packageResponse;
  const blogsData = (blogsResponse?.data || []).map((blog) => ({
    id: blog.id,
    name: blog.categories?.[0]?.category_name || 'Travel',
    slug: blog.slug,
    description: blog.name,
    image: blog.media_gallery?.find((m) => m.is_featured)?.url || blog.media_gallery?.[0]?.url || '',
  }));

  // If city data doesn't exist, show 404
  if (!citydata || Object.keys(citydata).length === 0) {
    notFound();
  }

  //dynamic schema
  const jsonLd = citydata?.seo?.schema_data || '';

  return (
    <>
      <BannerSection city={citydata} />

      <CitySection data={whiteCardData} />

      {activitesData?.length > 0 ? (
        <CityProductSliderSection
          title="Top Activities"
          subtitle={`Discover the best activities in ${citydata?.name || city}`}
          items={activitesData}
          navigationId="city-activities"
        />
      ) : (
        <div className="py-12 text-center">
          <h2 className="font-home-heading text-[28px] font-bold tracking-[-0.04em] text-[var(--weelp-home-ink)] mb-2">Top Activities</h2>
          <p className="text-[15px] text-[var(--weelp-home-copy)]">No activities available in {citydata?.name || city} yet</p>
        </div>
      )}

      {itineraryData.length > 0 ? (
        <CityProductSliderSection
          title="Top Itineraries"
          subtitle={`Curated itineraries for ${citydata?.name || city}`}
          items={itineraryData}
          navigationId="city-itineraries"
        />
      ) : (
        <div className="py-12 text-center">
          <h2 className="font-home-heading text-[28px] font-bold tracking-[-0.04em] text-[var(--weelp-home-ink)] mb-2">Top Itineraries</h2>
          <p className="text-[15px] text-[var(--weelp-home-copy)]">No itineraries available in {citydata?.name || city} yet</p>
        </div>
      )}

      {packageData?.length > 0 ? (
        <>
          <BreakSection marginTop={'m-0 p-0'} />
          <CityProductSliderSection
            title="Top Tours"
            subtitle={`Curated tour packages in ${citydata?.name || city}`}
            items={packageData}
            navigationId="city-tours"
          />
        </>
      ) : (
        <div className="py-12 text-center">
          <h2 className="font-home-heading text-[28px] font-bold tracking-[-0.04em] text-[var(--weelp-home-ink)] mb-2">Top Tours</h2>
          <p className="text-[15px] text-[var(--weelp-home-copy)]">No packages available in {citydata?.name || city} yet</p>
        </div>
      )}
      <BreakSection />

      <CityFilter hasAnyData={activitesData?.length > 0 || itineraryData?.length > 0 || packageData?.length > 0} cityName={citydata?.name} />

      {typeof citydata === 'object' && <ReviewSectionCity cityData={citydata} />}

      {blogsData.length > 0 && <CityGuideSection title="Blogs" data={blogsData} />}

      {/* Add schema in  page */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
