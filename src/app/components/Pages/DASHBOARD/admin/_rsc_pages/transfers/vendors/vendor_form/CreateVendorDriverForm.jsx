'use client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select as ShadcnSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetchers';
import { createVendorDrivers } from '@/lib/actions/vendor'; //actions
import Select from 'react-select';

const CreateVendorDriverForm = ({ onSuccess }) => {
  const { vendorId } = useParams(); // dynamic vendor id
  const { toast } = useToast();
  const { data = {}, error, isLoading } = useSWR(`/api/admin/vendors/${vendorId}/vehiclesdropdown`, fetcher);
  const { data: vehicles = [] } = data?.data || {}; // destructure vendor safely

  //initialize form
  const methods = useForm({
    defaultValues: {
      vendor_id: parseInt(vendorId),
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      license_number: '',
      license_expiry: '',
      status: '',
      assigned_vehicle_id: '',
      languages: ['english'],
    },
  });

  // intialize form
  const {
    register,
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = methods;

  // handlesubmit
  const onSubmit = async (data) => {
    const response = await createVendorDrivers(data); // action for create vendor drivers
    console.log(response);
    if (response.success) {
      toast({ title: response.message || 'Vendor created successfully' });
      onSuccess?.();
      mutate((key) => key.startsWith(`/api/admin/vendors/${vendorId}/drivers`)); //
    } else {
      toast({
        title: 'Error',
        description: response.message,
        variant: 'destructive',
      });
    }
  };

  const languageOptions = [
    { label: 'English', value: 'english' },
    { label: 'Spanish', value: 'spanish' },
    { label: 'French', value: 'french' },
    { label: 'Hindi', value: 'hindi' },
    { label: 'Arabic', value: 'arabic' },
  ];

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset className={`grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 ${isSubmitting && 'cursor-wait'}`} disabled={isSubmitting}>
          {/* FirstName */}
          <div className="grid gap-3">
            <Label htmlFor="first_name">First Name</Label>
            <Input type="text" {...register('first_name', { required: 'First Name Requried' })} placeholder="Enter First Name" />

            {/* Error  */}
            {errors?.first_name && <p className="text-red-400 font-semibold text-sm">{errors?.first_name?.message}</p>}
          </div>

          {/* LastName */}
          <div className="grid gap-3">
            <Label htmlFor="last_name">Last Name</Label>
            <Input type="text" {...register('last_name', { required: 'Last Name Requried' })} placeholder="Enter Last Name" />

            {/* Error  */}
            {errors?.last_name && <p className="text-red-400 font-semibold text-sm">{errors?.last_name?.message}</p>}
          </div>

          {/* Email */}
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input type="email" {...register('email', { required: 'Email Requried' })} placeholder="Enter Email" required />

            {/* Error  */}
            {errors?.email && <p className="text-red-400 font-semibold text-sm">{errors?.email?.message}</p>}
          </div>

          {/* Phone */}
          <div className="grid gap-3">
            <Label htmlFor="phone">Phone</Label>
            <Input type="number" min="0" {...register('phone', { required: 'Phone Number Required' })} placeholder="Enter Phone Number" required />

            {/* Error  */}
            {errors?.phone && <p className="text-red-400 font-semibold text-sm">{errors?.phone?.message}</p>}
          </div>

          {/* License */}
          <div className="grid gap-3">
            <Label htmlFor="license_number">License Number</Label>
            <Input
              type="text"
              {...register('license_number', {
                required: 'License Number Required',
              })}
              placeholder="Enter License Number"
            />

            {/* Error  */}
            {errors?.license_number && <p className="text-red-400 font-semibold text-sm">{errors?.license_number?.message}</p>}
          </div>

          {/* License Expiry */}
          <div className="grid gap-3">
            <Label htmlFor="license_expiry">License Expiry</Label>
            <Input
              type="date"
              {...register('license_expiry', {
                required: 'Licese Expiry Requried',
              })}
            />
            {errors?.license_expiry && <p className="text-red-400 font-semibold text-sm">{errors.license_expiry.message}</p>}
          </div>

          {/* Status  */}
          <div className="grid gap-3">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <ShadcnSelect onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="off_duty">Off Duty</SelectItem>
                    <SelectItem value="on_duty">On Duty</SelectItem>
                  </SelectContent>
                </ShadcnSelect>
              )}
            />
            {errors?.status && <p className="text-red-400 text-sm font-semibold">{errors.status.message}</p>}
          </div>

          {/* Assigned Vehicle  */}
          <div className="grid gap-3">
            <Label htmlFor="assigned_vehicle_id">Assign Vehicle</Label>
            <Controller
              name="assigned_vehicle_id"
              control={control}
              rules={{ required: 'Assigne Vehicle', valueAsNumber: true }}
              render={({ field }) => (
                <ShadcnSelect onValueChange={(value) => field.onChange(Number(value))} value={Number(field.value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.length > 0 &&
                      vehicles.map(({ make = '', model = '', id }, index) => {
                        return (
                          <SelectItem className="text-sm" key={index} value={id}>
                            {make} {model}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </ShadcnSelect>
              )}
            />
            {errors?.status && <p className="text-red-400 text-sm font-semibold">{errors.status.message}</p>}
          </div>

          {/* Languages */}
          <div className="grid gap-3 sm:col-span-2">
            <Label htmlFor="languages">Languages</Label>
            <Controller
              name="languages"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={languageOptions}
                  isMulti
                  className="basic-multi-select"
                  classNamePrefix="select"
                  onChange={(selected) => field.onChange(selected.map((opt) => opt.value))}
                  value={languageOptions.filter((opt) => field.value.includes(opt.value))}
                  placeholder="Please select languages..."
                />
              )}
            />
          </div>

          <DialogFooter className="sm:col-span-2">
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

export default CreateVendorDriverForm;
