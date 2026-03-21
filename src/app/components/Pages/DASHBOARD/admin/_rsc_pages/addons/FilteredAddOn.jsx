'use client';

import { authFetcher } from '@/lib/fetchers';
import { useForm, useWatch } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import useSWR from 'swr';
import { CustomPagination } from '@/app/components/Pagination';
import { AddOnTable } from './components/table/Table';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { deleteAddon } from '@/lib/actions/addOn'; // delete add on action
import { FORM_ADDON_ITEMTYPE, FORM_ADDON_STATUS } from '@/constants/forms/addon';
import { BulkActionButtons } from '@/app/components/BulkActions/BulkActionButtons';
import { AddNewButton } from '@/app/components/Button/AddNewButton';
import { deleteMultipleAddons } from '@/lib/actions/addOn';
import { FilterBar } from '@/app/components/DashboardShared/FilterBar';

export const FilteredAddOn = () => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState([]); // Selected addon IDs for bulk delete
  const [isAllSelected, setIsAllSelected] = useState(false); // Track Select All toggle state

  // intialize form
  const form = useForm({
    defaultValues: {
      name: '',
      page: 1,
      type: 'all',
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
    debouncedUpdate(filters);
    return () => debouncedUpdate.cancel();
  }, [filters, debouncedUpdate]);

  // Reset page to 1 when any filter other than page changes
  useEffect(() => {
    form.setValue('page', 1);
  }, [filters.name, filters.type, filters.status]);

  // Memoized query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (debouncedFilters.name) params.append('name', debouncedFilters.name);
    if (debouncedFilters.page) params.append('page', debouncedFilters.page);
    if (debouncedFilters.type !== 'all') params.append('type', debouncedFilters.type);
    if (debouncedFilters.status !== 'all') params.append('status', debouncedFilters.status);

    return params.toString();
  }, [debouncedFilters]);

  // filter
  const { data = {}, isValidating, error, mutate } = useSWR(`/api/admin/addons/?${queryParams}`, authFetcher); // get all addons

  const { current_page = 0, per_page = 0, data: addOns = [], total = 0 } = data; // safely destructure

  // handleDeleteReview
  const handleDelete = async (deleteId) => {
    try {
      const response = await deleteAddon(deleteId);

      if (response.success) {
        toast({ title: response?.message, variant: 'default' });

        mutate(); // mutate data
      } else {
        toast({
          title: response?.message || 'Failed to delete',
          variant: 'destructive',
        });
      }
    } catch (error) {
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
      setSelectedItems(addOns.map((addOn) => addOn.id));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const result = await deleteMultipleAddons(selectedItems);

      if (result.success) {
        toast({
          title: `${selectedItems.length} add-on(s) deleted`,
          variant: 'success',
        });
        mutate();
        setSelectedItems([]);
        setIsAllSelected(false);
      } else {
        toast({
          title: 'Delete failed',
          description: result.message,
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
      {/* Header with Search, Type, Status and AddNewButton */}
      <div className="flex justify-between items-center gap-4">
        <Form {...form}>
          <FilterBar
            form={form}
            searchName="name"
            searchPlaceholder="Search add-on..."
            typeFieldName="type"
            typePlaceholder="All Types"
            typeOptions={[...FORM_ADDON_ITEMTYPE, { label: 'All Type', value: 'all' }]}
            statusFieldName="status"
            statusPlaceholder="All Status"
            statusOptions={FORM_ADDON_STATUS}
          />
        </Form>
        {selectedItems.length > 0 ? (
          <BulkActionButtons
            selectedCount={selectedItems.length}
            totalCount={addOns.length}
            isAllSelected={isAllSelected}
            onSelectAllToggle={handleSelectAllToggle}
            onDelete={handleBulkDelete}
            deleteLabel="Delete"
          />
        ) : (
          <AddNewButton href="/dashboard/admin/addon/new" />
        )}
      </div>

      {/* Table Data */}
      {isValidating && <span className="loader"></span>}
      {!isValidating && !error && (
        <>
          {addOns && addOns.length > 0 ? (
            <AddOnTable data={addOns} onDelete={handleDelete} selectedItems={selectedItems} onSelectionChange={setSelectedItems} addOnsCount={addOns.length} onAllSelectedChange={setIsAllSelected} />
          ) : (
            <div className="grid place-items-center text-gray-400">
              <span>Sorry No Item Found</span>
            </div>
          )}
          <CustomPagination totalItems={total} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
        </>
      )}
      {error && <span className="text-red-400">Something Went Wrong</span>}
    </div>
  );
};
