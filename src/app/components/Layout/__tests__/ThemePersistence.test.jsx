import { useTheme } from 'next-themes';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ThemeProvider } from '../ThemeProvider';

function ThemePersistenceControls() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <output aria-label="Current theme">{theme}</output>
      <button type="button" onClick={() => setTheme('light')}>
        Light
      </button>
      <button type="button" onClick={() => setTheme('dark')}>
        Dark
      </button>
    </div>
  );
}

describe('theme persistence', () => {
  beforeEach(() => {
    localStorage.setItem('weelp-theme', 'dark');
    document.documentElement.className = 'dark';
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
  });

  it('persists explicit Light then Dark choices through next-themes', async () => {
    render(
      <ThemeProvider>
        <ThemePersistenceControls />
      </ThemeProvider>,
    );

    await waitFor(() => expect(screen.getByLabelText('Current theme')).toHaveTextContent('dark'));

    fireEvent.click(screen.getByRole('button', { name: 'Light' }));
    await waitFor(() => {
      expect(localStorage.getItem('weelp-theme')).toBe('light');
      expect(document.documentElement).toHaveClass('light');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Dark' }));
    await waitFor(() => {
      expect(localStorage.getItem('weelp-theme')).toBe('dark');
      expect(document.documentElement).toHaveClass('dark');
    });
  });
});
