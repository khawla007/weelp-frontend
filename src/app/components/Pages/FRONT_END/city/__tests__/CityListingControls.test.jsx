import { act, fireEvent, render, screen } from '@testing-library/react';

import CityListingControls, { CityListingToolbar } from '../CityListingControls';

const push = jest.fn();
let currentQuery = 'page=3&tags=family';
let currentPath = '/cities/dubai/packages';

jest.mock('next/navigation', () => ({
  usePathname: () => currentPath,
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(currentQuery),
}));

jest.mock(
  'react-range-slider-input',
  () =>
    function MockRangeSlider({ value, onInput, ariaLabel }) {
      return (
        <>
          <input type="range" aria-label={ariaLabel[0]} aria-valuenow={value[0]} value={value[0]} onChange={(event) => onInput([Number(event.target.value), value[1]])} />
          <input type="range" aria-label={ariaLabel[1]} aria-valuenow={value[1]} value={value[1]} onChange={(event) => onInput([value[0], Number(event.target.value)])} />
        </>
      );
    },
);

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ children }) => <div>{children}</div>,
  SheetTrigger: ({ children }) => children,
  SheetContent: ({ children, className }) => <div className={className}>{children}</div>,
  SheetHeader: ({ children }) => <div>{children}</div>,
  SheetTitle: ({ children }) => <h2>{children}</h2>,
  SheetDescription: ({ children }) => <p>{children}</p>,
  SheetClose: ({ children }) => children,
}));

const options = {
  categories: [
    { slug: 'culture', name: 'Culture' },
    { slug: 'sports', name: 'Sports' },
  ],
  tags: [
    { slug: 'adventure', name: 'Adventure' },
    { slug: 'family', name: 'Family' },
  ],
};

describe('CityListingControls', () => {
  beforeEach(() => {
    push.mockClear();
    currentQuery = 'page=3&tags=family';
    currentPath = '/cities/dubai/packages';
  });

  it('submits search and sort changes while resetting pagination', () => {
    render(<CityListingControls {...options} />);

    fireEvent.change(screen.getAllByLabelText('Search listings')[0], { target: { value: 'desert safari' } });
    fireEvent.submit(screen.getAllByRole('form', { name: 'Search city listings' })[0]);
    expect(push).toHaveBeenLastCalledWith('/cities/dubai/packages?tags=family&search=desert+safari', { scroll: false });

    fireEvent.change(screen.getAllByLabelText('Sort listings')[0], { target: { value: 'price_desc' } });
    expect(push).toHaveBeenLastCalledWith('/cities/dubai/packages?tags=family&search=desert+safari&sort_by=price_desc', { scroll: false });
  });

  it('offers mobile and tablet filter presentations with touch-sized controls', () => {
    render(<CityListingControls {...options} />);

    expect(screen.getByTestId('listing-filter-panel')).toHaveClass('rounded-[11.5px]', 'lg:p-6');
    expect(screen.getByRole('button', { name: 'Open filters' })).toHaveClass('min-h-11');
    expect(screen.getByTestId('mobile-listing-filters')).toHaveClass('lg:hidden');
    expect(screen.getByTestId('desktop-listing-filters')).toHaveClass('hidden', 'lg:block');
  });

  it('updates category and tag chips and can remove an active chip', () => {
    render(<CityListingControls {...options} />);

    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Sports' })[0]);
    expect(push).toHaveBeenLastCalledWith('/cities/dubai/packages?tags=family&categories=sports', { scroll: false });

    fireEvent.click(screen.getByRole('button', { name: 'Remove Family filter' }));
    expect(push).toHaveBeenLastCalledWith('/cities/dubai/packages?categories=sports', { scroll: false });
  });

  it('preserves rapid filter selections before navigation settles', () => {
    currentQuery = '';
    render(<CityListingControls {...options} />);

    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Adventure' })[0]);
    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Family' })[0]);

    expect(push).toHaveBeenLastCalledWith('/cities/dubai/packages?tags=adventure%2Cfamily', { scroll: false });
  });

  it('displays the URL price range without an apply or clear button', () => {
    currentQuery = 'tags=family&min_price=100&max_price=500';
    render(<CityListingControls {...options} />);

    expect(screen.getAllByLabelText('Minimum price')[0]).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getAllByLabelText('Maximum price')[0]).toHaveAttribute('aria-valuenow', '500');
    expect(screen.queryByRole('button', { name: 'Apply price' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('does not restore stale filters after a rapid clear and sort', () => {
    render(
      <>
        <CityListingControls {...options} />
        <CityListingToolbar />
      </>,
    );

    fireEvent.click(screen.getAllByRole('checkbox', { name: 'All' })[1]);
    fireEvent.change(screen.getByLabelText('Sort listings', { selector: '#listing-sort-desktop' }), { target: { value: 'price_asc' } });

    expect(push).toHaveBeenLastCalledWith('/cities/dubai/packages?sort_by=price_asc', { scroll: false });
  });

  it('filters after the price slider moves without an apply action', () => {
    jest.useFakeTimers();
    currentQuery = '';
    render(<CityListingControls {...options} />);

    fireEvent.change(screen.getAllByLabelText('Minimum price')[0], { target: { value: '10' } });
    act(() => jest.advanceTimersByTime(500));

    expect(push).toHaveBeenLastCalledWith('/cities/dubai/packages?min_price=10&max_price=5000', { scroll: false });
    jest.useRealTimers();
  });

  it('preserves a filter navigation that settles during the price debounce', () => {
    jest.useFakeTimers();
    currentQuery = '';
    const { rerender } = render(<CityListingControls {...options} />);

    fireEvent.change(screen.getAllByLabelText('Minimum price')[0], { target: { value: '10' } });
    currentQuery = 'categories=sports';
    rerender(<CityListingControls {...options} />);
    act(() => jest.advanceTimersByTime(500));

    expect(push).toHaveBeenLastCalledWith('/cities/dubai/packages?categories=sports&min_price=10&max_price=5000', { scroll: false });
    jest.useRealTimers();
  });

  it('does not carry pending filters into another listing route', () => {
    currentQuery = '';
    const { rerender } = render(<CityListingControls {...options} />);
    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Sports' })[0]);

    currentPath = '/cities/dubai/itineraries';
    currentQuery = '';
    rerender(
      <>
        <CityListingControls {...options} />
        <CityListingToolbar />
      </>,
    );
    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Sports' })[0]);
    fireEvent.change(screen.getAllByLabelText('Sort listings').at(-1), { target: { value: 'price_asc' } });

    expect(push).toHaveBeenLastCalledWith('/cities/dubai/itineraries?categories=sports&sort_by=price_asc', { scroll: false });
  });

  it('shows All as the reset option for categories and tags', () => {
    currentQuery = '';
    render(<CityListingControls {...options} />);

    expect(screen.getAllByRole('checkbox', { name: 'All' })).toHaveLength(4);
    screen.getAllByRole('checkbox', { name: 'All' }).forEach((option) => expect(option).toBeChecked());
  });

  it('filters by rating and clears it through the rating All option', () => {
    currentQuery = '';
    const { rerender } = render(<CityListingControls {...options} />);

    fireEvent.click(screen.getAllByRole('radio', { name: '4 stars and up' })[0]);
    expect(push).toHaveBeenLastCalledWith('/cities/dubai/packages?min_rating=4', { scroll: false });

    currentQuery = 'min_rating=4';
    rerender(<CityListingControls {...options} />);
    fireEvent.click(screen.getAllByRole('radio', { name: 'All' })[0]);
    expect(push).toHaveBeenLastCalledWith('/cities/dubai/packages', { scroll: false });
  });

  it('synchronizes uncontrolled inputs when URL filters are cleared', () => {
    currentQuery = 'search=desert&min_price=100&max_price=500';
    const { rerender } = render(<CityListingControls {...options} />);

    expect(screen.getAllByLabelText('Search listings')[0]).toHaveValue('desert');
    expect(screen.getAllByLabelText('Minimum price')[0]).toHaveAttribute('aria-valuenow', '100');

    currentQuery = '';
    rerender(<CityListingControls {...options} />);

    expect(screen.getAllByLabelText('Search listings')[0]).toHaveValue('');
    expect(screen.getAllByLabelText('Minimum price')[0]).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getAllByLabelText('Maximum price')[0]).toHaveAttribute('aria-valuenow', '5000');
  });
});
