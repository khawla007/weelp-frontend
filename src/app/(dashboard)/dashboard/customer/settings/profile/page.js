'use client';
import { ProfileSettings } from '@/app/components/Pages/DASHBOARD/customer/settings/ProfileSettings';
import { PageSkeleton } from '@/app/components/Animation/Cards';
import { UserNotFound } from '@/app/components/Pages/DASHBOARD/UserNotFound';
import { useUserProfile } from '@/hooks/api/customer/profile';

const ProfilePage = () => {
  const { user, error, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
        <PageSkeleton />
        <p className="text-sm text-muted-foreground mt-4">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="font-bold text-lg">Profile</h2>
      <p className="text-base text-muted-foreground my-2">This is how others will see you on the site.</p>

      {user ? <ProfileSettings user={user} /> : <UserNotFound />}
    </div>
  );
};

export default ProfilePage;
