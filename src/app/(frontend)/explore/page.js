import React from 'react';
import CreatorFilter from '@/app/components/Pages/FRONT_END/explore/SectionCreatorFilter';
import BannerSectionSearchForm from '@/app/components/Pages/FRONT_END/Global/BannerSectionSearchForm';

const ExplorePage = async () => {
  return (
    <>
      <BannerSectionSearchForm title={'Explore Creators'} description={"You'll discover everything from whisky to Harry Potter, or even some body snatchers, in Scotland's captivating capital."} />

      <CreatorFilter />
    </>
  );
};

export default ExplorePage;
