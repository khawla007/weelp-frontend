import { render, screen } from '@testing-library/react';

import ItemCard from '../item-card';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill: _fill, blurDataURL: _blurDataURL, placeholder: _placeholder, sizes, ...props }) => <img {...props} alt={props.alt} data-sizes={sizes} />,
}));

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

jest.mock('@/app/components/Wishlist/ItemCardWishlistButton', () => ({
  __esModule: true,
  default: ({ item }) => <button aria-label={`Wishlist ${item.title}`}>Wishlist</button>,
}));

jest.mock('@/lib/attributeIcons', () => ({
  getAttributeIcon: () =>
    function MockAttributeIcon(props) {
      return <svg {...props} />;
    },
}));

const richProduct = {
  id: 42,
  productId: 42,
  itemType: 'activity',
  slug: 'desert-safari',
  citySlug: 'dubai',
  hasValidIdentity: true,
  hasRealTitle: true,
  hasRealImage: true,
  href: '/cities/dubai/activities/desert-safari',
  image: '/desert-safari.jpg',
  title: 'Desert Safari Adventure',
  category: 'Outdoor adventure',
  price: '$130.00',
  priceValue: 130,
  priceCurrency: 'USD',
  originalPrice: '$216.00',
  discount: '40% OFF',
  rating: '4.8',
  ratingValue: 4.8,
  reviewCount: '210',
  reviewCountValue: 210,
  availability: 'https://schema.org/InStock',
  shortDescription: 'Ride the dunes at golden hour.',
  attributes: [
    { slug: 'duration', name: 'Duration', attribute_value: '4 Hours' },
    { slug: 'group-size', name: 'Group Size', attribute_value: '6-10' },
    { slug: 'age-restriction', name: 'Age Restriction', attribute_value: '12+' },
  ],
  wishlistItem: {
    item_type: 'activity',
    item_id: 42,
    title: 'Desert Safari Adventure',
    slug: 'desert-safari',
    city_slug: 'dubai',
    image_url: '/desert-safari.jpg',
    price: 130,
    currency: 'USD',
  },
};

it('renders the home-gold composition with a sibling detail link and wishlist control', () => {
  render(<ItemCard {...richProduct} variant="full" />);

  const card = screen.getByTestId('product-item-card');
  const link = screen.getByRole('link', { name: /explore desert safari adventure/i });
  const wishlist = screen.getByRole('button', { name: /wishlist/i });

  expect(card).toHaveClass('rounded-[24px]', 'border-[var(--weelp-card-border)]', 'bg-background');
  expect(card).toHaveClass(
    'transition-shadow',
    'duration-300',
    'hover:[box-shadow:var(--weelp-card-hover-shadow)]',
    'motion-reduce:transition-none',
  );
  expect(card.className).not.toMatch(/hover:(?:-?translate|scale)/);
  expect(link).toHaveAttribute('href', '/cities/dubai/activities/desert-safari');
  expect(link).not.toContainElement(wishlist);
  expect(card).toContainElement(link);
  expect(card).toContainElement(wishlist);
  expect(screen.getByText('Ride the dunes at golden hour.')).toBeVisible();
  expect(screen.getAllByTestId('product-item-attribute')).toHaveLength(3);
});

it('renders only genuine discount and original-price claims', () => {
  const { rerender } = render(<ItemCard {...richProduct} discount={null} originalPrice={null} />);
  expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
  expect(screen.queryByText('$216.00')).not.toBeInTheDocument();

  rerender(<ItemCard {...richProduct} discount="40% OFF" originalPrice="$216.00" />);
  expect(screen.getByText('-40% OFF')).toBeVisible();
  expect(screen.getByText('$216.00')).toHaveClass('line-through');
});

it('emits valid Product, Offer, and AggregateRating raw values', () => {
  const { container } = render(<ItemCard {...richProduct} />);
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).toBeInTheDocument();
  expect(container.querySelector('[itemprop="price"]')).toHaveAttribute('content', '130');
  expect(container.querySelector('[itemprop="priceCurrency"]')).toHaveAttribute('content', 'USD');
  expect(container.querySelector('[itemprop="availability"]')).toHaveAttribute('href', 'https://schema.org/InStock');
  expect(container.querySelector('[itemprop="ratingValue"]')).toHaveAttribute('content', '4.8');
  expect(container.querySelector('[itemprop="reviewCount"]')).toHaveAttribute('content', '210');
});

it('omits Offer and AggregateRating markup when raw values are incomplete or invalid', () => {
  const { container, rerender } = render(<ItemCard {...richProduct} priceValue={null} priceCurrency={null} ratingValue={null} reviewCountValue={null} />);
  expect(container.querySelector('[itemtype="https://schema.org/Offer"]')).not.toBeInTheDocument();
  expect(container.querySelector('[itemtype="https://schema.org/AggregateRating"]')).not.toBeInTheDocument();

  rerender(<ItemCard {...richProduct} priceCurrency="ZZZ" ratingValue={7} reviewCountValue={2.5} />);
  expect(container.querySelector('[itemtype="https://schema.org/Offer"]')).not.toBeInTheDocument();
  expect(container.querySelector('[itemtype="https://schema.org/AggregateRating"]')).not.toBeInTheDocument();
});

it('omits navigation, Product schema, and wishlist for an invalid product identity', () => {
  const { container } = render(<ItemCard {...richProduct} href={null} hasValidIdentity={false} wishlistItem={null} />);

  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /wishlist/i })).not.toBeInTheDocument();
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).not.toBeInTheDocument();
  expect(screen.getByText('Desert Safari Adventure')).toBeVisible();
});

it('omits Product schema when only the generic fallback image is available', () => {
  const { container } = render(<ItemCard {...richProduct} image="/assets/Card.webp" hasRealImage={false} />);
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).not.toBeInTheDocument();
});

it('omits Product schema when the title is only a display fallback', () => {
  const { container } = render(<ItemCard {...richProduct} title="Untitled" hasRealTitle={false} />);
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).not.toBeInTheDocument();
});

it('removes the entire attribute region when no valid attributes exist', () => {
  const { rerender } = render(<ItemCard {...richProduct} />);
  expect(screen.getByTestId('product-item-attributes')).toBeInTheDocument();

  rerender(<ItemCard {...richProduct} attributes={[]} />);
  expect(screen.queryByTestId('product-item-attributes')).not.toBeInTheDocument();
});

it('uses the target mobile image ratio and a bottom-anchored price row', () => {
  render(<ItemCard {...richProduct} />);

  expect(screen.getByAltText('Desert Safari Adventure').parentElement).toHaveClass('aspect-[5/3]', 'sm:aspect-[4/3]');
  expect(screen.getByText('From').parentElement.parentElement).toHaveClass('mt-auto');
});

it('keeps the compact editorial structure free of product and wishlist markup', () => {
  const { container } = render(<ItemCard href="/blogs/a-guide" image="/guide.jpg" title="A guide" category="Travel" variant="compact" />);
  expect(screen.getByRole('link', { name: /a guide/i })).toBeInTheDocument();
  expect(container.querySelector('[itemtype="https://schema.org/Product"]')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /wishlist/i })).not.toBeInTheDocument();
  expect(screen.getByText('Travel')).toBeVisible();
});
