'use client';
import React from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { BlogCard } from '@/app/components/singleproductguide';
import { useBlogs } from '@/hooks/api/public/blogs/useBlogs';
import { useCategories } from '@/hooks/api/public/categories';
import { CustomPagination } from '@/app/components/Pagination';
import { BLOGSORT_OPTIONS } from '../../../DASHBOARD/admin/_rsc_pages/blogs/FilterBlogPage';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UniversalLoader from '@/app/components/Loading/UniversalLoader';

const BlogFilterBar = () => {
  // Initialize form with default values
  const { control, setValue } = useForm({
    defaultValues: {
      // categories: [],
      sort_by: '',
      page: 1,
    },
  });

  const filters = useWatch({ control: control });

  // Fetch categories for filter options
  const { data: categoryRes = {} } = useCategories();

  // Build query params for API
  const filterQuery = {
    sort_by: filters.sort_by,
    page: filters.page,
  };

  // Fetch blogs using the useBlogs hook
  const { blogs: blogRes = {}, isLoading, error } = useBlogs(filterQuery);
  const { total: totalItems = 0, current_page = 0, per_page = 0 } = blogRes;
  const blogs = blogRes?.data || [];

  // handle page change
  const handlePageChange = (newPage) => {
    setValue('page', newPage, { shouldValidate: true, shouldDirty: true }); // through server side pagination
  };

  return (
    <div className="flex flex-col gap-8 mt-4">
      {/* Sort Bar */}
      <form className="flex flex-wrap gap-4 justify-end">
        <div className="relative">
          {/* Sort Dropdown */}
          <div className="flex justify-start lg:justify-between flex-wrap">
            <div className="space-y-4 flex flex-col ">
              {/* Recommended */}
              <Controller
                name="sort_by"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Recommended" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {BLOGSORT_OPTIONS.map(({ name, value }) => (
                          <SelectItem key={value} value={value} className="cursor-pointer">
                            {name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>
      </form>

      {/* Results Grid */}
      {isLoading ? (
        <UniversalLoader />
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error loading blogs</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No blogs found</div>
      ) : (
        <ul className="grid grid-col-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
          {blogs.map((blog) => (
            <li key={blog.id || blog.slug}>
              <BlogCard {...blog} imageSrc={blog?.media_gallery?.[0]?.url || blog?.image} blogTitle={blog?.title} />
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <CustomPagination totalItems={totalItems} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
    </div>
  );
};

export default BlogFilterBar;
