'use client';

import React, { useEffect } from 'react';
import { useForm, FormProvider, Controller, useFieldArray, useWatch, useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { CalendarIcon, Tag, Trash2, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ComboboxMultiple, ComboboxMultipleAttribute } from '@/components/ui/combobox_multi';
import { Card } from '@/components/ui/card';
import { cn, generateSlug, log } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { constructNow, format } from 'date-fns';
import { DiscountBlock } from '@/app/components/Form/reusablecomponents/DiscountSettings';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { NavigationActivity } from './activity_shared';
import { deleteActivityItems, editActivity } from '@/lib/actions/activities';
import { isEmpty, isArray } from 'lodash';
import { useMediaStore } from '@/lib/store/useMediaStore'; // For Handling Media Store
import { Medialibrary } from '../media/MediaLibrary'; // Handling Media Library
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';
import { useAddOnOptionsAdmin } from '@/hooks/api/admin/addon';

const SharedAddOnMultiSelect = dynamic(() => import('../shared_tabs/addon/SharedAddOn'), { ssr: false });

export const EditActivityForm = ({ categories, attributes, tags, locations = [], activitydata }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [toggleUpdate, setToggleUpdate] = useState(false);
  const [formData, setFormData] = useState({});
  const router = useRouter();
  const { toast } = useToast();

  const { data, error, isLoading } = useAddOnOptionsAdmin();

  const addOnOptions = data?.data || [];

  //desctructure data
  const {
    id,
    name,
    slug,
    description,
    short_description,
    featured_activity,
    locations: presetLocation,
    categories: presetCategories,
    tags: presetTags,
    attributes: presetAttributes,
    media_gallery,
    pricing: presetPricing,
    seasonal_pricing,
    group_discounts,
    early_bird_discount,
    last_minute_discount,
    addons = [],
  } = activitydata;

  // total location retrive of activity
  const presetLocations = presetLocation.map(({ id, location_type, city_id, location_label, duration }) => ({
    id,
    location_type,
    city_id,
    location_label,
    duration,
  }));

  // set attributes preselected
  const initialAttributes = presetAttributes.map(({ attribute_id, attribute_value }) => ({
    attribute_id,
    attribute_value,
  }));

  // pricing
  const { regular_price, currency } = presetPricing;

  //seasonal pricing
  const initialSeasonalPricing = isEmpty(seasonal_pricing)
    ? []
    : seasonal_pricing.map((item) => ({
        ...item,
        dateRange:
          item.season_start && item.season_end
            ? {
                from: new Date(item.season_start),
                to: new Date(item.season_end),
              }
            : null,
      }));

  // intialGroupDiscount
  const initialGroupDiscounts = !isEmpty(group_discounts) ? group_discounts : [];

  // addons modify
  const initialAdd = Array.isArray(addons) ? addons.map((item) => item.addon_id) : [];

  //  intialize form
  const methods = useForm({
    shouldUnregister: false,
    mode: 'onSubmit',
    defaultValues: {
      name: name,
      slug: slug,
      description: description,
      short_description: short_description,
      featured_activity: featured_activity ?? false,
      locations: presetLocations,
      categories: presetCategories?.map((cat) => cat.category_id) || [],
      tags: presetTags?.map((tag) => tag?.tag_id) || [],
      attributes: initialAttributes,
      media_gallery: media_gallery,
      pricing: {
        regular_price,
        currency,
      },
      seasonal_pricing: initialSeasonalPricing,
      group_discounts: initialGroupDiscounts,
      early_bird_discount: early_bird_discount,
      last_minute_discount: last_minute_discount,
      addons: initialAdd,
    },
  });

  const { errors, isValid, isSubmitting } = methods?.formState;

  /** Inline Actions Side Effects */
  useEffect(() => {
    methods.setValue('locations', [...presetLocations]); // update side effect for location
  }, [toggleUpdate, locations]);

  useEffect(() => {
    methods.setValue('seasonal_pricing', [...initialSeasonalPricing]); // update side effect for seasonal pricing
  }, [toggleUpdate, seasonal_pricing]);

  useEffect(() => {
    methods.setValue('group_discounts', [...group_discounts]); // update side effect for group discount
  }, [toggleUpdate, group_discounts]);

  //  Main Steps
  const steps = [
    {
      id: 1,
      title: 'Basic Information',
      description: 'Name , description and status',
    },
    {
      id: 2,
      title: 'Location',
      description: 'Activity type and where it takes place',
    },
    {
      id: 3,
      title: 'Taxonomies & Attributes',
      description: 'Duration , difficulty and requirements',
    },
    {
      id: 4,
      title: 'Add On`s',
      description: 'Add on of the Activity',
    },
    {
      id: 5,
      title: 'Images & Media',
      description: 'Upload images regarding activity',
    },

    {
      id: 6,
      title: 'Pricing & Booking',
      description: 'Prices , group sizes, and booking info',
    },
  ];

  // Basic Information
  const PersonalInfoTab = () => {
    const {
      register,
      watch,
      getValues,
      setValue,
      formState: { errors },
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
        <div className="pb-2 space-y-2 w-full">
          <div className="pb-2 space-y-2">
            <Label htmlFor="name" className={`block text-sm font-medium ${errors?.name ? 'text-red-400' : 'text-gray-700'}`}>
              Name
            </Label>
            <Input
              placeholder="Activity name"
              id="name"
              {...register('name', { required: 'Name is required' })}
              className="mt-1 p-2 text-sm block w-full rounded-md border border-gray-300 shadow-sm focus:outline-secondaryDark"
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
        </div>
        <div className="pb-2 space-y-2">
          <Label htmlFor="description" className={`block text-sm font-medium ${errors?.description ? 'text-red-400' : 'text-gray-700'}`}>
            Description
          </Label>
          <Textarea
            placeholder="Detailed description"
            id="description"
            {...register('description', {
              required: 'Description is required',
            })}
            className="mt-1 p-2 text-sm block w-full rounded-md border border-gray-300 shadow-sm h-28 focus:outline-secondaryDark"
          />
          {errors?.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="pb-2 space-y-2">
          <Label htmlFor="short_description" className={`block text-sm font-medium ${errors?.short_description ? 'text-red-400' : 'text-gray-700'}`}>
            Short Description
          </Label>
          <Textarea
            placeholder="Short description"
            id="short_description"
            {...register('short_description', {
              required: 'Field is required',
            })}
            className="mt-1 p-2 text-sm block w-full rounded-md border border-gray-300 h-20 focus:outline-secondaryDark"
          />
          {errors?.short_description && <p className="text-red-500 text-sm mt-1">{errors.short_description.message}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="featured_activity" className="text-sm font-medium text-gray-700">
            Feature Activity
          </Label>
          <Controller
            name="featured_activity"
            defaultValue={false}
            control={methods.control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                id="featured_activity"
                className="group relative inline-flex h-6 w-11 items-center rounded-full transition bg-gray-300 data-[state=checked]:bg-secondaryDark"
              >
                <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform group-data-[state=checked]:translate-x-5" />
              </Switch>
            )}
          />
        </div>
      </div>
    );
  };

  // Locations Cities
  const LocationsTab = () => {
    const {
      register,
      control,
      watch,
      getValues,
      setValue,
      formState: { errors },
    } = useFormContext();

    const {
      fields: locationFields,
      append: appendLocation,
      remove: removeLocation,
    } = useFieldArray({
      control,
      name: 'locations', // Field array for locations
    });

    const predefinedLocations = useWatch({
      control: control,
      name: 'locations',
    }); // watches

    // remove location handle
    const handleRemoveLocation = async (item, activityId, index) => {
      const { id } = item; // destructure data

      // Remove Local Index
      if (!id) {
        removeLocation(index);
        return;
      }

      // Remove With Api
      let deleted_location_ids = [];
      deleted_location_ids.push(id);

      try {
        const res = await deleteActivityItems({
          activityId,
          deleted_location_ids,
        });

        console.log(res);
        if (res.success) {
          toast({ title: 'Activity Updated successfully!' });

          setToggleUpdate((prev) => !prev); // update toggle listner
        } else {
          toast({
            title: 'Error',
            description: res.error || 'Please Try Again',
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
      <div className="space-y-4">
        {/* Min Group Size */}
        <div className="hidden justify-between gap-4 py-2 ">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700">Minimum Age</label>
            <Controller
              name="minimum_age"
              control={methods?.control}
              // rules={{ required: "Field required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={1}
                  placeholder="Min Age"
                  value={field.value || ''} // Ensure it's controlled
                  onChange={(e) => field.onChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus-visible:focus:outline-secondaryDark"
                />
              )}
            />

            {errors.minimum_age && <p className="text-red-500 text-sm mt-1">{errors.minimum_age.message}</p>}
          </div>

          {/** Max Group Size */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700">Max Group Size</label>
            <Controller
              name="maxgroup_size"
              control={methods.control}
              defaultValue=""
              // rules={{ required: "Group Size Required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={1}
                  max={50}
                  placeholder="Max group size"
                  value={field.value || ''} // Ensure it's controlled
                  onChange={(e) => field.onChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus-visible:outline-secondaryDark"
                />
              )}
            />
            {errors?.maxgroup_size && <p className="text-red-500 text-sm mt-1">{errors.maxgroup_size.message}</p>}
          </div>
        </div>

        {/* Locations */}
        <div>
          <Label className="block py-2 text-sm font-medium text-gray-700">Locations</Label>
          <p className="py-4 px-8 space-y-4 bg-white">
            {/* Primary Location */}
            <span className="block pb-2 text-sm font-medium text-gray-700">Primary Location</span>
            {methods.formState.errors?.locations && <span className="text-red-400">All Fields Required</span>}

            <Controller name="locations.0.city_id" control={methods.control} render={({ field }) => <Combobox data={locations} value={field.value} onChange={field.onChange} />} />

            <Controller
              name="locations.0.location_label"
              control={methods.control}
              rules={{ required: 'Type required' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full rounded-md text-start focus:outline-secondaryDark">
                    <SelectValue placeholder="Location Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Starting Point', 'Main Location', 'End Point'].map((category, index) => (
                      <SelectItem className="capitalize" key={index} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            {/* Hidden Input to Set Primary Type */}
            <input type="hidden" {...methods.register('locations.0.location_type')} value="primary" />

            {/* Primary Location Duration */}
            <Controller
              name="locations.0.duration"
              control={methods.control}
              defaultValue={0}
              rules={{ required: 'Field Required' }}
              render={({ field }) => (
                <Input
                  type="number"
                  min={1}
                  placeholder="Duration (in minutes)"
                  className="w-full p-2 mt-2 border rounded-md"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </p>

          {/* Additional Locations */}
          <div className="flex flex-col w-full">
            {predefinedLocations.map((item, index) => {
              if (index === 0) return null;

              return (
                <div key={index} className="mt-4 py-4 px-8 space-y-4 bg-white">
                  <span className="block text-sm font-medium text-gray-700">Additional Location {index}</span>

                  <Controller name={`locations[${index}].city_id`} control={methods.control} render={({ field }) => <Combobox data={locations} value={field.value} onChange={field.onChange} />} />

                  <div className="flex items-center gap-4">
                    <Controller
                      name={`locations[${index}].location_label`}
                      control={methods.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full rounded-md text-start focus:outline-secondaryDark">
                            <SelectValue placeholder="Location Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {['StopOver', 'Highlight', 'Optional'].map((category, idx) => (
                              <SelectItem className="capitalize" key={idx} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />

                    <Controller
                      name={`locations[${index}].duration`}
                      control={methods.control}
                      defaultValue={1}
                      rules={{ required: 'Field Required' }}
                      render={({ field }) => (
                        <Input
                          type="number"
                          min={1}
                          placeholder="Duration (in minutes)"
                          className="w-full p-2 mt-2 border rounded-md"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />

                    <Input type="hidden" {...methods.register(`locations[${index}].location_type`)} value="additional" />

                    <X onClick={() => handleRemoveLocation(item, id, index)} className="hover:cursor-pointer" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Additional Location Button */}
          <Button
            type="button"
            onClick={() =>
              appendLocation({
                city_id: null,
                location_label: '',
                location_type: 'additional', // Predefined as additional
                duration: null,
              })
            }
            className="mt-4 w-full bg-white text-black hover:bg-inherit border shadow-sm"
          >
            Add Additional Location
          </Button>
        </div>
      </div>
    );
  };

  // Attributes and Taxonomies
  const TaxonomiesAttributesTab = () => {
    const {
      register,
      getValues,
      formState: { errors },
    } = useFormContext();

    return (
      <div className="space-y-4">
        {/* Categories */}
        <div>
          <Label htmlFor={'categories'} className="block py-2 text-sm font-medium text-gray-700">
            Categories
          </Label>
          <Controller
            control={methods.control}
            name="categories"
            rules={{ required: 'Categories Required' }}
            render={({ field: { value, onChange } }) => (
              <ComboboxMultiple
                id={'categories'}
                type={'categories'} //Required
                items={categories} //Required
                value={value || []} //Required
                onChange={onChange} //Required
              />
            )}
          />
          {errors?.categories && <span className="text-red-400">{errors?.categories?.message}</span>}
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor={'tags'} className="block py-2 text-sm font-medium text-gray-700">
            Tags
          </Label>

          {/* Dropdown that allows multiple selections */}
          <Controller
            control={methods.control}
            name="tags"
            rules={{ required: 'Tags Required' }}
            render={({ field: { value, onChange } }) => (
              <ComboboxMultiple
                id={'tags'}
                type={'tags'} // Required
                items={tags} //Required
                value={value || []} //Required
                onChange={onChange} //Required
              />
            )}
          />

          {errors?.tags && <span className="text-red-400">{errors?.tags?.message}</span>}
        </div>

        {/* Attributes */}
        <div>
          <Label htmlFor={'attributes'} className="block py-2 text-sm font-medium text-gray-700">
            Attributes
          </Label>
          <Controller
            name="attributes"
            control={methods?.control}
            rules={{ required: 'Please Select Attributes' }}
            render={({ field: { onChange, value } }) => <ComboboxMultipleAttribute id={'attributes'} attributes={attributes} value={value} onChange={onChange} />}
          />
          {errors?.attributes && <span className="text-red-400">{errors?.attributes?.message}</span>}
        </div>

        <div className="w-full py-2">
          <Label htmlFor={'difficulty_level'} className="block text-sm font-medium text-gray-700">
            Difficulty Level
          </Label>
          <Controller
            name="difficulty_level"
            control={methods.control}
            defaultValue="easy"
            render={({ field }) => (
              <Select id={'difficulty_level'} onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="mt-1 w-full capitalize rounded-md p-2 focus:outline-secondaryDark">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {['easy', 'moderate', 'hard'].map((val, index) => (
                    <SelectItem key={index} value={val} className="capitalize">
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    );
  };

  // Media Tab
  const MediaTab = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activityImages, setActivityImages] = useState([]); // all images intialize
    const { selectedMedia, resetMedia } = useMediaStore(); // Retrive images From Media

    const {
      setValue,
      formState: { errors },
      getValues,
    } = useFormContext();

    const media_gallery = useWatch({
      name: 'media_gallery',
    });

    //  Hydarte First if there is already media exist
    useEffect(() => {
      if (media_gallery?.length > 0) {
        setActivityImages(media_gallery); // Sync from form to local state
      }
    }, []);

    // sideeffect for getting image from gallery popup
    useEffect(() => {
      if (selectedMedia.length > 0) {
        // 1. Transform selectedMedia (id → media_id) before adding
        const transformedMedia = selectedMedia.map((obj) => _.mapKeys(obj, (value, key) => (key === 'id' ? 'media_id' : key))); // update key to media id

        // 2. Push transformed data to local state
        setActivityImages((prev) => [...prev, ...transformedMedia]);
        resetMedia(); // runs immediately after set
        setDialogOpen(false);
      }
    }, [selectedMedia]);

    // sycn with form
    useEffect(() => {
      setValue('media_gallery', activityImages); // sync form
    }, [activityImages, setValue]);

    // handleDelteImage
    const handleDeleteImage = (image) => {
      setActivityImages((prev) => {
        const updatedImages = prev.filter((img) => img.url !== image.url);
        // setActivityImages(updatedImages);
        setTimeout(() => setValue('media_gallery', updatedImages), 0); //
        return updatedImages;
      });
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="hidden">
          <Controller
            control={methods?.control}
            name="media_gallery"
            defaultValue={[]}
            rules={{
              validate: (val) => val?.length > 0 || 'Please upload at least 1 image.',
            }}
            render={() => ''}
          />
        </div>

        {/**Uploaded Media As Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-fit self-end">
              Upload Media
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-screen-xl">
            <DialogTitle className="sr-only">Edit profile</DialogTitle>
            <DialogDescription className="invisible">Upload Media For Activity</DialogDescription>
            <Medialibrary />
          </DialogContent>
        </Dialog>

        {/**Selected Media From Store */}
        {activityImages.length > 0 ? (
          <div className="w-full flex flex-wrap gap-4 ">
            {activityImages.map((image, index) => {
              return (
                <div key={index} className="group/item relative rounded-md border cursor-pointer p-2 border-black">
                  <img className="size-72 rounded-md border" src={image?.url} alt="media_image" />
                  <Trash2 onClick={() => handleDeleteImage(image)} className="absolute bottom-8 right-8 size-0 group-hover/item:size-6 transition-all text-red-400 bg-white rounded-full shadow" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full">{errors.media_gallery && <p className="text-red-500 mt-1">{errors.media_gallery.message}</p>}</div>
        )}
      </div>
    );
  };

  // Pricing Tab
  const PricingTab = () => {
    const [isSeasonPricing, setSeasonPricing] = useState(false);
    const [isEarlyBirdDiscount, setEarlyBirdDiscount] = useState(false);
    const [islastMinuteDiscount, setLastMinuteDiscount] = useState(false);

    // intialize
    const {
      control,
      register,
      setValue,
      getValues,
      watch,
      formState: { errors, isValid },
    } = useFormContext();

    const seasonalPricing = getValues('seasonal_pricing');
    const isEnabledSeasonalPricing = Array.isArray(seasonalPricing) && seasonalPricing.length > 0 ? seasonalPricing.every((item) => item.enable_seasonal_pricing === true) : false;

    // check is enabled or not pre existing
    useEffect(() => {
      setSeasonPricing(isEnabledSeasonalPricing);
      setEarlyBirdDiscount(early_bird_discount?.enabled);
      setLastMinuteDiscount(last_minute_discount?.enabled);
    }, [isEnabledSeasonalPricing, early_bird_discount?.enabled, last_minute_discount?.enabled]);

    // season fields
    const {
      fields: seasonFields,
      append: addSeason,
      remove: removeSeason,
    } = useFieldArray({
      control,
      name: 'seasonal_pricing',
    });

    //group discount fields
    const {
      fields: discountFields,
      append: addDiscountField,
      remove: removeDiscountField,
    } = useFieldArray({
      control,
      name: 'group_discounts',
    });

    // ALL season fields at once
    const watchedSeasons =
      useWatch({
        control,
        name: 'seasonal_pricing',
      }) || [];

    // date range error
    const isDateError = errors?.seasonal_pricing;

    const seasonFieldsWatched = useWatch({ name: 'seasonal_pricing' });
    const discountFieldsWatched = useWatch({ name: 'group_discounts' });

    const handleRemoveSeason = async (seasonfield, activityId, index) => {
      const { id } = seasonfield;

      // check season have id or not
      if (!id) {
        removeSeason(index);
        return;
      }

      let deleted_seasonal_pricing_ids = [];
      deleted_seasonal_pricing_ids.push(id);

      try {
        const res = await deleteActivityItems({
          activityId,
          deleted_seasonal_pricing_ids,
        });

        if (res.success) {
          toast({ title: 'Activity Updated successfully!' });

          setToggleUpdate((prev) => !prev); // update toggle listner
        } else {
          toast({
            title: 'Error',
            description: res.error || 'Please Try Again',
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

    const handleRemoveDiscount = async (discountField, activityId, index) => {
      const { id } = discountField; // destructure data

      // check whether it is local or come from api
      if (!id) {
        removeDiscountField(index);
        return;
      }

      // remove from api
      let deleted_group_discounts_ids = [];
      deleted_group_discounts_ids.push(id);

      try {
        const res = await deleteActivityItems({
          activityId,
          deleted_group_discounts_ids,
        }); // delete through action

        if (res.success) {
          toast({ title: 'Activity Updated successfully!' });

          setToggleUpdate((prev) => !prev); // update toggle listner
        } else {
          toast({
            title: 'Error',
            description: res.error || 'Please Try Again',
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

    // allseasons
    const seasons = [
      { name: 'Spring Season', value: 'spring' },
      { name: 'Summer Season', value: 'summer' },
      { name: 'Autumn Season', value: 'autumn' },
      { name: 'Winter Season', value: 'winter' },
    ];

    return (
      <div className="space-y-6">
        {/* Base Pricing */}
        <div className="flex flex-col justify-between gap-4 p-8 shadow-md bg-white rounded-md">
          <h3 className="text-lg font-medium text-gray-900">$ Base Pricing</h3>
          <div className="w-full flex gap-4">
            <div className="w-full space-y-2">
              <Label htmlFor="regular_price" className="w-full">
                Regular Price
              </Label>
              <Controller
                name="pricing.regular_price"
                control={methods.control}
                // defaultValue={0}
                rules={{ required: 'Base Price is required' }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="regular_price"
                    type="number"
                    required={true}
                    value={field.value == 0 ? '' : field.value}
                    min={1}
                    placeholder="e.g: 10 , 20"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />

              {errors?.pricing?.regular_price && <span className="text-red-500 text-sm">{errors.pricing.regular_price.message}</span>}
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="currency" className="w-full">
                Currency
              </Label>
              <Controller
                name="pricing.currency"
                control={methods?.control}
                defaultValue="USD" //  Ensures
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? 'USD'} //
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {['USD', 'EUR', 'GBP', 'JPY', 'INR'].map((val, index) => {
                          return (
                            <SelectItem key={index} value={val}>
                              {val}
                            </SelectItem>
                          );
                        })}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div>
            {/* Switch for Seasonal Pricing*/}
            <div className="flex items-center gap-4">
              <Switch
                className="data-[state=checked]:bg-secondaryDark ease-in-out duration-500"
                checked={isSeasonPricing}
                onCheckedChange={(checked) => {
                  setSeasonPricing(checked);

                  // Optional: update your items here when switch toggles ON
                  if (checked && Array.isArray(seasonalPricing)) {
                    const updated = seasonalPricing.map((item) => ({
                      ...item,
                      enable_seasonal_pricing: true,
                    }));
                    // Update your form values or state
                    setValue('seasonal_pricing', updated);
                  }

                  // Optional: on toggle OFF, disable all
                  if (!checked && Array.isArray(seasonalPricing)) {
                    const updated = seasonalPricing.map((item) => ({
                      ...item,
                      enable_seasonal_pricing: false,
                    }));
                    setValue('seasonal_pricing', updated);
                  }
                }}
              />

              <Label className="text-sm font-medium text-gray-900">Enable Seasonal Pricing</Label>
            </div>

            {isSeasonPricing && (
              <div className="seasonal_pricing_main py-4">
                {!isValid && <span className="text-red-500 text-sm mb-4">Fields Required</span>}
                {isDateError && (
                  <p className="text-sm text-red-500 mt-1">
                    {/* Custom error message */}
                    Please select both start and end dates.
                  </p>
                )}

                {seasonFieldsWatched.map((season, index) => {
                  const dateRange = watchedSeasons?.[index]?.dateRange || null;
                  return (
                    <div key={index} className="w-full flex gap-4 items-center">
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 flex-[2]">
                        {/* Season Date Range Picker */}
                        <div className="w-full">
                          <Label>Season Date Range</Label>
                          <div className="text-sm text-muted-foreground mb-2"></div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !dateRange?.from && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from && dateRange?.to ? (
                                  <>
                                    {format(new Date(dateRange.from), 'MMM dd, yyyy')} - {format(new Date(dateRange.to), 'MMM dd, yyyy')}
                                  </>
                                ) : (
                                  <span>Pick a date range</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Controller
                                name={`seasonal_pricing.${index}.dateRange`}
                                control={methods.control}
                                rules={{
                                  validate: (value) => (value?.from && value?.to ? true : 'Please select a valid date range'),
                                }}
                                render={({ field }) => (
                                  <Calendar
                                    mode="range"
                                    className="tfc_calendar"
                                    disabled={{
                                      before: new Date(new Date().setHours(0, 0, 0, 0)),
                                    }}
                                    selected={field.value}
                                    onSelect={(range) => {
                                      field.onChange(range);

                                      methods.setValue(`seasonal_pricing.${index}.season_start`, range?.from ? new Date(range.from).toISOString().split('T')[0] : '');
                                      methods.setValue(`seasonal_pricing.${index}.season_end`, range?.to ? new Date(range.to).toISOString().split('T')[0] : '');
                                    }}
                                  />
                                )}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Price */}
                        <div className="w-full space-y-2">
                          <Label htmlFor={`season_price_${index}`}>Price</Label>
                          <Controller
                            name={`seasonal_pricing.${index}.season_price`}
                            control={methods.control}
                            defaultValue={0}
                            rules={{ required: 'Price is required' }}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id={`season_price_${index}`}
                                type="number"
                                required
                                min={1}
                                value={field.value == 0 ? '' : field.value}
                                placeholder="e.g: 10 , 20"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            )}
                          />
                        </div>

                        {/* Season Name */}
                        <div className="w-full space-y-2">
                          <Label htmlFor={`season_name_${index}`}>Season Name</Label>
                          <Controller
                            name={`seasonal_pricing.${index}.season_name`}
                            control={methods.control}
                            rules={{ required: 'Season name is required' }}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id={`season_name_${index}`} className="w-full">
                                  <SelectValue placeholder="Please Select Season" />
                                </SelectTrigger>
                                <SelectContent>
                                  {seasons.map((season, index) => {
                                    return (
                                      <SelectItem key={index} value={season?.value}>
                                        {season?.name}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                      {/* Remove Button */}
                      <div className="w-fit">
                        <Trash2 type="button" variant="destructive" className="mt-4 text-red-600  rounded-full cursor-pointer" onClick={() => handleRemoveSeason(season, id, index)} />
                      </div>
                    </div>
                  );
                })}

                {/* Add Button */}
                <Button
                  type="button"
                  onClick={() =>
                    addSeason({
                      season_name: '',
                      season_start: '',
                      season_end: '',
                      season_price: 0,
                    })
                  }
                  className="mt-4 bg-secondaryDark"
                >
                  Add Season
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Discount & Promotions */}
        <div className="flex flex-col justify-between gap-4 p-8 shadow-md bg-white rounded-md">
          <h3 className="text-lg flex items-center gap-4 font-semibold text-gray-900">
            <Tag size={18} className=" stroke-2 font-semibold" /> Discount & Promotions
          </h3>

          {/* Group Discounts */}
          <div className="w-full flex flex-col gap-4">
            <div className="w-full flex justify-between">
              <h3 className="text-lg flex items-center gap-4 font-semibold text-gray-900">
                <Users size={18} className="stroke-2" />
                Group Discount
              </h3>
              <button
                className="p-2 border rounded text-sm"
                onClick={() => {
                  addDiscountField({
                    min_people: 1,
                    discount_amount: 0,
                    discount_type: 'percentage',
                  });
                }}
              >
                Add Discount
              </button>
            </div>
            {discountFieldsWatched.length > 0 &&
              discountFieldsWatched.map((item, index) => {
                return (
                  <div key={index} className="flex gap-4 items-center">
                    <Controller
                      name={`group_discounts.${index}.min_people`}
                      control={methods?.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          min={1}
                          required={true}
                          type="number"
                          value={field.value == 0 ? ' ' : field.value}
                          placeholder="Min. People"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />

                    <Controller
                      name={`group_discounts.${index}.discount_amount`}
                      control={methods?.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          min={1}
                          type="number"
                          required={true}
                          value={field.value == 0 ? '' : field.value}
                          placeholder="Discount Amount"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />

                    <Controller
                      name={`group_discounts.${index}.discount_type`}
                      control={control}
                      defaultValue="percentage"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a fruit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="percentage">Percentage %</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />

                    {/* Remove Button */}
                    <div className="w-fit">
                      <Trash2 type="button" variant="destructive" className="text-red-600  rounded-full cursor-pointer" onClick={() => handleRemoveDiscount(item, id, index)} />
                    </div>
                  </div>
                );
              })}
          </div>
          <Separator />

          {/* Discounts variations */}
          <div className="w-full flex flex-col gap-4">
            <DiscountBlock title="Early Bird Discount" description="Offer discounts for early bookings" prefix="early_bird_discount" register={register} setValue={setValue} watch={watch} />

            <DiscountBlock title="Last Minute Discount" description="Offer discounts for last-minute bookings" prefix="last_minute_discount" register={register} setValue={setValue} watch={watch} />
          </div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoTab />;
      case 2:
        return <LocationsTab />;
      case 3:
        return <TaxonomiesAttributesTab />;
      case 4:
        return <SharedAddOnMultiSelect />;
      case 5:
        return <MediaTab />;
      case 6:
        return <PricingTab />;
      default:
        return null;
    }
  };

  // Submit Data
  const onSubmit = async (data) => {
    const mergedData = { ...formData, ...data };

    if (currentStep < 6) {
      setFormData(mergedData);
      setCurrentStep((prev) => prev + 1);
      return;
    }

    const {
      name,
      slug,
      description,
      featured_activity,
      short_description,
      locations,
      categories,
      tags,
      attributes,
      media_gallery,
      pricing,
      seasonal_pricing,
      group_discounts,
      early_bird_discount,
      last_minute_discount,
      addons,
    } = mergedData;

    const finalData = {
      name,
      slug,
      description,
      featured_activity,
      short_description,
      locations,
      categories,
      tags,
      attributes,
      media_gallery,
      pricing,
      seasonal_pricing: isArray(mergedData.seasonal_pricing) ? mergedData.seasonal_pricing : [],
      group_discounts,
      early_bird_discount,
      last_minute_discount,
      addons,
    };

    // Handle Submission
    try {
      const res = await editActivity(id, finalData);
      if (res.success) {
        toast({ title: 'Activity Updated successfully!' });
        router.back(); // backroute
      } else {
        toast({
          title: 'Error',
          description: res.message,
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
    <div className="min-h-screen w-full bg-gray-50 py-12 sm:px-6 lg:px-8">
      <NavigationActivity title={'Edit Activity'} desciption={'Edit activity for your customers'} backurl={'/dashboard/admin/activities/'} />
      <div className="w-full space-y-8">
        <FormProvider {...methods}>
          <div className="w-full bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="mb-8 w-full">
              <ul className="flex justify-between gap-8 items-center w-full mb-4 flex-wrap md:flex-nowrap ">
                {steps &&
                  steps.map((step) => (
                    <li
                      key={step.id}
                      onClick={() => {
                        setCurrentStep(step?.id);
                      }}
                      className={`flex flex-col items-center w-full space-y-1 cursor-pointer group relative self-start`}
                    >
                      <Separator className={` pt-1 rounded-full ${currentStep >= step?.id && 'bg-secondaryDark group-hover:bg-blue-600 '}`} />

                      <div className={`text-sm font-medium pt-2`}>{step.title}</div>
                      <span className="text-sm text-gray-500">{step?.description}</span>
                      {step?.id === currentStep && !isValid && <span className="absolute top-full text-sm text-red-400">Field Requireds</span>}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <fieldset className={`space-y-6 ${isSubmitting && ' cursor-wait'}`} disabled={isSubmitting}>
              {renderStep()}
              <div className="flex justify-between pt-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Previous
                  </Button>
                )}

                {/* Display Cancel Button */}
                {currentStep < 2 && (
                  <Button
                    type="button"
                    onClick={() => {
                      router.back();
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </Button>
                )}

                <div className="flex gap-4">
                  {/* Display Cancel Button */}
                  {currentStep === 6 && (
                    <Button
                      type="button"
                      onClick={() => {
                        router.back();
                      }}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={isSubmitting} className={`ml-auto py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-secondaryDark cursor-pointer`}>
                    {isSubmitting ? (currentStep === 6 ? 'Submitting...' : 'Submit') : currentStep === 6 ? 'Submit' : 'Next'}
                  </Button>
                </div>
              </div>
            </fieldset>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
