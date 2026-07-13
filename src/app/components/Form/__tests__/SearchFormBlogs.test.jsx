import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const useBlogs = jest.fn();

jest.mock('@/hooks/api/public/blogs/useBlogs', () => ({
  useBlogs: (...args) => useBlogs(...args),
}));
jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
jest.mock('@/app/components/MediaImage', () => ({
  __esModule: true,
  default: ({ alt, ...props }) => <img alt={alt} {...props} />,
}));

import { SearchFormBlogs } from '../SearchForm';

describe('SearchFormBlogs', () => {
  it('submits a structured search query and renders internal results with NavigationLink semantics', async () => {
    useBlogs.mockImplementation((params) => ({
      blogs: params?.search ? { data: [{ id: 10, slug: 'sit-qui-temporibus-10', name: 'Sit qui temporibus.', media_gallery: [] }] } : { data: [] },
      isValidating: false,
      error: null,
    }));

    render(<SearchFormBlogs />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search blogs' }), { target: { value: 'Sit qui' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search blogs' }));

    await waitFor(() => expect(useBlogs).toHaveBeenLastCalledWith({ search: 'Sit qui' }));
    expect(screen.getByRole('link', { name: /Sit qui temporibus/i })).toHaveAttribute('href', '/blogs/sit-qui-temporibus-10');
  });

  it('clears an executed query when an empty value is submitted', async () => {
    useBlogs.mockImplementation((params) => ({
      blogs: { data: params?.search ? [{ id: 10, slug: 'story', name: 'Story', media_gallery: [] }] : [] },
      isValidating: false,
      error: null,
    }));

    render(<SearchFormBlogs />);
    const input = screen.getByRole('textbox', { name: 'Search blogs' });
    fireEvent.change(input, { target: { value: 'Story' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search blogs' }));
    expect(await screen.findByRole('link', { name: /Story/i })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Clear blog search' }));

    await waitFor(() => expect(useBlogs).toHaveBeenLastCalledWith({}));
    expect(screen.queryByRole('link', { name: /Story/i })).not.toBeInTheDocument();
  });
});
