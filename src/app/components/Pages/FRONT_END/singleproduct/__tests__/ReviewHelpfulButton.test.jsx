import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const openAuthModal = jest.fn();
const toast = jest.fn();
let sessionState = { data: { user: { id: 7 } }, status: 'authenticated' };

jest.mock('next-auth/react', () => ({
  useSession: () => sessionState,
}));

jest.mock('@/lib/store/useAuthModalStore', () => ({
  __esModule: true,
  default: () => ({ openAuthModal }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

import ReviewHelpfulButton from '../ReviewHelpfulButton';

const readyProps = {
  reviewId: 8,
  count: 3,
  isMarked: false,
  isPending: false,
  isStatusReady: true,
};

describe('ReviewHelpfulButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionState = { data: { user: { id: 7 } }, status: 'authenticated' };
  });

  it('renders the count and accessible unselected state', () => {
    render(<ReviewHelpfulButton {...readyProps} onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Mark review as helpful' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button')).toHaveAttribute('data-review-id', '8');
    expect(screen.getByRole('button')).not.toHaveAttribute('id');
    expect(screen.getByRole('button')).toHaveClass('px-3');
    expect(screen.getByText('Helpful · 3')).toBeVisible();
  });

  it('renders zero without a count suffix and a selected sage thumb', () => {
    render(<ReviewHelpfulButton {...readyProps} count={0} isMarked onChange={jest.fn()} />);

    expect(screen.getByText('Helpful')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Remove helpful vote from review' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('helpful-thumb')).toHaveClass('fill-weelp-sage-deep', 'text-weelp-sage-deep');
  });

  it('adds and removes for authenticated viewers', () => {
    const onChange = jest.fn().mockResolvedValue(undefined);
    const { rerender } = render(<ReviewHelpfulButton {...readyProps} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(<ReviewHelpfulButton {...readyProps} isMarked onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it.each([
    ['session loading', {}, { data: null, status: 'loading' }],
    ['status hydration', { isStatusReady: false }, { data: { user: { id: 7 } }, status: 'authenticated' }],
    ['mutation pending', { isPending: true }, { data: { user: { id: 7 } }, status: 'authenticated' }],
  ])('is disabled during %s', (_label, overrides, session) => {
    sessionState = session;
    render(<ReviewHelpfulButton {...readyProps} {...overrides} onChange={jest.fn()} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('opens authentication for a guest without changing immediately', () => {
    sessionState = { data: null, status: 'unauthenticated' };
    const onChange = jest.fn();
    render(<ReviewHelpfulButton {...readyProps} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));

    expect(openAuthModal).toHaveBeenCalledWith({ onSuccess: expect.any(Function) });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('adds once after successful guest authentication', async () => {
    sessionState = { data: null, status: 'unauthenticated' };
    const onChange = jest.fn().mockResolvedValue(undefined);
    render(<ReviewHelpfulButton {...readyProps} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));

    await act(async () => openAuthModal.mock.calls[0][0].onSuccess());

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('contains rejected changes and shows the backend message', async () => {
    const error = Object.assign(new Error('Request failed'), { response: { data: { message: 'You cannot mark your own review as helpful.' } } });
    const onChange = jest.fn().mockRejectedValue(error);
    render(<ReviewHelpfulButton {...readyProps} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'Unable to update helpful vote',
        description: 'You cannot mark your own review as helpful.',
        variant: 'destructive',
      }),
    );
  });

  it('contains an auth callback rejection and uses the fallback message', async () => {
    sessionState = { data: null, status: 'unauthenticated' };
    const onChange = jest.fn().mockRejectedValue(new Error('Transport detail'));
    render(<ReviewHelpfulButton {...readyProps} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));

    await act(async () => expect(openAuthModal.mock.calls[0][0].onSuccess()).resolves.toBeUndefined());

    expect(toast).toHaveBeenCalledWith({
      title: 'Unable to update helpful vote',
      description: 'Please try again.',
      variant: 'destructive',
    });
  });

  it('uses the latest authenticated callback from an already-open guest modal', async () => {
    sessionState = { data: null, status: 'unauthenticated' };
    const guestOnChange = jest.fn();
    const authenticatedOnChange = jest.fn().mockResolvedValue(undefined);
    const { rerender } = render(<ReviewHelpfulButton {...readyProps} onChange={guestOnChange} />);
    fireEvent.click(screen.getByRole('button'));
    const storedOnSuccess = openAuthModal.mock.calls[0][0].onSuccess;

    sessionState = { data: { user: { id: 7 } }, status: 'authenticated' };
    rerender(<ReviewHelpfulButton {...readyProps} onChange={authenticatedOnChange} />);
    await act(async () => expect(storedOnSuccess()).resolves.toBeUndefined());

    expect(guestOnChange).not.toHaveBeenCalled();
    expect(authenticatedOnChange).toHaveBeenCalledTimes(1);
    expect(authenticatedOnChange).toHaveBeenCalledWith(true);
  });

  it('contains rejection from the latest authenticated callback stored by a guest click', async () => {
    sessionState = { data: null, status: 'unauthenticated' };
    const guestOnChange = jest.fn();
    const error = Object.assign(new Error('Request failed'), { response: { data: { message: 'Review is no longer public.' } } });
    const authenticatedOnChange = jest.fn().mockRejectedValue(error);
    const { rerender } = render(<ReviewHelpfulButton {...readyProps} onChange={guestOnChange} />);
    fireEvent.click(screen.getByRole('button'));
    const storedOnSuccess = openAuthModal.mock.calls[0][0].onSuccess;

    sessionState = { data: { user: { id: 7 } }, status: 'authenticated' };
    rerender(<ReviewHelpfulButton {...readyProps} onChange={authenticatedOnChange} />);
    await act(async () => expect(storedOnSuccess()).resolves.toBeUndefined());

    expect(guestOnChange).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      title: 'Unable to update helpful vote',
      description: 'Review is no longer public.',
      variant: 'destructive',
    });
  });
});
