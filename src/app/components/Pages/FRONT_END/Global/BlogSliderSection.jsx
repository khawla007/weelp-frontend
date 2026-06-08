'use client';
import React from 'react';
import BlogSection from '@/app/components/ui/BlogSection';
import { useBlogs } from '@/hooks/api/public/blogs/useBlogs';

// Latest-blogs carousel on the blogs page. Reuses the shared BlogSection (the
// homepage "Your Guide" section) so the card + carousel design stay identical.
const BlogSliderSection = ({ sectionTitle }) => {
  const { blogs, error, isLoading } = useBlogs('?sort_by=latest&per_page=5');
  const latestBlogs = blogs?.data || [];

  if (error) return null;
  if (!isLoading && latestBlogs.length === 0) return null;

  // Reserve vertical space during fetch so the section below doesn't shift when
  // the carousel hydrates — eliminates the CLS spike Lighthouse flagged on /blogs.
  return (
    <div className="min-h-[400px] md:min-h-[460px]">
      {latestBlogs.length > 0 && (
        <BlogSection blogs={latestBlogs} title={sectionTitle || 'Latest Blogs'} navigationId="latest-blogs" className="weelp-fade-up" />
      )}
    </div>
  );
};

export default BlogSliderSection;
