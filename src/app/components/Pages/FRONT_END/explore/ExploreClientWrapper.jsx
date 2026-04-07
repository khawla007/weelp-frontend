'use client';

import { useState, useCallback, useEffect } from 'react';
import CreatorFilter from './SectionCreatorFilter';
import CreatorStatCards from './CreatorStatCards';
import CreatorApplicationForm from './CreatorApplicationForm';
import { getApplicationStatus } from '@/lib/actions/creatorApplications';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Clock, HelpCircle } from 'lucide-react';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import { useSession } from 'next-auth/react';

export default function ExploreClientWrapper({ initialItineraries, lastPage }) {
  const [applicationFormOpen, setApplicationFormOpen] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [guideOpen, setGuideOpen] = useState(false);
  const { toast } = useToast();
  const { openAuthModal } = useAuthModalStore();
  const { data: session, update: updateSession } = useSession();
  const isLoggedIn = !!session?.user;
  const [statusLoading, setStatusLoading] = useState(false);
  const isCreator = !!session?.user?.is_creator || applicationStatus === 'approved';

  // Check application status for logged-in non-creators on mount
  useEffect(() => {
    if (!isLoggedIn || session?.user?.is_creator) return;

    const checkStatus = async () => {
      setStatusLoading(true);
      const result = await getApplicationStatus();
      if (result.success && result.data) {
        setApplicationStatus(result.data.status);
        // Sync session if approved but session is stale
        if (result.data.status === 'approved') {
          updateSession({ is_creator: true });
        }
      }
      setStatusLoading(false);
    };
    checkStatus();
  }, [isLoggedIn, session?.user?.is_creator, updateSession]);

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
          // Auto-open apply form after successful signup
          setApplicationFormOpen(true);
        },
      });
    }
  }, [isCreator, isLoggedIn, applicationStatus, openAuthModal, toast]);

  return (
    <>
      {/* Creator Stats */}
      {isCreator && <CreatorStatCards />}

      {/* Creator Welcome / Pending / Apply Banner */}
      {isLoggedIn && !statusLoading && (
        <div className="relative z-10 max-w-[95%] mx-auto px-6 py-4">
          {isCreator ? (
            <div className="flex items-center justify-between bg-gradient-to-r from-secondaryDark/10 to-secondaryDark/5 rounded-xl p-6">
              <div>
                <h3 className="text-lg font-semibold text-[#142A38]">Welcome, Creator!</h3>
                <p className="text-sm text-[#5A5A5A] mt-1">Share your travel experiences and inspire the community.</p>
              </div>
              <Button onClick={() => setGuideOpen(true)} variant="outline" className="border-secondaryDark text-secondaryDark hover:bg-secondaryDark/10">
                <HelpCircle className="size-4 mr-2" />
                How to Create Itinerary
              </Button>
            </div>
          ) : applicationStatus === 'pending' ? (
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
        statusLoading={statusLoading}
      />

      {/* Creator Application Form Modal */}
      {isLoggedIn && !isCreator && <CreatorApplicationForm open={applicationFormOpen} onOpenChange={setApplicationFormOpen} />}

      {/* How to Create Itinerary Guide */}
      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#142A38]">How to Create an Itinerary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {[
              { step: 1, title: 'Go to a Single Itinerary Page', desc: 'Browse the Explore page and open any itinerary that inspires you.' },
              { step: 2, title: 'Add or Edit the Schedule', desc: 'Customize the itinerary by adding your own day-by-day schedule, activities, timings, and travel tips.' },
              { step: 3, title: 'Submit for Approval', desc: "Once your itinerary is ready, submit it for admin review. You'll be notified once it's approved and published on the Explore page." },
              { step: 4, title: 'Track in My Itineraries', desc: 'View and manage all your created itineraries from the My Itineraries section in your dashboard.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondaryDark/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-secondaryDark">{item.step}</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#142A38]">{item.title}</h4>
                  <p className="text-sm text-[#5A5A5A] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
