import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CreatorItinerariesClientWrapper from '../CreatorItinerariesClientWrapper';
import { adminPermanentlyDeleteCreatorItinerary, adminRestoreCreatorItinerary } from '@/lib/actions/creatorItineraries';

const refresh = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/lib/actions/creatorItineraries', () => ({
  approveCreatorItinerary: jest.fn(),
  rejectCreatorItinerary: jest.fn(),
  adminDeleteCreatorItinerary: jest.fn(),
  adminApproveEdit: jest.fn(),
  adminRejectEdit: jest.fn(),
  adminApproveRemoval: jest.fn(),
  adminRejectRemoval: jest.fn(),
  adminRestoreCreatorItinerary: jest.fn(),
  adminPublishCreatorItinerary: jest.fn(),
  adminPermanentlyDeleteCreatorItinerary: jest.fn(),
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

describe('admin creator itinerary Trash view', () => {
  it('shows restore and permanent deletion without public or preview actions', async () => {
    adminRestoreCreatorItinerary.mockResolvedValue({ success: true, message: 'Restored' });
    adminPermanentlyDeleteCreatorItinerary.mockResolvedValue({ success: true, message: 'Deleted' });
    render(
      <CreatorItinerariesClientWrapper
        initialItineraries={[{ id: 12, name: 'Desert Weekend', status: 'deleted', days_until_purge: 12, deleted_at: '2026-08-08T12:00:00Z', purge_at: '2026-09-07T12:00:00Z' }]}
        activeView="trash"
        activeStatus=""
      />,
    );

    expect(screen.getByRole('link', { name: 'Draft' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Trash' })).toBeInTheDocument();
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(screen.getByText(/Removed Aug 8, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Purges Sep 7, 2026/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete permanently' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm permanent deletion' }));
    await waitFor(() => expect(adminPermanentlyDeleteCreatorItinerary).toHaveBeenCalledWith(12));
  });

  it('syncs rows after URL-filter navigation and hides conflicting actions', () => {
    const { rerender } = render(
      <CreatorItinerariesClientWrapper initialItineraries={[{ id: 12, name: 'Pending removal', status: 'draft', removal_status: 'requested' }]} activeView="active" activeStatus="draft" />,
    );

    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve Removal' })).toBeInTheDocument();

    rerender(<CreatorItinerariesClientWrapper initialItineraries={[{ id: 99, name: 'Different page', status: 'approved' }]} activeView="active" activeStatus="approved" />);

    expect(screen.getByText('Different page')).toBeInTheDocument();
    expect(screen.queryByText('Pending removal')).not.toBeInTheDocument();
  });

  it('restores a trashed itinerary to Draft', async () => {
    adminRestoreCreatorItinerary.mockResolvedValue({ success: true, message: 'Restored' });
    render(<CreatorItinerariesClientWrapper initialItineraries={[{ id: 12, name: 'Desert Weekend', status: 'deleted', days_until_purge: 12 }]} activeView="trash" activeStatus="" />);

    fireEvent.click(screen.getByRole('button', { name: 'Restore to Draft' }));
    await waitFor(() => expect(adminRestoreCreatorItinerary).toHaveBeenCalledWith(12));
  });
});
