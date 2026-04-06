import React from 'react';
import { getExploreCreatorItineraries } from '@/lib/services/exploreCreatorItineraries';
import BannerSectionSearchForm from '@/app/components/Pages/FRONT_END/Global/BannerSectionSearchForm';
import ExploreClientWrapper from '@/app/components/Pages/FRONT_END/explore/ExploreClientWrapper';

const ExplorePage = async () => {
  const itinerariesData = await getExploreCreatorItineraries(1);
  const initialItineraries = itinerariesData?.data || [];
  const lastPage = itinerariesData?.last_page || 1;

  return (
    <>
      <BannerSectionSearchForm title={'Explore Creators'} description={'Discover travel experiences shared by creators. Find inspiration and book your next adventure.'} />

      <ExploreClientWrapper initialItineraries={initialItineraries} lastPage={lastPage} />
    </>
  );
};

export default ExplorePage;
