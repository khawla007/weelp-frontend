import React from 'react';
import { render } from '@testing-library/react';

import AiSection from '../AiSection';

describe('AiSection', () => {
  it('stacks the visual collage on small screens to prevent horizontal scrolling', () => {
    const { container } = render(<AiSection />);

    const mediaLayout = container.querySelector('section > div:last-child');
    expect(mediaLayout).toHaveClass('flex-col');
    expect(mediaLayout).toHaveClass('lg:flex-row');
  });
});
