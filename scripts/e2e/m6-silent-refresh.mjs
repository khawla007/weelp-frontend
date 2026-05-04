#!/usr/bin/env node

/**
 * M6 silent-refresh E2E contract test (closes audit follow-up M).
 *
 * Exercises the live single-use refresh contract against a running backend.
 * Pure HTTP — no browser — so it can run in CI alongside `php artisan test`.
 *
 * Backend must be running (default http://localhost:8000). Override via
 *   API_BASE=http://staging.example.com node scripts/e2e/m6-silent-refresh.mjs
 *
 * Asserts:
 *   1. Login returns access + refresh tokens
 *   2. Refresh rotates both tokens (server returns new pair)
 *   3. Old refresh token is single-use → reuse returns 401
 *   4. 5 parallel refreshes from the same starting refresh — exactly one
 *      request succeeds, the other 4 race and either succeed-then-revoke or
 *      get token_revoked. The contract here is "no double-spend": no two
 *      different access tokens may be issued from the same refresh.
 *
 * Exit codes: 0 = all green, 1 = any assertion failed, 2 = setup error.
 */

const API_BASE = process.env.API_BASE || 'http://localhost:8000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'atul@fanaticcoders.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'atul@123#';

let failures = 0;
const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed, detail });
  if (!passed) failures++;
  const mark = passed ? '✓' : '✗';
  console.log(`  ${mark} ${name}${detail ? ' — ' + detail : ''}`);
}

async function post(path, body, accessToken) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

async function login() {
  const res = await post('/api/login', { email: TEST_EMAIL, password: TEST_PASSWORD });
  if (res.status !== 200) {
    console.error(`Login failed (${res.status}):`, res.data);
    process.exit(2);
  }
  const access = res.data?.access_token || res.data?.accessToken || res.data?.token;
  const refresh = res.data?.refresh_token || res.data?.refreshToken;
  if (!access || !refresh) {
    console.error('Login response missing tokens. Got keys:', Object.keys(res.data || {}));
    process.exit(2);
  }
  return { access, refresh };
}

async function refresh(refreshToken) {
  return post('/api/refresh-token', { refreshToken });
}

async function main() {
  console.log(`M6 silent-refresh E2E — API_BASE=${API_BASE}`);
  console.log('');

  const initial = await login();
  record('1. login returns access + refresh tokens', !!initial.access && !!initial.refresh);

  const r1 = await refresh(initial.refresh);
  const newAccess = r1.data?.access_token || r1.data?.accessToken;
  const newRefresh = r1.data?.refresh_token || r1.data?.refreshToken;
  record(
    '2. /refresh-token rotates both tokens',
    r1.status === 200 && !!newAccess && !!newRefresh && newRefresh !== initial.refresh,
    `status=${r1.status}, refresh-rotated=${newRefresh !== initial.refresh}`
  );

  const r2 = await refresh(initial.refresh);
  record(
    '3. reusing old refresh returns 401 token_revoked',
    r2.status === 401,
    `status=${r2.status}`
  );

  const fresh = await login();
  const parallel = await Promise.all([
    refresh(fresh.refresh),
    refresh(fresh.refresh),
    refresh(fresh.refresh),
    refresh(fresh.refresh),
    refresh(fresh.refresh),
  ]);
  const successes = parallel.filter((r) => r.status === 200);
  const issuedAccess = new Set(
    successes
      .map((r) => r.data?.access_token || r.data?.accessToken)
      .filter(Boolean)
  );
  record(
    '4. parallel refreshes never double-spend a single refresh',
    issuedAccess.size <= 1,
    `successes=${successes.length}, distinct access issued=${issuedAccess.size}`
  );

  console.log('');
  console.log(`Results: ${results.length - failures}/${results.length} passed`);
  process.exit(failures > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(2);
});
