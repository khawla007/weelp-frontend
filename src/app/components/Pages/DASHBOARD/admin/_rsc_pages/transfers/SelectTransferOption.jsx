'use client';
import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SelectTransferOption = () => {
  //intialize route
  const router = useRouter();

  // route selection
  const selectRoute = [
    {
      label: 'By Admin',
      icon: <User className="h-6 w-6" />,
      url: '/dashboard/admin/transfers/new/admin',
      disabled: false,
    }, // admin transfer creation
    {
      label: 'By Vendor',
      icon: <User className="h-6 w-6" />,
      url: '/dashboard/admin/transfers/new/vendor',
      disabled: true, // Coming soon
    }, // vendor based transfer creation
  ];

  return (
    <Card className="bg-inherit border-none shadow-none h-[70vh] flex items-center justify-center">
      <CardHeader className="flex gap-4 justify-start h-full w-full p-0 sm:p-4">
        <CardTitle className="flex gap-3 self-start">
          <ArrowLeft onClick={() => router.back()} cursor="pointer" /> Create Transfer
        </CardTitle>

        <div className="flex flex-wrap self-center gap-4 w-full sm:w-fit ">
          {selectRoute.map((route, index) => (
            <div key={index} className="flex flex-col items-center justify-center w-full sm:size-52 p-4 shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl relative">
              {route.disabled ? (
                <>
                  {/* Disabled Card */}
                  <div className="flex flex-col items-center justify-center opacity-50 cursor-not-allowed w-full h-full">
                    <div className="bg-gray-400 text-white p-3 rounded-full mb-2">{route.icon}</div>
                    <p className="text-sm font-semibold">{route.label}</p>
                  </div>
                  {/* Coming Soon Badge */}
                  <Badge variant="success" className="text-[8px] animate-pulse absolute bottom-2">
                    Coming Soon
                  </Badge>
                </>
              ) : (
                <Link href={route.url} className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <div className="bg-primary text-white p-3 rounded-full mb-2">{route.icon}</div>
                  <p className="text-sm font-semibold">{route.label}</p>
                </Link>
              )}
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  );
};

export default SelectTransferOption;
