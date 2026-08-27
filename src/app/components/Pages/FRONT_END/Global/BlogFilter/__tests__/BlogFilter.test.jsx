import { render, screen } from '@testing-library/react';

import BlogFilterBar from '../BlogFilter';

const useBlogs = jest.fn();
const mockItemCard = jest.fn(({ title }) => <article data-testid="item-card">{title}</article>);

jest.mock('@/hooks/api/public/blogs/useBlogs', () => ({
  useBlogs: (...args) => useBlogs(...args),
}));

jest.mock('@/hooks/api/public/categories', () => ({
  useCategories: () => ({ data: { data: [] } }),
}));

jest.mock('@/app/components/Pages/DASHBOARD/admin/_rsc_pages/blogs/FilterBlogPage', () => ({
  BLOGSORT_OPTIONS: [{ name: 'Latest', value: 'latest' }],
}));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ as: Component = 'div', children, className }) => <Component className={className}>{children}</Component>,
}));

jest.mock('@/app/components/ui/item-card', () => ({
  __esModule: true,
  default: (props) => mockItemCard(props),
}));

describe('BlogFilterBar states', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows contained mobile skeletons while loading', () => {
    useBlogs.mockReturnValue({ blogs: {}, isLoading: true, error: null });
    const { container } = render(<BlogFilterBar />);

    expect(container.querySelector('ul[aria-hidden="true"]')).toHaveClass('grid-cols-1');
  });

  it('shows a readable empty state', () => {
    useBlogs.mockReturnValue({ blogs: { data: [], total: 0, current_page: 1, per_page: 5 }, isLoading: false, error: null });
    render(<BlogFilterBar />);

    expect(screen.getByText('No blogs found')).toBeVisible();
  });

  it('shows a readable API error state', () => {
    useBlogs.mockReturnValue({ blogs: {}, isLoading: false, error: new Error('offline') });
    render(<BlogFilterBar />);

    expect(screen.getByText('Error loading blogs')).toBeVisible();
  });

  it('renders every result through the editorial shared card without publication data', () => {
    useBlogs.mockReturnValue({
      blogs: {
        data: [
          {
            id: 14,
            name: 'Wildfire Safety',
            slug: 'wildfire-safety',
            excerpt: 'How to stay safe',
            published_at: '2026-08-04T06:58:08.000000Z',
            media_gallery: [],
            categories: [{ category_name: 'Nature' }],
          },
        ],
        total: 1,
        current_page: 1,
        per_page: 5,
      },
      isLoading: false,
      error: null,
    });

    render(<BlogFilterBar />);

    expect(mockItemCard.mock.calls.at(-1)[0]).toEqual(
      expect.objectContaining({
        href: '/blogs/wildfire-safety',
        image: '/assets/images/home-tour-hero.jpg',
        title: 'Wildfire Safety',
        category: 'Nature',
        variant: 'editorial',
      }),
    );
    expect(mockItemCard.mock.calls.at(-1)[0]).not.toHaveProperty('publishedAt');
  });

  it('passes initial category and tag filters to the public blog query', () => {
    useBlogs.mockReturnValue({ blogs: { data: [], total: 0, current_page: 1, per_page: 5 }, isLoading: false, error: null });
    render(<BlogFilterBar initialFilters={{ category: 'travel-tips', tag: 'family' }} />);

    expect(useBlogs).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'travel-tips',
        tag: 'family',
        page: 1,
        per_page: 5,
      }),
    );
  });
});
