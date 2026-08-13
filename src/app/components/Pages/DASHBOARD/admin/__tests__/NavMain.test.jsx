import { render, screen } from '@testing-library/react';
import { ShoppingCart, MessageSquare } from 'lucide-react';
import { NavMain } from '../nav-main';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/admin/orders',
}));

jest.mock('next/link', () => {
  return function MockLink({ children, ...props }) {
    return <a {...props}>{children}</a>;
  };
});

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }) => <section>{children}</section>,
  SidebarGroupContent: ({ children }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }) => <h2>{children}</h2>,
  SidebarMenu: ({ children }) => <ul>{children}</ul>,
  SidebarMenuBadge: ({ children, ...props }) => <span {...props}>{children}</span>,
  SidebarMenuButton: ({ asChild, children, isActive }) =>
    asChild ? (
      <div data-active={isActive ? 'true' : 'false'}>{children}</div>
    ) : (
      <button type="button" data-active={isActive ? 'true' : 'false'}>
        {children}
      </button>
    ),
  SidebarMenuItem: ({ children, ...props }) => <li {...props}>{children}</li>,
  SidebarMenuSub: ({ children }) => <ul>{children}</ul>,
  SidebarMenuSubButton: ({ children }) => <div>{children}</div>,
  SidebarMenuSubItem: ({ children }) => <li>{children}</li>,
  SidebarSeparator: () => <hr />,
}));

const sections = [
  {
    section: 'BOOKINGS',
    items: [
      { title: 'Orders', icon: ShoppingCart, url: '/dashboard/admin/orders', notificationKey: 'orders' },
      { title: 'Reviews', icon: MessageSquare, url: '/dashboard/admin/reviews', notificationKey: 'reviews' },
    ],
  },
];

describe('NavMain unseen badges', () => {
  it('renders positive unseen counts, omits zero counts, and preserves active links', () => {
    render(<NavMain items={sections} counts={{ orders: 4, reviews: 0 }} />);

    const ordersLink = screen.getByRole('link', { name: 'Orders, 4 unseen' });
    expect(ordersLink).toHaveAttribute('href', '/dashboard/admin/orders');
    expect(ordersLink.parentElement).toHaveAttribute('data-active', 'true');
    expect(screen.getByText('4')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('link', { name: 'Reviews' })).toBeInTheDocument();
  });

  it('caps visible badge text while retaining the exact accessible count', () => {
    const { rerender } = render(<NavMain items={sections} counts={{ orders: 4, reviews: 0 }} />);

    rerender(<NavMain items={sections} counts={{ orders: 4, reviews: 125 }} />);

    expect(screen.getByRole('link', { name: 'Reviews, 125 unseen' })).toBeInTheDocument();
    expect(screen.getByText('99+')).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps the badge visible and compact when the sidebar is collapsed', () => {
    render(<NavMain items={sections} counts={{ orders: 4, reviews: 0 }} />);

    const badge = screen.getByText('4');
    expect(badge).toHaveClass('group-data-[collapsible=icon]:!flex');
    expect(badge).toHaveClass('group-data-[collapsible=icon]:right-0.5');
    expect(badge).toHaveClass('group-data-[collapsible=icon]:top-0.5');
    expect(badge).toHaveClass('group-data-[collapsible=icon]:h-4');
    expect(badge).toHaveClass('group-data-[collapsible=icon]:min-w-4');
    expect(badge).toHaveClass('group-data-[collapsible=icon]:px-1');
    expect(badge).toHaveClass('group-data-[collapsible=icon]:text-[9px]');
  });

  it('shows cancellation attention independently from unseen orders with one accessible label', () => {
    render(<NavMain items={sections} counts={{ orders: 4, reviews: 2 }} attention={{ cancellations: true }} />);

    expect(screen.getByRole('link', { name: 'Orders, 4 unseen, cancellation needs attention' })).toBeInTheDocument();
    expect(screen.getByText('!')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('!')).toHaveClass('bg-destructive', 'text-destructive-foreground');
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Reviews, 2 unseen' })).toBeInTheDocument();

    const cluster = screen.getByTestId('orders-badge-cluster');
    expect(cluster).toHaveClass('pointer-events-none', 'absolute', 'flex');
    expect(cluster).toContainElement(screen.getByText('4'));
    expect(cluster).toContainElement(screen.getByText('!'));
    expect(screen.getByText('4')).not.toHaveClass('absolute');
    expect(screen.getByText('!')).not.toHaveClass('absolute');
  });

  it('shows cancellation attention without turning it into a count', () => {
    render(<NavMain items={sections} counts={{ orders: 0, reviews: 0 }} attention={{ cancellations: true }} />);

    expect(screen.getByRole('link', { name: 'Orders, cancellation needs attention' })).toBeInTheDocument();
    expect(screen.getByTestId('orders-badge-cluster')).toHaveClass('group-data-[collapsible=icon]:top-9');
  });

  it('keeps both Orders badges together without overlap in collapsed navigation', () => {
    render(<NavMain items={sections} counts={{ orders: 4, reviews: 0 }} attention={{ cancellations: true }} />);

    const cluster = screen.getByTestId('orders-badge-cluster');
    expect(cluster).toHaveClass('gap-1', 'group-data-[collapsible=icon]:left-0', 'group-data-[collapsible=icon]:top-9', 'group-data-[collapsible=icon]:w-9');
    expect(cluster).not.toHaveClass('group-data-[collapsible=icon]:right-0.5', 'group-data-[collapsible=icon]:top-0.5');
    expect(cluster.closest('li')).toHaveClass('group-data-[collapsible=icon]:pb-5');
    expect(screen.getByText('4')).toHaveClass('group-data-[collapsible=icon]:h-4', 'group-data-[collapsible=icon]:min-w-4');
    expect(screen.getByText('!')).toHaveClass('group-data-[collapsible=icon]:size-4');
  });
});
