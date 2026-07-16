import React from 'react';
import BlogFilterBar from './BlogFilter';
import Reveal from '@/app/components/ui/Reveal';

const BlogList = ({ initialFilters = {} }) => {
  return (
    <Reveal as="section" initialHidden className="container-page flex flex-col gap-3 pb-10 md:pb-16 lg:pb-24">
      <BlogFilterBar title="Browse Blogs" initialFilters={initialFilters} />
    </Reveal>
  );
};

export default BlogList;
