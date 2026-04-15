'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ComboboxMultiple } from '@/components/ui/combobox_multi';
import { generateSlug } from '@/lib/utils';

export default function Step1BasicInfo({ locations = [] }) {
  const {
    register,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext();

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
      <h2 className="text-base font-semibold text-[#09090B]">Basic Information</h2>

      <div className="flex w-full gap-4">
        <div className="pb-2 space-y-2 w-full">
          <Label htmlFor="name" className={`block text-sm font-medium ${errors?.name ? 'text-red-400' : 'text-black'}`}>
            Itinerary Name <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="Itinerary name"
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
      </div>

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

      {/* destination */}
      <div className="space-y-2">
        <Label htmlFor={'locations'} className={`block text-sm font-medium ${errors?.locations ? 'text-red-400' : 'text-black'}`}>
          Destinations <span className="text-red-500">*</span>
        </Label>
        <Controller
          control={control}
          name="locations"
          defaultValue={[]}
          rules={{ required: 'Locations Required' }}
          render={({ field: { value, onChange } }) => (
            <ComboboxMultiple
              id={'locations'}
              name="locations"
              type={'locations'}
              items={locations}
              value={value ?? []}
              onChange={onChange}
            />
          )}
        />
        {errors?.locations && <span className="text-red-400">{errors?.locations?.message}</span>}
      </div>

      <div className="flex items-center space-x-2">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="featured_itinerary">
          <Controller
            name="featured_itinerary"
            defaultValue={false}
            control={control}
            render={({ field }) => (
              <Switch
                id="featured_itinerary"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="group relative inline-flex h-6 w-11 items-center rounded-full transition bg-gray-300 data-[state=checked]:bg-secondaryDark"
              >
                <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform group-data-[state=checked]:translate-x-5" />
              </Switch>
            )}
          />
          Featured
        </Label>
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="private_itinerary">
          <Controller
            name="private_itinerary"
            defaultValue={false}
            control={control}
            render={({ field }) => (
              <Switch
                id="private_itinerary"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="group relative inline-flex h-6 w-11 items-center rounded-full transition bg-gray-300 data-[state=checked]:bg-secondaryDark"
              >
                <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform group-data-[state=checked]:translate-x-5" />
              </Switch>
            )}
          />
          Private
        </Label>
      </div>
    </div>
  );
}
