import BrowseDestinationsSection from '@/app/components/Pages/FRONT_END/home/BrowseDestinationsSection';
import BannerSection from '@/app/components/Pages/FRONT_END/holiday/BannerSection';
import { getAllFeaturedCities } from '@/lib/services/cities';

export const revalidate = 60;

const HolidayPage = async () => {
  const featuredCitiesRes = await getAllFeaturedCities();
  const featuredCities = Array.isArray(featuredCitiesRes) ? featuredCitiesRes : (featuredCitiesRes?.data ?? []);

  return (
    <>
      <BannerSection />
      <BrowseDestinationsSection cities={featuredCities} title="Trending Spots" subtitleMode="count" navigationPrefix="holiday-trending-spots" />
    </>
  );
};

export default HolidayPage;
