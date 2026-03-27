'use client';
import { ProfileSettings } from '@/app/components/Pages/DASHBOARD/customer/settings/ProfileSettings';
import { UserNotFound } from '@/app/components/Pages/DASHBOARD/UserNotFound';
import { useUserProfile } from '@/hooks/api/customer/profile';

const ProfilePage = () => {
  const { user, error, isLoading } = useUserProfile();

  return (
    <div className="w-full">
      <h2 className="font-bold text-lg">Profile</h2>
      <p className="text-base text-[#71717A] my-2">This is how others will see you on the site.</p>

      {user ? <ProfileSettings user={user} /> : <UserNotFound />}
    </div>
  );
};

export default ProfilePage;
