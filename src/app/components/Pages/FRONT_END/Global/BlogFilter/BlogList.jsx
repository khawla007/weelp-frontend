import React from 'react';
import BlogFilterBar from './BlogFilter';
import Reveal from '@/app/components/ui/Reveal';

const BlogList = () => {
  return (
    <Reveal as="section" initialHidden className="container-page flex flex-col gap-3 pb-10 md:pb-16 lg:pb-24">
      <h2 className="text-lg sm:text-[28px] font-medium text-[#18181b] capitalize">Browse Blogs</h2>
      <BlogFilterBar />
    </Reveal>
  );
};

export default BlogList;
