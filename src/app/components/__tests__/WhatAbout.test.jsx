import { render } from '@testing-library/react';

import { WhatAboutCity, WhatAboutRegion } from '../WhatAbout';

jest.mock('next/navigation', () => ({
  useParams: () => ({ city: 'dubai', region: 'emirates' }),
  usePathname: () => '/cities/dubai',
}));

test('city and region fact panels use the shared outer radius', () => {
  const { container, rerender } = render(<WhatAboutCity location_details={{ a: 1, b: 2, weather: 'Sunny' }} />);
  expect(container.querySelector('[data-public-card="city-facts"]')).toHaveClass('rounded-[24px]');

  rerender(<WhatAboutRegion destinationInfo={[{ title: 'Climate', description: 'Sunny' }]} />);
  expect(container.querySelector('[data-public-card="region-facts"]')).toHaveClass('rounded-[24px]');
});
