import { fireEvent, render, waitFor } from '@testing-library/react';
import UserLayout from '../layout';
import { useSession } from 'next-auth/react';
import { authApi } from '@/lib/axiosInstance';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/customer/overview',
}));

jest.mock('@/lib/axiosInstance', () => ({
  authApi: { get: jest.fn() },
}));

jest.mock('@/app/components/Layout/header', () => () => null);
jest.mock('@/app/components/Layout/footer', () => () => null);
jest.mock('@/app/components/Layout/DashboardSidebar', () => () => null);
jest.mock('@/app/components/Pages/DASHBOARD/DashboardContentWrapper', () => ({
  DashboardContentWrapper: ({ children }) => children,
}));
jest.mock('@/components/ui/toaster', () => ({ Toaster: () => null }));

describe('customer dashboard creator session reconciliation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes the cached creator role when no approved application remains', async () => {
    const update = jest.fn();
    useSession.mockReturnValue({ data: { user: { name: 'Creator', is_creator: true } }, update });
    authApi.get.mockResolvedValue({ data: { data: null } });

    render(<UserLayout>Dashboard</UserLayout>);

    await waitFor(() => {
      expect(authApi.get).toHaveBeenCalledWith('/api/customer/creator/application-status');
      expect(update).toHaveBeenCalledWith({ is_creator: false });
    });
  });

  it('does not check creator status for regular customers', () => {
    useSession.mockReturnValue({ data: { user: { name: 'Customer', is_creator: false } }, update: jest.fn() });

    render(<UserLayout>Dashboard</UserLayout>);

    expect(authApi.get).not.toHaveBeenCalled();
  });

  it('keeps the cached creator role when the application is still approved', async () => {
    const update = jest.fn();
    useSession.mockReturnValue({ data: { user: { name: 'Creator', is_creator: true } }, update });
    authApi.get.mockResolvedValue({ data: { data: { status: 'approved' } } });

    render(<UserLayout>Dashboard</UserLayout>);

    await waitFor(() => expect(authApi.get).toHaveBeenCalledTimes(1));
    expect(update).not.toHaveBeenCalled();
  });

  it('rechecks an already-mounted creator session when the window regains focus', async () => {
    const update = jest.fn();
    useSession.mockReturnValue({ data: { user: { name: 'Creator', is_creator: true } }, update });
    authApi.get.mockResolvedValueOnce({ data: { data: { status: 'approved' } } }).mockResolvedValueOnce({ data: { data: null } });

    render(<UserLayout>Dashboard</UserLayout>);
    await waitFor(() => expect(authApi.get).toHaveBeenCalledTimes(1));

    fireEvent.focus(window);

    await waitFor(() => {
      expect(authApi.get).toHaveBeenCalledTimes(2);
      expect(update).toHaveBeenCalledWith({ is_creator: false });
    });
  });
});
