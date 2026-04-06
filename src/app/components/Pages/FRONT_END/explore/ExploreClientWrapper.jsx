'use client';

import { useState, useCallback, useEffect } from 'react';
import CreatorFilter from './SectionCreatorFilter';
import CreatorStatCards from './CreatorStatCards';
import CreatorApplicationForm from './CreatorApplicationForm';
import { getApplicationStatus } from '@/lib/actions/creatorApplications';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock } from 'lucide-react';
import useAuthModalStore from '@/lib/store/useAuthModalStore';

export default function ExploreClientWrapper({ initialItineraries, lastPage, session }) {
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const { toast } = useToast();
  const { openAuthModal } = useAuthModalStore();

  const isCreator = !!session?.user?.is_creator;
  const isLoggedIn = !!session?.user;

  // Check application status for non-creators on mount
  useEffect(() => {
    if (!isLoggedIn || isCreator) return;

    const checkStatus = async () => {
      const result = await getApplicationStatus();
      if (result.success && result.data) {
        setApplicationStatus(result.data.status);
      }
    };
    checkStatus();
  }, [isLoggedIn, isCreator]);

  // Called when the dynamic action button is clicked
  const handleActionClick = useCallback(() => {
    if (isCreator) {
      // Creators don't have a special action here anymore
      return;
    } else if (isLoggedIn) {
      if (applicationStatus === 'pending') {
        toast({ title: 'Application Pending', description: 'Your creator application is under review.' });
      } else {
        setApplicationFormOpen(true);
      }
    } else {
      // Guest: open auth modal
      openAuthModal({
        onSuccess: async () => {
          toast({ title: 'Welcome! You can now apply to become a creator.' });
        },
      });
    }
  }, [isCreator, isLoggedIn, applicationStatus, openAuthModal, toast]);

  return (
    <>
      {/* Creator Stats */}
      {isCreator && <CreatorStatCards />}

      {/* Apply as Creator / Pending Banner */}
      {isLoggedIn && !isCreator && (
        <div className="relative z-10 max-w-[95%] mx-auto px-6 py-4">
          {applicationStatus === 'pending' ? (
            <div className="flex items-center justify-between bg-gradient-to-r from-amber-100/60 to-amber-50/40 rounded-xl p-6">
              <div>
                <h3 className="text-lg font-semibold text-[#142A38]">Application Pending</h3>
                <p className="text-sm text-[#5A5A5A] mt-1">Your creator application is under review. We&apos;ll notify you once it&apos;s approved.</p>
              </div>
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                <Clock className="size-4" />
                <span className="text-sm font-medium">Under Review</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gradient-to-r from-secondaryDark/10 to-secondaryDark/5 rounded-xl p-6">
              <div>
                <h3 className="text-lg font-semibold text-[#142A38]">Become a Creator</h3>
                <p className="text-sm text-[#5A5A5A] mt-1">Share your travel experiences and earn commissions on bookings.</p>
              </div>
              <Button onClick={() => setApplicationFormOpen(true)} className="bg-secondaryDark hover:bg-secondaryDark/90 text-white">
                <Sparkles className="size-4 mr-2" />
                Apply Now
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Itinerary Feed */}
      <CreatorFilter
        initialItineraries={initialItineraries}
        lastPage={lastPage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onActionClick={handleActionClick}
        isLoggedIn={isLoggedIn}
        isCreator={isCreator}
        applicationStatus={applicationStatus}
      />

      {/* Creator Application Form Modal */}
      {isLoggedIn && !isCreator && <CreatorApplicationForm open={applicationFormOpen} onOpenChange={setApplicationFormOpen} />}
    </>
  );
}
