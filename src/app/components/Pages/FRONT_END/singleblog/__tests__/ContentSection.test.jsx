import { render, screen } from '@testing-library/react';

jest.mock('@/app/components/singleproductguide', () => ({ BlogAuthorInfo: () => null }));
jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ children, className = '', 'data-testid': testId }) => (
    <div className={className} data-testid={testId}>
      {children}
    </div>
  ),
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
  it('owns the section gap before recommended content with home-style bottom padding', () => {
    const { container } = render(<ContentSection content="A sufficiently long article body that should render in the public content surface." />);

    expect(container.querySelector('section')).toHaveClass('pb-12', 'md:pb-16', 'lg:pb-24');
  });

  it('matches the hero container width and side padding contract', () => {
    const { container } = render(<ContentSection content="A sufficiently long article body that should render in the public content surface." />);

    expect(container.querySelector('section')).toHaveClass('mx-auto', 'max-w-pen', 'px-4');
  });

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

  it('uses inline taxonomy text and one full-width mobile sidebar', () => {
    const { container } = render(
      <ContentSection
        content="A sufficiently long article body that should render in the public content surface."
        categories={[{ name: 'Travel Tips', slug: 'travel-tips' }]}
        tags={[{ name: 'Family', slug: 'family' }]}
      />,
    );

    const sidebar = container.querySelector('[data-testid="blog-sidebar"]');
    const categoryLink = screen.getByRole('link', { name: 'Travel Tips' });
    const tagLink = screen.getByRole('link', { name: 'Family' });
    const categoryList = categoryLink.closest('ul');
    const tagList = tagLink.closest('ul');

    expect(container.querySelectorAll('[data-testid="blog-sidebar"]')).toHaveLength(1);
    expect(sidebar).toHaveClass('w-full', 'px-0', 'lg:px-8');
    expect(categoryList).toHaveClass('flex', 'flex-wrap', 'max-w-none');
    expect(tagList).toHaveClass('flex', 'flex-wrap', 'max-w-none');

    [categoryLink, tagLink].forEach((link) => {
      expect(link).not.toHaveClass('border');
      expect(link).not.toHaveClass('rounded-md');
      expect(link).not.toHaveClass('px-6');
      expect(link).not.toHaveClass('py-4');
      expect(link).toHaveClass('text-base', 'hover:text-weelp-sage-text');
    });
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
