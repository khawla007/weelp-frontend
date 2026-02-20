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
import { createVendorRoute } from '@/lib/actions/vendor'; //action for creating vendor route
import { mutate } from 'swr';

const CreateVendorRouteForm = ({ onSuccess }) => {
  const { vendorId } = useParams(); // dynamic vendor id
  const { toast } = useToast();

  //initialize form
  const methods = useForm({
    defaultValues: {
      vendor_id: parseInt(vendorId),
      name: '',
      description: '',
      start_point: '',
      end_point: '',
      base_price: 0,
      price_per_km: 0,
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
    const response = await createVendorRoute(data); // action for create vendor route
    if (response.success) {
      toast({ title: response.message || 'Vendor created successfully' });
      onSuccess?.();

      mutate((key) => key.startsWith(`/api/admin/vendors/${vendorId}/routes`)); //
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
            <Label htmlFor="name">Route Name</Label>
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

          {/* Starting Point adn Entoint */}
          <div className="flex gap-4">
            <div className="grid gap-3 w-full">
              <Label htmlFor="start_point">Starting Point</Label>
              <Input
                type="text"
                {...register('start_point', {
                  required: 'Starting point Required',
                })}
                id="start_point"
                name="start_point"
                placeholder="Enter Starting Point"
              />

              {/* Error  */}
              {errors?.start_point && <p className="text-red-400 font-semibold text-sm">{errors?.start_point?.message}</p>}
            </div>

            <div className="grid gap-3 w-full">
              <Label htmlFor="end_point">End Point</Label>
              <Input type="text" {...register('end_point', { required: 'End Point Required' })} id="end_point" name="end_point" placeholder="Enter End Point" />

              {/* Error  */}
              {errors?.end_point && <p className="text-red-400 font-semibold text-sm">{errors?.end_point?.message}</p>}
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

export default CreateVendorRouteForm;
