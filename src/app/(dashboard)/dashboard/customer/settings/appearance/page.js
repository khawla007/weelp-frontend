'use client';

import { AppearanceSettings } from '@/app/components/Pages/DASHBOARD/customer/settings/AppearanceSettings';
import { useUserProfile } from '@/hooks/api/customer/profile';

const AppearancePage = () => {
  const { user } = useUserProfile();

  return <AppearanceSettings user={user} />;
};

export default AppearancePage;
