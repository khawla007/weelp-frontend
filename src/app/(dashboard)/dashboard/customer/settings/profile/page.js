'use client';
import BreakSection from '@/app/components/BreakSection';
import { EditProfile } from '@/app/components/Pages/DASHBOARD/user/_rsc_pages/settings/EditProfile';
import { UserNotFound } from '@/app/components/Pages/DASHBOARD/UserNotFound';
import { useUserProfile } from '@/hooks/api/customer/profile';

const ProfilePage = () => {
  const { user, error, isLoading } = useUserProfile(); // client side fetch user

  return (
    <div className="w-full">
      <h2 className="font-bold text-lg">Profile</h2>
      <p className="text-base text-[#71717A] my-2">This is how others will see you on the site.</p>
      <BreakSection marginTop="my-4" />

      {user !== null && user !== undefined ? <EditProfile user={user} /> : <UserNotFound />}
    </div>
  );
};

export default ProfilePage;
