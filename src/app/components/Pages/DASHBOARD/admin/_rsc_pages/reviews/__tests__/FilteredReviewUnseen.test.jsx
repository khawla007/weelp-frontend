import { render } from '@testing-library/react';
import useSWR from 'swr';

import { useMarkAdminNavigationSeen } from '@/hooks/api/admin/navigationUnseen';

import FilteredReview from '../FilteredReview';

jest.mock('swr', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/hooks/api/admin/navigationUnseen', () => ({
  newestCreatedAt: jest.requireActual('@/hooks/api/admin/navigationUnseen').newestCreatedAt,
  useMarkAdminNavigationSeen: jest.fn(),
}));
jest.mock('react-hook-form', () => ({
  useForm: () => ({ control: {}, setValue: jest.fn() }),
  useWatch: () => ({ search: '', page: 1, item_type: 'all', status: 'all' }),
}));
jest.mock('lodash', () => ({
  debounce: (callback) => Object.assign(callback, { cancel: jest.fn() }),
}));
jest.mock('@/components/ui/form', () => ({ Form: ({ children }) => <div>{children}</div> }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/lib/actions/reviews', () => ({ deleteReview: jest.fn(), deleteMultipleReviews: jest.fn() }));
jest.mock('@/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/components/table/Table', () => ({ ReviewTable: () => <div>Review table</div> }));
jest.mock('@/app/components/Pagination', () => ({ CustomPagination: () => <div>Pagination</div> }));
jest.mock('@/app/components/DashboardShared', () => ({ TableSkeleton: () => <div>Loading reviews</div> }));
jest.mock('@/app/components/BulkActions/BulkActionButtons', () => ({ BulkActionButtons: () => <div>Bulk actions</div> }));
jest.mock('@/app/components/Button/AddNewButton', () => ({ AddNewButton: () => <span>Add review</span> }));
jest.mock('@/app/components/DashboardShared/FilterBar', () => ({ FilterBar: () => <div>Review filters</div> }));

function reviewResponse(records, requestState = {}) {
  return {
    data: {
      data: {
        current_page: 1,
        per_page: 5,
        data: records,
        total: records.length,
      },
    },
    isLoading: false,
    isValidating: false,
    error: null,
    mutate: jest.fn(),
    ...requestState,
  };
}

describe('FilteredReview unseen clearing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSWR.mockReturnValue(reviewResponse([]));
  });

  it('clears unseen reviews through the newest valid timestamp', () => {
    useSWR.mockReturnValue(
      reviewResponse([
        { id: 3, created_at: '2026-08-11T10:05:00.000000Z' },
        { id: 2, created_at: 'invalid' },
        { id: 1, created_at: '2026-08-10T08:00:00.000000Z' },
      ]),
    );

    render(<FilteredReview />);

    expect(useMarkAdminNavigationSeen).toHaveBeenLastCalledWith('reviews', {
      enabled: true,
      seenThrough: '2026-08-11T10:05:00.000Z',
    });
  });

  it('clears an empty settled reviews response without a timestamp boundary', () => {
    render(<FilteredReview />);

    expect(useMarkAdminNavigationSeen).toHaveBeenLastCalledWith('reviews', {
      enabled: true,
      seenThrough: undefined,
    });
  });

  it.each([
    ['loading', { isLoading: true }],
    ['validating', { isValidating: true }],
    ['failed', { error: new Error('Reviews failed') }],
  ])('does not clear unseen reviews while the response is %s', (_state, requestState) => {
    useSWR.mockReturnValue(reviewResponse([], requestState));

    render(<FilteredReview />);

    expect(useMarkAdminNavigationSeen).toHaveBeenLastCalledWith('reviews', {
      enabled: false,
      seenThrough: undefined,
    });
  });

  it('waits for a fresh response before advancing a stale cached boundary', () => {
    let swrState = reviewResponse([{ id: 1, created_at: '2026-08-10T08:00:00.000000Z' }], { isValidating: true });
    useSWR.mockImplementation(() => swrState);

    const { rerender } = render(<FilteredReview />);

    expect(useMarkAdminNavigationSeen).toHaveBeenLastCalledWith('reviews', {
      enabled: false,
      seenThrough: '2026-08-10T08:00:00.000Z',
    });

    swrState = reviewResponse([{ id: 2, created_at: '2026-08-12T09:30:00.456789Z' }]);
    rerender(<FilteredReview />);

    expect(useMarkAdminNavigationSeen).toHaveBeenLastCalledWith('reviews', {
      enabled: true,
      seenThrough: '2026-08-12T09:30:00.456Z',
    });
  });
});
