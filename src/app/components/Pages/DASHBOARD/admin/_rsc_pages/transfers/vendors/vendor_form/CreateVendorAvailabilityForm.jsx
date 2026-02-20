'use client';

import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { createVendorAvailability } from '@/lib/actions/vendor'; //action for creating vendor route
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetchers';
import { format } from 'date-fns';

const CreateVendorAvailabilityForm = ({ onSuccess }) => {
  const { vendorId } = useParams(); // dynamic vendor id
  const { toast } = useToast();
  const { data = {}, error, isLoading } = useSWR(`/api/admin/vendors/${vendorId}/vehiclesdropdown`, fetcher);
  const { data: vehicles = [] } = data?.data || {}; // destructure vendor safely

  //initialize form
  const methods = useForm({
    defaultValues: {
      vendor_id: parseInt(vendorId),
      vehicle_id: '',
      date: '',
      start_time: '',
      end_time: '',
      price_multiplier: '',
    },
  });

  const {
    register,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = methods;

  const onSubmit = async (data) => {
    const response = await createVendorAvailability(data); // action for create vendor route
    if (response.success) {
      toast({ title: response.message || 'Vendor created successfully' });
      onSuccess?.();
      mutate((key) => key.startsWith(`/api/admin/vendors/${vendorId}/availability`)); //
    } else {
      toast({
        title: 'Error',
        description: response.message,
        variant: 'destructive',
      });
    }
  };

  const selectedVehicleId = useWatch({ control, name: 'vehicle_id' });
  const { vehicle_type: vehicleType = '' } = vehicles.find((v) => v.id === Number(selectedVehicleId)) || {};

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className={`grid gap-4 py-4 ${isSubmitting && 'cursor-wait'}`} disabled={isSubmitting}>
          {/* Vehicle Type */}
          <div className="grid gap-3">
            <Label htmlFor="vehicle_id">Vehicle Type</Label>
            <Controller
              name="vehicle_id"
              control={control}
              rules={{ required: 'Type Required' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type">{vehicleType}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle, index) => {
                      return (
                        <SelectItem key={index} value={Number(vehicle.id)}>
                          {vehicle.vehicle_type}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />

            {/* Error  */}
            {errors?.vehicle_id && <p className="text-red-400 font-semibold text-sm">{errors?.vehicle_id?.message}</p>}
          </div>

          {/* Date */}
          <div className="grid gap-3">
            <Label htmlFor="date">Date</Label>
            <Controller
              name="date"
              rules={{ required: 'Date Field Required' }}
              control={control}
              render={({ field }) => {
                const value = field.value
                  ? format(new Date(field.value), 'yyyy-MM-dd') // Format using date-fns
                  : '';

                return <Input type="date" id="date" value={value} onChange={(e) => field.onChange(e.target.value)} className={errors?.date && 'border-red-500'} />;
              }}
            />

            {errors?.date && <p className="text-red-400 font-semibold text-sm">{errors?.date?.message}</p>}
          </div>

          {/* Starting Point and Endtime */}
          <div className="flex gap-4">
            <div className="grid gap-3 w-full">
              <Label htmlFor="start_time">Starting Time</Label>

              <Input
                type="time"
                {...register('start_time', {
                  required: 'Starting time is required',
                })}
                id="start_time"
                name="start_time"
                placeholder="Enter starting time"
                className={errors?.start_time && 'border-red-500'}
              />

              {/* Error */}
              {errors?.start_time && <p className="text-red-400 font-semibold text-sm">{errors.start_time.message}</p>}
            </div>

            <div className="grid gap-3 w-full">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                type="time"
                id="end_time"
                placeholder="Enter End time"
                {...register('end_time', {
                  required: 'Ending time is required',
                })}
                className={`w-full ${errors?.end_time ? 'border-red-500' : ''}`}
              />

              {errors?.end_time && <p className="text-red-400 font-semibold text-sm">{errors.end_time.message}</p>}
            </div>
          </div>

          {/* MaxBooking and PricePer Km */}
          <div className="flex gap-4">
            <div className="grid gap-3 w-full">
              <Label htmlFor="max_bookings">Max Booking</Label>
              <Input
                type="number"
                min="1"
                {...register('max_bookings', {
                  required: 'Max Bookings Required',
                  valueAsNumber: true,
                })}
                id="max_bookings"
                name="max_bookings"
                placeholder=""
              />

              {/* Error  */}
              {errors?.max_bookings && <p className="text-red-400 font-semibold text-sm">{errors?.max_bookings?.message}</p>}
            </div>

            <div className="grid gap-3 w-full">
              <Label htmlFor="price_multiplier">Price Per Km</Label>
              <Input
                type="number"
                min="1"
                {...register('price_multiplier', {
                  required: 'Price Per Booking required',
                  valueAsNumber: true,
                })}
                id="price_multiplier"
                name="price_multiplier"
                placeholder=""
              />

              {/* Error  */}
              {errors?.price_multiplier && <p className="text-red-400 font-semibold text-sm">{errors?.price_multiplier?.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="secondary" type="submit">
              {isSubmitting ? 'Creating Vendor' : 'Add Vendor '}
            </Button>
          </DialogFooter>
        </fieldset>
      </form>
    </FormProvider>
  );
};

export default CreateVendorAvailabilityForm;
