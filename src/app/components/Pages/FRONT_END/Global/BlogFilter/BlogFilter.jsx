'use client';
import React from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import ItemCard from '@/app/components/ui/item-card';
import { mapBlogToItemCard } from '@/lib/mapProductToItemCard';
import { useBlogs } from '@/hooks/api/public/blogs/useBlogs';
import { useCategories } from '@/hooks/api/public/categories';
import { CustomPagination } from '@/app/components/Pagination';
import { BLOGSORT_OPTIONS } from '../../../DASHBOARD/admin/_rsc_pages/blogs/FilterBlogPage';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Reveal from '@/app/components/ui/Reveal';

const BlogFilterBar = ({ title = 'Browse Blogs' }) => {
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
    per_page: 5,
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
      {/* Heading + sort on one row */}
      <Reveal variant="lift" className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg sm:text-[28px] font-medium text-[#18181b] capitalize">{title}</h2>
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
      </Reveal>

      {/* Results Grid */}
      {isLoading ? (
        <ul aria-hidden className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-[270px] sm:h-[280px] lg:h-[297px] rounded-lg bg-zinc-100 animate-pulse" />
          ))}
        </ul>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Error loading blogs</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">No blogs found</div>
      ) : (
        <Reveal as="ul" key={`grid-${current_page}`} initialHidden stagger={60} variant="lift" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {blogs.map((blog) => {
            const item = mapBlogToItemCard(blog);
            return (
              <li key={blog.id || blog.slug}>
                <ItemCard href={item.href} image={item.image} title={item.title} category={item.category} variant="compact" />
              </li>
            );
          })}
        </Reveal>
      )}

      {/* Pagination */}
      <CustomPagination totalItems={totalItems} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
    </div>
  );
};

export default BlogFilterBar;
