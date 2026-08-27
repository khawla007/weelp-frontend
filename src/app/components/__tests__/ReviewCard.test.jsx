import { render } from '@testing-library/react';

import ReviewCard, { ReviewCard2, SingleProductReviewCard } from '../ReviewCard';

test('public review variants use the shared outer radius', () => {
  const { container, rerender } = render(<ReviewCard title="Great" rating={5} comment="Lovely" />);
  expect(container.querySelector('[data-public-card="review"]')).toHaveClass('rounded-[24px]');

  rerender(<ReviewCard2 title="Great" rating={5} comment="Lovely" />);
  expect(container.querySelector('[data-public-card="review-gallery"]')).toHaveClass('rounded-[24px]');

  rerender(<SingleProductReviewCard title="Great" rating={5} comment="Lovely" />);
  expect(container.querySelector('[data-public-card="single-review"]')).toHaveClass('rounded-[24px]');
});
