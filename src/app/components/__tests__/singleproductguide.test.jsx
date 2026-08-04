import { render } from '@testing-library/react';
import { BlogAuthorInfo } from '../singleproductguide';

describe('BlogAuthorInfo', () => {
  it('keeps bottom separation without top or horizontal padding', () => {
    const { container } = render(<BlogAuthorInfo />);
    const author = container.firstChild;

    expect(author).toHaveAttribute('class', 'mx-auto max-w-4xl pb-6');
  });
});
