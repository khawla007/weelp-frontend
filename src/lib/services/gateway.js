// FastAPI integration gateway client.
//
// The gateway proxies place providers (Mapbox, Nominatim) and applies tiered
// rate limits keyed off the bearer: anonymous callers get the IP bucket
// (60/min), bearer-carrying callers land in the user bucket (600/min). The
// frontend's job is to forward the NextAuth-issued JWT when one exists and
// otherwise stay out of the way — the gateway already falls through to the
// anonymous tier on a missing or invalid bearer, so a 401 from /v1/places/*
// would mean the gateway itself is misconfigured.
//
// `NEXT_PUBLIC_GATEWAY_URL` is the only contract; do not hard-code the host
// elsewhere. Default points at the dev port (9100, not 9000 — MinIO holds 9000).

const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL?.replace(/\/$/, '') || 'http://localhost:9100';

export class GatewayError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = 'GatewayError';
    this.status = status ?? 0;
    this.body = body ?? null;
  }
}

function buildUrl(path, params) {
  const url = new URL(`${GATEWAY_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function gatewayFetch(path, { params, token, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, params), { method: 'GET', headers, signal });

  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch {
      // non-JSON error body is fine; status code is enough for the caller.
    }
    throw new GatewayError(
      body?.detail || body?.message || `Gateway ${res.status}`,
      { status: res.status, body },
    );
  }

  return res.json();
}

export async function geocode(q, { limit = 5, token, signal } = {}) {
  return gatewayFetch('/v1/places/geocode', {
    params: { q, limit },
    token,
    signal,
  });
}

export async function reverse(lat, lng, { token, signal } = {}) {
  return gatewayFetch('/v1/places/reverse', {
    params: { lat, lng },
    token,
    signal,
  });
}

export async function me({ token, signal } = {}) {
  return gatewayFetch('/v1/me', { token, signal });
}

export async function getServerSessionToken() {
  const { auth } = await import('@/lib/auth/auth');
  const session = await auth();
  return session?.access_token ?? null;
}

export const __testing = { GATEWAY_URL, buildUrl };
