import { render } from '@testing-library/react';

import MiniCartReviewCard from '../MiniCartReviewCard';

test('mini-cart recommendation keeps its layout with the shared outer radius', () => {
  const { container } = render(<MiniCartReviewCard productTitle="Dubai route" imageSrc="/route.jpg" />);
  expect(container.querySelector('[data-public-card="mini-cart-recommendation"]')).toHaveClass('rounded-[24px]', 'flex', 'gap-4');
});
