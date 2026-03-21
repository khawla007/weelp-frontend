'use client';

import useSWR from 'swr';
import { useForm } from 'react-hook-form';
import { fetcher } from '@/lib/fetchers'; // or use `fetcher`

import { DataTableTags } from './data-table-tags';
import { CustomPagination } from '@/app/components/Pagination';
import { TaxonomiesPageTitle } from '../taxonomies_shared';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteMultipleTags } from '@/lib/actions/tags';
import { BulkActionButtons } from '@/app/components/BulkActions/BulkActionButtons';
import { AddNewButton } from '@/app/components/Button/AddNewButton';

export function TagsPageClient() {
  const { control, watch, setValue } = useForm({
    defaultValues: {
      page: 1,
    },
  });

  const page = watch('page'); // watch page value

  const { data, error, isLoading, mutate } = useSWR(`/api/admin/taxonomies/tags?page=${page}`, fetcher); // fetch data

  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  if (error) return <p className="text-red-400">Failed to load tags.</p>;

  const response = data?.data || {};
  const { data: tagsData } = response || {};
  const { data: items = [], current_page = '', per_page = '', total: totalItems = '' } = tagsData || {};

  // Handle page change
  const handlePageChange = (newPage) => {
    setValue('page', newPage); // updates the form state and re-triggers SWR
    setSelectedItems([]);
    setIsAllSelected(false);
  };

  // Toggle select all / unselect all
  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.id));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const result = await deleteMultipleTags(selectedItems);

      if (result.success) {
        toast({
          title: `${selectedItems.length} tags deleted`,
          variant: 'success',
        });
        mutate();
        setSelectedItems([]);
        setIsAllSelected(false);
      } else {
        toast({
          title: 'Delete failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TaxonomiesPageTitle title="tags" />
        {selectedItems.length > 0 ? (
          <BulkActionButtons
            selectedCount={selectedItems.length}
            totalCount={items.length}
            isAllSelected={isAllSelected}
            onSelectAllToggle={handleSelectAllToggle}
            onDelete={handleBulkDelete}
            deleteLabel="Delete"
          />
        ) : (
          <AddNewButton href="/dashboard/admin/taxonomies/tags/new" />
        )}
      </div>
      <DataTableTags
        tags={items}
        isloading={isLoading}
        mutate={mutate}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        tagsCount={items.length}
        onAllSelectedChange={setIsAllSelected}
      />
      <CustomPagination totalItems={totalItems} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
    </div>
  );
}
