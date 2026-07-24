import { fireEvent, render, screen } from '@testing-library/react';

import { AppearanceSettings } from '../AppearanceSettings';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const mockSetTheme = jest.fn((theme) => {
  mockThemeState.theme = theme;
  mockThemeState.resolvedTheme = theme;
});
const mockThemeState = {
  theme: 'dark',
  resolvedTheme: 'dark',
};

jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockThemeState.theme,
    resolvedTheme: mockThemeState.resolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

jest.mock('@/hooks/useIsClient', () => ({
  useIsClient: () => true,
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

jest.mock('@/lib/store/uiStore', () => ({
  useUIStore: () => ({ font: 'Inter', setFont: jest.fn() }),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children, ...props }) => <button {...props}>{children}</button>,
  DropdownMenuContent: ({ children }) => <div role="menu">{children}</div>,
  DropdownMenuItem: ({ children, onSelect }) => (
    <button type="button" role="menuitem" onClick={onSelect}>
      {children}
    </button>
  ),
}));

describe('theme controls agreement', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
    mockThemeState.theme = 'dark';
    mockThemeState.resolvedTheme = 'dark';
  });

  it('offers only explicit choices and keeps dashboard and global controls in sync', () => {
    const { rerender } = render(
      <>
        <AppearanceSettings />
        <ThemeToggle />
      </>,
    );

    const darkChoice = screen.getByRole('button', { name: /Dark.*Deep Forest.*default/i });
    const lightChoice = screen.getByRole('button', { name: /Light.*bright surfaces/i });

    expect(darkChoice).toHaveAttribute('aria-pressed', 'true');
    expect(lightChoice).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('menuitem', { name: 'Light' })).toBeInTheDocument();
    expect(screen.queryByText('System')).not.toBeInTheDocument();

    fireEvent.click(lightChoice);
    expect(mockSetTheme).toHaveBeenCalledWith('light');

    rerender(
      <>
        <AppearanceSettings />
        <ThemeToggle />
      </>,
    );

    expect(screen.getByRole('button', { name: /Light.*bright surfaces/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Dark.*Deep Forest.*default/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('menuitem', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /theme.*light/i })).toBeInTheDocument();
  });
});
