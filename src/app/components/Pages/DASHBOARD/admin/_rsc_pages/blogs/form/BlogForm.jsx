'use client';
import React from 'react';
import { BlogHeader } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/components/BlogHeader';
import BlogSidebar from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/Sidebar';
import { BlogMain } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/BlogMain';
import { FormProvider, useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { createBlog, updateBlog } from '@/lib/actions/blogs';

// const BlogFormSchema = z.object({
//   title: z.string().nonempty({ message: 'Field Required' }).min(3, { message: 'Length Must Be Greater Then 3' }).default(''),
//   content: z.object().optional(),
//   media_gallery: z
//     .array(
//       z.object({
//         url: z.string(),
//         id: z.number(),
//       }),
//     )
//     .min(1, { message: 'At least one media item is required' }).optional().nullable(),
// });

/**
 * Shape of Form Data
 * @type {BlogPostForm}
 */

// create blog page
export const BlogForm = ({ editPage = false, data: blogData }) => {
  const { toast } = useToast();

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
  });

  // form data
  const onSubmit = async (data) => {
    try {
      // prepare Data
      const finalData = {
        ...data,
        media_gallery: data?.media_gallery?.length > 0 ? data?.media_gallery.map((media, index) => media.media_id) : [], // safely handle data
        tags: data?.tags?.length > 0 ? data?.tags.map((tag, index) => tag.value) : [], // safely handle data
        categories: data?.categories?.length > 0 ? data?.categories.map((category, index) => category.value) : [], // safely handle data
      };

      let response;
      //   check is in edit page
      if (!editPage && !blogData?.id) {
        response = await createBlog(finalData);
      } else {
        response = await updateBlog(blogData?.id, finalData);
      }

      // send notice
      if (!response.success) {
        toast({ title: response?.message || 'Something went wrong', variant: 'destructive' });
        return;
      }

      toast({ title: response?.message || 'Submitting Successfully' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Unexpected Error', variant: 'destructive' });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        <BlogHeader />

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
