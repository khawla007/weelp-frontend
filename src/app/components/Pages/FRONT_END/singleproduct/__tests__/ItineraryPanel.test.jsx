import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => mockSearchParams.get('edit') ?? null),
  }),
}));

jest.mock('../ActivitySearchModalPublic', () => () => null);
jest.mock('../TransferSearchModalPublic', () => () => null);

import ItineraryPanel from '../ItineraryPanel';

const mockSearchParams = new URLSearchParams();

beforeEach(() => {
  mockSearchParams.delete('edit');
  global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
  }));
});

const schedules = [
  { day: 1, title: 'Arrival', activities: [], transfers: [] },
  { day: 2, title: 'Explore', activities: [], transfers: [] },
];

describe('ItineraryPanel', () => {
  it('keeps the date navigation sticky on desktop while preserving mobile scroll behavior', () => {
    render(<ItineraryPanel schedules={schedules} startDate={new Date('2026-10-03T00:00:00')} />);

    const dateRail = screen.getByRole('button', { name: '3rd Oct, Sat' }).parentElement;

    expect(dateRail).toHaveClass('overflow-x-auto');
    expect(dateRail).toHaveClass('md:sticky');
    expect(dateRail).toHaveClass('md:top-[176px]');
    expect(dateRail).toHaveClass('md:self-start');
  });

  it('keeps the login to customize action in the sticky header position', () => {
    render(<ItineraryPanel schedules={schedules} startDate={new Date('2026-10-03T00:00:00')} itinerary={{ slug: 'sample', locations: [] }} />);

    const actions = screen.getAllByRole('button', { name: /login to customize/i });
    const headerRow = actions[0].closest('.flex.items-center.justify-between');

    expect(actions).toHaveLength(1);
    expect(headerRow).toHaveClass('md:sticky');
    expect(headerRow).toHaveClass('md:top-[121px]');
    expect(headerRow).toContainElement(actions[0]);
  });

  it('keeps the exit edit action in the sticky header position', () => {
    mockSearchParams.set('edit', 'true');

    render(<ItineraryPanel schedules={schedules} startDate={new Date('2026-10-03T00:00:00')} session={{ user: { id: 1 } }} itinerary={{ slug: 'sample', locations: [], schedules }} />);

    const actions = screen.getAllByRole('button', { name: /exit edit mode/i });
    const headerRow = actions[0].closest('.flex.items-center.justify-between');

    expect(actions).toHaveLength(1);
    expect(headerRow).toHaveClass('md:sticky');
    expect(headerRow).toHaveClass('md:top-[121px]');
    expect(headerRow).toContainElement(actions[0]);
  });
});
