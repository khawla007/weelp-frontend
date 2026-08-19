import { render, screen, within } from '@testing-library/react';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, blurDataURL, fill, placeholder, sizes, ...props }) => (
    <img alt={alt} data-blur-data-url={blurDataURL} data-fill={fill ? 'true' : 'false'} data-placeholder={placeholder} data-sizes={sizes} {...props} />
  ),
}));

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('../GoldActivityWishlistButton', () => ({
  __esModule: true,
  default: () => <button aria-label="Save Desert Safari Adventure to wishlist" type="button" />,
}));

import GoldActivityCard from '../GoldActivityCard';

const mappedItem = {
  href: '/cities/dubai/activities/desert-safari',
  image: '/desert-safari.jpg',
  title: 'Desert Safari Adventure',
  category: 'Desert Safari & Tour',
  price: '$130.00',
  originalPrice: '$216.00',
  rating: '5.0',
  reviewCount: '124',
  discount: '40% OFF',
};

const rawActivity = {
  id: 42,
  item_type: 'activity',
  name: 'Desert Safari Adventure',
};

describe('GoldActivityCard', () => {
  it('renders the complete reference-shaped card as one city-aware detail link with a sibling wishlist control', () => {
    render(<GoldActivityCard item={mappedItem} wishlistItem={rawActivity} />);

    const card = screen.getByTestId('home-gold-activity-card');
    const link = screen.getByRole('link', { name: /explore desert safari adventure/i });
    const image = screen.getByRole('img', { name: 'Desert Safari Adventure' });
    const wishlist = screen.getByRole('button', { name: /wishlist/i });

    expect(card.tagName).toBe('ARTICLE');
    expect(card).toHaveClass('rounded-[24px]');
    expect(link).toHaveAttribute('href', '/cities/dubai/activities/desert-safari');
    expect(image).toHaveAttribute('src', '/desert-safari.jpg');
    expect(image).toHaveAttribute('data-fill', 'true');
    expect(image).toHaveAttribute('data-placeholder', 'blur');
    expect(image).toHaveAttribute('data-blur-data-url');
    expect(image).toHaveAttribute('data-sizes', expect.stringContaining('(max-width: 640px)'));
    expect(image).toHaveClass('object-cover');
    expect(screen.getByText('-40% OFF')).toBeVisible();
    expect(screen.getByText('★')).toBeVisible();
    expect(screen.getByText('5.0')).toBeVisible();
    expect(screen.getByText('(124)')).toBeVisible();
    expect(screen.getByText('Desert Safari & Tour')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Desert Safari Adventure' })).toBeVisible();
    expect(screen.getByText('From')).toBeVisible();
    expect(screen.getByText('$130.00')).toBeVisible();
    expect(screen.getByText('$216.00')).toHaveClass('line-through');
    expect(wishlist).toBeVisible();
  });

  it('omits empty rating details and their separator while retaining the Activity fallback', () => {
    render(<GoldActivityCard item={{ ...mappedItem, category: '', rating: null, reviewCount: null, originalPrice: null }} wishlistItem={rawActivity} />);

    expect(screen.queryByText('★')).not.toBeInTheDocument();
    expect(screen.queryByText('(124)')).not.toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeVisible();
    expect(screen.queryByText('$216.00')).not.toBeInTheDocument();
  });

  it('omits the entire pricing cluster when the activity has no current price', () => {
    render(<GoldActivityCard item={{ ...mappedItem, price: '', originalPrice: '$216.00' }} wishlistItem={rawActivity} />);

    expect(screen.queryByText('From')).not.toBeInTheDocument();
    expect(screen.queryByText('$216.00')).not.toBeInTheDocument();
  });

  it('uses the Top Activities discount fallback when the mapped discount is absent', () => {
    render(<GoldActivityCard item={{ ...mappedItem, discount: null }} wishlistItem={rawActivity} />);

    expect(screen.getByText('-40% OFF')).toBeVisible();
  });

  it('normalizes an existing leading hyphen without duplicating it', () => {
    render(<GoldActivityCard item={{ ...mappedItem, discount: '-40% OFF' }} wishlistItem={rawActivity} />);

    expect(screen.getByText('-40% OFF')).toBeVisible();
    expect(screen.queryByText('--40% OFF')).not.toBeInTheDocument();
  });

  it('derives a struck original price from the 40% fallback when the current currency price is parseable', () => {
    render(<GoldActivityCard item={{ ...mappedItem, discount: null, originalPrice: null, price: '$130.00' }} wishlistItem={rawActivity} />);

    expect(screen.getByText('$216.67')).toHaveClass('line-through');
  });

  it('does not invent an original price when the current price is not parseable currency', () => {
    render(<GoldActivityCard item={{ ...mappedItem, discount: null, originalPrice: null, price: 'Contact us' }} wishlistItem={rawActivity} />);

    expect(screen.getByText('Contact us')).toBeVisible();
    expect(screen.queryByText('$216.67')).not.toBeInTheDocument();
  });
});

const richItem = {
  id: 1,
  href: '/cities/dubai/activities/desert-safari',
  image: '/assets/Card.webp',
  title: 'Desert Safari',
  category: 'Adventure',
  price: '$120',
  originalPrice: '$200',
  rating: '4.8',
  reviewCount: '210',
  discount: '40% OFF',
  shortDescription: 'Ride the dunes at golden hour.',
  attributes: [
    { slug: 'duration', name: 'Duration', attribute_value: '4 Hours' },
    { slug: 'group-size', name: 'Group Size', attribute_value: '6-10' },
    { slug: 'age-restriction', name: 'Age Restriction', attribute_value: '12+' },
  ],
};

describe('GoldActivityCard description and attributes', () => {
  it('renders the short description when provided', () => {
    render(<GoldActivityCard item={richItem} wishlistItem={richItem} />);
    expect(screen.getByText('Ride the dunes at golden hour.')).toBeInTheDocument();
  });

  it('renders exactly three attribute chips with accessible labels', () => {
    render(<GoldActivityCard item={richItem} wishlistItem={richItem} />);
    const chips = screen.getAllByTestId('home-gold-activity-attribute');
    expect(chips).toHaveLength(3);
    expect(chips[0]).toHaveAccessibleName('Duration: 4 Hours');
    expect(chips[1]).toHaveAccessibleName('Group Size: 6-10');
    expect(chips[2]).toHaveAccessibleName('Age Restriction: 12+');
    expect(within(chips[0]).getByText('4 Hours')).toBeInTheDocument();
  });

  it('omits the description block when shortDescription is null', () => {
    const item = { ...richItem, shortDescription: null };
    render(<GoldActivityCard item={item} wishlistItem={item} />);
    expect(screen.queryByText('Ride the dunes at golden hour.')).not.toBeInTheDocument();
  });

  it('omits the attribute row when attributes are empty', () => {
    const item = { ...richItem, attributes: [] };
    render(<GoldActivityCard item={item} wishlistItem={item} />);
    expect(screen.queryAllByTestId('home-gold-activity-attribute')).toHaveLength(0);
  });

  it('renders only the attributes the card receives (no client-side overflow)', () => {
    // Defensive check: the mapper caps at three, but if a future consumer
    // passes four the card must render whatever it is handed, one chip each,
    // without silently dropping items.
    const fourAttributes = [...richItem.attributes, { slug: 'language', name: 'Language', attribute_value: 'English' }];
    const item = { ...richItem, attributes: fourAttributes };
    render(<GoldActivityCard item={item} wishlistItem={item} />);
    expect(screen.getAllByTestId('home-gold-activity-attribute')).toHaveLength(4);
  });
});
