'use client';
import React from 'react';
import BlogSlider from '@/app/components/sliders/BlogSlider';
import { useBlogs } from '@/hooks/api/public/blogs/useBlogs';
import { fakeData as data } from '@/app/Data/ShopData';
import { ProductCarouselAnimation, ProductGalleryAnimation } from '@/app/components/Animation/ProductAnimation';

const BlogSliderSection = ({ sectionTitle }) => {
  const { blogs, isLoading, error } = useBlogs('?sort_by=latest');

  const latestBlogs = blogs?.data || [];

  return (
    <section className="container-page flex flex-col gap-3 pb-10 md:pb-16 lg:pb-24 productSlider blog_slider_section">
      <h2 className="text-[28px] font-medium text-[#18181b] top-4">{sectionTitle || 'Your Blogs'}</h2>

      {error && <span>Something went wrong displaying latest blogs</span>}
      {/* {isLoading && <ProductCarouselAnimation />} */}
      {!isLoading && data.length > 0 && <BlogSlider data={latestBlogs} />}
    </section>
  );
};
// return;
// };

export default BlogSliderSection;
