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
  it('uses the Explore Creators search field styling in light and dark themes', () => {
    useBlogs.mockReturnValue({ blogs: { data: [] }, isValidating: false, error: null });

    render(<SearchFormBlogs />);

    const input = screen.getByRole('textbox', { name: 'Search blogs' });
    const form = input.closest('form');
    const submitButton = screen.getByRole('button', { name: 'Search blogs' });

    expect(form).toHaveClass('min-h-14', 'gap-3', 'border-border', 'bg-card', 'dark:bg-[var(--weelp-home-surface)]', 'px-3', 'py-2', 'dark:shadow-none');
    expect(input).toHaveClass('bg-transparent', 'px-2', 'py-3', 'text-sm', 'font-medium', 'text-foreground', 'placeholder:text-muted-foreground');
    expect(submitButton).toHaveClass('weelp-search-control', 'bg-weelp-sage-deep', 'dark:bg-[var(--weelp-home-page)]', 'text-white', 'shadow-[0_3px_9px_rgba(0,0,0,0.04)]');

    fireEvent.change(input, { target: { value: 'Story' } });
    expect(screen.getByRole('button', { name: 'Clear blog search' })).toHaveClass('weelp-search-control');
  });

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
