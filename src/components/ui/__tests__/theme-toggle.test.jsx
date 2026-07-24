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

  it.each([
    ['default', {}],
    ['compact admin', { compact: true }],
  ])('keeps a semantic keyboard focus ring on the %s trigger', (_placement, props) => {
    render(<ThemeToggle {...props} className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-red-500" />);

    const trigger = screen.getByRole('button', { name: /change theme/i });
    trigger.focus();

    expect(trigger).toHaveFocus();
    expect(trigger).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-weelp-sage-text', 'focus-visible:ring-offset-2', 'focus-visible:ring-offset-background');
    expect(trigger).not.toHaveClass('focus-visible:ring-0', 'focus-visible:ring-offset-0', 'focus-visible:ring-red-500');
  });
});
