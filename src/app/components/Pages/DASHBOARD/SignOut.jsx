'use client';
import { buttonVariants } from '@/components/ui/button';

import { logout } from '@/lib/auth/logout';

export function SignOut() {
  return (
    <button className={`${buttonVariants()} w-fit`} onClick={() => logout()}>
      Sign Out
    </button>
  );
}
