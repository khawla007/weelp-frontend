import { signOut } from 'next-auth/react';

import { logout } from '../logout';
import { logoutAction } from '@/lib/actions/logoutAction';

jest.mock('next-auth/react', () => ({ signOut: jest.fn() }));
jest.mock('@/lib/actions/logoutAction', () => ({ logoutAction: jest.fn() }));

describe('logout', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...ORIGINAL_ENV,
      NEXT_PUBLIC_SITE_URL: 'http://192.168.29.189:3000',
    };
    logoutAction.mockResolvedValue({ ok: true });
    signOut.mockResolvedValue(undefined);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  it('redirects logout to the configured network site URL by default', async () => {
    await logout();

    expect(signOut).toHaveBeenCalledWith({
      callbackUrl: 'http://192.168.29.189:3000/',
    });
  });

  it('resolves relative callbackUrl options against the configured network site URL', async () => {
    await logout({ callbackUrl: '/user/login' });

    expect(signOut).toHaveBeenCalledWith({
      callbackUrl: 'http://192.168.29.189:3000/user/login',
    });
  });
});
