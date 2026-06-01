'use client';

import { AccountSettings } from '@/app/components/Pages/DASHBOARD/customer/settings/AccountSettings';
import { PageSkeleton } from '@/app/components/Animation/Cards';
import { useUserProfile } from '@/hooks/api/customer/profile';

const AccountPage = () => {
  const { user, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
        <PageSkeleton />
      </div>
    );
  }

  return <AccountSettings user={user} />;
};

export default AccountPage;
