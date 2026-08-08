import { readFileSync } from 'fs';
import path from 'path';
import { act, fireEvent, render, screen } from '@testing-library/react';

jest.mock('../TabSection__modules', () => ({
  OverViewPanel: () => <div />,
  WhatIncludedPanel: () => <div />,
  ReviewPanel: () => <div />,
  FaqPanel: () => <div />,
  normalizeFaqItems: () => [],
  normalizeInclusionItems: () => [],
}));

jest.mock('../SimilarExperiences', () => ({
  __esModule: true,
  default: () => <section aria-label="Similar Experiences">Similar Experiences</section>,
}));

jest.mock('../ItineraryPanel', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('../ItineraryEditActionBar', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('@/app/components/ui/Reveal', () => ({
  __esModule: true,
  default: ({ children, className = '', ...props }) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

jest.mock('@/lib/store/useMiniCartStore', () => ({
  __esModule: true,
  default: () => ({ cartItems: [], setMiniCartOpen: jest.fn() }),
}));

jest.mock('@/app/components/Form/SingleProductForm', () => ({
  __esModule: true,
  default: ({ formId }) => <form id={formId} />,
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: () => ({ data: undefined }),
}));

import SingleProductTabSection from '../SingleProductTabSection';
import ProductSidebar from '../ProductSidebar';

let actionObserverCallback;

describe('single product sidebar layering', () => {
  beforeEach(() => {
    actionObserverCallback = undefined;
    window.IntersectionObserver = jest.fn((callback) => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
      callback: (actionObserverCallback = callback),
    }));
  });

  it('keeps the decorative bottom image behind the sidebar column content', () => {
    const { container } = render(
      <SingleProductTabSection
        productType="activity"
        productId={3}
        productData={{ id: 3, name: 'Desert Safari', pricing: { regular_price: 244, currency: 'USD' }, addons: [], faqs: [] }}
        citySlug="dubai"
        activitySlug="desert-safari"
      />,
    );

    const decorativeImageLayer = [...container.querySelectorAll('[aria-hidden="true"]')].find((element) => element.className.includes('pointer-events-none'));

    expect(decorativeImageLayer).toHaveClass('z-0');
    expect(decorativeImageLayer.parentElement).toHaveClass('xl:self-stretch');
    expect(screen.getByRole('heading', { name: 'Questions?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Help Center' })).toBeInTheDocument();
  });

  it('positions ProductSidebar content above decorative backgrounds', () => {
    const { container } = render(<ProductSidebar productId={3} productType="activity" productData={{ id: 3, pricing: { regular_price: 244, currency: 'USD' }, addons: [] }} />);

    expect(container.firstElementChild).toHaveClass('relative', 'z-[1]');
    expect(screen.getByRole('heading', { name: 'Questions?' })).toBeInTheDocument();
  });

  it('keeps the Questions card directly below the booking card in the sticky group', () => {
    render(<ProductSidebar productId={3} productType="activity" productData={{ id: 3, pricing: { regular_price: 244, currency: 'USD' }, addons: [] }} />);

    const layout = screen.getByTestId('product-sidebar-layout');
    const stickyCard = screen.getByTestId('booking-sticky-card');
    const questions = screen.getByRole('heading', { name: 'Questions?' }).closest('[data-testid="booking-support"]');

    expect(layout).toHaveClass('h-full', 'px-6', 'xl:px-10');
    expect(stickyCard).toHaveClass('weelp-booking-sticky');
    expect(stickyCard).toContainElement(questions);
  });

  it('defines a width-and-height-gated sticky boundary without nested scrolling', () => {
    const css = readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');
    expect(css).toMatch(/@media \(min-width: 1280px\) and \(min-height: 760px\)/);
    expect(css).toMatch(/\.weelp-booking-sticky\s*{[^}]*position:\s*sticky;[^}]*top:\s*142px;/s);
    expect(css).not.toMatch(/\.weelp-booking-sticky\s*{[^}]*overflow-y:\s*(auto|scroll)/s);
  });

  it('starts optional price details and add-ons collapsed with useful summaries', () => {
    render(
      <ProductSidebar
        productId={3}
        productType="activity"
        productData={{
          id: 3,
          pricing: { regular_price: 244, currency: 'USD' },
          addons: [{ addon_id: 7, addon_name: 'Photography Package', addon_price: 40 }],
        }}
      />,
    );

    const priceTrigger = screen.getByRole('button', { name: /price details/i });
    const addonTrigger = screen.getByRole('button', { name: /add-ons.*none selected/i });
    expect(priceTrigger).toHaveClass('px-4');
    expect(addonTrigger).toHaveClass('px-4');
    expect(priceTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(addonTrigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(addonTrigger);
    fireEvent.click(screen.getByRole('checkbox', { name: /photography package/i }));
    expect(screen.getByRole('button', { name: /add-ons.*1 selected/i })).toBeInTheDocument();
  });

  it('removes the forced dark border only from unselected calendar dates', () => {
    const css = readFileSync(path.join(process.cwd(), 'src/app/styles/date-picker.css'), 'utf8');

    expect(css).toMatch(
      /\.dark\s+\.weelp-calendar\s+\.rdp-day:not\(\.rdp-selected\):not\(#weelp-calendar-selected-date\)\s+\.rdp-day_button\s*{[^}]*border:\s*0\s*!important;/s,
    );
  });

  it('keeps package headline pricing synchronized with the booking total', () => {
    render(
      <ProductSidebar
        productId={2}
        productType="package"
        productData={{
          id: 2,
          base_pricing: {
            currency: 'USD',
            variations: [{ regular_price: 1000 }],
          },
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'From $1,000.00 / person' })).toBeInTheDocument();
    expect(screen.getByTestId('booking-action')).toHaveTextContent('Total');
    expect(screen.getByTestId('booking-action')).toHaveTextContent('$1,000.00');
  });

  it('shows one mobile booking bar only while the inline action is outside the viewport', () => {
    render(<ProductSidebar productId={3} productType="activity" productData={{ id: 3, pricing: { regular_price: 244, currency: 'USD' }, addons: [] }} />);

    act(() => actionObserverCallback([{ isIntersecting: false, intersectionRatio: 0 }]));
    expect(screen.getByTestId('mobile-booking-bar')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-booking-bar')).toHaveClass('fixed', 'bottom-0', 'xl:hidden');
    expect(screen.getByTestId('mobile-booking-bar').parentElement).toBe(document.body);

    act(() => actionObserverCallback([{ isIntersecting: true, intersectionRatio: 1 }]));
    expect(screen.queryByTestId('mobile-booking-bar')).not.toBeInTheDocument();
  });

  it('omits the enhancement when IntersectionObserver is unavailable', () => {
    delete window.IntersectionObserver;
    render(<ProductSidebar productId={3} productType="activity" productData={{ id: 3, pricing: { regular_price: 244, currency: 'USD' }, addons: [] }} />);
    expect(screen.queryByTestId('mobile-booking-bar')).not.toBeInTheDocument();
    expect(screen.getByTestId('booking-action')).toBeInTheDocument();
  });

  it('disconnects the action observer on unmount', () => {
    const disconnect = jest.fn();
    window.IntersectionObserver = jest.fn(() => ({ observe: jest.fn(), disconnect }));
    const { unmount } = render(<ProductSidebar productId={3} productType="activity" productData={{ id: 3, pricing: { regular_price: 244, currency: 'USD' }, addons: [] }} />);
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
