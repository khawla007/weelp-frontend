/**
 * Tests for logoutAction.
 *
 * The action imports `decode` from `next-auth/jwt`, which is ESM and pulls in
 * `@auth/core` (Node-only). Mocking it here means the real module is never
 * resolved in jsdom, so this suite (and the pre-commit `--findRelatedTests`
 * hook) stays clean regardless of the next-auth chain.
 */

import { logoutAction } from '../logoutAction';
import { cookies } from 'next/headers';
import { decode } from 'next-auth/jwt';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('next-auth/jwt', () => ({ decode: jest.fn() }));

/** Build a fake cookie store whose getAll() returns the provided list. */
function mockCookieStore(cookieList) {
  cookies.mockResolvedValue({ getAll: () => cookieList });
}

describe('logoutAction', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...ORIGINAL_ENV,
      AUTH_SECRET: 'test-secret',
      API_BASE_URL: 'http://backend.test/',
    };
    global.fetch = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  it('returns { ok: true } when no session cookie is present', async () => {
    mockCookieStore([{ name: 'unrelated', value: 'x' }]);

    const result = await logoutAction();

    expect(result).toEqual({ ok: true });
    expect(decode).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reads a direct (unchunked) session cookie and passes it to decode', async () => {
    mockCookieStore([{ name: 'authjs.session-token', value: 'rawtoken' }]);
    decode.mockResolvedValue({ accessToken: 'AT', refreshToken: 'RT' });
    global.fetch.mockResolvedValue({ ok: true });

    const result = await logoutAction();

    expect(decode).toHaveBeenCalledWith({
      token: 'rawtoken',
      secret: 'test-secret',
      salt: 'authjs.session-token',
    });
    expect(result).toEqual({ ok: true });
  });

  it('reassembles a chunked session cookie in numeric order before decoding', async () => {
    // Out of order AND spanning past index 9, so a lexicographic sort would
    // place .10/.11 before .2 (-> AABBDDEECC). Expecting AABBCCDDEE proves the
    // source sorts numerically.
    mockCookieStore([
      { name: 'authjs.session-token.1', value: 'BB' },
      { name: 'authjs.session-token.10', value: 'DD' },
      { name: 'authjs.session-token.0', value: 'AA' },
      { name: 'authjs.session-token.11', value: 'EE' },
      { name: 'authjs.session-token.2', value: 'CC' },
    ]);
    decode.mockResolvedValue({ accessToken: 'AT' });
    global.fetch.mockResolvedValue({ ok: true });

    await logoutAction();

    expect(decode).toHaveBeenCalledWith(expect.objectContaining({ token: 'AABBCCDDEE', salt: 'authjs.session-token' }));
  });

  it('returns { ok: false } when decode throws', async () => {
    mockCookieStore([{ name: 'authjs.session-token', value: 'bad' }]);
    decode.mockRejectedValue(new Error('invalid jwt'));

    const result = await logoutAction();

    expect(result).toEqual({ ok: false });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it('returns { ok: true } without calling the backend when no accessToken is present', async () => {
    mockCookieStore([{ name: 'authjs.session-token', value: 'rawtoken' }]);
    decode.mockResolvedValue({ refreshToken: 'RT' }); // no accessToken

    const result = await logoutAction();

    expect(result).toEqual({ ok: true });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('calls the backend logout with bearer + refreshToken body and returns { ok: res.ok }', async () => {
    mockCookieStore([{ name: 'authjs.session-token', value: 'rawtoken' }]);
    decode.mockResolvedValue({ accessToken: 'AT', refreshToken: 'RT' });
    global.fetch.mockResolvedValue({ ok: true });

    const result = await logoutAction();

    expect(global.fetch).toHaveBeenCalledWith(
      'http://backend.test/api/logout',
      expect.objectContaining({
        method: 'POST',
        cache: 'no-store',
        headers: expect.objectContaining({ Authorization: 'Bearer AT' }),
        body: JSON.stringify({ refreshToken: 'RT' }),
      }),
    );
    expect(result).toEqual({ ok: true });
  });

  it('sends an empty body when no refreshToken is present', async () => {
    mockCookieStore([{ name: 'authjs.session-token', value: 'rawtoken' }]);
    decode.mockResolvedValue({ accessToken: 'AT' });
    global.fetch.mockResolvedValue({ ok: true });

    await logoutAction();

    expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ body: JSON.stringify({}) }));
  });

  it('returns { ok: false } when the backend responds non-ok', async () => {
    mockCookieStore([{ name: 'authjs.session-token', value: 'rawtoken' }]);
    decode.mockResolvedValue({ accessToken: 'AT' });
    global.fetch.mockResolvedValue({ ok: false });

    const result = await logoutAction();

    expect(result).toEqual({ ok: false });
  });

  it('returns { ok: false } when the backend fetch throws', async () => {
    mockCookieStore([{ name: 'authjs.session-token', value: 'rawtoken' }]);
    decode.mockResolvedValue({ accessToken: 'AT' });
    global.fetch.mockRejectedValue(new Error('network down'));

    const result = await logoutAction();

    expect(result).toEqual({ ok: false });
    expect(console.error).toHaveBeenCalled();
  });

  it('falls back through the COOKIE_BASES list to legacy next-auth names', async () => {
    mockCookieStore([{ name: 'next-auth.session-token', value: 'legacy' }]);
    decode.mockResolvedValue({ accessToken: 'AT' });
    global.fetch.mockResolvedValue({ ok: true });

    await logoutAction();

    expect(decode).toHaveBeenCalledWith(expect.objectContaining({ token: 'legacy', salt: 'next-auth.session-token' }));
  });
});
