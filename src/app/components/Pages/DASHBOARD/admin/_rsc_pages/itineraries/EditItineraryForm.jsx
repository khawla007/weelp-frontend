'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider, Controller, useFieldArray, useWatch, useFormContext } from 'react-hook-form';
import { Activity, CalendarIcon, Car, Clock, MapPin, Plus, Settings, Trash, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ComboboxMultiple, ComboboxMultipleAttribute } from '@/components/ui/combobox_multi';
import { addCommabetweenString, cn, generateSlug, removeNestedKey } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ActivitySearchModal, CustomizedEditActivityForm, CustomizedEditTransferForm, NavigationItinerary, TransferSearchModal } from './itinerary_shared';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { isEmpty } from 'lodash';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMediaStore } from '@/lib/store/useMediaStore';
import { Medialibrary } from '../media/MediaLibrary';
import { Card } from '@/components/ui/card';
import { deleteItineraryItems, editItinerary } from '@/lib/actions/itineraries'; // server actions for handling data
import dynamic from 'next/dynamic';

const SharedAddOnMultiSelect = dynamic(() => import('../shared_tabs/addon/SharedAddOn'), { ssr: false });

export const EditItineraryForm = ({ categories, attributes, tags, locations = [], allactivities, alltransfers, itineraryData }) => {
  const hasResetRef = useRef(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [toggleUpdate, setToggleUpdate] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // destructuring data
  const {
    id,
    name,
    slug,
    description,
    locations: presetLocation = [],
    featured_itinerary,
    private_itinerary,
    schedules = [],
    activities = [],
    transfers = [],
    base_pricing,
    price_variations = [],
    blackout_dates = [],
    inclusions_exclusions = [],
    media_gallery = [],
    seo,
    categories: presetCategories = [],
    tags: presetTags = [],
    attributes: presetAttributes = [],
    addons,
  } = itineraryData;

  // destructure schema
  const { schema_data } = seo;

  // set attributes preselected
  const initialAttributes = presetAttributes?.length
    ? presetAttributes.map(({ attribute_id, attribute_value }) => ({
        attribute_id,
        attribute_value,
      }))
    : [];

  // addons modify
  const initialAdd = Array.isArray(addons) ? addons.map((item) => item.addon_id) : [];

  // intial states
  const methods = useForm({
    shouldUnregister: false,
    mode: 'onSubmit',
    defaultValues: {
      name: name,
      slug: slug,
      description: description,
      locations: presetLocation,
      featured_itinerary: featured_itinerary || false,
      private_itinerary: private_itinerary || false,
      locations: presetLocation?.length ? presetLocation.map(({ city_id }) => city_id) : [],
      schedules: schedules,
      transfers: transfers,
      activities: activities,
      pricing: {
        currency: base_pricing?.currency ?? 'USD',
        availability: String(base_pricing?.availability).toLowerCase() ?? 'available',
        start_date: base_pricing?.start_date ?? '2025-06-01',
        end_date: base_pricing?.end_date ?? '2025-06-10',
      },
      price_variations: price_variations,
      blackout_dates: blackout_dates,
      inclusions_exclusions: inclusions_exclusions,
      media_gallery: media_gallery,
      seo: { ...seo, schema_data: JSON.parse(schema_data) },
      categories: presetCategories?.length ? presetCategories.map(({ category_id }) => category_id) : [],
      tags: presetTags?.length ? presetTags.map(({ tag_id }) => tag_id) : [],
      attributes: initialAttributes,
      addons: initialAdd,
    },
  });

  // Handle Global Level Error
  const { reset, getValues } = methods;
  const { errors, isValid, isSubmitting } = methods?.formState;

  /** Inline Actions Side Effects */
  useEffect(() => {
    methods.setValue('schedules', [...schedules]); // update side effect for schedules
  }, [toggleUpdate, schedules]);

  useEffect(() => {
    methods.setValue('activities', [...activities]); // update side effect for activities
  }, [toggleUpdate, activities]);

  useEffect(() => {
    methods.setValue('transfers', [...transfers]); // update side effect for transfers
  }, [toggleUpdate, transfers]);

  useEffect(() => {
    methods.setValue('price_variations', [...price_variations]); // update side effect for price variations
  }, [toggleUpdate, price_variations]);

  useEffect(() => {
    methods.setValue('blackout_dates', [...blackout_dates]); // update side effect for price variations
  }, [toggleUpdate, blackout_dates]);

  useEffect(() => {
    methods.setValue('inclusions_exclusions', [...inclusions_exclusions]); // update side effect for inclusions_exclusions
  }, [toggleUpdate, inclusions_exclusions]);

  //  Main Steps
  const steps = [
    {
      id: 1,
      title: 'Basic Information',
    },
    {
      id: 2,
      title: 'Schedule',
    },
    {
      id: 3,
      title: 'Pricing',
    },
    {
      id: 4,
      title: 'Inclusions',
    },
    {
      id: 5,
      title: 'Add On`s',
    },
    {
      id: 6,
      title: 'Media',
    },
    {
      id: 7,
      title: 'Seo',
    },
    {
      id: 8,
      title: 'Taxonomy',
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
        <h2 className="text-base font-semibold text-[#09090B]">Basic Information</h2>

        <div className="flex w-full gap-4">
          <div className="pb-2 space-y-2 w-full">
            <Label htmlFor="name" className={`block text-sm font-medium ${errors?.name ? 'text-red-400' : 'text-black'}`}>
              Itinerary Name
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

        {/* destination */}
        <div className="space-y-2">
          <Label htmlFor={'locations'} className={`block text-sm font-medium ${errors?.locations ? 'text-red-400' : 'text-black'}`}>
            Destinations
          </Label>
          <Controller
            control={methods.control}
            name="locations"
            rules={{ required: 'Locations Required' }}
            render={({ field: { value, onChange } }) => (
              <ComboboxMultiple
                id={'locations'}
                name="locations"
                type={'locations'} //Required
                items={locations} //Required
                value={value ?? []} //Required
                onChange={onChange} //Required
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
              control={methods.control}
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
              control={methods.control}
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
  };

  // Schedule Booking
  const ScheduleTab = () => {
    const [openDropdownForDay, setOpenDropdownForDay] = useState(null);
    const [modalContext, setModalContext] = useState({ type: '', day: null });
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [handleEdit, setHandleEdit] = useState({
      // State For Managing Edit Modal
      type: '',
      isEditOn: false,
      item: {},
    });

    const {
      register,
      control,
      watch,
      getValues,
      setValue,
      setError,
      clearErrors,
      formState: { errors },
    } = useFormContext();

    // Scheules Repeater
    const {
      fields: dayFields,
      append: addDay,
      remove: removeDay,
    } = useFieldArray({
      control,
      name: 'schedules',
    });

    //  Activitiy Repeater
    const {
      fields: activityFields,
      append: addActivity,
      update: updateActivity,
      remove: removeActivity,
    } = useFieldArray({
      control,
      name: 'activities',
    });

    //  Transfer Repeater
    const {
      fields: transferFields,
      append: addTransfer,
      update: updateTransfer,
      remove: removeTransfer,
    } = useFieldArray({
      control,
      name: 'transfers',
    });

    //local state of schedules
    const schedules = useWatch({ control, name: 'schedules' }); //prefix s to diffrentiate
    const activities = useWatch({ control, name: 'activities' }); //prefix s to diffrentiate
    const transferss = useWatch({ control, name: 'transfers' }); //prefix s to diffrentiate

    // Add Day with auto-incrementing value
    const handleAddDay = () => {
      const nextDay = dayFields.length + 1; //set to 1 default index
      addDay({ day: nextDay });
    };

    // Handle validation
    const handleValidationSchedule = (e) => {
      e.preventDefault();

      // check first schedules
      if (!isEmpty(schedules)) {
        clearErrors('schedules');
        setCurrentStep(currentStep + 1); //
      } else {
        setError('schedules', {
          type: 'manual',
          message: 'At least one schedule is required',
        });
      }
    };

    // Modal Handle
    const handleOpenModal = (type, day, dayindex) => {
      setDropdownOpen(false);
      setTimeout(() => {
        setModalContext({ type, day });
      }, 50);
    };

    // Close modal
    const handleCloseModal = () => {
      setModalContext({ type: '', day: '' });
    };

    // handle remove schedule day** server action
    const handleRemoveDay = async (item, itineraryId, dayIndex) => {
      // delete
      let deleted_schedule_ids = [];
      const { id } = schedules.find((schedule) => schedule?.day == item?.day); // day remove

      // prevent delete if not come from server side
      if (!id) {
        removeDay(dayIndex);
        return;
      }

      deleted_schedule_ids.push(id);

      // remove schedule
      try {
        const res = await deleteItineraryItems({
          itineraryId,
          deleted_schedule_ids,
        });

        if (res.success) {
          toast({
            title: 'Updated succesfully',
          });

          setToggleUpdate((prev) => !prev);
        } else {
          console.log('Failed to delete schedule:', res.error);
        }
      } catch (error) {
        // failed message
        toast({
          title: 'API call failed:' ?? error.message,
          variant: 'destructive',
        });
        console.log('API call failed:', error.message);
      }
    };

    // remove activity handle
    const removeActivityHandle = async (filteredActivity, itineraryId) => {
      const { id } = filteredActivity;

      // prevent api if it is local
      if (!id) {
        const updatedActivitys = activities.filter((activity) => !(activity?.id == filteredActivity?.id && activity?.day == filteredActivity?.day));
        setValue('activities', updatedActivitys);
        return;
      }

      // remove schedule
      try {
        const deleted_activity_ids = [];
        deleted_activity_ids.push(id);
        const res = await deleteItineraryItems({
          itineraryId,
          deleted_activity_ids,
        });

        if (res.success) {
          toast({
            title: 'Updated succesfully',
          });

          setToggleUpdate((prev) => !prev);
        } else {
          console.log('Failed to delete schedule:', res.error);
        }
      } catch (error) {
        // failed message
        toast({
          title: 'API call failed:' ?? error.message,
          variant: 'destructive',
        });
        console.log('API call failed:', error.message);
      }
    };

    // remove transfer handle
    const removeTransferHandle = async (filteredTransfer, itineraryId) => {
      const { id } = filteredTransfer;

      // Case: Local-only transfer
      if (!id) {
        const updatedTransfers = transferss.filter((transfer) => !(transfer?.id === filteredTransfer?.id && transfer?.day === filteredTransfer?.day));
        setValue('transfers', updatedTransfers);
        return;
      }

      // Case: Remove from backend
      try {
        const deleted_transfer_ids = [id];

        const res = await deleteItineraryItems({
          itineraryId,
          deleted_transfer_ids,
        });

        if (res.success) {
          toast({
            title: 'Transfer removed successfully',
          });

          // Refresh local state
          setToggleUpdate((prev) => !prev); // Assuming you're using this for refetch or `useEffect` sync
        } else {
          toast({
            title: 'Failed to remove transfer',
            description: res.error || 'Unexpected error occurred',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: 'API call failed',
          description: error?.message || 'Something went wrong',
          variant: 'destructive',
        });
      }
    };

    return (
      <div className="py-4 relative">
        {errors?.schedules && <p className="text-sm text-red-500">{errors?.schedules?.message}</p>}

        <div className="w-full flex justify-between items-center">
          <h3 className="text-base font-semibold text-[#09090B]">Daily Schedule</h3>
          <Button type="button" onClick={handleAddDay} className="bg-secondaryDark hover:bg-secondaryDark">
            + Add Day
          </Button>
        </div>

        {/* Days Repeater */}
        {dayFields &&
          dayFields.map(
            (
              item,
              index, // item refer to dayfield
            ) => (
              <div key={item?.id} className="space-y-4">
                <div className="flex items-center gap-4 mt-4 justify-between">
                  <Input
                    type="number"
                    {...register(`schedules.${index}.day`)}
                    defaultValue={item?.day}
                    className="max-w-xs focus-visible:ring-secondaryDark focus-visible:ring-1"
                    placeholder="Day"
                    readOnly
                  />
                  <Trash onClick={() => handleRemoveDay(item, id, index)} className=" cursor-pointer " size={20} />
                </div>

                <div className="flex flex-col space-y-4">
                  {/* Display Activities in Iteration */}
                  {!isEmpty(activities) ? (
                    activities
                      .filter((activity) => activity?.day == item.day) //
                      .map((filteredActivity, activityIndex) => (
                        <div key={activityIndex} className="p-4 flex w-full border rounded-md items-center gap-4">
                          <img
                            className="size-24"
                            src={
                              filteredActivity?.activitydata?.media_gallery?.[0]?.url ?? filteredActivity?.media_url?.[0]?.url ?? 'https://picsum.photos/100/100' // fallback image
                            }
                            alt={filteredActivity?.activitydata?.media_gallery?.[0]?.alt_text ?? filteredActivity?.media_url?.[0]?.alt_text ?? 'selectedschedule_image'}
                          />

                          <div className="space-y-2">
                            <p className="font-bold text-base">{filteredActivity?.activitydata?.name ?? filteredActivity?.activity_name}</p>
                            <div className="flex gap-2 flex-wrap">
                              <Clock /> {`${filteredActivity?.start_time} - ${filteredActivity?.end_time}`}
                              <Activity /> <b>Activity</b>
                              <Settings
                                onClick={() =>
                                  setHandleEdit({
                                    type: 'activity',
                                    isEditOn: true,
                                    item: filteredActivity,
                                  })
                                }
                              />
                              {/* <Trash onClick={() => removeActivityHandle(filteredActivity)} className=" cursor-pointer " size={20} /> */}
                              <Trash onClick={() => removeActivityHandle(filteredActivity, id)} className=" cursor-pointer " size={20} />
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p>No activities available for this day.</p>
                  )}

                  {/* Display Transfer in Iteration */}
                  {!isEmpty(transferss)
                    ? transferss
                        .filter((transfer) => transfer?.day == item.day)
                        .map((filteredTransfer, transferIndex) => (
                          <div key={transferIndex} className="p-4 flex w-full border rounded-md items-center gap-4">
                            <img
                              className="size-24"
                              src={filteredTransfer?.media_url?.[0]?.url ?? filteredTransfer?.transferData?.media_gallery?.[0]?.url ?? 'https://picsum.photos/100/100'}
                              alt={filteredTransfer?.media_url?.[0]?.url ?? filteredTransfer?.transferData?.media_gallery?.[0]?.url ?? 'itinerary_image'}
                            />

                            <div className="space-y-2">
                              <p className="font-bold text-base">{filteredTransfer?.transferData?.name ?? filteredTransfer?.transfer_name}</p>
                              <div className="flex gap-2 flex-wrap">
                                <Clock /> {`${filteredTransfer?.start_time} - ${filteredTransfer?.end_time}`}
                                <Car />
                                <b>Transfer</b>
                                <Settings
                                  onClick={() =>
                                    setHandleEdit({
                                      type: 'transfer',
                                      isEditOn: true,
                                      item: filteredTransfer,
                                    })
                                  }
                                />
                                <Trash onClick={() => removeTransferHandle(filteredTransfer, id)} className=" cursor-pointer " size={20} />
                              </div>
                            </div>
                          </div>
                        ))
                    : 'No Transfer this day'}

                  {/* Booking Type */}
                  <div className="w-full flex justify-center">
                    <DropdownMenu
                      open={openDropdownForDay == item.day}
                      onOpenChange={(isOpen) => {
                        setOpenDropdownForDay(isOpen ? item.day : null);
                      }}
                    >
                      <DropdownMenuTrigger>
                        <p className="bg-secondaryDark hover:bg-secondaryDark rounded-3xl p-2 text-white px-6 self-center">+ Add Item</p>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenDropdownForDay(null);
                            handleOpenModal('activity', item.day);
                          }}
                        >
                          <Car /> Add Activity
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenDropdownForDay(null);
                            handleOpenModal('transfer', item.day);
                          }}
                        >
                          <MapPin /> Add Transfer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Handle Modal  for Creating */}
                  {modalContext.type === 'activity' && modalContext.day == item.day && (
                    <ActivitySearchModal activities={allactivities} day={item?.day} addActivity={addActivity} onClose={handleCloseModal} />
                  )}
                  {/* Transfer Modal  */}
                  {modalContext.type === 'transfer' && modalContext.day === item.day && (
                    <TransferSearchModal day={item?.day} onClose={handleCloseModal} addTransfer={addTransfer} transfers={alltransfers} />
                  )}
                </div>

                {/* Edit Form Modal */}
                {/*Activity Edit Form */}
                {handleEdit?.isEditOn && handleEdit?.type === 'activity' && (
                  <CustomizedEditActivityForm
                    isEditOn={handleEdit.isEditOn}
                    selectedActivity={handleEdit?.item}
                    day={handleEdit?.item?.day}
                    updateActivity={updateActivity}
                    activities={activities}
                    onClose={() => setHandleEdit({ type: '', isEditOn: false })}
                  />
                )}

                {/*Transfer Edit Form */}
                {handleEdit?.isEditOn && handleEdit?.type === 'transfer' && (
                  <CustomizedEditTransferForm
                    isEditOn={handleEdit.isEditOn}
                    selectedTransfer={handleEdit?.item}
                    day={handleEdit?.item?.day}
                    updateTransfer={updateTransfer}
                    transfers={transferss}
                    onClose={() => setHandleEdit({ type: '', isEditOn: false })}
                  />
                )}
              </div>
            ),
          )}

        {/* Next Button */}
        <Button
          type="submit"
          onClick={handleValidationSchedule}
          className={`absolute right-0 -bottom-14 ml-auto py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-secondaryDark cursor-pointer`}
        >
          Next
        </Button>
      </div>
    );
  };

  // Pricing Tab
  const PricingTab = () => {
    const { control, register, watch, getValues, setValue } = useFormContext();

    const availability = watch('pricing.availability');
    const startDate = watch('pricing.start_date');
    const endDate = watch('pricing.end_date');

    // watched variations
    const watchedPriceVariations = useWatch({
      control,
      name: 'price_variations',
    });

    // watched blackouts
    const watchedBlackoutdates = useWatch({
      control,
      name: 'blackout_dates',
    });

    // Variations Fields
    const {
      fields: variationsFields,
      append: appendVariationField,
      remove: removeVariationField,
    } = useFieldArray({
      control,
      name: 'price_variations',
    });

    // Variations Fields
    const {
      fields: blackOutFields,
      append: appendBlackOutField,
      remove: removeBlackOutField,
    } = useFieldArray({
      control,
      name: 'blackout_dates',
    });

    // Handle for removing variations
    const handleRemoveVariationField = async (priceVariation, itineraryId, localVariationindex) => {
      const { id } = priceVariation;

      // suppose id exist
      if (!id) {
        removeVariationField(localVariationindex); // remove local field
        return;
      }

      // handle action
      try {
        const deleted_price_variation_ids = [];
        deleted_price_variation_ids.push(id);
        const res = await deleteItineraryItems({
          itineraryId,
          deleted_price_variation_ids,
        });

        if (res.success) {
          toast({
            title: 'Updated succesfully',
          });

          setToggleUpdate((prev) => !prev); // update listener
        } else {
          console.log('Failed to delete schedule:', res.error);
        }
      } catch (error) {
        // failed message
        toast({
          title: 'API call failed:' ?? error.message,
          variant: 'destructive',
        });
        console.log('API call failed:', error.message);
      }
    };

    // Handle For Remove Blackout Fields
    const handleRemoveBlackOutField = async (blackoutField, itineraryId, localVariationindex) => {
      const { id } = blackoutField;

      // suppose id exist
      if (!id) {
        removeBlackOutField(localVariationindex); // remove local field
        return;
      }

      // handle action
      try {
        const deleted_blackout_date_ids = [];
        deleted_blackout_date_ids.push(id);
        const res = await deleteItineraryItems({
          itineraryId,
          deleted_blackout_date_ids,
        });

        if (res.success) {
          toast({
            title: 'Updated succesfully',
          });

          setToggleUpdate((prev) => !prev); // update listener
        } else {
          console.log('Failed to delete schedule:', res.error);
        }
      } catch (error) {
        // failed message
        toast({
          title: 'API call failed:' ?? error.message,
          variant: 'destructive',
        });
        console.log('API call failed:', error.message);
      }
    };

    console.log(getValues('pricing'));
    return (
      <div className="flex flex-col justify-between py-2  rounded-md space-y-8">
        {/* Base Pricing */}
        <div className="flex flex-col space-y-4 border p-4 rounded-xl bg-white">
          <h3 className="text-lg font-medium text-gray-900">Base Pricing</h3>
          <div className="w-full  flex gap-4">
            <div className="w-full space-y-2">
              <Label htmlFor="currency" className="w-full">
                Currency
              </Label>
              <Controller
                name="pricing.currency"
                control={methods?.control}
                defaultValue="USD" //  Ensures it has a default value
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? 'USD'} //  Ensures it's never undefined
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

            {/* Availability */}
            <div className="w-full space-y-2">
              <Label htmlFor="availability" className="w-full">
                Availability
              </Label>
              <Controller
                name="pricing.availability"
                defaultValue="available" //
                control={methods?.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? 'available'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {[
                          { label: 'Always Available ', value: 'available' },
                          { label: 'Date Range', value: 'date_range' },
                        ].map((val, index) => {
                          return (
                            <SelectItem className={'capitalize'} key={index} value={val.value}>
                              {val.label}
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

          {/* Date Range Select */}
          {availability === 'date_range' && (
            <div className="flex w-full gap-4">
              {/* Start Date Picker */}
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="start_date">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="start_date" variant="outline" className={cn('justify-start text-left font-normal', !startDate && 'text-muted-foreground')}>
                      <CalendarIcon />
                      {startDate ? format(new Date(startDate), 'yyyy-MM-dd') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate ? new Date(startDate) : undefined}
                      onSelect={(date) => setValue('pricing.start_date', date?.toISOString().split('T')[0])}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date Picker */}
              <div className="flex flex-col gap-4 w-full">
                <Label htmlFor="end_date">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="end_date" variant="outline" className={cn('justify-start text-left font-normal', !endDate && 'text-muted-foreground')}>
                      <CalendarIcon />
                      {endDate ? format(new Date(endDate), 'yyyy-MM-dd') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Calendar mode="single" selected={endDate ? new Date(endDate) : undefined} onSelect={(date) => setValue('pricing.end_date', date?.toISOString().split('T')[0])} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>

        {/* Price variations */}
        <div className="space-y-4  border p-4 rounded-xl bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Price Variations</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendVariationField({
                  name: '',
                  regular_price: '',
                  sale_price: '',
                  max_guests: '',
                  description: '',
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add Variation
            </Button>
          </div>

          {watchedPriceVariations.map(
            (
              item,
              index, // variation field
            ) => (
              <div key={index} className="border p-4 rounded-xl space-y-4 relative">
                <div className="flex flex-nowwrap gap-6 items-center">
                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor={`price_variations.${index}.name`} className={errors?.price_variations?.[index]?.name ? 'text-red-400' : ''}>
                      Name
                    </Label>
                    <Input
                      id={`price_variations.${index}.name`}
                      {...register(`price_variations.${index}.name`, {
                        required: 'Name Required',
                      })}
                      type="text"
                      className="w-full"
                    />

                    {errors?.price_variations?.[index]?.name && <p className="text-sm text-red-400">{errors?.price_variations[index].name.message}</p>}
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor={`price_variations.${index}.regular_price`} className={errors?.price_variations?.[index]?.regular_price ? 'text-red-400' : ''}>
                      Regular Price
                    </Label>
                    <Input
                      id={`price_variations.${index}.regular_price`}
                      min="1"
                      type="number"
                      className="w-full"
                      {...register(`price_variations.${index}.regular_price`, {
                        required: 'Regular price is required',
                        setValueAs: (value) => {
                          const parsedValue = parseFloat(value);
                          return isNaN(parsedValue) ? 0 : parsedValue.toFixed(2); // Ensure two decimals
                        },
                      })}
                    />
                    {errors?.price_variations?.[index]?.regular_price && <p className="text-sm text-red-400">{errors?.price_variations[index].regular_price.message}</p>}
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor={`price_variations.${index}.sale_price`} className={errors?.price_variations?.[index]?.sale_price ? 'text-red-400' : ''}>
                      Sale Price
                    </Label>
                    <Input
                      id={`price_variations.${index}.sale_price`}
                      defaultValue="1"
                      min="0"
                      {...register(`price_variations.${index}.sale_price`, {
                        required: 'Sale price is required',
                      })}
                      type="number"
                      className="w-full"
                    />
                    {errors?.price_variations?.[index]?.sale_price && <p className="text-sm text-red-400">{errors?.price_variations[index].sale_price.message}</p>}
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor={`price_variations.${index}.max_guests`}>Max Guests</Label>
                    <Input
                      id={`price_variations.${index}.max_guests`}
                      min="1"
                      {...register(`price_variations.${index}.max_guests`, {
                        required: 'Field Required',
                      })}
                      type="number"
                      defaultValue="1"
                      className="w-full"
                    />
                    {errors?.price_variations?.[index]?.max_guests && <p className="text-sm text-red-400">{errors?.price_variations[index]?.desciption?.message}</p>}
                  </div>

                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor={`price_variations.${index}.description`} className={`${errors?.price_variations?.[index]?.description?.message ? 'text-red-400' : ''}`}>
                      Description
                    </Label>
                    <Input
                      defaultValue=""
                      id={`price_variations.${index}.description`}
                      {...register(`price_variations.${index}.description`, {
                        required: 'Description Required',
                      })}
                      className="w-full"
                    />
                    {errors?.price_variations?.[index]?.description && <p className="text-sm text-red-400">{errors?.price_variations[index]?.description.message}</p>}
                  </div>
                  <div className="hover:bg-white flex items-center justify-center">
                    {/* <Trash2 className="cursor-pointer text-red-400" onClick={() =>removeVariationField(index)} /> */}
                    <Trash2 className="cursor-pointer text-red-400" onClick={() => handleRemoveVariationField(item, id, index)} />
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        {/* BlackOut Fields */}
        <div className="space-y-4 border p-4 rounded-xl bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Blackout Dates</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendBlackOutField({
                  date: '',
                  reason: '',
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Add BlackOut Date
            </Button>
          </div>

          {watchedBlackoutdates.map((item, index) => (
            <div key={index} className="space-y-4 border p-4 rounded-xl relative">
              <div className="flex flex-nowwrap gap-6 items-center">
                <div className="flex flex-col gap-2 w-fit">
                  <Label htmlFor={`blackout_dates.${index}.date`} className={errors?.blackout_dates?.[index]?.date ? 'text-red-400' : ''}>
                    Date
                  </Label>
                  <Controller
                    key={index}
                    name={`blackout_dates.${index}.date`}
                    control={control}
                    rules={{ required: 'Field Required' }}
                    defaultValue={format(Date.now(), 'yyyy-MM-dd')}
                    render={({ field: { onChange, value } }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn('w-[240px] justify-start text-left font-normal', !value && 'text-muted-foreground')}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {value ? value : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={value ? new Date(value) : undefined}
                            onSelect={(selectedDate) => {
                              if (selectedDate) {
                                onChange(format(selectedDate, 'yyyy-MM-dd')); // Store it as string in "yyyy-MM-dd"
                              }
                            }}
                            disabled={
                              (date) => date < new Date(new Date().setHours(0, 0, 0, 0)) // Disable past dates
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />

                  {errors?.blackout_dates?.[index]?.date && <p className="text-sm text-red-500 mt-1">{errors?.blackout_dates[index]?.date?.message}</p>}
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <Label htmlFor={`blackout_dates.${index}.reason`}>Reason</Label>
                  <Input id={`blackout_dates.${index}.reason`} min="1" {...register(`blackout_dates.${index}.reason`)} defaultValue="1" className="w-full" placeholder="Optional Reason For BlackOut" />
                </div>

                <div className="hover:bg-white flex items-center justify-center">
                  <Trash2 className="cursor-pointer text-red-400" onClick={() => handleRemoveBlackOutField(item, id, index)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Inclusion Tab
  const InclusionTab = () => {
    const { control, register, getValues } = useFormContext();

    // watched variations
    const watchedInclusion = useWatch({
      control,
      name: 'inclusions_exclusions',
    });

    //Repater Fields
    const {
      fields: inclusionFields,
      append: addInclusionField,
      remove: removeInclusionField,
      move: moveInclusion,
    } = useFieldArray({
      control,
      name: 'inclusions_exclusions',
    });

    // Type
    const selecType = [
      { title: 'Activity', value: 'activity' },
      { title: 'Transfer', value: 'transfer' },
      { title: 'Meal', value: 'meal' },
      { title: 'Accommodation', value: 'accommodation' },
      { title: 'Equipment', value: 'equipment' },
      { title: 'Other', value: 'other' },
    ];

    // Handle For Adding Fields
    const handleAddInclustionField = () => {
      addInclusionField({ type: '', title: '', description: '', included: '' });
    };

    // Handle For Removing Inclustion Fields
    const handleRemoveInclusionField = async (inclusionField, itineraryId, localIndex) => {
      const { id } = inclusionField;

      // suppose id exist
      if (!id) {
        removeInclusionField(localIndex); // remove local field
        return;
      }

      // handle action
      try {
        const deleted_inclusion_exclusion_ids = [];
        deleted_inclusion_exclusion_ids.push(id);
        const res = await deleteItineraryItems({
          itineraryId,
          deleted_inclusion_exclusion_ids,
        });

        if (res.success) {
          toast({
            title: 'Updated succesfully',
          });

          setToggleUpdate((prev) => !prev); // update listener
        } else {
          console.log('Failed to delete schedule:', res.error);
        }
      } catch (error) {
        // failed message
        toast({
          title: 'API call failed:' ?? error.message,
          variant: 'destructive',
        });
        console.log('API call failed:', error.message);
      }
    };

    return (
      <div className="flex flex-col justify-between py-2 rounded-md space-y-8">
        <div className="flex justify-between">
          <h3 className="text-base font-bold text-gray-900 ">Inclusion & Exclusions</h3>
          <Button className="bg-white text-black border hover:bg-accent hover:accent-black" onClick={handleAddInclustionField}>
            + Add Item
          </Button>
        </div>

        {watchedInclusion.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-4 border p-4 rounded-xl bg-white">
            <div className="self-start">
              <Label htmlFor={`inclusions_exclusions.${index}.type`}>Type</Label>
              <Controller
                control={control}
                name={`inclusions_exclusions.${index}.type`}
                defaultValue=""
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-[180px] focus:ring-secondaryDark">
                      <SelectValue placeholder="activity" />
                    </SelectTrigger>
                    <SelectContent>
                      {selecType.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">{option.title}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="w-full self-start">
              <Label htmlFor={`inclusions_exclusions.${index}.title`} className={`${errors?.inclusions_exclusions?.[index]?.title && 'text-red-400'}`}>
                Title
              </Label>
              <Input
                id={`inclusions_exclusions.${index}.title`}
                className="focus-visible:ring-secondaryDark"
                placeholder="Enter Title"
                {...register(`inclusions_exclusions.${index}.title`, {
                  required: 'Field Required',
                })}
              />
              {errors?.inclusions_exclusions?.[index]?.title && <p className="text-sm text-red-400 mt-1">{errors?.inclusions_exclusions?.[index]?.title?.message}</p>}
            </div>

            <div className="w-full self-start">
              <Label htmlFor={`inclusions_exclusions.${index}.description`}>Description</Label>
              <Textarea
                id={`inclusions_exclusions.${index}.description`}
                className="focus-visible:ring-secondaryDark"
                placeholder="Enter Description"
                {...register(`inclusions_exclusions.${index}.description`)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                control={control}
                name={`inclusions_exclusions.${index}.included`}
                defaultValue={false}
                render={({ field }) => (
                  <Switch id={`inclusions_exclusions.${index}.included`} checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-secondaryDark" />
                )}
              />
              <Label htmlFor={`inclusions_exclusions.${index}.included`}>Included</Label>
            </div>

            <div>
              <Trash className="cursor-pointer" onClick={() => handleRemoveInclusionField(item, id, index)} />
            </div>
          </div>
        ))}
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

    // console.log(getValues())
    return (
      <div className="flex flex-col gap-4">
        <div className="hidden">
          <Controller
            control={methods?.control}
            name="media_gallery"
            // defaultValue={[]}
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
                  <img className="size-72 rounded-md border" src={image?.url} alt="activity_image" />
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

  // SEO Tab
  const SeoTab = () => {
    //schema types
    const schemaTypes = [
      {
        value: 'Product',
        label: 'Product',
        template: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: '',
          description: '',
          image: '',
          offers: {
            '@type': 'Offer',
            price: '',
            priceCurrency: 'USD',
          },
        },
      },
      {
        value: 'TouristAttraction',
        label: 'Tourist Attraction',
        template: {
          '@context': 'https://schema.org',
          '@type': 'TouristAttraction',
          name: '',
          description: '',
          image: '',
          address: {
            '@type': 'PostalAddress',
            addressLocality: '',
            addressRegion: '',
            addressCountry: '',
          },
        },
      },
      {
        value: 'TouristTrip',
        label: 'Tourist Trip',
        template: {
          '@context': 'https://schema.org',
          '@type': 'TouristTrip',
          name: '',
          description: '',
          touristType: {
            '@type': 'Audience',
            audienceType: '',
          },
          itinerary: {
            '@type': 'ItemList',
            itemListElement: [],
          },
        },
      },
      {
        value: 'Service',
        label: 'Service',
        template: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: '',
          description: '',
          provider: {
            '@type': 'Organization',
            name: '',
          },
        },
      },
    ];

    const [openItem, setOpenItem] = useState('item-1'); // set default open
    const {
      register,
      control,
      setValue,
      getValues,
      setError,
      clearErrors,
      formState: { errors },
    } = useFormContext();

    const [jsonInput, setJsonInput] = useState('');
    const [validationState, setValidationState] = useState({
      isValid: true,
      message: '',
      showMessage: false,
    });

    // Get selected schema type from form
    const selectedSchemaType = useWatch({
      control,
      name: 'seo.schema_type',
    });

    // GET selected schema data from form
    const selectedSchemaData = useWatch({
      control,
      name: 'seo.schema_data',
    });

    // Meta Title
    const metaTitle = useWatch({
      control,
      name: 'seo.meta_title',
    });

    // Meta Description
    const metaDescription = useWatch({
      control,
      name: 'seo.meta_description',
    });

    // Sync selectedSchemaType with JSON template
    useEffect(() => {
      const selectedSchema = schemaTypes.find((s) => s.value === selectedSchemaType);
      if (selectedSchema) {
        setJsonInput(JSON.stringify(selectedSchema.template, null, 2));
      }
    }, [selectedSchemaType]);

    // update with latest value
    useEffect(() => {
      if (!jsonInput.trim()) {
        setJsonInput(JSON.stringify(selectedSchemaData || {}, null, 2));
      }
    }, [selectedSchemaData]);
    // Handle JSON validation and update
    const handleJsonUpdate = () => {
      // Validate JSON only when button is clicked
      let isValid = true;
      try {
        // Clear any previous errors
        clearErrors('schema_data');

        if (jsonInput.trim()) {
          setJsonInput(JSON.parse(jsonInput));
          setValue('seo.schema_data', JSON.parse(jsonInput));
        } else {
          isValid = false;
        }
      } catch (error) {
        isValid = false;
      }

      // Update validation state
      setValidationState({
        isValid,
        message: isValid ? 'Success! Schema JSON is valid and has been updated.' : 'Error! Invalid JSON format. Please correct and try again.',
        showMessage: true,
      });

      // If valid, update the hidden schema_markup field in the form
      if (!isValid) {
        setError('schema_data', {
          type: 'manual',
          message: 'Invalid JSON format. Please fix the syntax.',
        });
      }

      // Hide message after 3 seconds
      setTimeout(() => {
        setValidationState((prevState) => ({
          ...prevState,
          showMessage: false,
        }));
      }, 3000);
    };

    return (
      <Accordion
        type="single"
        collapsible
        value={openItem}
        onValueChange={(value) => {
          if (value) setOpenItem(value);
        }}
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="hover:bg-gray-50 px-4">
            <h2 className="text-black font-semibold text-xl">Basic Settings</h2>
          </AccordionTrigger>
          <AccordionContent className="px-2 space-y-4">
            <div className="space-y-2">
              <Label className={`${errors?.seo?.meta_title?.message && 'text-red-400'}`}>Meta Title</Label>
              <Input
                type="text"
                maxLength="60"
                placeholder="Enter meta title"
                className="focus-visible:ring-secondaryDark"
                {...register('seo.meta_title', {
                  required: 'Meta Title Required',
                })}
              />
              <span className="block text-xs p-1 text-gray-500">{`${String(metaTitle || '').length}/60`} Characters</span>
              {errors?.seo?.meta_title && <p className="text-red-400 text-sm">{errors?.seo?.meta_title?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className={`${errors?.seo?.meta_description?.message && 'text-red-400'}`}>Meta Description</Label>
              <Input
                type="text"
                placeholder="Enter meta description"
                maxLength="160"
                className="focus-visible:ring-secondaryDark"
                {...register('seo.meta_description', {
                  required: 'Meta Description Required',
                })}
              />
              <span className="block text-xs p-1 text-gray-500">{`${String(metaDescription || '').length}/160`} Characters</span>
              {errors?.seo?.meta_description && <p className="text-red-400 text-sm">{errors?.seo?.meta_description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className={`${errors?.seo?.keywords?.message && 'text-red-400'}`}>Keywords</Label>
              <Input
                type="text"
                placeholder="Enter keywords separated by commas"
                className="focus-visible:ring-secondaryDark"
                {...register('seo.keywords', {
                  required: 'Keywords Required',
                  onBlur: (e) => {
                    const formatted = addCommabetweenString(e.target.value);
                    setValue('seo.keywords', formatted);
                  },
                })}
              />
              {errors?.seo?.keywords && <p className="text-red-400 text-sm">{errors?.seo?.keywords?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className={`${errors?.seo?.og_image_url?.message && 'text-red-400'}`}>OG Image Url</Label>
              <Input
                type="url"
                placeholder="e.g: https://example.com/sample-og.jpg"
                className="focus-visible:ring-secondaryDark"
                {...register('seo.og_image_url', {
                  required: 'og_image_url Required',
                })}
              />
              {errors?.seo?.og_image_url && <p className="text-red-400 text-sm">{errors?.seo?.og_image_url?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className={`${errors?.seo?.canonical_url?.message && 'text-red-400'}`}>Canonical Url</Label>
              <Input
                type="url"
                placeholder="e.g: https://example.com/"
                className="focus-visible:ring-secondaryDark"
                {...register('seo.canonical_url', {
                  required: 'canonical_url Required',
                })}
              />
              {errors?.seo?.canonical_url && <p className="text-red-400 text-sm">{errors?.seo?.canonical_url?.message}</p>}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="hover:bg-gray-50 px-4">
            <h2 className="text-black font-semibold text-xl">Schema Markup</h2>
            {errors?.schema_data?.message && <div className="bg-red-100 text-red-800">{errors?.schema_data?.message}</div>}
          </AccordionTrigger>
          <AccordionContent className="px-2 flex flex-col">
            <Card className="p-8 space-y-4">
              <div>
                <Label>Select Schema Type</Label>
                <Controller
                  control={control}
                  name="seo.schema_type"
                  defaultValue="Product"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schema" />
                      </SelectTrigger>
                      <SelectContent>
                        {schemaTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label>Edit JSON-LD</Label>
                <Textarea
                  className={`font-mono text-sm h-96 resize-none ${validationState.showMessage ? (validationState.isValid ? 'border-green-500' : 'border-red-500') : ''}`}
                  value={jsonInput}
                  placeholder={selectedSchemaData ? JSON.stringify(selectedSchemaData, null, 2) : 'Schema data will appear here...'}
                  onChange={(e) => setJsonInput(e.target.value)}
                />

                <input type="hidden" {...register('seo.schema_data')} />
              </div>

              <Button type="button" onClick={handleJsonUpdate}>
                Validate & Update Schema
              </Button>

              {validationState.showMessage && (
                <div className={`p-4 rounded-md text-sm ${validationState.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{validationState.message}</div>
              )}
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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
            defaultValue={[]}
            control={methods?.control}
            rules={{ required: 'Please Select Attributes' }}
            render={({ field: { onChange, value } }) => <ComboboxMultipleAttribute id={'attributes'} attributes={attributes} value={value} onChange={onChange} />}
          />

          {errors?.attributes && <span className="text-red-400">{errors?.attributes?.message}</span>}
        </div>
      </div>
    );
  };

  /**
   * Handle Rendering Components Based on Step id
   * @returns function
   */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoTab />;
      case 2:
        return <ScheduleTab />;
      case 3:
        return <PricingTab />;
      case 4:
        return <InclusionTab />;
      case 5:
        return <SharedAddOnMultiSelect />;
      case 6:
        return <MediaTab />;
      case 7:
        return <SeoTab />;
      case 8:
        return <TaxonomiesAttributesTab />;
      default:
        return null;
    }
  };

  // Submit Data
  const onSubmit = async (data) => {
    const mergedData = { ...formData, ...data };

    if (currentStep < 8) {
      setFormData(mergedData);
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Cleaning of Data
    const { activities: dirtyActivities, transfers: dirtyTransfers, inclusions_exclusions: dirty_inclusions_exclusions, media_gallery: dirtyMedia_gallery } = mergedData;

    const activities = removeNestedKey(dirtyActivities, 'media_url');
    const transfers = removeNestedKey(dirtyTransfers, 'media_url');
    const inclusions_exclusions = removeNestedKey(dirty_inclusions_exclusions, ['created_at', 'updated_at']);
    const media_gallery = removeNestedKey(dirtyMedia_gallery, ['name', 'url', 'alt_text', 'itinerary_id']);

    let finalData = _.set(mergedData, 'activities', activities); // add new activites
    finalData = _.set(mergedData, 'transfers', transfers); // add new transfers
    finalData = _.set(finalData, 'inclusions_exclusions', inclusions_exclusions); // add new inclusion exclusion
    finalData = _.set(finalData, 'media_gallery', media_gallery);

    // Final step: submit full data
    try {
      const res = await editItinerary(id, finalData); // Edit Itinerary Based ON id

      if (res.success) {
        toast({ title: 'Itinerary Updated successfully!' });

        // success reset
        reset();
        router.push('/dashboard/admin/itineraries');
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
    <div className="min-h-screen w-full bg-gray-50 py-12 sm:px-6 lg:px-8">
      <NavigationItinerary title={'Edit Itinerary'} desciption={'Build a new itinerary with schedule, pricing, and more'} backurl={'/dashboard/admin/itineraries/'} />
      <div className="w-full space-y-4">
        <FormProvider {...methods}>
          <div className="w-full">
            <div className="w-full">
              <ul className="w-fit flex justify-between items-center">
                {steps &&
                  steps.map((step) => (
                    <li
                      key={step.id}
                      // onClick={() => {setCurrentStep(step?.id)}}
                      className={`flex flex-col items-center w-full space-y-1 cursor-pointer group relative p-4 duration-300 ease-in-out group hover:bg-gray-100 ${
                        currentStep == step?.id && ' bg-gradient-to-t from-[#c7ffc02e] to-slate-50 border-b-secondaryDark border-b-2'
                      }`}
                    >
                      <div
                        className={`text-sm font-medium pt-2 w-full text-nowrap duration-300 ease-in-out ${!currentStep == step?.id && ' group-hover:text-gray-800'} ${
                          currentStep == step?.id ? 'text-secondaryDark ' : 'text-grayDark'
                        }`}
                      >
                        {step.title}
                      </div>
                    </li>
                  ))}
              </ul>
              <Separator className="" />
            </div>
          </div>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <fieldset className={`${currentStep === 3 ? '' : 'bg-white p-2 px-8 border shadow rounded-lg'} ${isSubmitting && ' cursor-wait'}`} disabled={isSubmitting}>
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

                {/* Displaying Cancel Button On Starting */}
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

                {/* Prevent Button On Schedules */}
                {currentStep === 2 ? null : (
                  <div className="flex gap-4">
                    {/* Display Cancel Button Final Step */}
                    {currentStep === 8 && (
                      <Button
                        type="button"
                        onClick={() => {
                          router.back();
                        }}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-800 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting} className={`ml-auto py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-secondaryDark cursor-pointer`}>
                      {isSubmitting ? (currentStep === 8 ? 'Submitting...' : 'Submit') : currentStep === 8 ? 'Submit' : 'Next'}
                    </Button>
                  </div>
                )}
              </div>
            </fieldset>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
