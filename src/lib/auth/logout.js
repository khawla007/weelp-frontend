'use client';

import { signOut } from 'next-auth/react';

import { logoutAction } from '@/lib/actions/logoutAction';

export async function logout(options = {}) {
  try {
    await logoutAction();
  } catch (err) {
    console.error('logout: backend revoke failed:', err?.message);
  }
  await signOut(options);
}
