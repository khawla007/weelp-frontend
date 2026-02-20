'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, House, Heart, Settings, Tags, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoginForm } from '../Form/LoginForm';

const SubmenuAccount = ({ showSubmenu, setShowSubmenu }) => {
  const [open, setOpen] = useState();
  // pathname
  const pathname = usePathname();

  const dynamicPaths = pathname;

  const { data: session, status } = useSession();

  // If session is loading, don't render anything yet to avoid flickering
  if (status === 'loading') {
    return null; // or a loading spinner if you prefer
  }

  if (session) {
    const { role } = session?.user;
  }
  return (
    <div
      onMouseLeave={(e) => {
        e.stopPropagation();
        setShowSubmenu(!showSubmenu);
      }}
      className="absolute top-3/4 border rounded-xl bg-white z-10"
    >
      <ul>
        {/* Conditionally render the first li based on session existence */}
        {!session ? (
          <>
            <Dialog open={open} onOpenChange={setOpen}>
              <li className="p-4 px-8 border-b text-[#5A5A5A]">
                <DialogTrigger asChild>
                  <button className="text-md leading-5 flex gap-x-2">
                    <User className="size-5" /> SignUp / Login
                  </button>
                </DialogTrigger>
              </li>
              <li className="p-4 px-8 border-b text-[#5A5A5A]">
                <DialogTrigger asChild>
                  <button className="text-md leading-5 flex gap-x-2">
                    <House className="size-5" />
                    Dashboard
                  </button>
                </DialogTrigger>
              </li>
              <li className="p-4 px-8 border-b text-[#5A5A5A]">
                <DialogTrigger asChild>
                  <button className="text-md leading-5 flex gap-x-2">
                    <Heart className="size-5" />
                    Wishlist
                  </button>
                </DialogTrigger>
              </li>
              <DialogContent className={'bg-transparent border-none'} aria-describedby={undefined}>
                <DialogTitle className="sr-only">Are you absolutely sure?</DialogTitle>
                <LoginForm onCloseDialog={() => setOpen(false)} customUrl={dynamicPaths || '/'} />
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            {/* Role Based Links */}
            {session?.user?.role === 'super_admin' ? (
              <>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <Link href={'/dashboard/admin'}>
                    <button className="text-md leading-5 flex gap-x-2">
                      <House className="size-5" />
                      Dashboard
                    </button>
                  </Link>
                </li>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <Link href={'/dashboard/admin/settings'}>
                    <button className="text-md leading-5 flex gap-x-2">
                      <Settings className="size-5" />
                      Settings
                    </button>
                  </Link>
                </li>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <Link href={'/dashboard/admin/settings'}>
                    <button className="text-md leading-5 flex gap-x-2">
                      <Tags className="size-5" />
                      Taxonomies
                    </button>
                  </Link>
                </li>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <button
                    className="text-md leading-5 flex gap-x-2"
                    onClick={() => {
                      signOut({ redirect: false, redirectTo: '/' });
                    }}
                  >
                    <LogOut className="size-5" />
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                {/** For customer link */}
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <Link href={'/dashboard/customer'}>
                    <button className="text-md leading-5 flex gap-x-2">
                      <House className="size-5" />
                      Dashboard
                    </button>
                  </Link>
                </li>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <Link href={'/dashboard/cusomter'}>
                    <button className="text-md leading-5 flex gap-x-2">
                      <Heart className="size-5" />
                      Wishlist
                    </button>
                  </Link>
                </li>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <button
                    className="text-md leading-5 flex gap-x-2"
                    onClick={() => {
                      signOut({ redirect: false, redirectTo: '/' });
                    }}
                  >
                    <LogOut className="size-5" />
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </>
        )}
      </ul>
    </div>
  );
};

export default SubmenuAccount;
