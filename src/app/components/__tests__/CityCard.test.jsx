import { render, screen } from '@testing-library/react';

import CityCard from '../CityCard';

const city = {
  id: 1,
  name: 'Dubai',
  slug: 'dubai',
  featured_image: '/assets/dubai.webp',
  activities_count: 13,
};

test('renders the accessible Weelp Postcard treatment', () => {
  render(<CityCard city={city} />);

  const link = screen.getByRole('link', { name: /dubai/i });
  expect(link).toHaveAttribute('href', '/cities/dubai');
  expect(link).toHaveAccessibleName('Dubai 13 Activities');
  expect(link).toHaveClass(
    'weelp-destination-card',
    'h-[400px]',
    'sm:h-[440px]',
    'md:h-[490px]',
    'lg:h-[460px]',
    'xl:h-[500px]',
    'min-[1440px]:h-[470px]',
    'rounded-[24px]',
    'border-[var(--weelp-card-border)]',
    'hover:[box-shadow:var(--weelp-card-hover-shadow)]',
    'focus-visible:ring-2',
    'motion-reduce:transition-none',
  );
  expect(link).not.toHaveClass('h-[280px]', 'sm:h-[320px]', 'xl:h-[360px]');

  expect(screen.getByRole('heading', { name: 'Dubai', level: 3 })).toHaveClass('text-white');
  expect(screen.getByText('13 Activities')).toHaveClass('text-white/90');

  const action = screen.getByTestId('destination-card-action');
  expect(action).toHaveAttribute('aria-hidden', 'true');
  expect(action).toHaveClass(
    'grid',
    'size-10',
    'shrink-0',
    'place-items-center',
    'rounded-full',
    'border',
    'border-white/55',
    // dark-mode-exempt: assertion locks the arrow-only photographic-overlay surface
    'bg-white/15',
    'text-white',
    'shadow-sm',
    'backdrop-blur-md',
    'transition-transform',
    'duration-300',
    'group-hover:-rotate-45',
    'motion-reduce:transition-none',
    'motion-reduce:group-hover:rotate-0',
  );
  expect(action.querySelector('.lucide-arrow-right')).toBeInTheDocument();
  expect(action).not.toHaveTextContent('Explore');
  expect(screen.queryByTestId('destination-card-arrow')).not.toBeInTheDocument();

  expect(screen.getByAltText('')).toHaveClass('motion-reduce:group-hover:scale-100');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

test('uses singular activity and blog labels independently', () => {
  const { rerender } = render(<CityCard city={{ ...city, activities_count: 1 }} />);
  expect(screen.getByText('1 Activity')).toBeInTheDocument();

  rerender(<CityCard city={{ ...city, activities_count: 13, blogs_count: 1 }} subtitleMode="blogs" />);
  expect(screen.getByText('1 Blog')).toBeInTheDocument();
});

test('only shows a starting price when one is available', () => {
  const { rerender } = render(<CityCard city={{ ...city, starting_price: null }} subtitleMode="price" />);
  expect(screen.queryByText(/starting at/i)).not.toBeInTheDocument();

  rerender(<CityCard city={{ ...city, starting_price: 130, currency: 'USD' }} subtitleMode="price" />);
  expect(screen.getByText('Starting at $130.00')).toBeInTheDocument();
});

test('uses the shared destination fallback when no city image is available', () => {
  const { container } = render(<CityCard city={{ id: 2, name: 'Paris', slug: 'paris' }} />);

  expect(container.querySelector('img')).toHaveAttribute('src', expect.stringContaining('Card.webp'));
});
