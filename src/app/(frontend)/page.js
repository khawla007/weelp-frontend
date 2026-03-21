export const revalidate = 60;

import HeroSection from '../components/Pages/FRONT_END/home/HeroSection';
import ProductSliderSection from '@/app/components/ui/ProductSliderSection';
import { mapProductToItemCard } from '@/lib/mapProductToItemCard';
import BrowseDestinationsSection from '../components/Pages/FRONT_END/home/BrowseDestinationsSection';
import TestimonialSection from '../components/Pages/FRONT_END/Global/TestimonialSection';
import AiSection from '../components/Pages/FRONT_END/home/AiSection';
import BlogSection from '../components/ui/BlogSection';
import { getAllFeaturedActivities } from '@/lib/services/activites';
import { getAllFeaturedCities } from '@/lib/services/cities';
import { publicApi } from '@/lib/axiosInstance';

const HomePage = async () => {
  const [featuredActivitiesRes, featuredCitiesRes, blogsRes] = await Promise.all([
    getAllFeaturedActivities(),
    getAllFeaturedCities(),
    publicApi
      .get('/api/blogs?per_page=10', { headers: { Accept: 'application/json' } })
      .then((res) => res.data)
      .catch(() => ({ data: [] })),
  ]);

  const featuredActivities = Array.isArray(featuredActivitiesRes) ? featuredActivitiesRes : (featuredActivitiesRes?.data ?? []);

  const featuredCities = Array.isArray(featuredCitiesRes) ? featuredCitiesRes : (featuredCitiesRes?.data ?? []);

  const blogs = blogsRes?.data ?? [];

  return (
    <>
      <HeroSection />
      {featuredActivities.length > 0 && <ProductSliderSection items={featuredActivities.map((a) => mapProductToItemCard(a))} title="Top activities" navigationId="top-activities" />}
      <BrowseDestinationsSection cities={featuredCities} />
      <TestimonialSection />
      <AiSection />
      <BlogSection blogs={blogs} navigationId="guide-blog" />
    </>
  );
};

export default HomePage;
