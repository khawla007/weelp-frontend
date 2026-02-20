import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateSlug } from '@/lib/utils';
import { Controller, useFormContext } from 'react-hook-form';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';
import { SelectInputTransfer, SelectInputTransfer2 } from '../components/SelectForm';
import { VEHICLE_TYPES, TRANSFER_TYPES } from '@/constants/transfer'; // constants

// Basic Information
const BasicInfoTabAdmin = () => {
  const { data, error, isLoading } = useSWR('/api/admin/destinations/places/placesdropdown/', fetcher); // fetch places

  const places = data?.data || [];

  // intialize form
  const {
    register,
    watch,
    getValues,
    setValue,
    formState: { errors },
    control,
  } = useFormContext();

  // handling value when blur
  const handleBlur = () => {
    const name = getValues('name');
    const currentSlug = getValues('slug');
    const newSlug = generateSlug(name);

    if (currentSlug !== newSlug) {
      setValue('slug', newSlug);
    }
  };

  if (isLoading) return <div className="loader"></div>;

  if (error) return <div className="text-red-500">Something went wrong: {error.message}</div>;

  return (
    <div className="space-y-4 py-6">
      <h2 className="text-base font-semibold text-[#09090B]">Transfer Details</h2>
      <p className="text-sm text-gray-600">Enter the basic detail of transfer service</p>

      {/* Name */}
      <div className="pb-2 space-y-2 w-full">
        <Label htmlFor="name" className={`block text-sm font-medium ${errors?.name ? 'text-red-400' : 'text-black'}`}>
          Name
        </Label>
        <Input
          placeholder="Enter Transfer Name"
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 p-2 text-sm block w-full rounded-md border border-gray-300 shadow-sm focus-visible:ring-secondaryDark"
          onBlur={handleBlur}
        />
        {errors?.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div className="pb-2 space-y-2 w-full">
        <Label htmlFor="slug" className={`block text-sm font-medium ${errors?.slug ? 'text-red-400' : 'text-black'}`}>
          Slug
        </Label>
        <Input
          placeholder="Enter Url slug"
          id="slug"
          {...register('slug', { required: 'Slug is required' })}
          className="mt-1 p-2 text-sm block w-full rounded-md border border-gray-300 shadow-sm focus-visible:ring-secondaryDark"
          onBlur={handleBlur}
        />
        {errors?.slug && <p className="text-red-500 text-sm mt-1">{errors?.slug.message}</p>}
      </div>

      {/* Transfer Type */}
      <div className="space-y-2">
        <Label htmlFor="transfer_type" className={`block text-sm font-medium ${errors?.transfer_type ? 'text-red-400' : 'text-black'}`}>
          Transfer Type
        </Label>
        <Controller
          name="transfer_type"
          control={control}
          rules={{ required: 'Field Required' }}
          render={({ field }) => <SelectInputTransfer2 value={field.value} onChange={field.onChange} options={TRANSFER_TYPES} placeholder="Select pickup location..." />}
        />
        {errors?.transfer_type && <p className="text-red-500 text-sm mt-1">{errors?.transfer_type?.message}</p>}
      </div>

      {/* Vehicle Type */}
      <div className="space-y-2">
        <Label htmlFor="vehicle_type" className={`block text-sm font-medium ${errors?.vehicle_type ? 'text-red-400' : 'text-black'}`}>
          Vehicle Type
        </Label>
        <Controller
          name="vehicle_type"
          control={control}
          rules={{ required: 'Field Required' }}
          render={({ field }) => <SelectInputTransfer2 value={field.value} onChange={field.onChange} options={VEHICLE_TYPES} placeholder="Select pickup location..." />}
        />
        {errors?.vehicle_type && <p className="text-red-500 text-sm mt-1">{errors?.vehicle_type?.message}</p>}
      </div>

      {/* Pickup Location Dropoff Location */}
      <div className="flex w-full gap-4 flex-col sm:flex-row">
        <div className="pb-2 space-y-2 w-full">
          <Label htmlFor="pickup_location">Pickup Location</Label>
          <Controller
            name="pickup_location"
            control={control}
            defaultValue=""
            render={({ field }) => <SelectInputTransfer value={field.value} onChange={field.onChange} options={places} placeholder="Select pickup location..." />}
          />
          {errors?.pickup_location && <p className="text-red-500 text-sm mt-1">{errors.pickup_location.message}</p>}
        </div>

        <div className="pb-2 space-y-2 w-full">
          <Label htmlFor="dropoff_location">Dropoff Location</Label>
          <Controller
            name="dropoff_location"
            control={control}
            defaultValue=""
            rules={{
              validate: (value) => value !== watch('pickup_location') || 'Pickup and Dropoff location cannot be the same',
            }}
            render={({ field }) => <SelectInputTransfer value={field.value} onChange={field.onChange} options={places} placeholder="Select dropoff location..." />}
          />

          {errors?.dropoff_location && <p className="text-red-500 text-sm mt-1">{errors.dropoff_location.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className={`block text-sm font-medium ${errors?.description ? 'text-red-400' : 'text-black'}`}>
          Description
        </Label>
        <Textarea
          placeholder="Detailed description"
          id="description"
          {...register('description', {
            required: 'Description is required',
          })}
          className="mt-1 p-2 text-sm block w-full rounded-md border border-gray-300 shadow-sm focus-visible:ring-secondaryDark"
        />
        {errors?.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      {/* Inclusions */}
      <div className="space-y-2">
        <Label htmlFor="inclusion" className={`block text-sm font-medium ${errors?.inclusion ? 'text-red-400' : 'text-black'}`}>
          Inclusion
        </Label>
        <Textarea
          placeholder="Detailed inclusion"
          id="inclusion"
          {...register('inclusion', {
            required: 'inclusion is required',
          })}
          className="mt-1 p-2 text-sm block w-full rounded-md border border-gray-300 shadow-sm focus-visible:ring-secondaryDark"
        />
        {errors?.inclusion && <p className="text-red-500 text-sm mt-1">{errors?.inclusion.message}</p>}
      </div>
    </div>
  );
};

export default BasicInfoTabAdmin;
