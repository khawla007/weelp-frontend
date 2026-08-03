import { fireEvent, render, screen } from '@testing-library/react';

const mockContextualHelpPanel = jest.fn(({ open, onOpenChange, context }) =>
  open ? (
    <aside role="dialog" aria-label="Experience help">
      <span>{context.itemTitle}</span>
      <button type="button" onClick={() => onOpenChange(false)}>
        Close help
      </button>
    </aside>
  ) : null,
);

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: () => ({
    cartItems: [],
    setMiniCartOpen: jest.fn(),
    addItem: jest.fn(),
  }),
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: () => ({ data: undefined }),
}));

jest.mock('@/app/components/Help/ContextualHelpPanel', () => ({
  ContextualHelpPanel: (props) => mockContextualHelpPanel(props),
}));

jest.mock('../SingleProductReview', () => ({
  SingleProductReview: () => null,
}));

import ProductSidebar from '../ProductSidebar';

const activity = {
  id: 42,
  name: 'Dubai Desert Safari',
  pricing: { regular_price: 475, currency: 'USD' },
  addons: [{ addon_id: 7, addon_name: 'Photography Package', addon_sale_price: 30, addon_price: 40 }],
  faqs: [{ question: 'What should I bring?', answer: 'Bring sunscreen.' }],
};

describe('ProductSidebar contextual help', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.history.replaceState({}, '', '/cities/dubai/activities/dubai-desert-safari');
  });

  it('opens contextual help without navigating or resetting booking controls', () => {
    const initialPath = window.location.pathname;

    render(<ProductSidebar productId={42} productType="activity" productData={activity} citySlug="dubai" itemSlug="dubai-desert-safari" />);

    expect(screen.getByRole('button', { name: '1 Travelers' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument();

    const addon = screen.getByRole('checkbox', { name: /photography package/i });
    fireEvent.click(addon);
    expect(addon).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Help Center' }));

    expect(screen.getByRole('dialog', { name: 'Experience help' })).toBeInTheDocument();
    expect(mockContextualHelpPanel.mock.calls.at(-1)[0]).toEqual(
      expect.objectContaining({
        open: true,
        context: expect.objectContaining({
          itemType: 'activity',
          itemId: 42,
          itemTitle: 'Dubai Desert Safari',
          itemSlug: 'dubai-desert-safari',
          citySlug: 'dubai',
          pagePath: '/cities/dubai/activities/dubai-desert-safari',
        }),
      }),
    );
    expect(window.location.pathname).toBe(initialPath);
    expect(screen.getByRole('button', { name: '1 Travelers' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close help' }));

    expect(screen.queryByRole('dialog', { name: 'Experience help' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /photography package/i })).toHaveAttribute('aria-checked', 'true');
  });

  it.each([
    ['package', 'packages', 'dubai-family-package'],
    ['itinerary', 'itineraries', 'dubai-family-itinerary'],
  ])('normalizes %s route context', (productType, routeSegment, itemSlug) => {
    render(
      <ProductSidebar
        productId={42}
        productType={productType}
        productData={{ ...activity, name: `Dubai ${productType}` }}
        citySlug="dubai"
        itemSlug={itemSlug}
        itinerarySlug={productType === 'itinerary' ? itemSlug : undefined}
        packageSlug={productType === 'package' ? itemSlug : undefined}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Help Center' }));

    expect(mockContextualHelpPanel.mock.calls.at(-1)[0].context).toEqual(
      expect.objectContaining({
        itemType: productType,
        itemSlug,
        pagePath: `/cities/dubai/${routeSegment}/${itemSlug}`,
      }),
    );
  });

  it('prefers the canonical route slug over a stale API slug', () => {
    render(<ProductSidebar productId={42} productType="activity" productData={{ ...activity, slug: 'stale-api-slug' }} citySlug="dubai" itemSlug="dubai-desert-safari" />);

    fireEvent.click(screen.getByRole('button', { name: 'Help Center' }));

    expect(mockContextualHelpPanel.mock.calls.at(-1)[0].context).toEqual(
      expect.objectContaining({
        itemSlug: 'dubai-desert-safari',
        pagePath: '/cities/dubai/activities/dubai-desert-safari',
      }),
    );
  });

  it('does not render a dead help trigger or panel when route context is incomplete', () => {
    render(<ProductSidebar productId={42} productType="activity" productData={activity} itemSlug="dubai-desert-safari" />);

    expect(screen.queryByRole('button', { name: 'Help Center' })).not.toBeInTheDocument();
    expect(mockContextualHelpPanel).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Questions?' })).toBeInTheDocument();
  });
});
