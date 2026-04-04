'use client';

import { useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import CreatorFilter from './SectionCreatorFilter';
import CreatorStatCards from './CreatorStatCards';
import CreatePostModal from '@/app/components/Modals/CreatePostModal';
import { authApi } from '@/lib/axiosInstance';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import useAuthModalStore from '@/lib/store/useAuthModalStore';

export default function ExploreClientWrapper({ initialPosts, lastPage }) {
  const { data: session, update: updateSession } = useSession();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const [activeTab, setActiveTab] = useState('home');
  const { toast } = useToast();
  const { openAuthModal } = useAuthModalStore();

  const isCreator = !!session?.user?.is_creator;
  const isLoggedIn = !!session?.user;

  // Sort posts for trending: by total engagement (likes + shares) descending
  const trendingPosts = useMemo(() => {
    if (activeTab !== 'trending') return null;
    return [...posts].sort((a, b) => {
      const scoreA = (a.likes_count || 0) + (a.shares_count || 0);
      const scoreB = (b.likes_count || 0) + (b.shares_count || 0);
      return scoreB - scoreA;
    });
  }, [posts, activeTab]);

  const displayPosts = activeTab === 'trending' ? trendingPosts : posts;

  const handleUpgrade = useCallback(async () => {
    setUpgrading(true);
    try {
      const res = await authApi.post('/api/customer/upgrade-to-creator');
      if (res.data?.success) {
        toast({ title: "You're now a Creator!", description: 'Welcome to the creator community.' });
        await updateSession({ is_creator: true });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to upgrade.';
      if (err?.response?.status === 422 && msg.toLowerCase().includes('already')) {
        toast({ title: 'You are already a creator!', description: 'Refreshing your session...' });
        await updateSession({ is_creator: true });
      } else {
        toast({ title: 'Upgrade failed', description: msg, variant: 'destructive' });
      }
    } finally {
      setUpgrading(false);
    }
  }, [toast, updateSession]);

  // Called when the dynamic action button is clicked
  const handleActionClick = useCallback(() => {
    if (isCreator) {
      // Creator: open create post modal
      setCreateModalOpen(true);
    } else if (isLoggedIn) {
      // Logged-in non-creator: upgrade to creator
      handleUpgrade();
    } else {
      // Guest: open auth modal with onSuccess callback to auto-upgrade
      openAuthModal({
        onSuccess: async (newSession) => {
          try {
            await authApi.post('/api/customer/upgrade-to-creator');
            toast({ title: "You're now a Creator!", description: 'Welcome to the creator community.' });
            // Update session to reflect creator status without full page reload
            await updateSession({ is_creator: true });
          } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to upgrade.';
            if (err?.response?.status === 422 && msg.toLowerCase().includes('already')) {
              toast({ title: 'You are already a creator!' });
              await updateSession({ is_creator: true });
            } else {
              toast({ title: 'Upgrade failed', description: msg, variant: 'destructive' });
            }
          }
        },
      });
    }
  }, [isCreator, isLoggedIn, handleUpgrade, openAuthModal, toast, updateSession]);

  const handlePostCreated = (newPost) => {
    if (newPost) {
      setPosts((prev) => [newPost, ...prev]);
    }
  };

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
        initialPosts={displayPosts}
        lastPage={lastPage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onActionClick={handleActionClick}
        isLoggedIn={isLoggedIn}
        isCreator={isCreator}
        upgrading={upgrading}
      />

      {/* Create Post Modal */}
      {isCreator && <CreatePostModal open={createModalOpen} onOpenChange={setCreateModalOpen} onPostCreated={handlePostCreated} />}
    </>
  );
}
