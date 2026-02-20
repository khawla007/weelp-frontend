import React from 'react';
import BannerSectionSearchForm from '@/app/components/Pages/FRONT_END/Global/BannerSectionSearchForm';
import { fakeData } from '@/app/Data/ShopData';
import BlogSliderSection from '@/app/components/Pages/FRONT_END/Global/BlogSliderSection';
import DestinationSliderSection from '@/app/components/Pages/FRONT_END/Global/DestinationSection';
import BlogList from '@/app/components/Pages/FRONT_END/Global/BlogFilter/BlogList';

export async function generateMetadata() {
  return {
    title: 'Blogs Page',
    description: 'Description of the Blog',
  };
}

const BlogsPage = () => {
  return (
    <>
      <BannerSectionSearchForm title={'Explore Blogs'} description={"You'll discover everything from whisky to Harry Potter, or even some bodysnatcher's, in scotland's capital"} />
      <BlogSliderSection sectionTitle={'Latest Blogs'} />
      <DestinationSliderSection sliderTitle={'Top Categories'} data={fakeData} />
      <BlogList />
    </>
  );
};

export default BlogsPage;
