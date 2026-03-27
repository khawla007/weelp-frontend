'use client';

import React from 'react';
import Link from 'next/link';
import { User, House, Heart, Settings, Tags, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import useAuthModalStore from '@/lib/store/useAuthModalStore';

const SubmenuAccount = ({ showSubmenu, setShowSubmenu }) => {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModalStore();

  if (status === 'loading') {
    return null;
  }

  const closeDropdown = () => setShowSubmenu(false);

  return (
    <div
      onMouseLeave={(e) => {
        e.stopPropagation();
        setShowSubmenu(false);
      }}
      className="absolute right-0 top-3/4 border rounded-xl bg-white z-10 whitespace-nowrap"
    >
      <ul>
        {!session ? (
          <>
            <li className="p-4 px-8 border-b text-[#5A5A5A]">
              <Link href="/user/login" onClick={closeDropdown} className="text-md leading-5 flex gap-x-2">
                <User className="size-5" /> SignUp / Login
              </Link>
            </li>
            <li className="p-4 px-8 border-b text-[#5A5A5A]">
              <button
                className="text-md leading-5 flex gap-x-2"
                onClick={() => {
                  closeDropdown();
                  openAuthModal({ redirectTo: '/dashboard/customer' });
                }}
              >
                <House className="size-5" />
                Dashboard
              </button>
            </li>
            <li className="p-4 px-8 border-b text-[#5A5A5A]">
              <button
                className="text-md leading-5 flex gap-x-2"
                onClick={() => {
                  closeDropdown();
                  openAuthModal({ redirectTo: '/dashboard/customer' });
                }}
              >
                <Heart className="size-5" />
                Wishlist
              </button>
            </li>
          </>
        ) : (
          <>
            {session?.user?.role === 'super_admin' ? (
              <>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <Link href="/dashboard/admin" onClick={closeDropdown} className="text-md leading-5 flex gap-x-2">
                    <House className="size-5" />
                    Dashboard
                  </Link>
                </li>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <Link href="/dashboard/admin/settings" onClick={closeDropdown} className="text-md leading-5 flex gap-x-2">
                    <Settings className="size-5" />
                    Settings
                  </Link>
                </li>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <Link href="/dashboard/admin/settings" onClick={closeDropdown} className="text-md leading-5 flex gap-x-2">
                    <Tags className="size-5" />
                    Taxonomies
                  </Link>
                </li>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <button
                    className="text-md leading-5 flex gap-x-2"
                    onClick={() => {
                      closeDropdown();
                      signOut({ callbackUrl: '/' });
                    }}
                  >
                    <LogOut className="size-5" />
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <Link href="/dashboard/customer" onClick={closeDropdown} className="text-md leading-5 flex gap-x-2">
                    <House className="size-5" />
                    Dashboard
                  </Link>
                </li>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <Link href="/dashboard/customer" onClick={closeDropdown} className="text-md leading-5 flex gap-x-2">
                    <Heart className="size-5" />
                    Wishlist
                  </Link>
                </li>
                <li className="p-4 px-8 border-b text-[#5A5A5A]">
                  <button
                    className="text-md leading-5 flex gap-x-2"
                    onClick={() => {
                      closeDropdown();
                      signOut({ callbackUrl: '/' });
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
