'use client';

import { signOut } from 'next-auth/react';

import { logoutAction } from '@/lib/actions/logoutAction';

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.BASE_URL || '/';
}

function withLogoutRedirect(options) {
  const callbackUrl = options.callbackUrl || '/';

  return {
    ...options,
    callbackUrl: new URL(callbackUrl, getSiteUrl()).toString(),
  };
}

export async function logout(options = {}) {
  try {
    await logoutAction();
  } catch (err) {
    console.error('logout: backend revoke failed:', err?.message);
  }
  await signOut(withLogoutRedirect(options));
}
