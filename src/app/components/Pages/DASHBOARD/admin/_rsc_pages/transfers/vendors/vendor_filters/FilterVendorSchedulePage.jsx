'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { useEffect, useState, useMemo } from 'react';
import { debounce } from 'lodash';
import { Form, FormDescription, FormItem, FormControl, FormMessage, FormField, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CustomPagination } from '@/app/components/Pagination';
import { CardVendorSchedule } from '../shared/vendor_cards';
import { useParams } from 'next/navigation';
import { fetcher } from '@/lib/fetchers';
import { VendorNoResultFound } from '../shared/VendorNoResultFound';
import useSWR from 'swr';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

const FilterVendorSchedulePage = () => {
  const { vendorId } = useParams(); // get vendor id

  // intialize method
  const form = useForm({
    defaultValues: {
      page: 1,
      driver_id: '',
      vehicle_id: '',
      shift: '',
      date: '',
    },
  });

  const {
    control,
    setValue,
    formState: { errors },
  } = form;
  const page = useWatch({ control, name: 'page' });
  const [query, setQuery] = useState('?page=1');

  const watchedDriver_id = useWatch({ control, name: 'driver_id' });
  const watchedVehicle_id = useWatch({ control, name: 'vehicle_id' });
  const watchedShift = useWatch({ control, name: 'shift' });
  const watchedDate = useWatch({ control, name: 'date' });

  // debounced query update
  const debouncedSetQuery = useMemo(
    () =>
      debounce((page, driver_id, shift, date, vehicle_id) => {
        const params = new URLSearchParams();

        if (driver_id) params.append('driver_id', driver_id);
        if (shift) params.append('shift', shift);
        if (date) params.append('date', date);
        if (vehicle_id) params.append('vehicle_id', vehicle_id);
        params.append('page', page.toString());

        setQuery(`?${params.toString()}`);
      }, 200),
    [],
  );

  // side effect for listening changes
  useEffect(() => {
    debouncedSetQuery(page, watchedDriver_id, watchedShift, watchedDate, watchedVehicle_id);
    return () => debouncedSetQuery.cancel();
  }, [page, watchedDriver_id, watchedShift, watchedDate, watchedVehicle_id, debouncedSetQuery]);

  const { data = {}, isLoading, error } = useSWR(`/api/admin/vendors/${vendorId}/schedules${query}`, fetcher); // for query get results
  const { current_page, data: schedules = [], per_page, total } = data?.data || {}; // destructure data

  // handle on page change
  const handlePageChange = (newPage) => {
    setValue('page', newPage);
  };

  const { data: driverdata = [] } = useSWR(`/api/admin/vendors/${vendorId}/driversdropdown`, fetcher); // get driver data
  const { data: vehicledata = [] } = useSWR(`/api/admin/vendors/${vendorId}/vehiclesdropdown`, fetcher); // get vehicle data

  const { data: drivers = [] } = driverdata?.data || {}; // access drivers
  const { data: vehicles = [] } = vehicledata?.data || {}; // access vehcles

  const shifts = ['day', 'night', 'morning', 'evening']; // shifts

  return (
    <Card className="flex flex-col md:flex-row bg-inherit border-none shadow-none gap-2">
      <CardHeader className="min-h-96 h-full md:max-w-xs w-full bg-white border shadow-sm rounded-lg space-y-6">
        <Form {...form}>
          <div>
            <FormLabel>Filters</FormLabel>
            <FormDescription>Filter schedule by driver or vehicle</FormDescription>
          </div>

          {/* Driver  */}
          <FormField
            control={control}
            name="driver_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver</FormLabel>
                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Please Select Driver" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Vehicle */}
          <FormField
            control={control}
            name="vehicle_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle</FormLabel>
                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Please Select Vehicle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem className="capitalize" key={vehicle.id} value={vehicle.id.toString()}>
                        {`${vehicle.make} (${vehicle.model})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Shift */}
          <FormField
            control={control}
            name="shift"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shift</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder="Select shift.." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {shifts.map((shift, index) => (
                      <SelectItem key={index} value={shift} className="capitalize">
                        {shift}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}
          <Label className="flex items-center gap-2">
            Date <CalendarIcon size={18} /> <span className="text-black">{watchedDate}</span>
          </Label>

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined} // Convert string back to Date
                onSelect={(date) => {
                  if (date) field.onChange(format(date, 'yyyy-MM-dd')); // Format as "July 11, 2025"
                }}
                className="rounded-md border"
              />
            )}
          />
        </Form>
      </CardHeader>
      <CardContent className="flex-col w-full space-y-4">
        {isLoading && <p className="loader"></p>}

        {error && <p className="text-red-400">Something Went Wrong</p>}

        {!isLoading && schedules?.length === 0 && <VendorNoResultFound />}

        {schedules?.length > 0 && (
          <Card className="grid grid-cols-1 p-8 gap-4">
            {schedules.map((schedule, index) => (
              <CardVendorSchedule key={index} {...schedule} />
            ))}
          </Card>
        )}

        {/* Pagination */}
        <CustomPagination currentPage={current_page || 1} totalItems={total} itemsPerPage={per_page} onPageChange={handlePageChange} />
      </CardContent>
    </Card>
  );
};

export default FilterVendorSchedulePage;
