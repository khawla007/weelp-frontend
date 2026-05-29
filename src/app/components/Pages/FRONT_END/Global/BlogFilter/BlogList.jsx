import React from 'react';
import BlogFilterBar from './BlogFilter';
import Reveal from '@/app/components/ui/Reveal';

const BlogList = () => {
  return (
    <Reveal as="section" className="container mx-auto flex flex-col gap-3 p-4 sm:my-4">
      <h2 className="text-lg sm:text-[28px] font-medium text-[#18181b] capitalize">Browse Blogs</h2>
      <BlogFilterBar />
    </Reveal>
  );
};

export default BlogList;
