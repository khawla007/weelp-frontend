import { render, screen } from '@testing-library/react';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../dropdown-menu';

describe('DropdownMenuContent', () => {
  it('renders above the frontend sticky header layer', () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Mode</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Light</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByRole('menu')).toHaveClass('z-[100000]');
  });
});
