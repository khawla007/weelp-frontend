'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useForm, FormProvider } from 'react-hook-form';
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
      availability_type: '',
      available_days: [],
      time_slots: [],
      blackout_dates: [],
    },
  });

  // Handle Global State
  const { errors, isValid, isSubmitting } = methods?.formState;

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
      title: 'Media',
    },
    {
      id: 5,
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
        return <MediaTab />;
      case 5:
        return <SeoTab />;
      default:
        return null;
    }
  };

  // Submit Data
  const onSubmit = async (data) => {
    const mergedData = { ...formData, ...data };

    if (currentStep < 5) {
      setFormData(mergedData);
      setCurrentStep((prev) => prev + 1);
      return;
    }

    const { media_gallery = [] } = data; // destructure media

    // change media data
    const finalData = {
      ...data,
      media_gallery: media_gallery.map((val) => ({
        media_id: val.media_id,
      })),
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
                <Button type="submit" disabled={isSubmitting} className={`ml-auto py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-secondaryDark cursor-pointer`}>
                  {currentStep === 5 ? 'Submit' : 'Next'}
                </Button>
              </div>
            </fieldset>
          </form>
        </FormProvider>
      </div>
    </Card>
  );
};
