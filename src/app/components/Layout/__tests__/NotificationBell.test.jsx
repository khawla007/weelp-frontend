import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import NotificationBell from '../NotificationBell';

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
jest.mock('swr', () => ({ __esModule: true, default: () => ({ data: [], mutate: jest.fn() }) }));
// Mocked via relative path: the @/ alias does not resolve in jest.mock's
// module lookup, but this resolves to the same file the component imports.
jest.mock('../../../../hooks/useIsClient', () => ({ __esModule: true, useIsClient: () => true }));

describe('NotificationBell (anonymous)', () => {
  test('renders the bell button when logged out', () => {
    render(<NotificationBell />);
    const trigger = screen.getByRole('button', { name: /notifications/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).not.toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-controls', 'notifications-popover');
  });

  test('closes when another header dropdown opens', async () => {
    render(<NotificationBell />);

    const trigger = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    act(() => {
      window.dispatchEvent(new CustomEvent('weelp-header-dropdown-open', { detail: { source: 'theme' } }));
    });

    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
