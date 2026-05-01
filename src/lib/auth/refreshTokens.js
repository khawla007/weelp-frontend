import { jwtDecode } from 'jwt-decode';

const TERMINAL_ERRORS = new Set(['refresh_token_reused', 'refresh_token_expired', 'refresh_token_missing', 'invalid_token', 'invalid_token_type', 'token_revoked', 'user_not_found']);

export async function refreshTokens(refreshToken) {
  if (!refreshToken) {
    return { ok: false, terminal: true, error: 'refresh_token_missing' };
  }

  let res;
  try {
    res = await fetch(`${process.env.API_BASE_URL}api/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (err) {
    return { ok: false, terminal: false, error: 'network_error', message: err?.message };
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore parse failure; treated below
  }

  if (!res.ok) {
    const error = data?.error || `http_${res.status}`;
    return { ok: false, terminal: TERMINAL_ERRORS.has(error), error };
  }

  if (!data?.accessToken || !data?.refreshToken) {
    return { ok: false, terminal: true, error: 'invalid_response' };
  }

  const accessExp = jwtDecode(data.accessToken).exp * 1000;
  const refreshExp = jwtDecode(data.refreshToken).exp * 1000;

  return {
    ok: true,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    accessExpiresAt: accessExp,
    refreshExpiresAt: refreshExp,
  };
}
