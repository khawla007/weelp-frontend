'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { createRegion, editRegion } from '@/lib/actions/regionActions';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';
import { Checkbox } from '@/components/ui/checkbox';
import { NavigationDestinations } from '../components/NavigationDestinations';

const FORM_REGION_VALUES_DEFAULT = {
  name: '',
  type: 'region',
  description: '',
  image_url: '',
  countries: [],
};

export const CreateRegionForm = ({ apiFormData = {} }) => {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  // Fetch countries for multi-select
  const { data: countriesData } = useSWR('/api/admin/countries/list', fetcher);
  const countries = countriesData?.data || [];

  // Initialize Form
  const methods = useForm({
    defaultValues: {
      ...FORM_REGION_VALUES_DEFAULT,
      ...apiFormData,
      countries: apiFormData?.country_ids || [],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = methods;

  const watchedCountries = watch('countries', []);

  // Handle country selection (multi-select via checkboxes)
  const handleCountryToggle = (countryId) => {
    const currentCountries = watchedCountries || [];
    if (currentCountries.includes(countryId)) {
      setValue(
        'countries',
        currentCountries.filter((id) => id !== countryId),
      );
    } else {
      setValue('countries', [...currentCountries, countryId]);
    }
  };

  // Form Submit
  const onSubmit = async (data) => {
    try {
      let res;
      if (id) {
        res = await editRegion(id, data);
      } else {
        res = await createRegion(data);
      }

      if (res?.success) {
        toast({
          title: res.message || (id ? 'Updated successfully!' : 'Created successfully!'),
        });
        router.push('/dashboard/admin/destinations/regions/');
      } else {
        toast({
          title: 'Error',
          description: res.message || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Unexpected Error',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 py-4 sm:px-6 lg:px-8">
      <NavigationDestinations
        title={id ? 'Edit Region' : 'New Region'}
        description={`${id ? 'Edit' : 'Create a new'} region with detailed information`}
      />

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>{id ? 'Edit Region' : 'Create New Region'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Europe, Asia, Americas"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                defaultValue={FORM_REGION_VALUES_DEFAULT.type}
                onValueChange={(value) => setValue('type', value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="region">Region</SelectItem>
                  <SelectItem value="continent">Continent</SelectItem>
                  <SelectItem value="subregion">Subregion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter region description..."
                rows={4}
                {...register('description')}
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...register('image_url')}
              />
            </div>

            {/* Countries - Multi-select via checkboxes */}
            <div className="space-y-2">
              <Label>Countries</Label>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                {countries.length === 0 ? (
                  <p className="text-gray-500 text-sm">No countries available</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {countries.map((country) => (
                      <div key={country.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`country-${country.id}`}
                          checked={watchedCountries?.includes(country.id)}
                          onCheckedChange={() => handleCountryToggle(country.id)}
                        />
                        <Label htmlFor={`country-${country.id}`} className="cursor-pointer text-sm font-normal">
                          {country.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">{watchedCountries?.length || 0} country(s) selected</p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/admin/destinations/regions/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    {id ? 'Updating...' : 'Creating...'}
                  </>
                ) : id ? (
                  'Update Region'
                ) : (
                  'Create Region'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
