'use client';

import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { createVendorPricing, createVendorRoute } from '@/lib/actions/vendor'; //action for creating vendor route
import { mutate } from 'swr';

const CreateVendorPricingForm = ({ onSuccess }) => {
  const { vendorId } = useParams(); // dynamic vendor id
  const { toast } = useToast();

  //initialize form
  const methods = useForm({
    defaultValues: {
      vendor_id: parseInt(vendorId),
      name: '',
      description: '',
      base_price: 0,
      price_per_km: 0,
      min_distance: 0,
      waiting_charge: 0,
      night_charge_multiplier: 1,
      peak_hour_multiplier: 1,
      status: 'Active',
    },
  });

  const {
    register,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = methods;

  const onSubmit = async (data) => {
    const response = await createVendorPricing(data); // action for create vendor route
    if (response.success) {
      toast({ title: response.message || 'Vendor created successfully' });
      onSuccess?.();

      mutate((key) => key.startsWith(`/api/admin/vendors/${vendorId}/pricing`)); // mutate pricing on sucess
    } else {
      toast({
        title: 'Error',
        description: response.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className={`grid gap-4 py-4 ${isSubmitting && 'cursor-wait'}`} disabled={isSubmitting}>
          {/* Name */}
          <div className="grid gap-3">
            <Label htmlFor="name">Tier Name</Label>
            <Input {...register('name', { required: 'Name Field Required' })} id="name" name="name" placeholder="Route Name" />

            {/* Error  */}
            {errors?.name && <p className="text-red-400 font-semibold text-sm">{errors?.name?.message}</p>}
          </div>

          {/* Description */}
          <div className="grid gap-3">
            <Label htmlFor="description">Route Description</Label>
            <Textarea {...register('description', { required: 'Field Required' })} id="description" name="description" placeholder="Enter Route Description" />

            {/* Error  */}
            {errors?.description && <p className="text-red-400 font-semibold text-sm">{errors?.description?.message}</p>}
          </div>

          {/* Minimum Distance adn Waiting Charge */}
          <div className="flex gap-4">
            <div className="grid gap-3 w-full">
              <Label htmlFor="min_distance">Minimum Distance</Label>
              <Input
                type="number"
                {...register('min_distance', {
                  required: 'Min Distance Required',
                  valueAsNumber: true,
                })}
                id="min_distance"
                name="min_distance"
                placeholder="Enter Minimum Distance"
              />

              {/* Error  */}
              {errors?.min_distance && <p className="text-red-400 font-semibold text-sm">{errors?.min_distance?.message}</p>}
            </div>

            <div className="grid gap-3 w-full">
              <Label htmlFor="waiting_charge">Waiting Charge Per Hr</Label>
              <Input
                type="number"
                {...register('waiting_charge', {
                  required: 'Waiting Charge Required',
                })}
                id="waiting_charge"
                name="waiting_charge"
                placeholder="Enter Waiting Charge"
              />

              {/* Error  */}
              {errors?.waiting_charge && <p className="text-red-400 font-semibold text-sm">{errors?.waiting_charge?.message}</p>}
            </div>
          </div>

          {/* Base Price adn PricePer Km */}
          <div className="flex gap-4">
            <div className="grid gap-3 w-full">
              <Label htmlFor="base_price">Base price</Label>
              <Input
                type="number"
                {...register('base_price', {
                  required: 'Base price Required',
                  valueAsNumber: true,
                })}
                id="base_price"
                name="base_price"
                placeholder="Enter Base Price"
              />

              {/* Error  */}
              {errors?.base_price && <p className="text-red-400 font-semibold text-sm">{errors?.base_price?.message}</p>}
            </div>

            <div className="grid gap-3 w-full">
              <Label htmlFor="price_per_km">Price Per Km</Label>
              <Input
                type="number"
                {...register('price_per_km', {
                  required: 'Price Per KM Required',
                  valueAsNumber: true,
                })}
                id="price_per_km"
                name="price_per_km"
                placeholder="Enter Price Per KM"
              />

              {/* Error  */}
              {errors?.price_per_km && <p className="text-red-400 font-semibold text-sm">{errors?.price_per_km?.message}</p>}
            </div>
          </div>

          {/* NightCharge Multiplier and Peak Hour */}
          <div className="flex gap-4">
            <div className="grid gap-3 w-full">
              <Label htmlFor="night_charge_multiplier">Night Charge Multiplier</Label>
              <Input
                type="number"
                {...register('night_charge_multiplier', {
                  required: 'Night charge Required',
                  valueAsNumber: true,
                })}
                id="night_charge_multiplier"
                name="night_charge_multiplier"
                placeholder="Enter Night Charge..."
              />

              {/* Error  */}
              {errors?.night_charge_multiplier && <p className="text-red-400 font-semibold text-sm">{errors?.night_charge_multiplier?.message}</p>}
            </div>

            <div className="grid gap-3 w-full">
              <Label htmlFor="peak_hour_multiplier">Peak Hour Multiplier</Label>
              <Input
                type="number"
                {...register('peak_hour_multiplier', {
                  required: 'Field Required',
                  valueAsNumber: true,
                })}
                id="peak_hour_multiplier"
                name="peak_hour_multiplier"
                placeholder="Enter Waiting Charge"
              />

              {/* Error  */}
              {errors?.peak_hour_multiplier && <p className="text-red-400 font-semibold text-sm">{errors?.peak_hour_multiplier?.message}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="grid gap-3">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
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

export default CreateVendorPricingForm;
