export const revalidate = 60;

import dynamic from 'next/dynamic';
import HeroSection from '../components/Pages/FRONT_END/home/HeroSection';
import WeelpRecommendations from '@/app/components/Pages/FRONT_END/home/WeelpRecommendations';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import { getAllFeaturedActivities } from '@/lib/services/activites';
import { getAllFeaturedCities } from '@/lib/services/cities';
import { getPublicReviews } from '@/lib/services/reviews';
import { publicApi } from '@/lib/axiosInstance';

const ProductSliderSection = dynamic(() => import('@/app/components/ui/ProductSliderSection'));
const BrowseDestinationsSection = dynamic(() => import('../components/Pages/FRONT_END/home/BrowseDestinationsSection'));
const TestimonialSection = dynamic(() => import('../components/Pages/FRONT_END/Global/TestimonialSection'));
const AiSection = dynamic(() => import('../components/Pages/FRONT_END/home/AiSection'));
const BlogSection = dynamic(() => import('../components/ui/BlogSection'));

const HomePage = async () => {
  const [featuredActivitiesRes, featuredCitiesRes, blogsRes, reviewsRes] = await Promise.all([
    getAllFeaturedActivities(),
    getAllFeaturedCities(),
    publicApi
      .get('/api/blogs?per_page=10', { headers: { Accept: 'application/json' } })
      .then((res) => res.data)
      .catch(() => ({ data: [] })),
    getPublicReviews(),
  ]);

  const featuredActivities = Array.isArray(featuredActivitiesRes) ? featuredActivitiesRes : (featuredActivitiesRes?.data ?? []);

  const featuredCities = Array.isArray(featuredCitiesRes) ? featuredCitiesRes : (featuredCitiesRes?.data ?? []);

  const blogs = blogsRes?.data ?? [];
  const reviews = Array.isArray(reviewsRes?.data) ? reviewsRes.data : [];

  return (
    <>
      <HeroSection />
      {featuredActivities.length > 0 && <ProductSliderSection items={featuredActivities.map((a) => mapProductToItemCard(a))} title="Top activities" navigationId="top-activities" />}
      <BrowseDestinationsSection cities={featuredCities} />
      <TestimonialSection reviews={reviews} />
      <AiSection />
      <BlogSection blogs={blogs} navigationId="guide-blog" />
      <WeelpRecommendations />
    </>
  );
};

export default HomePage;
