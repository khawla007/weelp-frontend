'use server';

import { cookies } from 'next/headers';
import { decode } from 'next-auth/jwt';

const COOKIE_BASES = ['authjs.session-token', '__Secure-authjs.session-token', 'next-auth.session-token', '__Secure-next-auth.session-token'];

// Auth.js v5 chunks the session cookie when the encrypted JWT exceeds ~4 KB,
// emitting `<base>.0`, `<base>.1`, ... in numeric order. Reassemble before
// passing to decode().
async function readSessionCookie() {
  const store = await cookies();
  const all = store.getAll();

  for (const base of COOKIE_BASES) {
    const direct = all.find((c) => c.name === base);
    if (direct?.value) return { name: base, value: direct.value };

    const chunks = all
      .filter((c) => c.name.startsWith(`${base}.`))
      .map((c) => ({ idx: Number(c.name.slice(base.length + 1)), value: c.value }))
      .filter((c) => Number.isInteger(c.idx))
      .sort((a, b) => a.idx - b.idx);

    if (chunks.length > 0) {
      return { name: base, value: chunks.map((c) => c.value).join('') };
    }
  }
  return null;
}

export async function logoutAction() {
  const cookie = await readSessionCookie();
  if (!cookie) return { ok: true };

  let token;
  try {
    token = await decode({
      token: cookie.value,
      secret: process.env.AUTH_SECRET,
      salt: cookie.name,
    });
  } catch (err) {
    console.error('logoutAction: jwt decode failed:', err?.message);
    return { ok: false };
  }

  const accessToken = token?.accessToken;
  const refreshToken = token?.refreshToken;
  if (!accessToken) return { ok: true };

  try {
    const res = await fetch(`${process.env.API_BASE_URL}api/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
      cache: 'no-store',
    });
    return { ok: res.ok };
  } catch (err) {
    console.error('logoutAction: fetch failed:', err?.message);
    return { ok: false };
  }
}
