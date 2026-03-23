/** City Page — matches designs/citypage.pen */
import dynamic from 'next/dynamic';
import CityHeroBanner from '@/app/components/Pages/FRONT_END/city/CityHeroBanner';
import CitySection from '@/app/components/Pages/FRONT_END/Global/CitySection';
import { whiteCardData } from '@/app/Data/ShopData';
import { getAllBlogs } from '@/lib/services/blogs';
import BreakSection from '@/app/components/BreakSection';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import CityToursSection from '@/app/components/Pages/FRONT_END/city/CityToursSection';
import { notFound } from 'next/navigation';
import { getCityData } from '@/lib/services/cities';
import { getAllFeaturedActivities } from '@/lib/services/activites';
import { getFeaturedItineraries } from '@/lib/services/itineraries';
import { getFeaturedReviews } from '@/lib/services/reviews';

const ReviewSectionCity = dynamic(() => import('@/app/components/Pages/FRONT_END/Global/ReviewSection').then((mod) => mod.ReviewSectionCity));
const ProductSliderSection = dynamic(() => import('@/app/components/ui/ProductSliderSection'));
const CityFilterSection = dynamic(() => import('@/app/components/Pages/FRONT_END/city/CityFilterSection'));
const BlogSection = dynamic(() => import('@/app/components/ui/BlogSection'));

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
  const activitiesResponse = await getAllFeaturedActivities(city);
  const itineraryResponse = await getFeaturedItineraries(city);
  const blogsResponse = await getAllBlogs();
  const featuredReviewsResponse = await getFeaturedReviews(city);

  const { data: citydata = [] } = cityResponse;
  const { data: activitesData = [] } = activitiesResponse;
  const { data: itineraryData = [] } = itineraryResponse;
  const blogsData = blogsResponse?.data || [];
  const featuredReviews = Array.isArray(featuredReviewsResponse?.data) ? featuredReviewsResponse.data : [];

  if (!citydata || Object.keys(citydata).length === 0) {
    notFound();
  }

  const jsonLd = citydata?.seo?.schema_data || '';
  const hasAnyProducts = activitesData?.length > 0 || itineraryData?.length > 0;

  return (
    <>
      {/* Hero Banner — always shows (city always has basic data) */}
      <CityHeroBanner city={citydata} />

      {/* Category Icon Cards — static data, always shows */}
      <CitySection data={whiteCardData} />

      {/* Top Activities Slider — only if activities exist */}
      {activitesData?.length > 0 && <ProductSliderSection items={activitesData.map((a) => mapProductToItemCard(a, city))} title="Top activities" navigationId="city-activities" />}

      {/* Divider before tours section */}
      {activitesData?.length > 0 && <BreakSection marginTop="m-0 p-0" />}

      {/* Tours grid section — fetches its own data with pagination, tag filter, sort */}
      <CityToursSection cityName={citydata?.name || city} />

      {/* Divider before filter section */}
      {hasAnyProducts && <BreakSection marginTop="m-0" />}

      {/* Filter Section (tabs, sort, sidebar, grid, pagination) — only if any product data */}
      {hasAnyProducts && <CityFilterSection />}

      {/* Reviews + What About + FAQ — only if city data is a valid object */}
      {typeof citydata === 'object' && citydata?.location_details && <ReviewSectionCity cityData={citydata} reviews={featuredReviews} />}

      {/* Blogs Slider — only if blogs exist */}
      {blogsData.length > 0 && <BlogSection blogs={blogsData} title="Blogs" navigationId="city-blogs" />}

      {/* JSON-LD Schema */}
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </>
  );
}
