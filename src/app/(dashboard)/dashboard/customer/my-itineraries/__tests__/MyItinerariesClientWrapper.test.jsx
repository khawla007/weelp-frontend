import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import MyItinerariesClientWrapper from '../MyItinerariesClientWrapper';
import { requestCreatorItineraryPublish, restoreCreatorItinerary } from '@/lib/actions/creatorItineraries';

const push = jest.fn();
const refresh = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/lib/actions/creatorItineraries', () => ({
  requestEdit: jest.fn(),
  requestRemoval: jest.fn(),
  restoreCreatorItinerary: jest.fn(),
  requestCreatorItineraryPublish: jest.fn(),
}));
jest.mock(
  '@/app/components/Navigation/NavigationLink',
  () =>
    function MockNavigationLink({ children, href, ...props }) {
      return (
        <a href={href} {...props}>
          {children}
        </a>
      );
    },
);
jest.mock('@/app/components/DashboardShared', () => ({ DashboardMotionFrame: ({ children }) => <div>{children}</div> }));

const base = {
  id: 12,
  name: 'Desert Weekend',
  slug: 'desert-weekend',
  creator_id: 4,
  locations: [{ city: { name: 'Dubai', slug: 'dubai' } }],
  schedules: [{ day: 1 }],
};

describe('MyItinerariesClientWrapper lifecycle views', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Trash as a private restore-only view with remaining days', async () => {
    restoreCreatorItinerary.mockResolvedValue({ success: true, message: 'Restored' });
    render(<MyItinerariesClientWrapper initialItineraries={[{ ...base, status: 'deleted', days_until_purge: 18, deleted_at: '2026-08-08T12:00:00Z' }]} isCreator activeView="trash" activeStatus="" />);

    expect(screen.getByRole('link', { name: 'All Itineraries' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Drafts' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Trash' })).toBeInTheDocument();
    expect(screen.getByText('Permanently removed in 18 days')).toBeInTheDocument();
    expect(screen.getByText(/Removed Aug 8, 2026/)).toBeInTheDocument();
    expect(screen.queryByText('View & Book')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Restore to Draft' }));
    await waitFor(() => expect(restoreCreatorItinerary).toHaveBeenCalledWith(12));
    expect(push).toHaveBeenCalledWith('/dashboard/customer/my-itineraries?status=draft');
  });

  it('uses singular countdown copy and syncs rows after URL-filter navigation', () => {
    const { rerender } = render(
      <MyItinerariesClientWrapper initialItineraries={[{ ...base, status: 'deleted', days_until_purge: 1, deleted_at: '2026-08-08T12:00:00Z' }]} isCreator activeView="trash" />,
    );
    expect(screen.getByText('Permanently removed in 1 day')).toBeInTheDocument();

    rerender(<MyItinerariesClientWrapper initialItineraries={[{ ...base, id: 99, name: 'New Draft', status: 'draft' }]} isCreator activeView="active" activeStatus="draft" />);

    expect(screen.getByText('New Draft')).toBeInTheDocument();
    expect(screen.queryByText('Desert Weekend')).not.toBeInTheDocument();
  });

  it('renders standalone Draft editing and publication actions', async () => {
    requestCreatorItineraryPublish.mockResolvedValue({ success: true, message: 'Requested' });
    render(<MyItinerariesClientWrapper initialItineraries={[{ ...base, status: 'draft' }]} isCreator activeView="active" activeStatus="draft" />);

    expect(screen.getByRole('link', { name: 'Continue editing' })).toHaveAttribute('href', '/dashboard/customer/my-itineraries/12/edit');
    fireEvent.click(screen.getByRole('button', { name: 'Request publish' }));
    await waitFor(() => expect(requestCreatorItineraryPublish).toHaveBeenCalledWith(12));
    expect(push).toHaveBeenCalledWith('/dashboard/customer/my-itineraries');
  });
});
