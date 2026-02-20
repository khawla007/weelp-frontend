'use client';

import { createVendor } from '@/lib/actions/vendor';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { mutate } from 'swr';

const CreateVendorForm = ({ onSuccess }) => {
  const { toast } = useToast();
  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
    },
  });

  const {
    register,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = methods;

  const onSubmit = async (data) => {
    const response = await createVendor(data);
    if (response.success) {
      toast({ title: response.message || 'Vendor created successfully' });
      onSuccess?.();

      mutate((key) => key.startsWith(`/api/admin/vendors/getallvendor`)); // trigger on success
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
            <Label htmlFor="name">Vendor Name</Label>
            <Input {...register('name', { required: 'Name Field Required' })} id="name" name="name" placeholder="Vendor Name" />

            {/* Error  */}
            {errors?.name && <p className="text-red-400 font-semibold text-sm">{errors?.name?.message}</p>}
          </div>

          {/* Description */}
          <div className="grid gap-3">
            <Label htmlFor="description">Description</Label>
            <Textarea {...register('description', { required: 'Field Required' })} id="description" name="description" placeholder="Vendor Description" />

            {/* Error  */}
            {errors?.description && <p className="text-red-400 font-semibold text-sm">{errors?.description?.message}</p>}
          </div>

          {/* Email & PhoneNumber */}
          <div className="flex gap-4">
            <div className="grid gap-3 w-full">
              <Label htmlFor="email">Email</Label>
              <Input type="email" {...register('email', { required: 'Email Required' })} id="email" name="email" placeholder="e.g.. vendor1@example.com" />

              {/* Error  */}
              {errors?.description && <p className="text-red-400 font-semibold text-sm">{errors?.description?.message}</p>}
            </div>

            <div className="grid gap-3 w-full">
              <Label htmlFor="phone">Phone Number</Label>
              <Input type="tel" {...register('phone', { required: 'Phone Number Required' })} id="phone" name="phone" placeholder="e.g.. +919999999999" />

              {/* Error  */}
              {errors?.phone && <p className="text-red-400 font-semibold text-sm">{errors?.phone?.message}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="grid gap-3">
            <Label htmlFor="address">Address</Label>
            <Textarea {...register('address', { required: 'Address Field Required' })} id="address" name="address" placeholder="e.g.. 123 Main Street" />

            {/* Error  */}
            {errors?.address && <p className="text-red-400 font-semibold text-sm">{errors?.address?.message}</p>}
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
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

export default CreateVendorForm;
