'use client';

import { useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { RotateCcw, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { calculateItineraryEditPricing, hasItineraryEditChanges, useItineraryEditStore } from '@/lib/store/useItineraryEditStore';
import { saveCustomerItinerary } from '@/lib/actions/customerItineraries';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import useMiniCartStore from '@/lib/store/useMiniCartStore';

export default function ItineraryEditActionBar({ session, productData, citySlug, selectedAddons = [] }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const submissionLockRef = useRef(false);
  const savedCopyRef = useRef(null);
  const openAuthModal = useAuthModalStore((s) => s.openAuthModal);
  const { addItem, setMiniCartOpen } = useMiniCartStore();
  const { getValues, trigger } = useFormContext();

  const { modifiedSchedules, originalSchedules, itineraryId, resetChanges } = useItineraryEditStore();

  const hasChanges = hasItineraryEditChanges({ originalSchedules, modifiedSchedules });

  if (!hasChanges) return null;

  const isLoggedIn = !!session?.user;

  const payload = {
    parent_itinerary_id: itineraryId,
    schedules: modifiedSchedules,
  };

  const handleCustomerSave = async () => {
    if (submissionLockRef.current) return;
    submissionLockRef.current = true;
    setSubmitting(true);
    try {
      if (!(await trigger())) {
        toast({ variant: 'destructive', title: 'Please select valid booking details.' });
        return;
      }
      const booking = getValues();
      const headcount = Math.max(1, Number(booking.howMany?.adults ?? 1) + Number(booking.howMany?.children ?? 0));
      const pricing = calculateItineraryEditPricing(modifiedSchedules, headcount, productData?.schedule_total_currency);
      if (!pricing) {
        toast({ variant: 'destructive', title: 'This itinerary has missing or mixed-currency pricing.' });
        return;
      }

      const addonsTotal = selectedAddons.reduce((sum, addon) => sum + Number(addon.addon_sale_price ?? addon.addon_price ?? 0), 0);
      const payloadFingerprint = JSON.stringify(payload);
      const cachedCopy = savedCopyRef.current?.payloadFingerprint === payloadFingerprint ? savedCopyRef.current.copy : null;
      const res = cachedCopy ? { success: true, data: cachedCopy } : await saveCustomerItinerary(payload);

      if (res.success) {
        savedCopyRef.current = { payloadFingerprint, copy: res.data };
        addItem({
          id: res.data.id,
          type: 'itinerary',
          name: res.data.name ?? productData?.name,
          slug: res.data.slug,
          city_slug: citySlug ?? productData?.city_slug,
          featured_image: productData?.featured_image,
          currency: pricing.currency ?? productData?.schedule_total_currency ?? 'USD',
          base_price: pricing.total,
          price: Math.round((pricing.total + addonsTotal) * 100) / 100,
          addons_total: Math.round(addonsTotal * 100) / 100,
          dateRange: booking.dateRange,
          howMany: booking.howMany,
          headcount,
          addons: selectedAddons.map((addon) => ({
            addon_id: addon.addon_id,
            addon_name: addon.addon_name,
            price: addon.addon_sale_price ?? addon.addon_price,
          })),
        });
        setMiniCartOpen(true);
        resetChanges();
        savedCopyRef.current = null;
        toast({ title: res.message || 'Itinerary saved and added to cart.' });
      } else {
        toast({ variant: 'destructive', title: res.message || 'Failed to save.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Something went wrong. Please try again.' });
    } finally {
      submissionLockRef.current = false;
      setSubmitting(false);
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
              toast({ title: 'Itinerary saved. Please select your booking details.' });
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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg dark:shadow-none z-50 p-4">
      <div className="container-page flex items-center justify-between">
        {/* Left: Reset */}
        <Button type="button" variant="outline" onClick={resetChanges} disabled={submitting}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Changes
        </Button>

        {/* Right: Role-based action */}
        {!isLoggedIn ? (
          <Button type="button" onClick={handleGuestBookNow} className="bg-weelp-sage-deep hover:bg-weelp-sage-deep/90">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Book Now
          </Button>
        ) : (
          <Button type="button" onClick={handleCustomerSave} disabled={submitting} className="bg-weelp-sage-deep hover:bg-weelp-sage-deep/90">
            {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
            Save &amp; Book
          </Button>
        )}
      </div>
    </div>
  );
}
