import { fireEvent, render, screen } from '@testing-library/react';

import { ThemeToggle } from '../theme-toggle';

const mockSetTheme = jest.fn();
const mockThemeState = {
  resolvedTheme: 'light',
};

jest.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: mockThemeState.resolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

jest.mock('@/hooks/useIsClient', () => ({
  useIsClient: () => true,
}));

jest.mock('@/components/ui/dropdown-menu', () => {
  const React = require('react');

  return {
    DropdownMenu: ({ children }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children, ...props }) => <button {...props}>{children}</button>,
    DropdownMenuContent: ({ children }) => <div role="menu">{children}</div>,
    DropdownMenuItem: ({ children, onSelect }) => (
      <button type="button" role="menuitem" onClick={onSelect}>
        {children}
      </button>
    ),
  };
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
    mockThemeState.resolvedTheme = 'light';
  });

  it('shows only Dark when the resolved theme is light', () => {
    render(<ThemeToggle />);

    expect(screen.getByRole('menuitem', { name: /dark/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /light/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /system/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('menuitem', { name: /dark/i }));

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('shows only Light when the resolved theme is dark', () => {
    mockThemeState.resolvedTheme = 'dark';

    render(<ThemeToggle />);

    expect(screen.getByRole('menuitem', { name: /light/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /dark/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /system/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('menuitem', { name: /light/i }));

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});
