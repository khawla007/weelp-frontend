'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { cn } from '@/lib/utils';
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
  locations: [],
  schedules: [],
  activities: [],
  transfers: [],
};

const STEPS = [
  { id: 1, title: 'Basic Information' },
  { id: 2, title: 'Schedule' },
];

// Single source for the directional slide classes so forward/back can't drift apart.
const STEP_SLIDE = { forward: 'slide-in-from-right-2', back: 'slide-in-from-left-2' };

export default function CreatorItineraryFormShell({ mode = 'create', draftId = null, initialData = null, locations = [], alltransfers = [] }) {
  const router = useRouter();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  // Direction-aware step transition: +1 advancing, -1 going back.
  const [direction, setDirection] = useState(1);
  // Wrapper that holds the swapping step content (Step1 slot + Step2's display-toggled box).
  const stepContentRef = useRef(null);
  // First paint should fade only — the horizontal slide is reserved for real step changes.
  const hasMounted = useRef(false);

  const goToStep = (next) => {
    setDirection(next >= currentStep ? 1 : -1);
    setCurrentStep(next);
  };

  // React owns the steady enter-animation classes via the wrapper's JSX className (see below);
  // this effect only *replays* that animation on each step change. We can't use a React `key`
  // to remount-and-replay because Step2 lives inside this wrapper and must keep its local state,
  // so we restart the CSS animation imperatively: strip the classes, force a reflow, re-add them.
  // The reflow makes the browser treat the re-added classes as a fresh animation start.
  useEffect(() => {
    // Skip the very first paint — the wrapper's JSX className already played the fade once.
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const el = stepContentRef.current;
    if (!el) return;
    const slide = direction >= 0 ? STEP_SLIDE.forward : STEP_SLIDE.back;
    const enterClasses = ['animate-in', 'fade-in-0', 'duration-200', 'motion-reduce:animate-none', slide];
    el.classList.remove(...enterClasses, STEP_SLIDE.forward, STEP_SLIDE.back);
    // Force reflow so the browser treats the re-added animation classes as a fresh start.
    void el.offsetWidth;
    el.classList.add(...enterClasses);
  }, [currentStep, direction]);

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
      goToStep(currentStep + 1);
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
    <div className="min-h-screen w-full bg-muted py-12 px-[140px]">
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
                      goToStep(step?.id);
                    }}
                    className={`flex flex-col items-center w-full space-y-1 cursor-pointer group relative p-4 duration-300 ease-in-out group hover:bg-muted ${currentStep == step?.id && ' bg-gradient-to-t from-weelp-sage-tint/20 to-muted border-b-weelp-sage-deep border-b-2'}`}
                  >
                    <div
                      className={`text-sm pt-2 w-full text-nowrap duration-300 ease-in-out ${!currentStep == step?.id && ' group-hover:text-foreground'} ${currentStep == step?.id ? 'text-weelp-copy font-bold' : 'text-weelp-steel font-medium'}`}
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
            <fieldset className={`bg-card p-2 px-8 border shadow rounded-lg ${submitting && ' cursor-wait'}`} disabled={submitting}>
              {/* Animate only the step content wrapper, not individual inputs. React owns these
                  enter classes (so a future className edit can't silently kill the animation);
                  the effect above only replays them on each step change. No React `key` here —
                  Step2 lives inside this wrapper (display toggled) and must keep its local state,
                  so we replay via reflow instead of remounting. First paint fades with no slide;
                  the directional slide (STEP_SLIDE) is added by the effect on real step changes. */}
              <div ref={stepContentRef} className={cn('animate-in', 'fade-in-0', 'duration-200', 'motion-reduce:animate-none')}>
                <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                  <Step2Schedule alltransfers={alltransfers} onSubmit={onStep2Submit} submitLabel={mode === 'edit' ? 'Save & Submit for Review' : 'Submit for Review'} submitting={submitting} />
                </div>
                {currentStep === 1 && <Step1BasicInfo locations={locations} />}
              </div>

              <div className="flex justify-between pt-4 pb-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={() => goToStep(currentStep - 1)}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-copy bg-muted hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
                  >
                    Previous
                  </Button>
                )}

                {currentStep < 2 && (
                  <Button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-copy bg-muted hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
                  >
                    Cancel
                  </Button>
                )}

                {currentStep === 2 ? null : (
                  <Button type="submit" disabled={submitting} className={`ml-auto py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-weelp-sage-deep cursor-pointer`}>
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
