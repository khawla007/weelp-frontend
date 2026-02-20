'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Car, Clock, Ellipsis, Plus, SquarePen, Tag, Trash2, User, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import debounce from 'lodash.debounce';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import ReactRangeSliderInput from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import { CustomPagination } from '@/app/components/Pagination';
import Link from 'next/link';
import useSWR from 'swr'; // for states cache and ui management
import { useToast } from '@/hooks/use-toast'; // toast for notification
import { Checkbox } from '@/components/ui/checkbox'; //
import { fetcher } from '@/lib/fetchers'; // interceptors
import { deleteMultipleTransfers, deleteTransfer } from '@/lib/actions/transfer'; // inline actions
import { VEHICLE_TYPES } from '@/constants/transfer'; // constants
import { SORT_BY } from '@/constants/shared'; // filter constants

const FilterTransfer = () => {
  const { toast } = useToast(); // intialize toast
  const [selectedItems, setSelectedItems] = useState([]); // selected item for multiple delete case
  const [modalState, setModalState] = useState({
    openDropdownIndex: '', //
    openDialogIndex: '',
  });

  // intialize hook
  const { register, setValue, control } = useForm({
    //initalize form
    defaultValues: {
      vehicle_type: '',
      availability_date: '',
      capacity: '',
      price: [50, 150],
      sort_by: '',
      page: 1,
    },
  });

  const filters = useWatch({ control: control }); // intialize watching
  const [debouncedFilters, setDebouncedFilters] = useState(filters); // fitlering

  //  handle delete to open modal
  const handleDeleteClick = (index) => {
    setModalState({
      openDropdownIndex: '',
      openDialogIndex: index,
    });
  };

  // colose dialog
  const closeDialog = () => {
    setModalState((prev) => ({ ...prev, openDialogIndex: '' }));
  };

  // handle for delete transfer
  async function handleDelete(itemId) {
    try {
      const res = await deleteTransfer(itemId); // call server action for deletion

      toast({
        title: res.message || 'Delete Succesfully',
        variant: 'success',
      });
      mutate(); // trigger api
      closeDialog(); // close your dialog after success
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error deleting item',
        variant: 'destructive',
      });
    }
  }

  // handle page change
  const handlePageChange = (newPage) => {
    setValue('page', newPage, { shouldValidate: true, shouldDirty: true }); // through server side pagiantion
  };

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

    if (debouncedFilters.vehicle_type) params.append('vehicle_type', debouncedFilters.vehicle_type);
    if (debouncedFilters.availability_date) params.append('availability_date', debouncedFilters.availability_date);
    if (debouncedFilters.capacity) params.append('capacity', debouncedFilters.capacity);
    if (debouncedFilters.sort_by) params.append('sort_by', debouncedFilters.sort_by);
    if (debouncedFilters.price?.[0]) params.append('min_price', debouncedFilters.price[0]);
    if (debouncedFilters.price?.[1]) params.append('max_price', debouncedFilters.price[1]);
    if (debouncedFilters.page) params.append('page', debouncedFilters.page);

    return params.toString();
  }, [debouncedFilters]);

  // SWR fetch
  const { data, error, isValidating, mutate } = useSWR(`/api/admin/transfers?${queryParams}`, fetcher, { revalidateOnFocus: true });

  console.log(data, 'data');
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
                      <SelectValue placeholder="Select a vehicle_type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {VEHICLE_TYPES.map((vehicle, i) => (
                          <SelectItem key={i} value={vehicle?.value}>
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
          <AccordionItem value="availablity_date">
            <AccordionTrigger>
              <p className="flex items-center gap-4">
                <Calendar size={18} /> Availability
              </p>
            </AccordionTrigger>
            <AccordionContent>
              <Input type="date" {...register('availability_date')} />
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
        <div className="flex justify-start lg:justify-between flex-wrap">
          Recommended
          <div className="space-y-4 flex flex-col">
            {selectedItems.length > 0 ? (
              // Seleted Items Functionality
              <p className="flex self-end gap-4">
                {/* <Button variant="outline" className="w-fit self-end" onClick={handleMultpleExport}>
                  <Download size={16} /> Export
                </Button> */}

                <Button variant="destructive" className="w-fit self-end" onClick={handleMultpleDelete}>
                  <Trash2 size={16} /> Delete
                </Button>
              </p>
            ) : (
              <Button asChild>
                <Link className="w-fit self-end bg-secondaryDark text-black" href="/dashboard/admin/transfers/new">
                  {/** Create New itineraries */}
                  <Plus size={16} /> Create Transfer
                </Link>
              </Button>
            )}

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
                {items.map(({ id: itemId, name, media_gallery = [], tags = [], attributes = [], vendor_routes: { is_vendor } = {} }, index) => (
                  <Card
                    key={index}
                    className={`group hover:shadow-md ease duration-300 rounded-lg w-full lg:w-fit border relative ${selectedItems?.includes(itemId) && 'p-3 border border-secondaryDark'}`}
                  >
                    <img
                      className="w-full lg:w-[326px] h-[183px] rounded-lg aspect-square"
                      src={`${media_gallery?.[0]?.url ? media_gallery?.[0]?.url : 'https://picsum.photos/350/300?random'}`}
                      alt="activity_image"
                    />

                    <div className=" bg-white p-4 space-y-2">
                      <h2>{name}</h2>

                      {/* vendor routes name */}
                      <span>{`Checking is by vendor ${is_vendor}`}</span>

                      {/* attributes have duration then */}
                      {attributes.length > 0 &&
                        attributes.map(({ attribute_name }, index) => {
                          {
                            return (
                              attribute_name === 'Duration' && ( // Specific attrbutete Value Hai
                                <span key={index} className="text-gray-500 text-sm flex items-center gap-2">
                                  <Clock size={16} /> 3 Hours
                                </span>
                              )
                            );
                          }
                        })}

                      {/* Display Tags */}
                      {tags.length > 0 && (
                        <div className="flex gap-2">
                          {tags.map(({ tag_name }, index) => (
                            <Badge key={index} className={`bg-secondaryDark text-white hover:text-white hover:bg-secondaryDark ${index === 0 && 'bg-gray-400'}`}>
                              {tag_name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-start gap-2">
                        <Badge className="bg-secondarylight hover:bg-secondarylight text-secondaryDark ">4.8</Badge>
                        <span className="text-gray-500 text-sm flex items-center gap-2">
                          <Users size={16} /> 1200 Bookings
                        </span>
                      </div>
                    </div>

                    {/*  DropDown */}
                    <div className="absolute right-4 top-4">
                      <DropdownMenu
                        open={modalState.openDropdownIndex === itemId}
                        onOpenChange={(open) => {
                          setModalState((prev) => ({
                            ...prev,
                            openDropdownIndex: open ? itemId : '',
                          }));
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <Ellipsis size={16} />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="space-y-0 -ml-20">
                          <DropdownMenuItem className="py-0">
                            <Button asChild variant="outline" className="w-full px-2 border-none flex justify-start text-sm font-normal">
                              {/* Edit Transfers Route Based on isVendor */}
                              {is_vendor ? (
                                <Link href={`/dashboard/admin/transfers/edit/${itemId}/vendor`}>
                                  <SquarePen size={16} className="mr-2" />
                                  Edit
                                </Link>
                              ) : (
                                <Link href={`/dashboard/admin/transfers/edit/${itemId}/admin`}>
                                  <SquarePen size={16} className="mr-2" />
                                  Edit
                                </Link>
                              )}
                            </Button>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="py-0"
                            onSelect={(e) => {
                              e.preventDefault();
                              handleDeleteClick(itemId);
                            }}
                          >
                            <Button variant="outline" className="w-full px-2 text-red-400 border-none flex justify-start text-sm font-normal">
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </Button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <AlertDialog
                        open={modalState.openDialogIndex === itemId}
                        onOpenChange={(open) => {
                          if (!open) closeDialog();
                        }}
                      >
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete your data from our servers.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-dangerSecondary" onClick={() => handleDelete(itemId)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Selected Items Input Field */}
                    <div className="absolute top-[5%] left-[5%] w-fit">
                      <Checkbox
                        checked={selectedItems.includes(itemId)}
                        className="data-[state=checked]:bg-secondaryDark"
                        onClick={(e) => {
                          setSelectedItems(
                            (prev) =>
                              prev.includes(itemId)
                                ? prev.filter((id) => id !== itemId) //
                                : [...prev, itemId], //
                          );
                        }}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <CustomPagination totalItems={totalItems} itemsPerPage={per_page} currentPage={current_page} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FilterTransfer;
