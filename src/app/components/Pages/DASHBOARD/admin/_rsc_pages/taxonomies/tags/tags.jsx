'use client';

import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { fetcher } from '@/lib/fetchers'; // or use `fetcher`

import { DataTableTags } from './data-table-tags';
import { CustomPagination } from '@/app/components/Pagination';
import { TaxonomiesPageTitle } from '../taxonomies_shared';

export function TagsPageClient() {
  const { control, watch, setValue } = useForm({
    defaultValues: {
      page: 1,
    },
  });

  const page = watch('page'); // watch page value

  const { data, error, isLoading, mutate } = useSWR(`/api/admin/taxonomies/tags?page=${page}`, fetcher); // fetch data

  if (error) return <p className="text-red-400">Failed to load tags.</p>;

  const response = data?.data || {};
  const { data: tagsData } = response || {};
  const { data: items = [], current_page = '', per_page = '', total: totalItems = '' } = tagsData || {};

  // Handle page change
  const handlePageChange = (newPage) => {
    setValue('page', newPage); // updates the form state and re-triggers SWR
  };

  return (
    <div className="space-y-4">
      <TaxonomiesPageTitle
        title="tags"
        buttoninfo={{
          buttonName: 'add tag',
          buttonurl: '/dashboard/admin/taxonomies/tags/new',
        }}
      />
      <DataTableTags tags={items} isloading={isLoading} mutate={mutate} />
      <CustomPagination totalItems={totalItems} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
    </div>
  );
}
