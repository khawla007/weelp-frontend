import { fireEvent, render, screen } from '@testing-library/react';

import { ComboboxMultiple } from '../combobox_multi';

describe('ComboboxMultiple', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it('names the selected resource in its empty state', () => {
    render(<ComboboxMultiple items={[]} type="destinations" value={[]} onChange={jest.fn()} />);

    fireEvent.click(screen.getByRole('combobox'));

    expect(screen.getByText('No destinations found.')).toBeInTheDocument();
    expect(screen.queryByText('No tags found.')).not.toBeInTheDocument();
  });
});
