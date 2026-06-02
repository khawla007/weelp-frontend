import React from 'react';
import dynamic from 'next/dynamic';
import BannerSectionSearchForm from '@/app/components/Pages/FRONT_END/Global/BannerSectionSearchForm';

const BlogSliderSection = dynamic(() => import('@/app/components/Pages/FRONT_END/Global/BlogSliderSection'));
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
      <BlogList />
    </>
  );
};

export default BlogsPage;
