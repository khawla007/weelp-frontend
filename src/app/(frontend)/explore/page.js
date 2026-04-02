import React from 'react';
import { getExplorePosts } from '@/lib/services/posts';
import BannerSectionSearchForm from '@/app/components/Pages/FRONT_END/Global/BannerSectionSearchForm';
import WeelpRecommendations from '@/app/components/Pages/FRONT_END/explore/WeelpRecommendations';
import ExploreClientWrapper from '@/app/components/Pages/FRONT_END/explore/ExploreClientWrapper';

const ExplorePage = async () => {
  const postsData = await getExplorePosts(1);
  const initialPosts = postsData?.data || [];
  const lastPage = postsData?.last_page || 1;

  return (
    <>
      <BannerSectionSearchForm title={'Explore Creators'} description={'Discover travel experiences shared by creators. Find inspiration and book your next adventure.'} />

      <ExploreClientWrapper initialPosts={initialPosts} lastPage={lastPage} />

      <WeelpRecommendations />
    </>
  );
};

export default ExplorePage;
