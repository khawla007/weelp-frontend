import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import CitiesListingControls from '../CitiesListingControls';

const push = jest.fn();
let currentSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  usePathname: () => '/cities',
  useRouter: () => ({ push }),
  useSearchParams: () => currentSearchParams,
}));

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={typeof href === 'string' ? href : href.pathname} {...props}>
      {children}
    </a>
  ),
}));

describe('CitiesListingControls', () => {
  beforeEach(() => {
    push.mockClear();
    currentSearchParams = new URLSearchParams();
  });

  it('uses compact mobile controls with an icon filter trigger', () => {
    render(<CitiesListingControls countries={[]} seasons={[]} />);

    const mobileToolbar = screen.getByLabelText('City listing controls').firstElementChild;
    expect(mobileToolbar).toHaveClass('grid-cols-[minmax(0,1fr)_auto]', 'gap-2', 'sm:gap-3', 'lg:hidden');
    expect(within(mobileToolbar).getByLabelText('Search cities')).toHaveClass('min-h-11', 'min-w-0');
    expect(within(mobileToolbar).getByLabelText('Sort cities')).toHaveClass('min-h-11', 'w-full');
    expect(within(mobileToolbar).getByLabelText('Open city filters')).toHaveClass('min-h-11', 'w-full', 'px-3');
    expect(within(mobileToolbar).getByLabelText('Open city filters').querySelector('svg')).toBeInTheDocument();
  });

  it('constrains active filter chips on narrow screens', () => {
    currentSearchParams = new URLSearchParams({
      search: 'a very long city search term',
      country: 'united-arab-emirates',
      season: 'winter',
      sort_by: 'activities_desc',
    });

    render(<CitiesListingControls countries={[{ name: 'United Arab Emirates', slug: 'united-arab-emirates' }]} seasons={[{ name: 'Winter', slug: 'winter' }]} />);

    expect(screen.getByRole('button', { name: 'Remove Search: a very long city search term filter' })).toHaveClass('max-w-full');
    expect(screen.getByRole('link', { name: 'Clear all' })).toHaveAttribute('href', '/cities');
  });

  it('closes the mobile filter drawer after submitting a drawer search', async () => {
    render(<CitiesListingControls countries={[]} seasons={[]} />);

    fireEvent.click(screen.getByLabelText('Open city filters'));

    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    expect(within(dialog).getByTestId('cities-filter-panel')).toHaveClass('p-4', 'sm:p-5');

    fireEvent.change(within(dialog).getByLabelText('Search cities'), { target: { value: 'dubai' } });
    fireEvent.click(within(dialog).getByLabelText('Submit search'));

    expect(push).toHaveBeenCalledWith('/cities?search=dubai', { scroll: false });
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Filters' })).not.toBeInTheDocument());
  });
});
