import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CustomerReviewList } from '../CustomerReviewList';
import { deleteReviewCustomer } from '@/lib/actions/customer/reviews';

const toast = jest.fn();

jest.mock('@/app/components/ReviewCard', () => ({
  UserDashboardReviewCard: ({ review, onDelete }) => (
    <article>
      <span>{review.review_text}</span>
      <button type="button" onClick={() => onDelete(review.id)}>
        Request delete {review.id}
      </button>
    </article>
  ),
}));

jest.mock('@/lib/actions/customer/reviews', () => ({
  deleteReviewCustomer: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast }),
}));

const review = { id: 17, review_text: 'A thoughtful review' };

describe('CustomerReviewList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    deleteReviewCustomer.mockResolvedValue({ status: 200, data: { message: 'Review removed' } });
  });

  it('asks for confirmation and cancel sends no delete request', () => {
    render(<CustomerReviewList reviews={[review]} mutate={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Request delete 17' }));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(deleteReviewCustomer).not.toHaveBeenCalled();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toHaveClass('border-foreground/50', 'dark:border-border');

    fireEvent.click(cancelButton);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(deleteReviewCustomer).not.toHaveBeenCalled();
  });

  it('dismisses with Escape without deleting', async () => {
    render(<CustomerReviewList reviews={[review]} mutate={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Request delete 17' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(deleteReviewCustomer).not.toHaveBeenCalled();
  });

  it('deletes only after confirmation and refreshes the list', async () => {
    const mutate = jest.fn();
    render(<CustomerReviewList reviews={[review]} mutate={mutate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Request delete 17' }));
    const removeButton = screen.getByRole('button', { name: 'Remove' });

    expect(removeButton).toHaveClass('bg-destructive', 'text-destructive-foreground', 'dark:bg-primary', 'dark:text-background');

    fireEvent.click(removeButton);

    await waitFor(() => expect(deleteReviewCustomer).toHaveBeenCalledWith(17));
    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('disables removal while the request is pending', async () => {
    let resolveDelete;
    deleteReviewCustomer.mockReturnValue(
      new Promise((resolve) => {
        resolveDelete = resolve;
      }),
    );

    render(<CustomerReviewList reviews={[review]} mutate={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Request delete 17' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    expect(screen.getByRole('button', { name: 'Removing...' })).toBeDisabled();

    await act(async () => {
      resolveDelete({ status: 200, data: { message: 'Review removed' } });
    });

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('keeps the dialog open and does not refresh after a failed delete', async () => {
    const mutate = jest.fn();
    deleteReviewCustomer.mockResolvedValue({ status: 500 });
    render(<CustomerReviewList reviews={[review]} mutate={mutate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Request delete 17' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'Failed to delete review',
        variant: 'destructive',
      }),
    );
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('A thoughtful review')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('handles a rejected delete even when the rejection is not an Error', async () => {
    const mutate = jest.fn();
    deleteReviewCustomer.mockRejectedValue(null);
    render(<CustomerReviewList reviews={[review]} mutate={mutate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Request delete 17' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      }),
    );
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });
});
