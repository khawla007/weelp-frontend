import { render, screen } from '@testing-library/react';

jest.mock('@/app/components/singleproductguide', () => ({ BlogAuthorInfo: () => null }));
jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ children, className = '' }) => <div className={className}>{children}</div>,
}));
jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import ContentSection from '../ContentSection';

describe('ContentSection', () => {
  it('uses the public rich-text overflow treatment for article content', () => {
    const { container } = render(<ContentSection content="A sufficiently long article body that should render in the public content surface." />);

    expect(container.querySelector('.rich-text-editor-content')).toHaveClass('public-rich-text');
  });

  it('renders slugged categories and tags as blog filter links', () => {
    render(
      <ContentSection
        content="A sufficiently long article body that should render in the public content surface."
        categories={[{ name: 'Travel Tips', slug: 'travel-tips' }]}
        tags={[{ name: 'Family', slug: 'family' }]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Travel Tips' })).toHaveAttribute('href', '/blogs?category=travel-tips');
    expect(screen.getByRole('link', { name: 'Family' })).toHaveAttribute('href', '/blogs?tag=family');
    expect(screen.getByRole('heading', { name: 'Categories' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Tags' })).toBeVisible();
  });

  it('renders taxonomy labels without links when the backend does not provide slugs', () => {
    render(
      <ContentSection content="A sufficiently long article body that should render in the public content surface." categories={[{ name: 'No Slug Category' }]} tags={[{ name: 'No Slug Tag' }]} />,
    );

    expect(screen.getByText('No Slug Category')).not.toHaveAttribute('href');
    expect(screen.getByText('No Slug Tag')).not.toHaveAttribute('href');
  });

  it('supports category_name and tag_name taxonomy shapes from blog list responses', () => {
    render(
      <ContentSection
        content="A sufficiently long article body that should render in the public content surface."
        categories={[{ category_name: 'List Category', slug: 'list-category' }]}
        tags={[{ tag_name: 'List Tag', slug: 'list-tag' }]}
      />,
    );

    expect(screen.getByRole('link', { name: 'List Category' })).toHaveAttribute('href', '/blogs?category=list-category');
    expect(screen.getByRole('link', { name: 'List Tag' })).toHaveAttribute('href', '/blogs?tag=list-tag');
  });
});
