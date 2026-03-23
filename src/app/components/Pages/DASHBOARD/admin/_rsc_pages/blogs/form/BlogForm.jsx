'use client';
import React, { useEffect, useRef } from 'react';
import { BlogHeader } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/components/BlogHeader';
import BlogSidebar from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/Sidebar';
import { BlogMain } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/BlogMain';
import { FormProvider, useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createBlog, updateBlog } from '@/lib/actions/blogs';

/**
 * Shape of Form Data
 * @type {BlogPostForm}
 */

// create blog page
export const BlogForm = ({ editPage = false, data: blogData, mutate }) => {
  const { toast } = useToast();
  const router = useRouter();

  const predefinedCategories = blogData?.categories
    ? blogData.categories.map((cat) => ({
        label: cat.name,
        value: cat.id, //
      }))
    : [];

  const predefinedTags = blogData?.tags
    ? blogData.tags.map((tag) => ({
        label: tag.name,
        value: tag.id, //
      }))
    : [];

  //check it is edit page
  const methods = useForm({
    defaultValues: {
      name: blogData?.name ?? '',
      content: '',
      excerpt: blogData?.excerpt ?? '',
      publish: blogData?.publish ?? true,
      media_gallery: blogData?.media_gallery ?? [],
      categories: predefinedCategories,
      tags: predefinedTags,
    },
    mode: 'onTouched',
  });

  // Reset dirty state after Tiptap editor initializes (it fires onChange on mount)
  const hasResetRef = useRef(false);
  useEffect(() => {
    if (editPage && !hasResetRef.current) {
      const timer = setTimeout(() => {
        methods.reset(methods.getValues(), { keepValues: true });
        hasResetRef.current = true;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [editPage, methods]);

  // Get media_gallery from form state
  // eslint-disable-next-line react-hooks/incompatible-library
  const media_gallery = methods.watch('media_gallery');

  // form data
  const onSubmit = async (data) => {
    try {
      console.log('Blog form data:', data);
      // prepare Data
      const finalData = {
        ...data,
        media_gallery:
          data?.media_gallery?.length > 0
            ? data?.media_gallery.map((media) => ({
                media_id: media.media_id,
                is_featured: media.is_featured ?? false,
              }))
            : [], // safely handle data with is_featured
        tags: data?.tags?.length > 0 ? data?.tags.map((tag, index) => tag.value) : [], // safely handle data
        categories: data?.categories?.length > 0 ? data?.categories.map((category, index) => category.value) : [], // safely handle data
      };

      console.log('Final data to send:', finalData);

      let response;
      //   check is in edit page
      if (!editPage && !blogData?.id) {
        response = await createBlog(finalData);
      } else {
        response = await updateBlog(blogData?.id, finalData);
      }

      console.log('API response:', response);

      // send notice
      if (!response.success) {
        toast({ title: response?.message || 'Something went wrong', variant: 'destructive' });
        return;
      }

      toast({ title: response?.message || 'Submitting Successfully' });

      // Invalidate SWR cache to ensure fresh data on next navigation
      if (mutate) {
        mutate();
      }

      // Redirect back to listing page after successful update (like activities)
      if (editPage && blogData?.id) {
        router.back();
      } else {
        // For new blog, redirect to listing page
        router.push('/dashboard/admin/blogs');
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Unexpected Error', variant: 'destructive' });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        <BlogHeader editPage={editPage} />

        <div className="flex flex-col md:flex-row w-full  gap-4 ">
          {/* Content Area */}
          <BlogMain content={blogData?.content ?? ''} />

          {/* Sidebar Area */}
          <div className="flex-1">
            <BlogSidebar />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
