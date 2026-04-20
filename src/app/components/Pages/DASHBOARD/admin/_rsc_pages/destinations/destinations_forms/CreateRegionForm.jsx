'use client';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Upload, Trash2 } from 'lucide-react';
import { createRegion, editRegion } from '@/lib/actions/regionActions';
import useSWR from 'swr';
import { authFetcher } from '@/lib/fetchers';
import { ComboboxMultiple } from '@/components/ui/combobox_multi';
import { Medialibrary } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/media/MediaLibrary';
import { useMediaStore } from '@/lib/store/useMediaStore';

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
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const { selectedMedia, resetMedia } = useMediaStore();

  // Fetch countries for multi-select
  const { data: countriesData } = useSWR('/api/admin/countries/list', authFetcher);
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
    control,
  } = methods;

  // eslint-disable-next-line react-hooks/incompatible-library
  const image_url = watch('image_url');

  useEffect(() => {
    if (selectedMedia.length > 0) {
      setValue('image_url', selectedMedia[0].url, { shouldDirty: true });
      resetMedia();
      setMediaDialogOpen(false);
    }
  }, [selectedMedia, setValue, resetMedia]);

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
      <div className="mb-6 flex items-center gap-3">
        <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{id ? 'Edit Region' : 'New Region'}</h1>
          <p className="text-sm text-gray-600 mt-1">{`${id ? 'Edit' : 'Create a new'} region with detailed information`}</p>
        </div>
      </div>

      <Card>
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
              <Input id="name" placeholder="e.g., Europe, Asia, Americas" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select defaultValue={FORM_REGION_VALUES_DEFAULT.type} onValueChange={(value) => setValue('type', value)}>
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
              <Textarea id="description" placeholder="Enter region description..." rows={4} {...register('description')} />
            </div>

            {/* Image */}
            <div className="flex flex-col gap-3">
              <Label>Image</Label>
              {image_url ? (
                <div className="relative inline-block">
                  <img src={image_url} alt="region" className="h-40 w-auto rounded-md border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => setValue('image_url', '', { shouldDirty: true })}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ) : null}
              <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="w-fit">
                    <Upload size={14} className="mr-2" />
                    Select Media
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-screen-xl">
                  <DialogTitle className="sr-only">Select Region Image</DialogTitle>
                  <DialogDescription className="invisible">Pick a region image</DialogDescription>
                  <Medialibrary closeDialog={() => setMediaDialogOpen(false)} alreadySelectedImages={image_url ? [{ url: image_url }] : []} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              <Label>Countries</Label>
              <Controller
                control={control}
                name="countries"
                render={({ field: { value, onChange } }) => (
                  <ComboboxMultiple id="countries" type="Countries" items={countries} value={value || []} onChange={onChange} />
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard/admin/destinations/regions/')} disabled={isSubmitting}>
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
