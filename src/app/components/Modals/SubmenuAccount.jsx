'use client';

import React from 'react';
import Link from 'next/link';
import { User, House, Heart, Settings, Tags, LogOut } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { logout } from '@/lib/auth/logout';
import useAuthModalStore from '@/lib/store/useAuthModalStore';

const SubmenuAccount = ({ showSubmenu, setShowSubmenu }) => {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModalStore();

  // Generate initials from name for fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Format role for display
  const formatRole = (role, isCreator) => {
    if (!role) return '';
    // Customer & Creator
    if (role === 'customer' && isCreator) {
      return 'Customer & Creator';
    }
    // Handle multiple roles separated by comma
    if (role.includes(',')) {
      const roles = role.split(',').map((r) =>
        r
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
          .trim(),
      );
      if (roles.length === 2) {
        return `${roles[0]} & ${roles[1]}`;
      }
      return roles.join(', ');
    }
    return role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (status === 'loading') {
    return null;
  }

  // Extract user data
  const user = session?.user || {};
  const { name = '', email = '', role = '', avatar, is_creator: rawIsCreator = false } = user;
  const is_creator = !!rawIsCreator;
  const userInitials = getInitials(name);
  const avatarSrc = avatar;

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
                  openAuthModal({ redirectTo: '/dashboard' });
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
                  openAuthModal({ redirectTo: '/dashboard' });
                }}
              >
                <Heart className="size-5" />
                Wishlist
              </button>
            </li>
          </>
        ) : (
          <>
            {/* User Info Header */}
            <li className="p-4 px-6 flex items-center gap-x-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden" style={{ backgroundColor: '#568f7c' }}>
                {avatarSrc ? <img src={avatarSrc} alt={name || 'user'} className="h-full w-full object-cover" /> : <span>{userInitials}</span>}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">{name || 'User'}</span>
                {role && <span className="text-xs text-gray-500">{formatRole(role, is_creator)}</span>}
              </div>
            </li>
            <li className="border-b" aria-hidden="true"></li>
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
                      logout({ callbackUrl: '/' });
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
                  <Link href={is_creator ? '/dashboard/customer/overview' : '/dashboard/customer'} onClick={closeDropdown} className="text-md leading-5 flex gap-x-2">
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
                      logout({ callbackUrl: '/' });
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
