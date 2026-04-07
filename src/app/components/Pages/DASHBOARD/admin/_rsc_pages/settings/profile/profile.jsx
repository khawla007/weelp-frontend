'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import AvatarUpload from '@/components/ui/AvatarUpload';
import { useToast } from '@/hooks/use-toast';
import { editUserProfileAction } from '@/lib/actions/userActions';
import { PageInfo } from '../settings_shared';

export default function AdminProfileSettings() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const user = session?.user || {};
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || null);

  const handleAvatarUpload = async (url) => {
    try {
      const result = await editUserProfileAction({ avatar: url });
      if (result.success) {
        setAvatarUrl(url);
        await update({ avatar: url });
        toast({ title: 'Avatar updated successfully' });
      } else {
        toast({ variant: 'destructive', title: 'Failed to save avatar' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to save avatar' });
    }
  };

  return (
    <div className="space-y-6">
      <PageInfo
        pageTitle="Profile Settings"
        pageDescription="Manage your profile picture and personal information."
      />

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <h3 className="text-base font-medium">Profile Picture</h3>
          <AvatarUpload currentAvatar={avatarUrl} onUploadSuccess={handleAvatarUpload} />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <h3 className="text-base font-medium">Account Information</h3>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm mt-1">{user.name || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm mt-1">{user.email || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <p className="text-sm mt-1 capitalize">{user.role || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
