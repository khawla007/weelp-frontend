'use client';

import useSWR from 'swr';
import { useForm, useWatch } from 'react-hook-form';
import { fetcher } from '@/lib/fetchers'; // or use `fetcher`
import { DataTableAttributes } from './data-table';
import { CustomPagination } from '@/app/components/Pagination';
import { TaxonomiesPageTitle } from '../taxonomies_shared';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { deleteMultipleAttributes } from '@/lib/actions/attributes';
import { BulkActionButtons } from '@/app/components/BulkActions/BulkActionButtons';
import { AddNewButton } from '@/app/components/Button/AddNewButton';

export function AttributePageClient() {
  const { control, watch, setValue } = useForm({
    defaultValues: {
      page: 1,
    },
  });

  const { page } = useWatch({ control }); // watch changes

  const { data, error, isLoading, mutate } = useSWR(`/api/admin/taxonomies/attributes?page=${page}`, fetcher); // fetch data

  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  if (error) return <p className="text-red-400">Failed to load attributes.</p>;

  const response = data?.data || {};

  const { data: items = [], current_page = '', per_page = '', total: totalItems = '' } = response?.data || {}; // destrucutre data

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
      setSelectedItems(items.map(item => item.id));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const result = await deleteMultipleAttributes(selectedItems);

      if (result.success) {
        toast({
          title: `${selectedItems.length} attributes deleted`,
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
        <TaxonomiesPageTitle
          title="Attributes"
        />
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
          <AddNewButton
            href="/dashboard/admin/taxonomies/attributes/new"
          />
        )}
      </div>
      <DataTableAttributes
        attributes={items}
        isloading={isLoading}
        mutate={mutate}
        selectedItems={selectedItems}
        onSelectionChange={setSelectedItems}
        attributesCount={items.length}
        onAllSelectedChange={setIsAllSelected}
      />
      <CustomPagination totalItems={totalItems} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
    </div>
  );
}
