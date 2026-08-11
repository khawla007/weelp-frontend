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
  SidebarMenuItem: ({ children }) => <li>{children}</li>,
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
});
