'use client';

import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { createVendorSchedule } from '@/lib/actions/vendor'; //action for creating vendor route
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetchers';
import { format } from 'date-fns';

const CreateVendorScheduleForm = ({ onSuccess }) => {
  const { vendorId } = useParams(); // dynamic vendor id
  const { toast } = useToast();
  const { data = {}, error, isLoading } = useSWR(`/api/admin/vendors/${vendorId}/vehiclesdropdown`, fetcher);
  const { data: driveroptions = {}, error: driverError, isLoading: driverIsLoading } = useSWR(`/api/admin/vendors/${vendorId}/driversdropdown`, fetcher);

  const { data: vehicles = [] } = data?.data || {}; // destructure vehicles safely
  const { data: drivers = [] } = driveroptions?.data || {}; // destructure vehicles safely

  //initialize form
  const methods = useForm({
    defaultValues: {
      vendor_id: parseInt(vendorId),
      vehicle_id: '',
      driver_id: '',
      date: '',
      shift: '',
      time: '',
    },
  });

  // destructure methods
  const {
    register,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = methods;

  // handle on submit
  const onSubmit = async (data) => {
    console.log(data);
    const response = await createVendorSchedule(data); // action for create vendor route
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

  const selectedDriverId = useWatch({ control, name: 'driver_id' });
  const { name: driverName = '' } = drivers.find((driver) => driver.id === Number(selectedDriverId)) || {};

  const shifts = ['day', 'night', 'morning', 'evening']; // shifts

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
              rules={{ required: 'Type Required', valueAsNumber: true }}
              render={({ field }) => (
                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type">{vehicleType}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle, index) => {
                      return (
                        <SelectItem key={index} value={vehicle.id}>
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

          {/* Driver Type */}
          <div className="grid gap-3">
            <Label htmlFor="driver_id">Select Driver</Label>
            <Controller
              name="driver_id"
              control={control}
              rules={{ required: 'Type Required', valueAsNumber: true }}
              render={({ field }) => (
                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver..">{driverName}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver, index) => {
                      return (
                        <SelectItem key={index} value={driver.id}>
                          {driver.name}
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

          {/* Timing */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="grid gap-3 w-full">
              <Label htmlFor="time">Time</Label>
              <Input type="time" {...register('time', { required: 'Timing is required' })} id="time" name="time" placeholder="Select Schedule Timing" className={errors?.time && 'border-red-500'} />

              {/* Error */}
              {errors?.time && <p className="text-red-400 font-semibold text-sm">{errors?.time?.message}</p>}
            </div>

            {/* Shift Type */}
            <div className="grid gap-3 w-full">
              <Label htmlFor="shift">Select Shift</Label>
              <Controller
                name="shift"
                control={control}
                rules={{ required: 'Type Required' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder="Select shift..">{field.value}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift, index) => {
                        return (
                          <SelectItem key={index} value={shift} className="capitalize">
                            {shift}
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
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="secondary" type="submit">
              {isSubmitting ? 'Creating Schedule' : 'Add Schedule '}
            </Button>
          </DialogFooter>
        </fieldset>
      </form>
    </FormProvider>
  );
};

export default CreateVendorScheduleForm;
