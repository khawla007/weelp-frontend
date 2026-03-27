'use client';

import { AppearanceSettings } from '@/app/components/Pages/DASHBOARD/customer/settings/AppearanceSettings';
import { useUserProfile } from '@/hooks/api/customer/profile';

const AppearancePage = () => {
  const { user, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
        <span className="loader"></span>
      </div>
    );
  }

  return <AppearanceSettings user={user} />;
};

export default AppearancePage;
