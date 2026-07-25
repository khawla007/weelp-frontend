import { fireEvent, render, screen } from '@testing-library/react';

import LocationComboboxPublic from '../LocationComboboxPublic';

jest.mock('@/lib/services/locations', () => ({
  searchPublicLocations: jest.fn().mockResolvedValue([]),
}));

describe('LocationComboboxPublic responsive popover', () => {
  beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
      observe() {}

      unobserve() {}

      disconnect() {}
    };
  });

  it('keeps the location search within the mobile viewport', () => {
    render(<LocationComboboxPublic />);

    fireEvent.click(screen.getByRole('button', { name: 'Search city or place…' }));

    expect(screen.getByTestId('transfer-location-popover')).toHaveClass('w-[320px]', 'max-w-[calc(100vw-2rem)]');
  });
});
