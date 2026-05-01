'use client';

import { getSession, signOut } from 'next-auth/react';

import { logoutAction } from '@/lib/actions/logoutAction';

const INFLIGHT_COOLDOWN_MS = 1500;

let inflight = null;

/**
 * Single-flight session refresh. The promise reference is held for a short
 * cooldown after resolution so 401s arriving back-to-back share one
 * /api/auth/session round trip — preventing the server jwt callback from
 * double-rotating and tripping the backend single-use refresh guard.
 *
 * @returns {Promise<string|null>} fresh access token, or null if session is gone.
 */
export function refreshSessionOnce() {
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const session = await getSession();
      if (!session || session.error) return null;
      return session.access_token ?? null;
    } catch (err) {
      console.error('refreshSessionOnce failed:', err?.message);
      return null;
    }
  })();

  inflight.finally(() => {
    setTimeout(() => {
      inflight = null;
    }, INFLIGHT_COOLDOWN_MS);
  });

  return inflight;
}

export async function forceSignOutToLogin() {
  // Best-effort backend revoke before clearing the cookie.
  try {
    await logoutAction();
  } catch (err) {
    console.error('forceSignOutToLogin logoutAction failed:', err?.message);
  }
  try {
    await signOut({ redirect: false });
  } catch (err) {
    console.error('forceSignOutToLogin signOut failed:', err?.message);
  }
  if (typeof window !== 'undefined') {
    window.location.href = '/user/login';
  }
}
