import { render, screen } from '@testing-library/react';

import ReviewCardSkeleton from '../ReviewCardSkeleton';

describe('ReviewCardSkeleton', () => {
  it('mirrors the review card sections', () => {
    render(<ReviewCardSkeleton />);

    expect(screen.getByTestId('review-card-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('review-card-skeleton-header')).toBeInTheDocument();
    expect(screen.getByTestId('review-card-skeleton-body')).toBeInTheDocument();
    expect(screen.getByTestId('review-card-skeleton-actions')).toBeInTheDocument();
  });
});
