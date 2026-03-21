'use client';

import React, { useState } from 'react';
import _ from 'lodash';
import { isEmpty } from 'lodash';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { FormActionButtons } from '@/app/components/Button/FormActionButtons';
import { Separator } from '@/components/ui/separator';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { createTransferByAdmin } from '@/lib/actions/transfer';

// Create Dynamic Import For Performance Optimization
const NavigationTransfer = dynamic(() => import('../transfer_shared').then((mod) => mod.NavigationTransfer), { ssr: false }); // for export
const BasicInfoTabAdmin = dynamic(() => import('../tabs/BasicInfoTabAdmin'), {
  ssr: false,
});
const PricingTabAdmin = dynamic(() => import('../tabs/PricingTabAdmin'), {
  ssr: false,
});
const ScheduleTabAdmin = dynamic(() => import('../tabs/ScheduleTabAdmin'), {
  ssr: false,
}); // schedule tab
const MediaTab = dynamic(() => import('../tabs/MediaTab'), { ssr: false });
const SeoTab = dynamic(() => import('../tabs/SeoTab'), { ssr: false });
const SharedAddOnMultiSelect = dynamic(() => import('../../shared_tabs/addon/SharedAddOnTransfer'), { ssr: false });

export const CreateTransferFormByAdmin = ({}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const router = useRouter();
  const { toast } = useToast(); // intialize toast

  // intialize methods
  const methods = useForm({
    defaultValues: {
      is_vendor: false,
      media_gallery: [],
      availability_type: 'always_available',
      available_days: [],
      time_slots: [],
      blackout_dates: [],
      addons: [],
      seo: {
        meta_title: '',
        meta_description: '',
        keywords: '',
        og_image_url: '',
        canonical_url: '',
        schema_type: 'Product',
        schema_data: {},
      },
    },
  });

  // Handle Global State
  const { errors, isValid, isSubmitting } = methods?.formState;

  // Watch Step 1 fields to enable/disable Create button (matching Activities pattern)
  const nameValue = useWatch({ control: methods.control, name: 'name' });
  const slugValue = useWatch({ control: methods.control, name: 'slug' });
  const transferTypeValue = useWatch({ control: methods.control, name: 'transfer_type' });
  const vehicleTypeValue = useWatch({ control: methods.control, name: 'vehicle_type' });
  const pickupLocationValue = useWatch({ control: methods.control, name: 'pickup_location' });
  const dropoffLocationValue = useWatch({ control: methods.control, name: 'dropoff_location' });
  const descriptionValue = useWatch({ control: methods.control, name: 'description' });
  const inclusionValue = useWatch({ control: methods.control, name: 'inclusion' });

  // Check if all Step 1 required fields have values (non-empty after trimming)
  const isStep1Valid = !!(
    nameValue?.trim() &&
    slugValue?.trim() &&
    transferTypeValue?.trim() &&
    vehicleTypeValue?.trim() &&
    pickupLocationValue?.trim() &&
    dropoffLocationValue?.trim() &&
    descriptionValue?.trim() &&
    inclusionValue?.trim()
  );

  // Step 1 required fields for validation
  const step1Fields = ['name', 'slug', 'transfer_type', 'vehicle_type', 'pickup_location', 'dropoff_location', 'description', 'inclusion'];

  // Handle Next button click - validates step 1 fields before proceeding
  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await methods.trigger(step1Fields);
      if (!isValid) return;
    }
    const currentData = methods.getValues();
    setFormData({ ...formData, ...currentData });
    setCurrentStep((prev) => prev + 1);
  };

  //  Main Steps
  const steps = [
    {
      id: 1,
      title: 'Basic Info',
    },
    {
      id: 2,
      title: 'Pricing',
    },
    {
      id: 3,
      title: 'Schedule',
    },
    {
      id: 4,
      title: 'AddOn',
    },
    {
      id: 5,
      title: 'Media',
    },
    {
      id: 6,
      title: 'Seo',
    },
  ];

  /**
   * Handle Rendering Components Based on Step id
   * @returns function
   */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoTabAdmin />;
      case 2:
        return <PricingTabAdmin />;
      case 3:
        return <ScheduleTabAdmin />;
      case 4:
        return <SharedAddOnMultiSelect />;
      case 5:
        return <MediaTab />;
      case 6:
        return <SeoTab />;
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

    const { media_gallery = [] } = mergedData; // destructure media

    // change media data
    const finalData = {
      ...mergedData,
      media_gallery: media_gallery.map((val) => ({
        media_id: val.media_id,
        is_featured: val.is_featured ?? false,
      })),
      seo: mergedData.seo || {},
    };

    // submit full data
    try {
      const res = await createTransferByAdmin(finalData);

      if (res.success) {
        toast({ title: res.message || 'Created successfully!' });

        // success reset
        router.push('/dashboard/admin/transfers');
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
    <Card className="min-h-screen border-none shadow-none w-full bg-gray-50 py-12 sm:px-6 lg:px-8">
      <NavigationTransfer title={'New Transfer'} desciption={'Create a new transfer service'} />
      <div className="w-full space-y-4">
        <FormProvider {...methods}>
          <div className="w-full">
            <div className="w-full">
              <ul className="w-full sm:w-fit  flex flex-col sm:flex-row justify-between items-center">
                {steps &&
                  steps.map((step) => (
                    <li
                      key={step.id}
                      onClick={async () => {
                        // Validate step 1 fields before allowing navigation away
                        if (currentStep === 1 && step?.id !== 1) {
                          const isValid = await methods.trigger(step1Fields);
                          if (!isValid) return;
                        }
                        setCurrentStep(step?.id);
                      }}
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
          <form
            onSubmit={
              currentStep === 6
                ? methods.handleSubmit(onSubmit)
                : async (e) => {
                    e.preventDefault();
                    await handleNext();
                  }
            }
          >
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
                      router.push('/dashboard/admin/transfers');
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </Button>
                )}

                {/* Prevent Button On Schedules */}
                {/* Step 6: Use FormActionButtons, Steps 1-5: Use Next button */}
                {currentStep === 6 ? (
                  <FormActionButtons
                    mode="create"
                    isSubmitting={isSubmitting}
                    isDisabled={!isStep1Valid}
                    cancelAlwaysEnabled={true}
                    cancelHref="/dashboard/admin/transfers"
                    containerType="div"
                    className="flex gap-4 ml-auto"
                  />
                ) : (
                  <Button type="submit" disabled={isSubmitting} className={`ml-auto py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-secondaryDark cursor-pointer`}>
                    Next
                  </Button>
                )}
              </div>
            </fieldset>
          </form>
        </FormProvider>
      </div>
    </Card>
  );
};
