import { fireEvent, render, screen } from '@testing-library/react';

import CheckoutPage from '../page';

const mockOpenAuthModal = jest.fn();
const mockSetMiniCartOpen = jest.fn();

let mockSessionStatus = 'authenticated';
let mockCartItems = [];

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSessionStatus === 'authenticated' ? { user: { email: 'customer@example.test' } } : null, status: mockSessionStatus }),
}));

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

jest.mock('@/lib/store/useAuthModalStore', () => ({
  __esModule: true,
  default: () => ({ openAuthModal: mockOpenAuthModal }),
}));

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: () => ({ cartItems: mockCartItems, setMiniCartOpen: mockSetMiniCartOpen }),
}));

jest.mock(
  'next/dynamic',
  () => () =>
    function CheckoutMainMock() {
      return <div>Checkout form</div>;
    },
);

jest.mock('@/app/components/Navigation/NavigationLink', () => ({
  __esModule: true,
  default: ({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('checkout page cart boundaries', () => {
  beforeEach(() => {
    mockSessionStatus = 'authenticated';
    mockCartItems = [];
    mockOpenAuthModal.mockClear();
    mockSetMiniCartOpen.mockClear();
  });

  it('uses an internal navigation action for an empty cart', () => {
    render(<CheckoutPage />);

    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  it('blocks checkout when more than one cart line is present', () => {
    mockCartItems = [{ id: 1 }, { id: 2 }];

    render(<CheckoutPage />);

    expect(screen.getByRole('heading', { name: /checkout one booking at a time/i })).toBeInTheDocument();
    expect(screen.queryByText('Checkout form')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /review cart/i }));
    expect(mockSetMiniCartOpen).toHaveBeenCalledWith(true);
  });

  it('renders checkout for exactly one cart line', () => {
    mockCartItems = [{ id: 1 }];

    render(<CheckoutPage />);

    expect(screen.getByText('Checkout form')).toBeInTheDocument();
  });
});
