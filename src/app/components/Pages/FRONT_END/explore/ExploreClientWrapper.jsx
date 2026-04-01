'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import CreatorFilter from './SectionCreatorFilter';
import CreatorStatCards from './CreatorStatCards';
import CreatePostModal from '@/app/components/Modals/CreatePostModal';
import { upgradeToCreator } from '@/lib/actions/posts';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function ExploreClientWrapper({ initialPosts, lastPage }) {
  const { data: session, update: updateSession } = useSession();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [posts, setPosts] = useState(initialPosts);

  const isCreator = session?.user?.is_creator;
  const isLoggedIn = !!session?.user;

  const handleCreateClick = () => {
    if (isCreator) {
      setCreateModalOpen(true);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    const result = await upgradeToCreator();
    if (result.success) {
      await updateSession();
      window.location.reload();
    }
    setUpgrading(false);
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
        <div className="max-w-[95%] mx-auto px-6 py-4">
          <div className="flex items-center justify-between bg-gradient-to-r from-secondaryDark/10 to-secondaryDark/5 rounded-xl p-6">
            <div>
              <h3 className="text-lg font-semibold text-[#142A38]">Become a Creator</h3>
              <p className="text-sm text-[#5A5A5A] mt-1">
                Share your travel experiences and earn commissions on bookings.
              </p>
            </div>
            <Button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="bg-secondaryDark hover:bg-secondaryDark/90 text-white"
            >
              <Sparkles className="size-4 mr-2" />
              {upgrading ? 'Upgrading...' : 'Get Started'}
            </Button>
          </div>
        </div>
      )}

      {/* Post Feed */}
      <CreatorFilter
        initialPosts={posts}
        lastPage={lastPage}
        onCreateClick={handleCreateClick}
      />

      {/* Create Post Modal */}
      {isCreator && (
        <CreatePostModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onPostCreated={handlePostCreated}
        />
      )}
    </>
  );
}
