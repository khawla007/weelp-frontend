'use client';

import React, { useState } from 'react';
import { NavigationDestinations } from '../components/Navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { omit } from 'lodash';
import { useIsClient } from '@/hooks/useIsClient';
import { createState, editState } from '@/lib/actions/state';
import { FORM_STATE_VALUES_DEFAULT } from '@/constants/forms/country';
import { useCountriesOptionsAdmin } from '@/hooks/api/admin/countries'; // hook for countries

// Lazy Load Client Components
const BasicInformationTab = dynamic(() => import('../tabs/BasicInformation'));
const LocationDetailsTab = dynamic(() => import('../tabs/LocationDetails'));
const TravelInformationTab = dynamic(() => import('../tabs/TravelInformation'));
const EventSeasonTab = dynamic(() => import('../tabs/EventSeason'));
const AdditionalInformationTab = dynamic(() => import('../tabs/AdditionalInformation'));
const FaqTab = dynamic(() => import('../tabs/FAQs'));
const MediaTab = dynamic(() => import('../tabs/MediaTab'));
const SeoTab = dynamic(() => import('../tabs/SeoTab'));

const CreateStateForm = ({ apiFormData = {} }) => {
  const isClient = useIsClient(); // intialize hydration
  const { toast } = useToast(); // Intialize toaster
  const [currentStep, setCurrentStep] = useState(1); // steps
  const [formData, setFormData] = useState({}); // form data
  const params = useParams(); // intialize params hook

  const cleanCountryData = omit(apiFormData, ['created_at', 'updated_at']);

  const { id } = params; // destructure id if exist or in edit route page

  // Initialize Form
  const methods = useForm({
    defaultValues: {
      ...FORM_STATE_VALUES_DEFAULT,
      ...cleanCountryData,
      location_details: {
        ...FORM_STATE_VALUES_DEFAULT.location_details,
        ...omit(cleanCountryData?.location_details, ['created_at', 'updated_at']),
      },
      travel_info: {
        ...FORM_STATE_VALUES_DEFAULT.travel_info,
        ...omit(cleanCountryData?.travel_info, ['created_at', 'updated_at']),
      },
      seasons: [...FORM_STATE_VALUES_DEFAULT.seasons, ...(cleanCountryData?.seasons || []).map((season) => omit(season, ['created_at', 'updated_at']))],
      events: [...FORM_STATE_VALUES_DEFAULT.events, ...(cleanCountryData?.events || []).map((event) => omit(event, ['created_at', 'updated_at']))],
      additional_info: [...FORM_STATE_VALUES_DEFAULT.additional_info, ...(cleanCountryData?.additional_info || []).map((info) => omit(info, ['created_at', 'updated_at']))],
    },
  });

  const router = useRouter(); // Initialize Router

  // destructure form
  const {
    formState: { isSubmitting },
  } = methods;

  //  Main Steps
  const steps = [
    {
      id: 1,
      title: 'Basic Information',
    },
    {
      id: 2,
      title: 'Locations & Details',
    },
    {
      id: 3,
      title: 'Travel Information',
    },
    {
      id: 4,
      title: 'Event & Seasons',
    },
    {
      id: 5,
      title: 'Additional Information',
    },
    {
      id: 6,
      title: 'Media',
    },
    {
      id: 7,
      title: 'FAQs',
    },
    {
      id: 8,
      title: 'SEO',
    },
  ];

  /**
   * Handle Rendering Components Based on Step id
   * @returns function
   */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInformationTab />;
      case 2:
        return <LocationDetailsTab />;
      case 3:
        return <TravelInformationTab />;
      case 4:
        return <EventSeasonTab />;
      case 5:
        return <AdditionalInformationTab />;
      case 6:
        return <MediaTab />;
      case 7:
        return <FaqTab />;
      case 8:
        return <SeoTab />;
      default:
        return null;
    }
  };

  // inside onSubmit
  const onSubmit = async (data) => {
    const mergedData = { ...formData, ...data };

    if (currentStep < 8) {
      setFormData(mergedData);
      setCurrentStep((prev) => prev + 1);
      return;
    }

    //  controll form
    try {
      let res;
      if (id) {
        res = await editState(id, mergedData); // edit action
      } else {
        res = await createState(mergedData); // create action
      }

      if (res.success) {
        toast({
          title: res.message || (id ? 'Updated successfully!' : 'Created successfully!'),
        });
        router.push('/dashboard/admin/destinations/states/'); // back push to states
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

  if (isClient) {
    return (
      <div className="min-h-screen w-full bg-gray-50 py-4 sm:px-6 lg:px-8">
        <NavigationDestinations title={id ? 'Edit state' : 'New state'} description={`${id ? ' Edit' : ' Create a new'} state destination with detailed information`} />

        <div className="w-full space-y-4">
          <FormProvider {...methods}>
            {/* Step Component */}
            <div className="w-full">
              <ul className="w-full lg:w-fit flex flex-col lg:flex-row justify-between items-center">
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

            {/* Dynamic Tabs */}
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <fieldset className={`${currentStep === 3 ? '' : 'bg-white p-4 md:px-8 border shadow rounded-lg'} ${isSubmitting && ' cursor-wait'}`} disabled={isSubmitting}>
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

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitting} className={`ml-auto py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-secondaryDark cursor-pointer`}>
                      {isSubmitting ? (currentStep === 8 ? 'Submitting...' : 'Submit') : currentStep === 8 ? 'Submit' : 'Next'}
                    </Button>
                  </div>
                  {/* )} */}
                </div>
              </fieldset>
            </form>
          </FormProvider>
        </div>
      </div>
    );
  }
};

export default CreateStateForm;
