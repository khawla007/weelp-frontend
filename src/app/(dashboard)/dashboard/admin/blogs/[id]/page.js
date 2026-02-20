'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';
import { NotFoundComponent } from '@/app/components/NotFound';
import { BlogForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/form/BlogForm';

const EditBlogPage = () => {
  const { id } = useParams();

  // Fetch blog data
  const { data, error, isLoading } = useSWR(id ? `/api/admin/blogs/${id}` : null, fetcher);

  // Loading state
  if (isLoading) {
    return <span className="loader"></span>;
  }

  // Error state
  if (error) {
    return <p>Something went wrong: {error.message || 'Api Error'}</p>;
  }

  // 404 / not found
  if (data?.success === false) {
    return <NotFoundComponent url="/dashboard/admin/blogs/" />;
  }

  // Blog data loaded successfully
  const blog = data?.data;

  return <BlogForm editPage={true} data={blog} />;
};

export default EditBlogPage;
