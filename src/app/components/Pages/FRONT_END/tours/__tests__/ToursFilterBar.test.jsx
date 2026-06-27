import { fireEvent, render, screen } from '@testing-library/react';

import ToursFilterBar from '../ToursFilterBar';

const mockCities = [
  { id: 1, name: 'Paris', slug: 'paris', type: 'city' },
  { id: 2, name: 'Dubai', slug: 'dubai', type: 'city' },
];

jest.mock('@/hooks/useCitiesRegions', () => ({
  useCitiesRegions: () => ({
    data: mockCities,
    loading: false,
  }),
}));

jest.mock('@/lib/services/tours', () => ({
  toursSearch: jest.fn(async () => []),
}));

describe('ToursFilterBar', () => {
  it('focuses From and Where To inputs when their field surfaces are clicked', () => {
    render(<ToursFilterBar />);

    const fromInput = screen.getByPlaceholderText('From?');
    const toInput = screen.getByPlaceholderText('Where To?');

    fireEvent.click(fromInput.parentElement);
    expect(fromInput).toHaveFocus();

    fireEvent.change(fromInput, { target: { value: 'Pa' } });
    expect(fromInput).toHaveValue('Pa');

    fireEvent.click(toInput.parentElement);
    expect(toInput).toHaveFocus();

    fireEvent.change(toInput, { target: { value: 'Du' } });
    expect(toInput).toHaveValue('Du');
  });

  it('keeps text inputs free of visible focus ring utility classes', () => {
    render(<ToursFilterBar />);

    expect(screen.getByPlaceholderText('From?')).toHaveClass('focus-visible:ring-0', 'focus-visible:ring-offset-0');
    expect(screen.getByPlaceholderText('Where To?')).toHaveClass('focus-visible:ring-0', 'focus-visible:ring-offset-0');
  });
});
