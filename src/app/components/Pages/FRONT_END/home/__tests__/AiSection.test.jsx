import React from 'react';
import { render } from '@testing-library/react';

import AiSection from '../AiSection';

describe('AiSection', () => {
  it('renders alternating image-text rows that stack on small screens', () => {
    const { container } = render(<AiSection />);

    const rowsWrapper = container.querySelector('section > div:last-child');
    expect(rowsWrapper).toHaveClass('flex-col');

    const rows = Array.from(rowsWrapper.children);
    expect(rows.length).toBeGreaterThan(1);
    rows.forEach((row) => {
      expect(row.className).toMatch(/flex-col/);
      expect(row.className).toMatch(/lg:flex-row/);
    });
  });

  it('uses the pen-canonical heading copy', () => {
    const { getByText } = render(<AiSection />);
    expect(getByText('Your AI Travel Buddy')).toBeInTheDocument();
  });
});
