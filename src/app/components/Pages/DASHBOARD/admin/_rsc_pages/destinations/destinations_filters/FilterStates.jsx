'use client';
import React, { useEffect, useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import useSWR from 'swr';
import debounce from 'lodash.debounce';
import { fetcher } from '@/lib/fetchers';
import { DashboardSearch } from '@/app/components/DashboardShared';
import { RouteCard } from '../components/cards/RouteCard';
import { CustomPagination } from '@/app/components/Pagination';
import { useToast } from '@/hooks/use-toast';
import { BulkActionButtons } from '@/app/components/BulkActions/BulkActionButtons';
import { AddNewButton } from '@/app/components/Button/AddNewButton';

export const FilterStates = () => {
  const methods = useForm({ defaultValues: { query: '', page: 1 } });
  const { control, setValue } = methods;
  const page = useWatch({ control, name: 'page' });
  const query = useWatch({ control, name: 'query' });
  const { toast } = useToast();

  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]); // Selected state IDs for bulk delete
  const [isAllSelected, setIsAllSelected] = useState(false); // Track Select All toggle state

  // Reset page to 1 when query changes
  useEffect(() => {
    setValue('page', 1);
  }, [query, setValue]);

  // Debounce query updates - handle in useEffect with cleanup
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  const { data, error, isValidating, mutate } = useSWR(`/api/admin/destinations/states?name=${debouncedQuery}&page=${page}`, fetcher);

  // destructure API response
  const { data: states = [], total = 0, per_page: perPage = 0, last_page: lastPage = 1, current_page: currentPage = 1 } = data || {};

  // Handle page change - clears selections
  const handlePageChange = (newPage) => {
    setValue('page', newPage);
    setSelectedItems([]);
    setIsAllSelected(false);
  };

  // Toggle select all / unselect all
  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(states.map((state) => state.id));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const { deleteMultipleStates } = await import('@/lib/actions/state');
      const result = await deleteMultipleStates(selectedItems);

      if (result.success) {
        toast({
          title: `${selectedItems.length} states deleted`,
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
    <FormProvider {...methods}>
      <div className="space-y-4">
        {/* Search and Bulk Actions */}
        <div className="flex justify-between items-center">
          <DashboardSearch control={control} name="query" placeholder="Search states" className="max-w-sm" />
          {selectedItems.length > 0 ? (
            <BulkActionButtons
              selectedCount={selectedItems.length}
              totalCount={states.length}
              isAllSelected={isAllSelected}
              onSelectAllToggle={handleSelectAllToggle}
              onDelete={handleBulkDelete}
              deleteLabel="Delete"
            />
          ) : (
            <AddNewButton label="Add New" href="/dashboard/admin/destinations/states/new" />
          )}
        </div>

        {/* RESULT Found */}
        <div className="flex flex-col gap-4 h-full">
          {/* Loading State */}

          {isValidating && <span className="loader"></span>}

          {/* Error State */}
          {!isValidating && error && <div className="text-red-500 text-center py-4">Failed to load data. Please try again.</div>}
          {/* No Items Found */}
          {!isValidating && !error && states.length === 0 && <div className="text-gray-500 text-center py-4">No states found.</div>}

          {/* For states */}
          {!isValidating && !error && states.length > 0 && (
            <div className="flex flex-col gap-4">
              <Card className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-inherit shadow-none border-none">
                {states.map((state) => (
                  <RouteCard
                    key={state?.id}
                    {...state}
                    checked={selectedItems.includes(state.id)}
                    onCheckedChange={(checked, id) => {
                      setSelectedItems((prev) => {
                        const newSelection = checked ? [...prev, id] : prev.filter((itemId) => itemId !== id);

                        // Update isAllSelected state
                        setIsAllSelected(newSelection.length === states.length);
                        return newSelection;
                      });
                    }}
                    showCheckbox={true}
                  />
                ))}
              </Card>

              {/* Pagination - outside form to avoid nesting */}
              <CustomPagination totalItems={total} itemsPerPage={perPage} currentPage={currentPage} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};
