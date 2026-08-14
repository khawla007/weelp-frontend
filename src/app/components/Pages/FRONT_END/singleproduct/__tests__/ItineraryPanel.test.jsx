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

  it('uses the inactive date-button surface for Exit Edit Mode', () => {
    mockSearchParams.set('edit', 'true');

    render(<ItineraryPanel schedules={schedules} startDate={new Date('2026-10-03T00:00:00')} session={{ user: { id: 1, role: 'admin' } }} itinerary={{ slug: 'sample', locations: [], schedules }} />);

    expect(screen.getByRole('button', { name: /exit edit mode/i })).toHaveClass('bg-card', 'border', 'border-border/50', 'text-muted-foreground');
  });

  it('keeps edit controls plain and the day-title field unframed in every interaction state', () => {
    mockSearchParams.set('edit', 'true');
    const editableSchedules = [
      {
        day: 1,
        title: 'Arrival',
        activities: [{ id: 1, name: 'Museum Visit' }],
        transfers: [{ id: 2, name: 'Airport Pickup' }],
      },
    ];

    render(
      <ItineraryPanel
        schedules={editableSchedules}
        startDate={new Date('2026-10-03T00:00:00')}
        session={{ user: { id: 1, role: 'admin' } }}
        itinerary={{ slug: 'sample', locations: [], schedules: editableSchedules }}
      />,
    );

    expect(screen.getByRole('button', { name: /add day/i })).toHaveClass('weelp-add-day-button');
    screen.getAllByRole('button', { name: /^edit$/i }).forEach((button) => expect(button).toHaveClass('weelp-plain-action', 'border-0', 'bg-transparent', 'shadow-none'));
    screen.getAllByRole('button', { name: /remove (activity|transfer)/i }).forEach((button) => expect(button).toHaveClass('weelp-plain-action', 'border-0', 'bg-transparent', 'shadow-none'));

    const titleInput = screen.getByPlaceholderText('Day 1');
    expect(titleInput).toHaveClass(
      'weelp-day-title-input',
      'px-3',
      'py-2',
      'border-0',
      'focus:border-0',
      'focus-visible:border-0',
      'focus:ring-0',
      'focus-visible:ring-0',
      'active:border-0',
      'outline-none',
    );
    expect(titleInput).not.toHaveClass('border-dashed');
  });
});
