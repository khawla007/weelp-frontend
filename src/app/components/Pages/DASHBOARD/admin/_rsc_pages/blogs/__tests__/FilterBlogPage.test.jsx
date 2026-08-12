import React from 'react';
import { render, screen } from '@testing-library/react';
import useSWR from 'swr';

import { useAllCategoriesOptionsAdmin } from '@/hooks/api/admin/categories';
import { useAlltagsOptionsAdmin } from '@/hooks/api/admin/tags';

import FilterBlog, { BLOGSORT_OPTIONS } from '../FilterBlogPage';

jest.mock('swr', () => jest.fn());
jest.mock('@/hooks/api/admin/categories', () => ({ useAllCategoriesOptionsAdmin: jest.fn() }));
jest.mock('@/hooks/api/admin/tags', () => ({ useAlltagsOptionsAdmin: jest.fn() }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/lib/actions/blogs', () => ({
  deleteBlog: jest.fn(),
  deleteMultipleBlogs: jest.fn(),
}));
jest.mock('@/app/components/Button/AddNewButton', () => ({
  AddNewButton: ({ label, href }) => <a href={href}>{label}</a>,
}));
jest.mock('@/app/components/BulkActions/BulkActionButtons', () => ({
  BulkActionButtons: () => <button type="button">Bulk actions</button>,
}));
jest.mock('@/app/components/DashboardShared', () => ({
  DashboardSearch: ({ placeholder }) => <input type="search" aria-label={placeholder} />,
  ListingCard: ({ children }) => <article>{children}</article>,
  ListingCardSkeleton: () => <div>Loading blogs</div>,
  ListingCardImage: () => null,
  ListingCardCheckbox: () => null,
  ListingCardContent: ({ children }) => <div>{children}</div>,
  ListingCardTitle: ({ children }) => <h2>{children}</h2>,
  ListingCardTags: ({ children }) => <div>{children}</div>,
  ListingCardActions: () => null,
}));
jest.mock('@/components/ui/select', () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectGroup: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => (
    <div role="option" aria-selected="false">
      {children}
    </div>
  ),
  SelectTrigger: ({ children, ...props }) => (
    <button type="button" role="combobox" aria-controls="mock-select-options" aria-expanded="false" {...props}>
      {children}
    </button>
  ),
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
}));

function renderBlogFilters({ categories = [{ name: 'Adventure', slug: 'adventure' }], tags = [{ name: 'Dubai', slug: 'dubai' }] } = {}) {
  useAllCategoriesOptionsAdmin.mockReturnValue({ categoriesList: categories, isLoading: false, error: null });
  useAlltagsOptionsAdmin.mockReturnValue({ tagList: tags, isLoading: false, error: null });
  useSWR.mockReturnValue({
    data: { data: { data: [], current_page: 1, per_page: 10, total: 0 } },
    error: null,
    isValidating: false,
    mutate: jest.fn(),
  });

  return render(<FilterBlog />);
}

describe('FilterBlog controls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('places Sort before Add New and exposes Category and Tags as single dropdowns', () => {
    renderBlogFilters();

    expect(screen.queryByText('Recommended')).not.toBeInTheDocument();

    const sort = screen.getByRole('combobox', { name: 'Sort blogs' });
    const addNew = screen.getByRole('link', { name: 'Add New' });
    expect(sort.compareDocumentPosition(addNew) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    BLOGSORT_OPTIONS.forEach(({ name }) => {
      expect(screen.getByRole('option', { name })).toBeInTheDocument();
    });

    expect(screen.getByRole('combobox', { name: 'Filter blogs by category' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Filter blogs by tag' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Categories' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tags' })).not.toBeInTheDocument();
  });

  it('uses the tag options when deciding whether to show the empty state', () => {
    renderBlogFilters({ tags: [] });

    expect(screen.getByText('No tags found')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Filter blogs by tag' })).not.toBeInTheDocument();
  });

  it('uses the category options when deciding whether to show the empty state', () => {
    renderBlogFilters({ categories: [] });

    expect(screen.getByText('No categories found')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Filter blogs by category' })).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Filter blogs by tag' })).toBeInTheDocument();
  });
});
