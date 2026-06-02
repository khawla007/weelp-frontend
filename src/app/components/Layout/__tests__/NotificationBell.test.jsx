import { render, screen } from '@testing-library/react';
import NotificationBell from '../NotificationBell';

jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
jest.mock('swr', () => ({ __esModule: true, default: () => ({ data: [], mutate: jest.fn() }) }));
// Mocked via relative path: the @/ alias does not resolve in jest.mock's
// module lookup, but this resolves to the same file the component imports.
jest.mock('../../../../hooks/useIsClient', () => ({ __esModule: true, useIsClient: () => true }));

describe('NotificationBell (anonymous)', () => {
  test('renders the bell button when logged out', () => {
    render(<NotificationBell />);
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });
});
