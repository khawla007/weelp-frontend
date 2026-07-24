import { render, screen } from '@testing-library/react';

import { Settings } from '../settings';

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const originalResizeObserver = global.ResizeObserver;

describe('admin general settings', () => {
  beforeAll(() => {
    global.ResizeObserver = ResizeObserver;
  });

  afterAll(() => {
    global.ResizeObserver = originalResizeObserver;
  });

  it('leaves theme selection to the global dashboard header control', () => {
    render(<Settings />);

    expect(screen.queryByText(/^Theme$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^System$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Light$/i)).not.toBeInTheDocument();
    expect(screen.getByText('Compact Mode')).toBeInTheDocument();
    expect(screen.getByText('Regional Settings')).toBeInTheDocument();
  });
});
