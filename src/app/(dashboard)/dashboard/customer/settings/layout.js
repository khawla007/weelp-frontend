import BreakSection from '@/app/components/BreakSection';
import { AccountLinks } from '@/app/components/Pages/DASHBOARD/user/user_components/AccountLinks';

// Setting Routes
const AccountRoutes = [
  { title: 'Profile', url: '/dashboard/customer/settings/profile' },
  { title: 'Appearance', url: '/dashboard/customer/settings/appearance' },
  { title: 'Notifications', url: '/dashboard/customer/settings/notifications' },
  { title: 'Account', url: '/dashboard/customer/settings/account' },
];

const SettingLayout = ({ children }) => {
  return (
    <div className="max-w-6xl p-10 w-full mx-auto space-y-4">
      <div className="space-y-2 ">
        <h1 className={'font-bold text-2xl'}>Settings</h1>
        <p className={'text-base text-[#71717A]'}>Manage your account settings and set e-mail preferences</p>
      </div>
      <BreakSection />

      <div className="flex space-x-8">
        {/** Links Dynamic */}
        <div className="flex flex-1 w-full">
          <AccountLinks AccountRoutes={AccountRoutes} />
        </div>
        <div className="flex-[3] w-full flex">{children}</div>
      </div>
    </div>
  );
};

export default SettingLayout;
