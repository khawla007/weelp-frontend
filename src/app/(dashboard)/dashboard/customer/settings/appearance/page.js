'use client';

import { AppearanceSettings } from '@/app/components/Pages/DASHBOARD/customer/settings/AppearanceSettings';
import { PageSkeleton } from '@/app/components/Animation/Cards';
import { useUserProfile } from '@/hooks/api/customer/profile';

const AppearancePage = () => {
  const { user, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
        <PageSkeleton />
      </div>
    );
  }

  return <AppearanceSettings user={user} />;
};

export default AppearancePage;
