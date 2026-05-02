'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, ShoppingCart, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useItineraryEditStore } from '@/lib/store/useItineraryEditStore';
import { saveCustomerItinerary } from '@/lib/actions/customerItineraries';
import { submitCreatorItinerary } from '@/lib/actions/creatorItineraries';
import useAuthModalStore from '@/lib/store/useAuthModalStore';

export default function ItineraryEditActionBar({ session }) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const openAuthModal = useAuthModalStore((s) => s.openAuthModal);

  const { modifiedSchedules, originalSchedules, itineraryId, resetChanges } = useItineraryEditStore();

  const hasChanges = JSON.stringify(originalSchedules) !== JSON.stringify(modifiedSchedules);

  if (!hasChanges) return null;

  const isLoggedIn = !!session?.user;
  const isCreator = !!session?.user?.is_creator;

  const payload = {
    parent_itinerary_id: itineraryId,
    schedules: modifiedSchedules,
  };

  const handleCustomerSave = async () => {
    setSubmitting(true);
    const res = await saveCustomerItinerary(payload);
    setSubmitting(false);

    if (res.success) {
      toast({ title: res.message || 'Itinerary saved successfully!' });
      resetChanges();
      if (res.data?.slug) {
        router.push(`/itineraries/${res.data.slug}`);
      }
    } else {
      toast({ variant: 'destructive', title: res.message || 'Failed to save.' });
    }
  };

  const handleCreatorSubmit = async () => {
    setSubmitting(true);
    const res = await submitCreatorItinerary(payload);
    setSubmitting(false);

    if (res.success) {
      toast({ title: res.message || 'Itinerary submitted for approval.' });
      resetChanges();
      if (res.data?.slug) {
        router.push(`/itineraries/${res.data.slug}`);
      }
    } else {
      toast({ variant: 'destructive', title: res.message || 'Failed to submit.' });
    }
  };

  const handleGuestBookNow = () => {
    // Persist edit state to sessionStorage before opening auth modal
    sessionStorage.setItem('itinerary_edit_state', JSON.stringify({ itineraryId, modifiedSchedules }));

    openAuthModal({
      onSuccess: async () => {
        try {
          const saved = sessionStorage.getItem('itinerary_edit_state');
          if (saved) {
            const { itineraryId: savedId, modifiedSchedules: savedSchedules } = JSON.parse(saved);
            sessionStorage.removeItem('itinerary_edit_state');
            const res = await saveCustomerItinerary({
              parent_itinerary_id: savedId,
              schedules: savedSchedules,
            });
            if (res.success && res.data?.slug) {
              router.push(`/itineraries/${res.data.slug}`);
            } else {
              toast({ variant: 'destructive', title: res.message || 'Failed to save itinerary.' });
            }
          }
        } catch {
          toast({ variant: 'destructive', title: 'Something went wrong. Please try again.' });
        }
      },
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Reset */}
        <Button variant="outline" onClick={resetChanges} disabled={submitting}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Changes
        </Button>

        {/* Right: Role-based action */}
        {!isLoggedIn ? (
          <Button onClick={handleGuestBookNow} className="bg-secondaryDark hover:bg-secondaryDark/90">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Book Now
          </Button>
        ) : isCreator ? (
          <div className="flex items-center gap-3">
            <Button onClick={handleCustomerSave} disabled={submitting} variant="outline" className="border-secondaryDark text-secondaryDark hover:bg-secondaryDark/5">
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
              Save &amp; Book
            </Button>
            <Button onClick={handleCreatorSubmit} disabled={submitting} className="bg-secondaryDark hover:bg-secondaryDark/90">
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Apply for Approval
            </Button>
          </div>
        ) : (
          <Button onClick={handleCustomerSave} disabled={submitting} className="bg-secondaryDark hover:bg-secondaryDark/90">
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
            Save &amp; Book
          </Button>
        )}
      </div>
    </div>
  );
}
