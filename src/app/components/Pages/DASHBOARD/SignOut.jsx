'use client';
import { buttonVariants } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

export function SignOut() {
  return (
    <button className={`${buttonVariants()} w-fit`} onClick={() => signOut()}>
      Sign Out
    </button>
  );
}
