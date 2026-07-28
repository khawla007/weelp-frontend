import React from 'react';
import { render, screen } from '@testing-library/react';

import { CountryCards } from '../MegaMenuComponents';

jest.mock('next/link', () => {
  const LinkMock = ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  LinkMock.displayName = 'LinkMock';
  return LinkMock;
});

describe('CountryCards', () => {
  it('keeps destination image card overlay and labels theme-independent', () => {
    render(
      <CountryCards
        selectedCountryId={null}
        onSelect={jest.fn()}
        countries={[
          {
            id: 1,
            name: 'United Arab Emirates',
            featured_image: '/dubai.jpg',
            cities_count: 7,
          },
        ]}
      />,
    );

    const countryName = screen.getByText('1. UAE');
    const cityCount = screen.getByText('7 Cities');
    const overlay = countryName.closest('button').querySelector('.to-black\\/50');

    expect(overlay).toBeInTheDocument();
    expect(countryName).toHaveClass('text-white');
    expect(cityCount).toHaveClass('text-white');
  });
});
