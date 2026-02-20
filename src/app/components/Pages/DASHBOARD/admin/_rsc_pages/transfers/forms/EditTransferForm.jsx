'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useForm, FormProvider } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { editTransferByAdmin } from '@/lib/actions/transfer';

// Create Dynamic Import For Performance Optimization
const NavigationTransfer = dynamic(() => import('../transfer_shared').then((mod) => mod.NavigationTransfer), { ssr: false }); // for export
const PersonalInfoTab = dynamic(() => import('../tabs/PersonalInfoTab'), {
  ssr: false,
});
const VendorTab = dynamic(() => import('../tabs/VendorTab'), { ssr: false });
const PricingTab = dynamic(() => import('../tabs/PricingTab'), { ssr: false });
const MediaTab = dynamic(() => import('../tabs/MediaTab'), { ssr: false });
const SeoTab = dynamic(() => import('../tabs/SeoTab'), { ssr: false });

// Create Transfer Form By Vendor
export const EditTransferForm = ({ transferData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const router = useRouter();
  const { toast } = useToast(); // intialize toast

  // desturcuture formdata
  const { id: transferId, name, slug, description, transfer_type, seo = {}, vendor_routes = {}, media_gallery = [] } = transferData; // destrucutre vendor data
  const { vendor_id, route_id } = vendor_routes; // destructure vendor routes

  // intialize methods
  const methods = useForm({
    defaultValues: {
      name: name,
      slug: slug,
      description: description,
      transfer_type: transfer_type,
      vendor_id: vendor_id ?? '',
      route_id: route_id ?? '',
      media_gallery: media_gallery,
      seo: { ...seo, schema_data: JSON.parse(seo?.schema_data) },
    },
  });

  // Handle Global Level Error
  const { reset } = methods;
  const { errors, isValid, isSubmitting } = methods?.formState;

  //  Main Steps
  const steps = [
    {
      id: 1,
      title: 'Basic Information',
    },
    {
      id: 2,
      title: 'Vendor Route',
    },
    {
      id: 3,
      title: 'Pricing Availability',
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
        return <PersonalInfoTab />;
      case 2:
        return <VendorTab />;
      case 3:
        return <PricingTab />;
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

    // console.log(media);
    const { media_gallery = [] } = formData;

    // change media data
    const finalData = {
      ...data,
      media_gallery: media_gallery.map((val) => ({
        media_id: val.media_id,
      })),
    };

    // submit full data
    try {
      console.log('finaldata', finalData);
      const res = await editTransferByAdmin(transferId, finalData);

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
    <div className="min-h-screen w-full bg-gray-50 py-12 sm:px-6 lg:px-8">
      <NavigationTransfer title={'Edit Transfer'} desciption={'Edit your transfer service'} />
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
                      className={`flex flex-col items-center w-full space-y-1 cursor-pointer group relative p-4 duration-300 ease-in-out group hover:bg-gray-100 ${currentStep == step?.id && ' bg-gradient-to-t from-[#c7ffc02e] to-slate-50 border-b-secondaryDark border-b-2'}`}
                    >
                      <div
                        className={`text-sm font-medium pt-2 w-full text-nowrap duration-300 ease-in-out ${!currentStep == step?.id && ' group-hover:text-gray-800'} ${currentStep == step?.id ? 'text-secondaryDark ' : 'text-grayDark'}`}
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
    </div>
  );
};
