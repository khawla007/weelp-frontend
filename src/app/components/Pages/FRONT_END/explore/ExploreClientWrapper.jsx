'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import CreatorFilter from './SectionCreatorFilter';
import CreatorStatCards from './CreatorStatCards';
import CreatePostModal from '@/app/components/Modals/CreatePostModal';
import { authApi } from '@/lib/axiosInstance';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function ExploreClientWrapper({ initialPosts, lastPage }) {
  const { data: session, update: updateSession } = useSession();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [posts, setPosts] = useState(initialPosts);
  const { toast } = useToast();

  const isCreator = !!session?.user?.is_creator;
  const isLoggedIn = !!session?.user;

  const handleCreateClick = () => {
    if (isCreator) {
      setCreateModalOpen(true);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await authApi.post('/api/customer/upgrade-to-creator');
      if (res.data?.success) {
        toast({ title: 'You are now a creator!', description: 'Welcome to the creator community.' });
        await updateSession({ is_creator: true });
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to upgrade.';
      if (err?.response?.status === 422 && msg.toLowerCase().includes('already')) {
        toast({ title: 'You are already a creator!', description: 'Refreshing your session...' });
        await updateSession({ is_creator: true });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast({ title: 'Upgrade failed', description: msg, variant: 'destructive' });
        setUpgrading(false);
      }
    }
  };

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
      <CreatorFilter initialPosts={posts} lastPage={lastPage} onCreateClick={handleCreateClick} />

      {/* Create Post Modal */}
      {isCreator && <CreatePostModal open={createModalOpen} onOpenChange={setCreateModalOpen} onPostCreated={handlePostCreated} />}
    </>
  );
}
