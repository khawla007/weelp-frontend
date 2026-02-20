import React from 'react';
import BlogFilterBar from './BlogFilter';

const BlogList = () => {
  return (
    <section className="container mx-auto flex flex-col gap-3 p-4 sm:my-4">
      <h2 className="text-lg sm:text-[28px] font-medium text-Nileblue capitalize">Browse Blogs</h2>
      <BlogFilterBar />
    </section>
  );
};

export default BlogList;
