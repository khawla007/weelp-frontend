'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Car, Clock, Plus, Star, Tag, User, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import debounce from 'lodash.debounce';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { CustomPagination } from '@/app/components/Pagination';
import Link from 'next/link';
import useSWR from 'swr'; // for states cache and ui management
import { useToast } from '@/hooks/use-toast'; // toast for notification
import {
  DashboardSearch,
  ListingCard,
  ListingCardImage,
  ListingCardCheckbox,
  ListingCardActions,
  ListingCardContent,
  ListingCardTitle,
  ListingCardMeta,
  ListingCardTags,
  ListingCardStats,
} from '@/app/components/DashboardShared';
import { BulkActionButtons } from '@/app/components/BulkActions/BulkActionButtons';
import { AddNewButton } from '@/app/components/Button/AddNewButton';
import { fetcher } from '@/lib/fetchers'; // interceptors
import { deleteMultipleTransfers, deleteTransfer } from '@/lib/actions/transfer'; // inline actions
import { VEHICLE_TYPES, AVAILABILITY_TYPES, WEEKDAYS } from '@/constants/transfer'; // constants
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SORT_BY } from '@/constants/shared'; // filter constants

const FilterTransfer = () => {
  const { toast } = useToast(); // intialize toast
  const [selectedItems, setSelectedItems] = useState([]); // selected item for multiple delete case
  const [isAllSelected, setIsAllSelected] = useState(false); // Track Select All toggle state
  const [deleteItemId, setDeleteItemId] = useState(null); // Track item pending deletion

  // intialize hook
  const { register, setValue, control } = useForm({
    //initalize form
    defaultValues: {
      search: '',
      vehicle_type: '',
      availability_type: '',
      available_days: [],
      time_slot_start: '',
      time_slot_end: '',
      capacity: '',
      price: [50, 5000],
      sort_by: 'default',
      page: 1,
    },
  });

  const filters = useWatch({ control: control }); // intialize watching
  const [debouncedFilters, setDebouncedFilters] = useState(filters); // fitlering

  //  handle delete to open modal
  const handleDeleteClick = (itemId) => {
    setDeleteItemId(itemId);
  };

  // cancel delete
  const cancelDelete = () => {
    setDeleteItemId(null);
  };

  // confirm delete
  const confirmDelete = async () => {
    if (!deleteItemId) return;
    try {
      const res = await deleteTransfer(deleteItemId);
      toast({
        title: res.message || 'Delete Successfully',
        variant: 'success',
      });
      mutate();
      setDeleteItemId(null);
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error deleting item',
        variant: 'destructive',
      });
    }
  };

  // handle page change
  const handlePageChange = (newPage) => {
    setValue('page', newPage, { shouldValidate: true, shouldDirty: true }); // through server side pagiantion
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

  const debouncedUpdate = useMemo(
    () =>
      debounce((newFilters) => {
        setDebouncedFilters(newFilters);
      }, 500),
    [],
  );

  // Memoize price array to prevent infinite re-renders
  const priceMemoized = useMemo(() => filters.price, [filters.price?.[0], filters.price?.[1]]);

  // reset page to 1 when filters change
  useEffect(() => {
    if (filters.page > 1) setValue('page', 1);
  }, [
    filters.search,
    filters.vehicle_type,
    filters.availability_type,
    filters.available_days,
    filters.time_slot_start,
    filters.time_slot_end,
    filters.capacity,
    priceMemoized,
    filters.sort_by,
    setValue,
  ]);

  // side effect for if fiilter change
  useEffect(() => {
    const { page, ...otherFilters } = filters;
    debouncedUpdate(otherFilters);
    return () => debouncedUpdate.cancel();
  }, [
    filters.search,
    filters.vehicle_type,
    filters.availability_type,
    filters.available_days,
    filters.time_slot_start,
    filters.time_slot_end,
    filters.capacity,
    priceMemoized,
    filters.sort_by,
    debouncedUpdate,
  ]);

  // Memoized query string
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (debouncedFilters.search) params.append('search', debouncedFilters.search);
    if (debouncedFilters.vehicle_type && debouncedFilters.vehicle_type !== 'all') params.append('vehicle_type', debouncedFilters.vehicle_type);
    if (debouncedFilters.availability_type && debouncedFilters.availability_type !== 'all') params.append('availability_type', debouncedFilters.availability_type);
    if (debouncedFilters.availability_type === 'custom_schedule' && debouncedFilters.available_days?.length > 0) params.append('available_days', debouncedFilters.available_days.join(','));
    if (debouncedFilters.availability_type === 'custom_schedule' && debouncedFilters.time_slot_start) params.append('time_slot_start', debouncedFilters.time_slot_start);
    if (debouncedFilters.availability_type === 'custom_schedule' && debouncedFilters.time_slot_end) params.append('time_slot_end', debouncedFilters.time_slot_end);
    if (debouncedFilters.capacity) params.append('capacity', debouncedFilters.capacity);
    if (debouncedFilters.sort_by) params.append('sort_by', debouncedFilters.sort_by);
    if (debouncedFilters.price?.[0] && debouncedFilters.price[0] !== 50) params.append('min_price', debouncedFilters.price[0]);
    if (debouncedFilters.price?.[1] && debouncedFilters.price[1] !== 5000) params.append('max_price', debouncedFilters.price[1]);
    if (debouncedFilters.page)
      params.append('page', filters.page); // use live page, debounced search
    else if (filters.page) params.append('page', filters.page);

    return params.toString();
  }, [debouncedFilters, filters.page]);

  // SWR fetch
  const { data, error, isValidating, mutate } = useSWR(`/api/admin/transfers?${queryParams}`, fetcher, { revalidateOnFocus: true });

  // destructure data
  const { data: items = [], current_page = '', per_page = '', total: totalItems = '' } = data?.data || {}; // destructure safely

  // handle Multiple Delete
  const handleMultpleDelete = async () => {
    try {
      const res = await deleteMultipleTransfers({ transferIds: selectedItems }); // delete itineraries
      if (res.success) {
        toast({
          title: res.message || 'Transfers deleted',
          variant: 'success',
        });

        // Force update the UI
        mutate();

        // flush items
        setSelectedItems([]);
        setIsAllSelected(false);
      } else {
        toast({
          title: 'Delete failed',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.log(error);
      toast({ title: 'Something went wrong', variant: 'destructive' });

      // flush items
      setSelectedItems([]);
      setIsAllSelected(false);
    }
  };

  // handle Multiple Export
  const handleMultpleExport = () => {
    console.log(selectedItems, 'delete');
  };

  return (
    <Card className="flex gap-4 flex-col lg:flex-row ">
      {/* Sidebar Filter */}
      <div className="lg:w-1/4  space-y-6 p-4">
        {/* Search - Outside accordion like Activity */}
        <div className="space-y-2">
          <DashboardSearch control={control} placeholder="Search Transfer" />
        </div>

        <Accordion type="single" collapsible>
          {/* Vehicle Type */}
          <AccordionItem value="vehicle_type">
            <AccordionTrigger>
              <p className="flex items-center gap-4">
                <Car size={18} />
                Vehicle Type
              </p>
            </AccordionTrigger>
            <AccordionContent>
              <Controller
                name="vehicle_type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="focus:ring-0">
                      <SelectValue placeholder="Select Vehicle Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all" className="cursor-pointer">
                          All Vehicles
                        </SelectItem>
                        {VEHICLE_TYPES.map((vehicle, i) => (
                          <SelectItem key={i} value={vehicle?.value} className="cursor-pointer">
                            {vehicle?.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Availability */}
          <AccordionItem value="availability">
            <AccordionTrigger>
              <p className="flex items-center gap-4">
                <Calendar size={18} /> Availability
              </p>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {/* Availability Type Select */}
                <Controller
                  name="availability_type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        // Reset sub-filters when type changes
                        if (val !== 'custom_schedule') {
                          setValue('available_days', []);
                          setValue('time_slot_start', '');
                          setValue('time_slot_end', '');
                        }
                      }}
                    >
                      <SelectTrigger className="focus:ring-0">
                        <SelectValue placeholder="Select Availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all" className="cursor-pointer">
                            All
                          </SelectItem>
                          {AVAILABILITY_TYPES.map((type, i) => (
                            <SelectItem key={i} value={type.value} className="cursor-pointer">
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />

                {/* Weekdays + Time Slots - shown when "Weekdays" selected */}
                {filters.availability_type === 'custom_schedule' && (
                  <div className="space-y-3">
                    {/* Weekday Checkboxes */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Days</Label>
                      <Controller
                        name="available_days"
                        control={control}
                        render={({ field }) => (
                          <div className="grid grid-cols-4 gap-2">
                            {WEEKDAYS.map((day) => (
                              <label key={day.value} className="flex items-center gap-1.5 cursor-pointer text-sm">
                                <Checkbox
                                  checked={field.value?.includes(day.value)}
                                  onCheckedChange={(checked) => {
                                    const updated = checked ? [...(field.value || []), day.value] : (field.value || []).filter((d) => d !== day.value);
                                    field.onChange(updated);
                                  }}
                                />
                                {day.label}
                              </label>
                            ))}
                          </div>
                        )}
                      />
                    </div>

                    {/* Time Slot Inputs */}
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Time Slot</Label>
                      <div className="flex items-center gap-2">
                        <Input type="time" {...register('time_slot_start')} className="text-sm" />
                        <span className="text-xs text-gray-400">to</span>
                        <Input type="time" {...register('time_slot_end')} className="text-sm" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Capacity */}
          <AccordionItem value="capacity">
            <AccordionTrigger>
              <p className="flex items-center gap-4">
                <User size={18} />
                Capacity
              </p>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex items-center gap-4">
                <Input type="number" placeholder="Total Persons" {...register('capacity')} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price Range */}
          <AccordionItem value="price">
            <AccordionTrigger>
              <p className="flex items-center gap-4">
                <Tag size={18} /> Price
              </p>
            </AccordionTrigger>
            <AccordionContent>
              <div className="py-4">
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => <ReactRangeSliderInput {...field} min={50} max={5000} step={100} value={field.value} onInput={field.onChange} className="w-full" />}
                />

                <div className="w-full flex justify-between text-sm text-gray-600 mt-2">
                  <span>${filters?.price?.[0]}</span>
                  <span>${filters?.price?.[1]}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Filtered Items Output */}
      <div className="lg:w-3/4 p-4 space-y-4">
        {/* Sidebar */}
        <div className="flex justify-start lg:justify-end flex-wrap">
          <div className="space-y-4 flex flex-col">
            {selectedItems.length > 0 ? (
              <BulkActionButtons
                selectedCount={selectedItems.length}
                totalCount={items.length}
                isAllSelected={isAllSelected}
                onSelectAllToggle={handleSelectAllToggle}
                onDelete={handleMultpleDelete}
              />
            ) : (
              <AddNewButton label="Add New" href="/dashboard/admin/transfers/new" />
            )}

            <Controller
              name="sort_by"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Default (Newest First)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {SORT_BY.map(({ name, value }) => (
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

        {/* Result  Found  */}
        <div className="flex flex-col gap-4 h-full">
          {/* Loading State */}
          {isValidating && <span className="loader"></span>}

          {/* Error State */}
          {!isValidating && error && <div className="text-red-500 text-center">Failed to load data. Please try again.</div>}

          {/* Empty State */}
          {!isValidating && !error && items.length === 0 && <div className="text-gray-500 text-center">No items found.</div>}

          {/* For Items */}
          {!isValidating && !error && items.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 ">
                {items.map(({ id: itemId, name, media_gallery = [], tags = [], attributes = [], vendor_routes: { is_vendor } = {}, feature_image }, index) => (
                  <ListingCard key={index}>
                    <ListingCardImage src={feature_image || media_gallery?.[0]?.url || 'https://picsum.photos/350/300?random'} alt={`${name} image`} />
                    <ListingCardCheckbox
                      checked={selectedItems.includes(itemId)}
                      onCheckedChange={(checked) => {
                        setSelectedItems((prev) => {
                          const newSelection = checked ? [...prev, itemId] : prev.filter((id) => id !== itemId);
                          setIsAllSelected(newSelection.length === items.length);
                          return newSelection;
                        });
                      }}
                      itemId={itemId}
                    />
                    <ListingCardContent>
                      <ListingCardTitle
                        actions={
                          <ListingCardActions
                            itemId={itemId}
                            editHref={is_vendor ? `/dashboard/admin/transfers/edit/${itemId}/vendor` : `/dashboard/admin/transfers/edit/${itemId}/admin`}
                            onDelete={() => handleDeleteClick(itemId)}
                          />
                        }
                      >
                        {name}
                      </ListingCardTitle>
                      <span className="text-gray-500 text-sm">{is_vendor ? 'Vendor Route' : 'Admin Route'}</span>
                      {attributes.length > 0 &&
                        attributes.map(
                          ({ attribute_name }, index) =>
                            attribute_name === 'Duration' && (
                              <ListingCardMeta key={index} icon={Clock}>
                                3 Hours
                              </ListingCardMeta>
                            ),
                        )}
                      {tags.length > 0 && (
                        <ListingCardTags>
                          {tags.map(({ tag_name }, index) => (
                            <Badge key={index} className={`bg-secondaryDark text-white hover:text-white hover:bg-secondaryDark ${index === 0 && 'bg-gray-400'}`}>
                              {tag_name}
                            </Badge>
                          ))}
                        </ListingCardTags>
                      )}
                      <ListingCardStats>
                        <Badge className="bg-secondarylight hover:bg-secondarylight text-secondaryDark">4.8</Badge>
                        <ListingCardMeta icon={Users}>1200 Bookings</ListingCardMeta>
                      </ListingCardStats>
                    </ListingCardContent>
                  </ListingCard>
                ))}
              </div>

              {/* Pagination */}
              <CustomPagination totalItems={totalItems} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteItemId && (
        <AlertDialog open={!!deleteItemId} onOpenChange={(open) => !open && cancelDelete()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. This will permanently delete your data from our servers.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-dangerSecondary" onClick={confirmDelete}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
};

export default FilterTransfer;
