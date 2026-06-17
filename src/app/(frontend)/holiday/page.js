import BannerSection from '@/app/components/Pages/FRONT_END/holiday/BannerSection';
import TrendingSection from '@/app/components/Pages/FRONT_END/holiday/TrendingSection';
import { getAllFeaturedCities } from '@/lib/services/cities';
import React from 'react';

export const revalidate = 60;

const HolidayPage = async () => {
  const featuredCitiesRes = await getAllFeaturedCities();
  const featuredCities = Array.isArray(featuredCitiesRes) ? featuredCitiesRes : (featuredCitiesRes?.data ?? []);

  return (
    <>
      <BannerSection />
      <TrendingSection cities={featuredCities} />
    </>
  );
};

export default HolidayPage;
