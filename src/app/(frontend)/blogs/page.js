import React from 'react';
import dynamic from 'next/dynamic';
import BannerSectionSearchForm from '@/app/components/Pages/FRONT_END/Global/BannerSectionSearchForm';
import { fakeData } from '@/app/Data/ShopData';

const BlogSliderSection = dynamic(() => import('@/app/components/Pages/FRONT_END/Global/BlogSliderSection'));
const BrowseDestinationsSection = dynamic(() => import('@/app/components/Pages/FRONT_END/home/BrowseDestinationsSection'));
const BlogList = dynamic(() => import('@/app/components/Pages/FRONT_END/Global/BlogFilter/BlogList'));

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
      <BrowseDestinationsSection cities={fakeData} title="Top Categories" navigationPrefix="top-categories" subtitleMode="blogs" />
      <BlogList />
    </>
  );
};

export default BlogsPage;
