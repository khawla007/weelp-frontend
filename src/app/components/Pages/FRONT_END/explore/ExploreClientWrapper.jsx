'use client';

import { useState, useCallback } from 'react';
import CreatorFilter from './SectionCreatorFilter';
import CreatorStatCards from './CreatorStatCards';
import CreatePostModal from '@/app/components/Modals/CreatePostModal';
import { authApi } from '@/lib/axiosInstance';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import useAuthModalStore from '@/lib/store/useAuthModalStore';

export default function ExploreClientWrapper({ initialPosts, lastPage, session }) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const { toast } = useToast();
  const { openAuthModal } = useAuthModalStore();

  const isCreator = !!session?.user?.is_creator;
  const isLoggedIn = !!session?.user;

  // Shared upgrade logic — accepts optional token override for post-auth flow
  const performUpgrade = useCallback(
    async (tokenOverride) => {
      try {
        const config = tokenOverride ? { headers: { Authorization: `Bearer ${tokenOverride}` } } : {};
        const res = await authApi.post('/api/customer/upgrade-to-creator', {}, config);
        if (res.data?.success) {
          toast({ title: "You're now a Creator!", description: 'Welcome to the creator community.' });
          // Session will refresh on navigation via server prop
        }
      } catch (err) {
        const msg = err?.response?.data?.message || 'Failed to upgrade.';
        if (err?.response?.status === 422 && msg.toLowerCase().includes('already')) {
          toast({ title: 'You are already a creator!', description: 'Refreshing your session...' });
          // Session will refresh on navigation via server prop
        } else {
          toast({ title: 'Upgrade failed', description: msg, variant: 'destructive' });
        }
      }
    },
    [toast],
  );

  const handleUpgrade = useCallback(async () => {
    setUpgrading(true);
    try {
      await performUpgrade();
    } finally {
      setUpgrading(false);
    }
  }, [performUpgrade]);

  // Called when the dynamic action button is clicked
  const handleActionClick = useCallback(() => {
    if (isCreator) {
      setCreateModalOpen(true);
    } else if (isLoggedIn) {
      handleUpgrade();
    } else {
      // Guest: open auth modal — onSuccess fires with session after login
      openAuthModal({
        onSuccess: async (newSession) => {
          // If user logged in with an account that's already a creator, skip upgrade
          if (newSession?.user?.is_creator) {
            toast({ title: 'Welcome back, Creator!' });
            return;
          }
          // Use explicit token to avoid race with getSession() in interceptor
          await performUpgrade(newSession?.access_token);
        },
      });
    }
  }, [isCreator, isLoggedIn, handleUpgrade, openAuthModal, performUpgrade]);

  return (
    <>
      {/* Creator Stats */}
      {isCreator && <CreatorStatCards />}

      {/* Become a Creator Banner */}
      {isLoggedIn && !isCreator && (
        <div className="relative z-10 max-w-[95%] mx-auto px-6 py-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-secondaryDark/10 to-secondaryDark/5 rounded-xl p-6">
            <div>
              <h3 className="text-lg font-semibold text-[#142A38]">Become a Creator</h3>
              <p className="text-sm text-[#5A5A5A] mt-1">Share your travel experiences and earn commissions on bookings.</p>
            </div>
            <Button onClick={handleUpgrade} disabled={upgrading} className="bg-secondaryDark hover:bg-secondaryDark/90 text-white">
              <Sparkles className="size-4 mr-2" />
              {upgrading ? 'Upgrading...' : 'Get Started'}
            </Button>
          </div>
        </div>
      )}

      {/* Post Feed */}
      <CreatorFilter
        initialPosts={initialPosts}
        lastPage={lastPage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onActionClick={handleActionClick}
        isLoggedIn={isLoggedIn}
        isCreator={isCreator}
        upgrading={upgrading}
        createModalOpen={createModalOpen}
        onCreateModalChange={setCreateModalOpen}
      />

      {/* Create Post Modal */}
      {isCreator && <CreatePostModal open={createModalOpen} onOpenChange={setCreateModalOpen} />}
    </>
  );
}
