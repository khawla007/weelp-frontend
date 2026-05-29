'use client';
import React from 'react';
import BlogSection from '@/app/components/ui/BlogSection';
import { useBlogs } from '@/hooks/api/public/blogs/useBlogs';

// Latest-blogs carousel on the blogs page. Reuses the shared BlogSection (the
// homepage "Your Guide" section) so the card + carousel design stay identical.
const BlogSliderSection = ({ sectionTitle }) => {
  const { blogs, error } = useBlogs('?sort_by=latest&per_page=5');
  const latestBlogs = blogs?.data || [];

  if (error || latestBlogs.length === 0) return null;

  return <BlogSection blogs={latestBlogs} title={sectionTitle || 'Latest Blogs'} navigationId="latest-blogs" className="weelp-fade-up" />;
};

export default BlogSliderSection;
