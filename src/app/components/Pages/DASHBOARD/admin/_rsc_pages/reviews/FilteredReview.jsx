'use client';

import { fetcher } from '@/lib/fetchers';
import { useForm, useWatch } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import useSWR from 'swr';
import { CustomPagination } from '@/app/components/Pagination';
import { ReviewTable } from './components/table/Table';
import { useToast } from '@/hooks/use-toast';
import { deleteReview, deleteMultipleReviews } from '@/lib/actions/reviews';
import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { FORM_REVIEW_ITEM_TYPE } from '@/constants/forms/review';
import { BulkActionButtons } from '@/app/components/BulkActions/BulkActionButtons';
import { AddNewButton } from '@/app/components/Button/AddNewButton';
import { FilterBar } from '@/app/components/DashboardShared/FilterBar';

const FilteredReview = () => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState([]); // Selected review IDs for bulk delete
  const [isAllSelected, setIsAllSelected] = useState(false); // Track Select All toggle state

  // intialize form
  const form = useForm({
    defaultValues: {
      search: '',
      page: 1,
      item_type: 'all',
      status: 'all',
    },
    mode: 'onChange', // validation triggers on each keystroke
  });

  const filters = useWatch({ control: form.control }); // intialize watching
  const [debouncedFilters, setDebouncedFilters] = useState(filters); // intialize filter

  // control debouncing
  const debouncedUpdate = useMemo(
    () =>
      debounce((newFilters) => {
        setDebouncedFilters(newFilters);
      }, 500),
    [],
  );

  // side effect for if fiilter change
  useEffect(() => {
    const { page, ...otherFilters } = filters;
    debouncedUpdate(otherFilters);
    return () => debouncedUpdate.cancel();
  }, [filters.search, filters.item_type, filters.status, debouncedUpdate]);

  // Reset page to 1 when search or item_type or status changes
  useEffect(() => {
    form.setValue('page', 1);
  }, [filters.search, filters.item_type, filters.status]);

  // Memoized query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (debouncedFilters.search) params.append('customer_name', debouncedFilters.search);
    if (filters.page) params.append('page', filters.page);
    if (debouncedFilters.item_type && debouncedFilters.item_type !== 'all') params.append('item_type', debouncedFilters.item_type);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);

    return params.toString();
  }, [debouncedFilters, filters]);

  // filter
  const { data = {}, isValidating, error, mutate } = useSWR(`/api/admin/reviews/?${queryParams}`, fetcher); // get all reviews

  const { data: responseData = {} } = data;
  const { current_page = 0, per_page = 0, data: reveiws = [], total = 0 } = responseData; // safely destructure

  // handleDeleteReview
  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await deleteReview(reviewId);

      if (response.success) {
        toast({ title: response.message, variant: 'default' });

        mutate(); // mutate data
      } else {
        // handle case when response.success is false
        toast({
          title: response.error || 'Failed to delete',
          variant: 'destructive',
        });
      }
    } catch (error) {
      // fallback in case deleteReview throws unexpectedly
      toast({
        title: error?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  // handle page change
  const handlePageChange = (newPage) => {
    form.setValue('page', newPage, { shouldValidate: true, shouldDirty: true }); // through server side pagination
    setSelectedItems([]);
    setIsAllSelected(false);
  };

  // Toggle select all / unselect all
  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(reveiws.map((review) => review.id));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const result = await deleteMultipleReviews(selectedItems);

      if (result.success) {
        toast({
          title: `${selectedItems.length} reviews deleted`,
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
    <div className="space-y-8">
      {/* Header with Search, Item Filter, and AddNewButton */}
      <div className="flex justify-between items-center gap-4">
        <Form {...form}>
          <FilterBar
            form={form}
            searchName="search"
            searchPlaceholder="Search by customer"
            typeFieldName="item_type"
            typePlaceholder="All Types"
            typeOptions={[...FORM_REVIEW_ITEM_TYPE, { value: 'all', label: 'All' }]}
            statusFieldName="status"
            statusPlaceholder="All Status"
            statusOptions={[
              { value: 'all', label: 'All Status' },
              { value: 'approved', label: 'Approved' },
              { value: 'pending', label: 'Pending' },
            ]}
          />
        </Form>

        {selectedItems.length > 0 ? (
          <BulkActionButtons
            selectedCount={selectedItems.length}
            totalCount={reveiws.length}
            isAllSelected={isAllSelected}
            onSelectAllToggle={handleSelectAllToggle}
            onDelete={handleBulkDelete}
            deleteLabel="Delete"
          />
        ) : (
          <AddNewButton href="/dashboard/admin/reviews/new" />
        )}
      </div>

      {/* Table Data */}
      {isValidating && <span className="loader"></span>}
      {!isValidating && !error && (
        <>
          <ReviewTable
            reviews={reveiws}
            onDelete={handleDeleteReview}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            reviewsCount={reveiws.length}
            onAllSelectedChange={setIsAllSelected}
          />
          <CustomPagination totalItems={total} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
        </>
      )}
      {error && <span className="text-red-400">Something Went Wrong</span>}
    </div>
  );
};

export default FilteredReview;
