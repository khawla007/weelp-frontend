'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { submitCreatorItineraryDraft, updateDraft, submitDraft } from '@/lib/actions/creatorItineraries';
import { NavigationItinerary } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/itineraries/itinerary_shared';
import Step1BasicInfo from './steps/Step1BasicInfo';
import Step2Schedule from './steps/Step2Schedule';

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  featured_itinerary: false,
  private_itinerary: false,
  locations: [],
  schedules: [],
  activities: [],
  transfers: [],
};

const STEPS = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Schedule' },
];

export default function CreatorItineraryFormShell({ mode = 'create', draftId = null, initialData = null, locations = [], alltransfers = [] }) {
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const methods = useForm({
    shouldUnregister: false,
    mode: 'all',
    defaultValues: initialData || EMPTY_FORM,
  });

  // Re-hydrate form when initialData changes (edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      methods.reset(initialData);
    }
  }, [mode, initialData, methods]);

  // Watched values for step gates
  const nameValue = useWatch({ control: methods.control, name: 'name' });
  const slugValue = useWatch({ control: methods.control, name: 'slug' });
  const descriptionValue = useWatch({ control: methods.control, name: 'description' });
  const locationsValue = useWatch({ control: methods.control, name: 'locations' });

  const isStep1Valid = !!(nameValue?.trim() && slugValue?.trim() && descriptionValue?.trim() && locationsValue?.length > 0);

  const validateCurrentStep = async () => {
    if (currentStep === 1) {
      const valid = await methods.trigger(['name', 'slug', 'description', 'locations']);
      return valid;
    }
    return true;
  };

  const handleNext = async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const buildPayload = () => {
    const data = methods.getValues();
    return {
      ...data,
      locations: Array.isArray(data.locations) ? data.locations.map((l) => (typeof l === 'string' ? parseInt(l, 10) : l)) : [],
    };
  };

  const handleCreateSubmit = async () => {
    setSubmitting(true);
    const result = await submitCreatorItineraryDraft(buildPayload());
    setSubmitting(false);
    if (result.success) {
      toast({ title: 'Submitted for review', description: result.message });
      router.push('/dashboard/customer/my-itineraries');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const handleEditSubmit = async () => {
    setSubmitting(true);
    const saveResult = await updateDraft(draftId, buildPayload());
    if (!saveResult.success) {
      toast({ variant: 'destructive', title: 'Failed to save before submitting.', description: saveResult.message });
      setSubmitting(false);
      return;
    }
    const submitResult = await submitDraft(draftId);
    setSubmitting(false);
    if (submitResult.success) {
      toast({ title: 'Submitted for review', description: submitResult.message });
      router.push('/dashboard/customer/my-itineraries');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: submitResult.message });
    }
  };

  const onStep2Submit = mode === 'edit' ? handleEditSubmit : handleCreateSubmit;

  return (
    <div className="min-h-screen w-full bg-gray-50 py-12 px-[140px]">
      <NavigationItinerary title={mode === 'edit' ? 'Edit Itinerary Draft' : 'Create New Itinerary'} desciption={'Build an itinerary with destinations and schedule'} />
      <div className="w-full space-y-4">
        <FormProvider {...methods}>
          <div className="w-full">
            <div className="w-full">
              <ul className="w-fit flex justify-between items-center">
                {STEPS.map((step) => (
                  <li
                    key={step.id}
                    onClick={async () => {
                      if (step?.id !== currentStep) {
                        const isValid = await validateCurrentStep();
                        if (!isValid) return;
                      }
                      setCurrentStep(step?.id);
                    }}
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
          >
            <fieldset className={`bg-white p-2 px-8 border shadow rounded-lg ${submitting && ' cursor-wait'}`} disabled={submitting}>
              <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                <Step2Schedule alltransfers={alltransfers} onSubmit={onStep2Submit} submitLabel={mode === 'edit' ? 'Save & Submit for Review' : 'Submit for Review'} submitting={submitting} />
              </div>
              {currentStep === 1 && <Step1BasicInfo locations={locations} />}

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

                {currentStep < 2 && (
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </Button>
                )}

                {currentStep === 2 ? null : (
                  <Button type="submit" disabled={submitting} className={`ml-auto py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-secondaryDark cursor-pointer`}>
                    Next
                  </Button>
                )}
              </div>
            </fieldset>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
