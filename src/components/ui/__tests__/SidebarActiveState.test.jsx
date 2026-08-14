import { render, screen } from '@testing-library/react';
import { SidebarMenuButton, SidebarMenuSubButton, SidebarProvider } from '../sidebar';

describe('sidebar active navigation styling', () => {
  it('gives active main navigation items a distinct background and foreground', () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton isActive>Users</SidebarMenuButton>
      </SidebarProvider>,
    );

    expect(screen.getByRole('button', { name: 'Users' })).toHaveClass('data-[active=true]:bg-sidebar-accent', 'data-[active=true]:text-sidebar-accent-foreground');
  });

  it('gives active nested navigation items the same visible treatment', () => {
    render(
      <SidebarProvider>
        <SidebarMenuSubButton isActive>Regions</SidebarMenuSubButton>
      </SidebarProvider>,
    );

    expect(screen.getByText('Regions')).toHaveClass('data-[active=true]:bg-sidebar-accent', 'data-[active=true]:text-sidebar-accent-foreground');
  });
});
