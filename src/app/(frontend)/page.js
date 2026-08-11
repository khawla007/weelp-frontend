export const revalidate = 60;

import dynamic from 'next/dynamic';
import HeroSection from '../components/Pages/FRONT_END/home/HeroSection';
import WeelpRecommendations from '@/app/components/Pages/FRONT_END/home/WeelpRecommendations';
import SectionFallback from '@/app/components/ui/SectionFallback';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import { getAllFeaturedActivities } from '@/lib/services/activites';
import { getAllFeaturedCities } from '@/lib/services/cities';
import { getPublicReviews } from '@/lib/services/reviews';
import { publicApi } from '@/lib/axiosInstance';

const ProductSliderSection = dynamic(() => import('@/app/components/ui/ProductSliderSection'));
const BrowseDestinationsSection = dynamic(() => import('../components/Pages/FRONT_END/home/BrowseDestinationsSection'));
const TestimonialSection = dynamic(() => import('../components/Pages/FRONT_END/Global/TestimonialSection'));
const AiSection = dynamic(() => import('../components/Pages/FRONT_END/home/AiSection'));
const WanderersBanner = dynamic(() => import('../components/Pages/FRONT_END/home/WanderersBanner'));
const BlogSection = dynamic(() => import('../components/ui/BlogSection'));

const fetchBlogs = () =>
  publicApi
    .get('/api/blogs?per_page=10', { headers: { Accept: 'application/json' } })
    .then((res) => ({ ok: true, data: Array.isArray(res.data?.data) ? res.data.data : [] }))
    .catch(() => ({ ok: false, data: [] }));

const HomePage = async () => {
  const [featuredActivitiesRes, featuredCitiesRes, blogsResult, reviewsRes] = await Promise.all([getAllFeaturedActivities(), getAllFeaturedCities(), fetchBlogs(), getPublicReviews()]);

  const featuredActivities = Array.isArray(featuredActivitiesRes) ? featuredActivitiesRes : (featuredActivitiesRes?.data ?? []);

  const citiesOk = featuredCitiesRes?.success !== false;
  const featuredCities = Array.isArray(featuredCitiesRes) ? featuredCitiesRes : (featuredCitiesRes?.data ?? []);

  const blogs = blogsResult.data;
  const reviews = Array.isArray(reviewsRes?.data) ? reviewsRes.data : [];

  return (
    <>
      <HeroSection />

      {featuredActivities.length > 0 ? (
        <ProductSliderSection items={featuredActivities.map((a) => mapProductToItemCard(a))} title="Top activities" navigationId="top-activities" className="pb-12 md:pb-16 lg:pb-24" />
      ) : (
        <SectionFallback
          eyebrow="Top activities"
          message="The concierge is between picks right now. Browse the Dubai catalog while we line up the next set."
          pivotHref="/cities/dubai"
          pivotLabel="Browse Dubai experiences"
        />
      )}

      {featuredCities.length > 0 ? (
        <BrowseDestinationsSection cities={featuredCities} cardTextTone="foreground" className="pb-12 md:pb-16 lg:pb-24" />
      ) : (
        <SectionFallback
          eyebrow="Top destinations"
          message={
            citiesOk
              ? "We're shaping a fresh set of cities for the season. Jump straight to the catalog in the meantime."
              : "We couldn't load destinations just now. Refresh, or browse the full catalog."
          }
          variant={citiesOk ? 'empty' : 'error'}
          pivotHref="/cities"
          pivotLabel="See all cities"
        />
      )}

      {reviews.length > 0 ? (
        <TestimonialSection reviews={reviews} />
      ) : (
        <SectionFallback
          eyebrow="From travelers"
          message="The first reviews of this season are still coming in. Yours could be the one we open with."
          pivotHref="/cities"
          pivotLabel="Plan a trip worth reviewing"
        />
      )}
      <WanderersBanner />
      <AiSection />

      {blogs.length > 0 ? (
        <BlogSection blogs={blogs} navigationId="guide-blog" className="pb-12 md:pb-16 lg:pb-24" />
      ) : (
        <SectionFallback
          eyebrow="Your guide"
          message={
            blogsResult.ok ? 'New stories from our editors are on the way. The catalog has plenty to wander in the meantime.' : "We couldn't pull the editors' latest just now. Refresh to try again."
          }
          variant={blogsResult.ok ? 'empty' : 'error'}
          pivotHref="/blogs"
          pivotLabel="Read all stories"
        />
      )}

      <WeelpRecommendations />
    </>
  );
};

export default HomePage;
