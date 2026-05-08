/**
 * @jest-environment node
 */

const createMock = jest.fn((config) => ({
  config,
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

const authMock = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: createMock,
  },
}));

jest.mock('../auth/auth', () => ({
  auth: authMock,
}));

describe('axiosInstance server auth client', () => {
  const originalApiBaseUrl = process.env.API_BASE_URL;

  beforeEach(() => {
    jest.resetModules();
    createMock.mockClear();
    authMock.mockReset();
    process.env.API_BASE_URL = 'https://api.example.test/';
  });

  afterEach(() => {
    process.env.API_BASE_URL = originalApiBaseUrl;
  });

  it('creates a server API client with the session bearer token', async () => {
    authMock.mockResolvedValue({ access_token: 'server-token' });

    const { createAuthenticatedServerApi } = await import('../axiosInstance');

    await createAuthenticatedServerApi();

    expect(createMock).toHaveBeenLastCalledWith({
      baseURL: 'https://api.example.test/',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer server-token',
      },
    });
  });

  it('omits Authorization when the server session has no access token', async () => {
    authMock.mockResolvedValue(null);

    const { createAuthenticatedServerApi } = await import('../axiosInstance');

    await createAuthenticatedServerApi();

    expect(createMock).toHaveBeenLastCalledWith({
      baseURL: 'https://api.example.test/',
      headers: {
        Accept: 'application/json',
      },
    });
  });

  it('routes getAuthApi to the server API client outside the browser', async () => {
    const serverApi = { kind: 'server-api' };
    createMock.mockReturnValueOnce({ kind: 'public-api' }).mockReturnValueOnce({ kind: 'module-auth-api' }).mockReturnValueOnce(serverApi);
    authMock.mockResolvedValue({ access_token: 'server-token' });

    const { getAuthApi } = await import('../axiosInstance');

    await expect(getAuthApi()).resolves.toBe(serverApi);
  });
});
