'use client';

import { fetcher } from '@/lib/fetchers';
import InputSearch from './components/Input';
import { useForm, useWatch } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import useSWR from 'swr';
import { CustomPagination } from '@/app/components/Pagination';
import { ReviewTable } from './components/table/Table';
import { useToast } from '@/hooks/use-toast';
import { deleteReview } from '@/lib/actions/reviews';
import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { SelectField } from './components/SelectField';
import { FORM_REVIEW_ITEM_TYPE } from '@/constants/forms/review';

const FilteredReview = () => {
  const { toast } = useToast();

  // intialize form
  const form = useForm({
    defaultValues: {
      search: '',
      page: 1,
      item_type: 'all',
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

    if (debouncedFilters.search) params.append('item_name', debouncedFilters.search); // controll every query
    if (debouncedFilters.page) params.append('page', debouncedFilters.page); // controll every query
    if (debouncedFilters.item_type !== 'all') params.append('item_type', debouncedFilters.item_type); // controll every query

    return params.toString();
  }, [debouncedFilters]);

  // filter
  const { data = {}, isValidating, error, mutate } = useSWR(`/api/admin/reviews/?${queryParams}`, fetcher); // get all reviews

  const { current_page = 0, per_page = 0, data: reveiws = [], total = 0 } = data; // safely destructure

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
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form className="flex w-full justify-between flex-col sm:flex-row gap-4">
          <InputSearch />

          {/* Item Type */}
          <div className="max-w-[240px] w-full ">
            <FormField
              control={form.control}
              name="item_type"
              defaultValue="all" // 👈 default to "All Types"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SelectField data={[...FORM_REVIEW_ITEM_TYPE, { value: 'all', label: 'All' }]} value={field.value} onChange={field.onChange} placeholder="Select Item Type" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      {/* Table Data */}
      {isValidating && <span className="loader"></span>}
      {!isValidating && !error && (
        <>
          <ReviewTable reviews={reveiws} onDelete={handleDeleteReview} />
          <CustomPagination totalItems={total} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
        </>
      )}
      {error && <span className="text-red-400">Something Went Wrong</span>}
    </div>
  );
};

export default FilteredReview;
