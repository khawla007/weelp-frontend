'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider, useFieldArray, useWatch, useFormContext } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { submitCreatorItineraryDraft } from '@/lib/actions/creatorItineraries';
import { getAllCitiesAdmin } from '@/lib/services/global';
import { getAllActivitesAdmin } from '@/lib/services/activites';
import { getAllTransfersAdmin } from '@/lib/services/transfers';
import { cn, generateSlug } from '@/lib/utils';

// Reused PersonalInfoTab from dashboard (Step 1)
const PersonalInfoTab = ({ locationsOptions }) => {
  const {
    register,
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
          <label htmlFor="name" className={cn('block text-sm font-medium', errors?.name ? 'text-red-400' : 'text-black')}>
            Itinerary Name <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="Itinerary name"
            id="name"
            {...register('name', { required: 'Name is required' })}
            className="mt-1 p-2 text-sm block w-full rounded-md border border-gray-300 shadow-sm focus-visible:ring-secondaryDark focus-visible:outline-none"
            onBlur={handleBlur}
          />
          {errors?.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div className="pb-2 space-y-2 w-full">
          <label htmlFor="slug" className={cn('block text-sm font-medium', errors?.slug ? 'text-red-400' : 'text-black')}>
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="Enter URL slug"
            id="slug"
            {...register('slug', { required: 'Slug is required' })}
            className="mt-1 p-2 text-sm block w-full rounded-md border border-gray-300 shadow-sm focus-visible:ring-secondaryDark focus-visible:outline-none"
            onBlur={handleBlur}
          />
          {errors?.slug && <p className="text-red-500 text-sm mt-1">{errors?.slug.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className={cn('block text-sm font-medium', errors?.description ? 'text-red-400' : 'text-black')}>
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          placeholder="Detailed description"
          id="description"
          {...register('description', { required: 'Description is required' })}
          className="mt-1 p-2 text-sm block w-full rounded-md border border-gray-300 shadow-sm focus-visible:ring-secondaryDark focus-visible:outline-none min-h-[120px]"
        />
        {errors?.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="locations" className={cn('block text-sm font-medium', errors?.locations ? 'text-red-400' : 'text-black')}>
          Destinations <span className="text-red-500">*</span>
        </label>
        <select
          id="locations"
          multiple
          {...register('locations', { required: 'Locations Required' })}
          className="mt-1 p-2 text-sm block w-full rounded-md border border-gray-300 shadow-sm focus-visible:ring-secondaryDark focus-visible:outline-none min-h-[100px]"
          aria-label="Select destinations for itinerary"
        >
          {locationsOptions.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        {errors?.locations && <span className="text-red-400">{errors?.locations?.message}</span>}
        <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple cities</p>
      </div>
    </div>
  );
};

// Reused ScheduleTab from dashboard (Step 2)
const ScheduleTab = ({ allactivities, alltransfers }) => {
  const [openDropdownForDay, setOpenDropdownForDay] = useState(null);
  const [modalContext, setModalContext] = useState({ type: '', day: null });
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

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

  const {
    fields: dayFields,
    append: addDay,
    remove: removeDay,
    update: updateDay,
  } = useFieldArray({
    control,
    name: 'schedules',
  });

  const {
    fields: activityFields,
    append: addActivity,
    remove: removeActivity,
  } = useFieldArray({
    control,
    name: 'activities',
  });

  const {
    fields: transferFields,
    append: addTransfer,
    remove: removeTransfer,
  } = useFieldArray({
    control,
    name: 'transfers',
  });

  const schedules = useWatch({ control, name: 'schedules' });
  const activities = useWatch({ control, name: 'activities' });
  const transfers = useWatch({ control, name: 'transfers' });
  const selectedLocations = useWatch({ control, name: 'locations' });

  const handleAddDay = () => {
    const nextDay = dayFields.length + 1;
    addDay({ day: nextDay, title: '' });
  };

  const handleOpenModal = (type, day) => {
    setModalContext({ type, day });
  };

  const handleCloseModal = () => {
    setModalContext({ type: '', day: null });
    setSelectedActivity(null);
    setSelectedTransfer(null);
  };

  const handleAddActivity = () => {
    if (selectedActivity && modalContext.day) {
      addActivity({
        day: modalContext.day,
        activity_id: selectedActivity.id,
        name: selectedActivity.name,
        start_time: '09:00',
        end_time: '10:00',
        price: selectedActivity.price,
        included: true,
      });
      handleCloseModal();
    }
  };

  const handleAddTransfer = () => {
    if (selectedTransfer && modalContext.day) {
      addTransfer({
        day: modalContext.day,
        transfer_id: selectedTransfer.id,
        name: selectedTransfer.name,
        start_time: '10:00',
        end_time: '11:00',
        price: selectedTransfer.price,
        included: true,
      });
      handleCloseModal();
    }
  };

  const handleRemoveActivity = (index) => {
    removeActivity(index);
  };

  const handleRemoveTransfer = (index) => {
    removeTransfer(index);
  };

  const filteredActivities = (allactivities || []).filter((a) => {
    if (!selectedLocations || selectedLocations.length === 0) return true;
    return selectedLocations.some((loc) => a.city_id === Number(loc));
  });

  const filteredTransfers = (alltransfers || []).filter((t) => {
    if (!selectedLocations || selectedLocations.length === 0) return true;
    return selectedLocations.some((loc) => {
      const route = t.vendor_routes;
      return route && (route.pickup_city_id === Number(loc) || route.dropoff_city_id === Number(loc));
    });
  });

  return (
    <div className="py-4 relative">
      {errors?.schedules && <p className="text-sm text-red-500 mb-4">{errors?.schedules?.message}</p>}

      <div className="w-full flex justify-between items-center">
        <h3 className="text-base font-semibold text-[#09090B]">Daily Schedule</h3>
        <button type="button" onClick={handleAddDay} className="bg-secondaryDark hover:bg-secondaryDark text-white px-4 py-2 rounded-md text-sm font-medium">
          + Add Day
        </button>
      </div>

      {dayFields.map((item, index) => (
        <div key={item.id} className="space-y-4 mt-4 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-4 justify-between">
            <input type="number" {...register(`schedules.${index}.day`)} value={item.day} readOnly className="w-20 p-2 border border-gray-300 rounded-md bg-gray-50" />
            <input type="text" {...register(`schedules.${index}.title`)} placeholder="e.g., Arrival in Port Blair" className="flex-1 p-2 border border-gray-300 rounded-md" />
            <button type="button" onClick={() => removeDay(index)} className="text-red-500 hover:text-red-700 p-2">
              Remove
            </button>
          </div>

          <div className="space-y-2">
            {activities
              .filter((a) => a.day === item.day)
              .map((activity, aIdx) => {
                const originalIndex = activities.indexOf(activity);
                // Use a stable unique identifier combining day, type, and activity_id
                const stableKey = `${activity.day}-activity-${activity.activity_id}-${aIdx}`;
                return (
                  <div key={stableKey} className="p-3 flex items-center justify-between border rounded-md bg-gray-50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.name || `Activity #${activity.activity_id}`}</p>
                      <p className="text-xs text-gray-500">
                        {activity.start_time} - {activity.end_time}
                      </p>
                    </div>
                    <button type="button" onClick={() => handleRemoveActivity(originalIndex)} className="text-red-500 hover:text-red-700 p-1">
                      Remove
                    </button>
                  </div>
                );
              })}

            {transfers
              .filter((t) => t.day === item.day)
              .map((transfer, tIdx) => {
                const originalIndex = transfers.indexOf(transfer);
                // Use a stable unique identifier combining day, type, and transfer_id
                const stableKey = `${transfer.day}-transfer-${transfer.transfer_id}-${tIdx}`;
                return (
                  <div key={stableKey} className="p-3 flex items-center justify-between border rounded-md bg-blue-50">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{transfer.name || `Transfer #${transfer.transfer_id}`}</p>
                      <p className="text-xs text-gray-500">
                        {transfer.start_time} - {transfer.end_time}
                      </p>
                    </div>
                    <button type="button" onClick={() => handleRemoveTransfer(originalIndex)} className="text-red-500 hover:text-red-700 p-1">
                      Remove
                    </button>
                  </div>
                );
              })}

            <div className="flex justify-center pt-2">
              <select
                value=""
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'activity') handleOpenModal('activity', item.day);
                  else if (value === 'transfer') handleOpenModal('transfer', item.day);
                  e.target.value = '';
                }}
                className="bg-secondaryDark hover:bg-secondaryDark text-white px-4 py-2 rounded-full cursor-pointer"
                aria-label="Add activity or transfer to schedule"
              >
                <option value="" disabled>
                  + Add Item
                </option>
                <option value="activity">Add Activity</option>
                <option value="transfer">Add Transfer</option>
              </select>
            </div>
          </div>

          {/* Activity Selection Modal */}
          {modalContext.type === 'activity' && modalContext.day === item.day && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Select Activity</h3>
                <div className="space-y-2">
                  {filteredActivities.length === 0 ? (
                    <p className="text-gray-500">No activities available. Please select destinations first.</p>
                  ) : (
                    filteredActivities.map((activity) => (
                      <div
                        key={activity.id}
                        onClick={() => setSelectedActivity(activity)}
                        className={cn('p-3 border rounded-md cursor-pointer', selectedActivity?.id === activity.id ? 'bg-secondaryDark/10 border-secondaryDark' : 'hover:bg-gray-50')}
                      >
                        <p className="font-medium text-sm">{activity.name}</p>
                        <p className="text-xs text-gray-500">${activity.price || 0}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-md">
                    Cancel
                  </button>
                  <button type="button" onClick={handleAddActivity} disabled={!selectedActivity} className="px-4 py-2 bg-secondaryDark text-white rounded-md disabled:opacity-50">
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transfer Selection Modal */}
          {modalContext.type === 'transfer' && modalContext.day === item.day && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Select Transfer</h3>
                <div className="space-y-2">
                  {filteredTransfers.length === 0 ? (
                    <p className="text-gray-500">No transfers available. Please select destinations first.</p>
                  ) : (
                    filteredTransfers.map((transfer) => (
                      <div
                        key={transfer.id}
                        onClick={() => setSelectedTransfer(transfer)}
                        className={cn('p-3 border rounded-md cursor-pointer', selectedTransfer?.id === transfer.id ? 'bg-secondaryDark/10 border-secondaryDark' : 'hover:bg-gray-50')}
                      >
                        <p className="font-medium text-sm">{transfer.name}</p>
                        <p className="text-xs text-gray-500">${transfer.price || 0}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 border border-gray-300 rounded-md">
                    Cancel
                  </button>
                  <button type="button" onClick={handleAddTransfer} disabled={!selectedTransfer} className="px-4 py-2 bg-secondaryDark text-white rounded-md disabled:opacity-50">
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function CreateItineraryModal({ open, onOpenChange, session }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const { toast } = useToast();

  const methods = useForm({
    mode: 'all',
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      locations: [],
      featured_itinerary: false,
      private_itinerary: false,
      schedules: [],
      activities: [],
      transfers: [],
    },
  });

  // Watch for validation
  const nameValue = useWatch({ control: methods.control, name: 'name' });
  const slugValue = useWatch({ control: methods.control, name: 'slug' });
  const descriptionValue = useWatch({ control: methods.control, name: 'description' });
  const locationsValue = useWatch({ control: methods.control, name: 'locations' });

  const isStep1Valid = !!(nameValue?.trim() && slugValue?.trim() && descriptionValue?.trim() && locationsValue && locationsValue.length > 0);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [locationsRes, activitiesRes, transfersRes] = await Promise.all([getAllCitiesAdmin(), getAllActivitesAdmin(), getAllTransfersAdmin()]);

        if (locationsRes.data?.data) {
          setLocations(locationsRes.data.data);
        }
        if (activitiesRes.data?.data) {
          setActivities(activitiesRes.data.data);
        }
        if (transfersRes?.data) {
          setTransfers(transfersRes.data);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          variant: 'destructive',
          title: 'Error loading data',
          description: 'Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadData();
    }
  }, [open, toast]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      methods.reset();
      setCurrentStep(1);
    }
  }, [open, methods]);

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await methods.trigger(['name', 'slug', 'description', 'locations']);
      if (!isValid) return;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const schedules = methods.getValues('schedules');
    if (!schedules || schedules.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please add at least one day to your schedule.',
      });
      return;
    }

    const activities = methods.getValues('activities');
    const transfers = methods.getValues('transfers');
    const hasItems = (activities && activities.length > 0) || (transfers && transfers.length > 0);
    if (!hasItems) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please add at least one activity or transfer to your schedule.',
      });
      return;
    }

    setSubmitting(true);

    const formData = methods.getValues();

    // Convert locations array to numbers
    const cleanedData = {
      ...formData,
      locations: Array.isArray(formData.locations) ? formData.locations.map((l) => (typeof l === 'string' ? parseInt(l, 10) : l)) : [],
    };

    const result = await submitCreatorItineraryDraft(cleanedData);

    setSubmitting(false);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message || 'Itinerary submitted for approval.',
      });
      onOpenChange(false);
      methods.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.message || 'Failed to submit itinerary.',
      });
    }
  };

  const handleOpenChange = (open) => {
    if (submitting) return;
    onOpenChange(open);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Itinerary</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-secondaryDark" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Itinerary</DialogTitle>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()}>
            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 py-4">
              <div className={cn('flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium', currentStep >= 1 ? 'bg-secondaryDark text-white' : 'bg-gray-200 text-gray-600')}>1</div>
              <div className={cn('w-12 h-1', currentStep >= 2 ? 'bg-secondaryDark' : 'bg-gray-200')} />
              <div className={cn('flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium', currentStep >= 2 ? 'bg-secondaryDark text-white' : 'bg-gray-200 text-gray-600')}>2</div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span className={currentStep === 1 ? 'font-semibold text-secondaryDark' : ''}>Basic Information</span>
              <span>→</span>
              <span className={currentStep === 2 ? 'font-semibold text-secondaryDark' : ''}>Schedule</span>
            </div>

            {/* Step Content */}
            {currentStep === 1 && <PersonalInfoTab locationsOptions={locations} />}
            {currentStep === 2 && <ScheduleTab allactivities={activities} alltransfers={transfers} />}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t">
              {currentStep === 1 ? (
                <div className="flex-1" />
              ) : (
                <button type="button" onClick={handleBack} disabled={submitting} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  className="flex items-center gap-2 px-4 py-2 bg-secondaryDark text-white rounded-md hover:bg-secondaryDark/90 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-secondaryDark text-white rounded-md hover:bg-secondaryDark/90 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Apply for Approval
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
