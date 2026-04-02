'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreatePostModal from '@/app/components/Modals/CreatePostModal';

export default function QuickActions() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handlePostCreated = (newPost) => {
    // Refresh the page or update state as needed
    router.refresh();
  };

  return (
    <>
      <div className="flex gap-4">
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-secondaryDark hover:bg-secondaryDark/90 text-white"
        >
          <Plus className="size-4 mr-2" />
          Create Post
        </Button>
        <Button
          onClick={() => router.push('/dashboard/customer/posts')}
          variant="outline"
          className="border-[#435a6742] text-[#435a67] hover:bg-[#CFDBE54D]"
        >
          <FileText className="size-4 mr-2" />
          View My Posts
        </Button>
      </div>

      <CreatePostModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onPostCreated={handlePostCreated}
      />
    </>
  );
}
