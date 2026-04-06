'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, Send, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useItineraryEditStore } from '@/lib/store/useItineraryEditStore';
import { submitCreatorItinerary } from '@/lib/actions/creatorItineraries';
import { saveCustomerItinerary } from '@/lib/actions/customerItineraries';

export default function ItineraryEditActionBar({ isCreator, isLoggedIn }) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { modifiedSchedules, originalSchedules, itineraryId, resetChanges } = useItineraryEditStore();

  const hasChanges = JSON.stringify(originalSchedules) !== JSON.stringify(modifiedSchedules);

  if (!hasChanges || !isLoggedIn) return null;

  const payload = {
    parent_itinerary_id: itineraryId,
    schedules: modifiedSchedules,
  };

  const handleCreatorSubmit = async () => {
    setSubmitting(true);
    const res = await submitCreatorItinerary(payload);
    setSubmitting(false);

    if (res.success) {
      toast({ title: res.message || 'Itinerary submitted for approval!' });
      resetChanges();
    } else {
      toast({ variant: 'destructive', title: res.message || 'Submission failed.' });
    }
  };

  const handleCustomerSave = async () => {
    setSubmitting(true);
    const res = await saveCustomerItinerary(payload);
    setSubmitting(false);

    if (res.success) {
      toast({ title: res.message || 'Itinerary saved successfully!' });
      resetChanges();
      // Redirect to the new copy's page
      if (res.data?.slug) {
        router.push(`/itineraries/${res.data.slug}`);
      }
    } else {
      toast({ variant: 'destructive', title: res.message || 'Failed to save.' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Reset */}
        <Button variant="outline" onClick={resetChanges} disabled={submitting}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Changes
        </Button>

        {/* Right: Submit */}
        {isCreator ? (
          <Button onClick={handleCreatorSubmit} disabled={submitting} className="bg-secondaryDark hover:bg-secondaryDark/90">
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Apply for Approval
          </Button>
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
