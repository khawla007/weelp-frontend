import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateSlug } from '@/lib/utils';
import { Controller, useFormContext } from 'react-hook-form';
import useSWR from 'swr';
import { authFetcher } from '@/lib/fetchers';
import { SelectInputTransfer2 } from '../components/SelectForm';
import { Combobox } from '@/components/ui/combobox';
import { VEHICLE_TYPES, TRANSFER_TYPES } from '@/constants/transfer'; // constants

// Basic Information
const BasicInfoTabAdmin = () => {
  // fetch active routes for selector
  const { data: routesData } = useSWR('/api/admin/transfer-routes/dropdown', authFetcher);
  const routes = (routesData?.data || []).map((r) => ({
    id: r.id,
    name: r.name,
    raw: r,
  }));

  // fetch zone price matrix cells (small payload) for resolving preview
  const { data: matrixData } = useSWR('/api/admin/transfer-zone-prices', authFetcher);
  const cells = matrixData?.cells || [];

  // intialize form
  const {
    register,
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

  return (
    <div className="space-y-4 py-6">
      <h2 className="text-base font-semibold text-[#09090B]">Transfer Details</h2>
      <p className="text-sm text-gray-600">Enter the basic detail of transfer service</p>

      {/* Name */}
      <div className="pb-2 space-y-2 w-full">
        <Label htmlFor="name" className={`block text-sm font-medium ${errors?.name ? 'text-red-400' : 'text-black'}`}>
          Name <span className="text-red-500">*</span>
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
          Slug <span className="text-red-500">*</span>
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
          Transfer Type <span className="text-red-500">*</span>
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
          Vehicle Type <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="vehicle_type"
          control={control}
          rules={{ required: 'Field Required' }}
          render={({ field }) => <SelectInputTransfer2 value={field.value} onChange={field.onChange} options={VEHICLE_TYPES} placeholder="Select pickup location..." />}
        />
        {errors?.vehicle_type && <p className="text-red-500 text-sm mt-1">{errors?.vehicle_type?.message}</p>}
      </div>

      {/* Route */}
      <div className="pb-2 space-y-2 w-full">
        <Label className={`block text-sm font-medium ${errors?.transfer_route_id ? 'text-red-400' : 'text-black'}`}>
          Route <span className="text-red-500">*</span>
        </Label>
        <Controller
          name="transfer_route_id"
          control={control}
          rules={{ required: 'Route is required' }}
          render={({ field }) => (
            <Combobox
              data={routes}
              value={field.value}
              onChange={(id) => {
                field.onChange(id);
                const picked = routes.find((r) => String(r.id) === String(id))?.raw;
                if (!picked) {
                  setValue('resolved_route_price', null);
                  return;
                }
                // resolve price from matrix cell
                if (picked.from_zone_id && picked.to_zone_id) {
                  const cell = cells.find((c) => c.from_zone_id === picked.from_zone_id && c.to_zone_id === picked.to_zone_id);
                  setValue('resolved_route_price', cell ? { price: cell.price, currency: cell.currency } : null);
                } else {
                  setValue('resolved_route_price', null);
                }
              }}
              placeholder="Select route..."
            />
          )}
        />
        {errors?.transfer_route_id && <p className="text-red-500 text-sm mt-1">{errors.transfer_route_id.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className={`block text-sm font-medium ${errors?.description ? 'text-red-400' : 'text-black'}`}>
          Description <span className="text-red-500">*</span>
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
          Inclusion <span className="text-red-500">*</span>
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
