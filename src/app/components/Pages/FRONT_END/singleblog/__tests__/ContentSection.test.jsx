import { render } from '@testing-library/react';

jest.mock('@/app/components/singleproductguide', () => ({ BlogAuthorInfo: () => null }));
jest.mock('../SingleBlogModules', () => ({ FollowUs: () => null, RelatedLinks: () => null }));
jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ children, className = '' }) => <div className={className}>{children}</div>,
}));

import ContentSection from '../ContentSection';

describe('ContentSection', () => {
  it('uses the public rich-text overflow treatment for article content', () => {
    const { container } = render(<ContentSection content="A sufficiently long article body that should render in the public content surface." />);

    expect(container.querySelector('.rich-text-editor-content')).toHaveClass('public-rich-text');
  });
});
