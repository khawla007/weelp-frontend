'use client';

import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select as ShadcnSelect, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Select from 'react-select';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { createVendorVehicle } from '@/lib/actions/vendor'; //action for creating
import { mutate } from 'swr';

const CreateVendorVehicleForm = ({ onSuccess }) => {
  const { vendorId } = useParams(); // dynamic vendor id
  const { toast } = useToast();

  //initialize form
  const methods = useForm({
    defaultValues: {
      vendor_id: parseInt(vendorId), // number
      vehicle_type: '',
      capacity: 0,
      make: '',
      model: '',
      year: 0,
      license_plate: '',
      features: '',
      status: 'Available',
      last_maintenance: '2025-07-01',
      next_maintenance: '2025-08-01',
    },
  });

  const {
    register,
    control,
    getValues,
    watch,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = methods;

  const onSubmit = async (data) => {
    const response = await createVendorVehicle(data); // action for create
    if (response.success) {
      toast({ title: response.message || 'Submitted successfully' });
      onSuccess?.();

      mutate((key) => key.startsWith(`/api/admin/vendors/${vendorId}/vehicles`)); //
    } else {
      toast({
        title: 'Error',
        description: response.message,
        variant: 'destructive',
      });
    }
  };

  // schema for vehicle type
  const vehicleTypeSchema = [
    { name: 'Sedan', value: 'sedan' },
    { name: 'SUV', value: 'suv' },
    { name: 'Van', value: 'van' },
    { name: 'Minibus', value: 'minibus' },
    { name: 'Luxury Sedan', value: 'luxury_sedan' },
    { name: 'Luxury SUV', value: 'luxury_suv' },
    { name: 'Shuttle', value: 'shuttle' },
    { name: 'Coach', value: 'coach' },
  ];

  // schema for features
  const featureOptions = [
    { id: 1, label: 'WiFi', value: 'wifi' },
    { id: 2, label: 'Air Conditioning', value: 'air_conditioning' },
    { id: 3, label: 'Leather Seats', value: 'leather_seats' },
    { id: 4, label: 'USB Charging', value: 'usb_charging' },
    { id: 5, label: 'Entertainment System', value: 'entertainment_system' },
    { id: 6, label: 'Wheelchair Access', value: 'wheelchair_access' },
    { id: 7, label: 'Child Seat', value: 'child_seat' },
    { id: 8, label: 'Luggage Space', value: 'luggage_space' },
    { id: 9, label: 'Refreshments', value: 'refreshments' },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className={`grid gap-4 py-4 ${isSubmitting && 'cursor-wait'}`} disabled={isSubmitting}>
          {/* Vehicle Type and Capacity */}
          <div className="flex gap-4">
            <div className="w-full space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Controller
                name="vehicle_type"
                control={control}
                rules={{ required: 'Vehicle Type Required' }}
                render={({ field }) => (
                  <ShadcnSelect onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="vehicle_type">
                      <SelectValue placeholder="Select Vehicle Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypeSchema.map((vehicle, index) => {
                        return (
                          <SelectItem key={index} value={vehicle.value}>
                            {vehicle.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </ShadcnSelect>
                )}
              />

              {/* Error  */}
              {errors?.vehicle_type && <p className="text-red-400 font-semibold text-sm">{errors?.vehicle_type?.message}</p>}
            </div>

            <div className="w-full">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                type="number"
                min="1"
                {...register('capacity', {
                  required: 'Capacity Required',
                  valueAsNumber: true,
                })}
                id="capacity"
                name="capacity"
                placeholder="Enter Capacity"
              />

              {/* Error  */}
              {errors?.capacity && <p className="text-red-400 font-semibold text-sm">{errors?.capacity?.message}</p>}
            </div>
          </div>

          <div className="flex gap-4  ">
            {/* Make */}
            <div className="flex flex-col gap-1 space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input type="text" {...register('make', { required: 'Field Required' })} id="make" name="make" placeholder="e.g Toyota" />

              {/* Error  */}
              {errors?.make && <p className="text-red-400 font-semibold text-sm">{errors?.make?.message}</p>}
            </div>

            {/* Model */}
            <div className="grid gap-3">
              <Label htmlFor="model">Model</Label>
              <Input type="text" {...register('model', { required: 'Field Required' })} id="model" name="model" placeholder="e.g Camry" />

              {/* Error  */}
              {errors?.model && <p className="text-red-400 font-semibold text-sm">{errors?.model?.message}</p>}
            </div>

            {/* Year */}
            <div className="grid gap-3">
              <Label htmlFor="year">Year</Label>
              <Input type="number" {...register('year', { required: 'Field Required' })} id="year" name="year" placeholder="e.g 2025" />

              {/* Error  */}
              {errors?.year && <p className="text-red-400 font-semibold text-sm">{errors?.year?.message}</p>}
            </div>
          </div>

          <div className="grid gap-3 w-full">
            <Label htmlFor="license_plate">License Plate</Label>
            <Input type="text" {...register('license_plate', { required: 'License Required' })} id="license_plate" name="license_plate" placeholder="Enter License Plate Number" />

            {/* Error  */}
            {errors?.license_plate && <p className="text-red-400 font-semibold text-sm">{errors?.license_plate?.message}</p>}
          </div>

          <div className="grid gap-3 w-full">
            <Label htmlFor="features">Features</Label>

            <Controller
              name="features"
              control={control}
              rules={{ required: 'Select at least one feature' }}
              render={({ field, fieldState }) => (
                <div>
                  <Select
                    isMulti
                    options={featureOptions}
                    value={featureOptions.filter((option) => field.value?.split(',').includes(option.value))}
                    onChange={(selected) => field.onChange(selected.map((opt) => opt.value).join(','))}
                    placeholder="Select features"
                  />
                  {fieldState.error && <p className="text-sm text-red-500 mt-1">{fieldState.error.message}</p>}
                </div>
              )}
            />
          </div>

          {/* Available */}
          <div className="grid gap-3">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <ShadcnSelect onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in_use">Inuse</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </ShadcnSelect>
              )}
            />
          </div>

          {/* Last Maintenance && Next Maintenance */}
          <div className="flex gap-4">
            <div className="grid gap-3 w-full">
              <Label htmlFor="last_maintenance">Last Maintenance</Label>
              <Controller
                name="last_maintenance"
                control={control}
                defaultValue=""
                rules={{ required: 'Date is required' }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <input type="date" {...field} className="input border px-3 py-2 rounded w-full" />
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                  </div>
                )}
              />
            </div>

            <div className="grid gap-3 w-full">
              <Label htmlFor="next_maintenance">Next Maintenance</Label>
              <Controller
                name="next_maintenance"
                control={control}
                defaultValue=""
                rules={{ required: 'Date is required' }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-col gap-1">
                    <input type="date" {...field} className="input border px-3 py-2 rounded w-full" />
                    {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                  </div>
                )}
              />
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

export default CreateVendorVehicleForm;
