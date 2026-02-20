'use client';
import BreakSection from '@/app/components/BreakSection';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu';
import { ArrowLeft, Settings, User } from 'lucide-react';
import Link from 'next/link';

// Setting Routes
const AccountRoutes = [
  {
    title: 'general',
    url: '/dashboard/admin/settings/',
    icon: <Settings size={18} />,
  },
  {
    title: 'profile',
    url: '/dashboard/admin/settings/profile',
    icon: <User size={18} />,
  },
];

const AdminSettingLayout = ({ children }) => {
  return (
    <div className="max-w-6xl p-10 w-full mx-auto space-y-4 ">
      <div className="flex justify-start gap-4 items-start">
        <Link href="/dashboard/admin/" className=" cursor-pointer">
          <ArrowLeft />
        </Link>
        <div className="space-y-2 ">
          <h1 className={'font-bold text-2xl'}>Settings</h1>
          <p className={'text-base text-[#71717A]'}>Manage your account settings and preferences</p>
        </div>
      </div>
      <BreakSection />

      <div className="flex space-x-8">
        <div className="flex flex-1 w-full tfc_adminSetting_nav">
          <NavigationMenu className="w-full max-w-full ">
            <NavigationMenuList className={'flex flex-col space-y-2 w-full min-w-full '}>
              {AccountRoutes?.map((val, index) => (
                <NavigationMenuItem key={index} className={`w-full min-w-full py-2 hover:bg-gray-100 rounded-md text-black font-medium `}>
                  <NavigationMenuLink asChild className="w-full px-4  ">
                    <Link className=" capitalize max-w-full w-full flex items-center gap-3 text-md " href={val?.url}>
                      {val?.icon}
                      {val?.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex-[3] w-full flex">{children}</div>
      </div>
    </div>
  );
};

export default AdminSettingLayout;
