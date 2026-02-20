'use client';

import { fetcher } from '@/lib/fetchers';
import { useForm, useWatch, Controller } from 'react-hook-form';
import useSWR from 'swr';
import { CustomPagination } from '@/app/components/Pagination';
import { AddOnTable } from './components/table/Table';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { deleteAddon } from '@/lib/actions/addOn'; // delete add on action
import InputFieldSearch from './components/Input';
import { SelectField } from './components/Select';
import { FORM_ADDON_ITEMTYPE, FORM_ADDON_STATUS } from '@/constants/forms/addon';

export const FilteredAddOn = () => {
  const { toast } = useToast();

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
  const { data = {}, isValidating, error, mutate } = useSWR(`/api/admin/addons/?${queryParams}`, fetcher); // get all addons

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
  };

  return (
    <div className="space-y-8">
      <form className="flex justify-between gap-4 flex-col sm:flex-row">
        <div className="w-full">
          {/* Search Field */}
          <Controller name="name" control={form.control} render={({ field }) => <InputFieldSearch value={field.value} onChange={field.onChange} />} />
        </div>

        <div className="flex gap-4 max-w-sm w-full flex-col sm:flex-row">
          {/* Type */}
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => <SelectField value={field.value} onChange={field.onChange} data={[...FORM_ADDON_ITEMTYPE, { label: 'All Type', value: 'all' }]} />}
          />

          {/* Status */}
          <Controller name="status" control={form.control} render={({ field }) => <SelectField placeholder="Select Status" value={field.value} onChange={field.onChange} data={FORM_ADDON_STATUS} />} />
        </div>
      </form>

      {/* Table Data */}
      {isValidating && <span className="loader"></span>}
      {!isValidating && !error && (
        <>
          {addOns && addOns.length > 0 ? (
            <AddOnTable data={addOns} onDelete={handleDelete} />
          ) : (
            <div className="grid place-items-center text-gray-400">
              <span>Sorry No Item Found</span>
            </div>
          )}
          <div></div>
          <CustomPagination totalItems={total} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
        </>
      )}
      {error && <span className="text-red-400">Something Went Wrong</span>}
    </div>
  );
};
