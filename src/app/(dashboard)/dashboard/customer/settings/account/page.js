'use client';

import { AccountSettings } from '@/app/components/Pages/DASHBOARD/customer/settings/AccountSettings';
import { useUserProfile } from '@/hooks/api/customer/profile';

const AccountPage = () => {
  const { user } = useUserProfile();

  return <AccountSettings user={user} />;
};

export default AccountPage;
