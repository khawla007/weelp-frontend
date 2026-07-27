import { buildDiscoverySearchUrl, parseDiscoverySearchParams } from '../discoverySearchParams';

describe('discoverySearchParams', () => {
  it('parses canonical location, dates, and quantity', () => {
    expect(parseDiscoverySearchParams('location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=3')).toEqual({
      location: 'dubai',
      dateRange: {
        from: new Date(2026, 7, 10),
        to: new Date(2026, 7, 14),
      },
      guests: { adults: 3, children: 0, infants: 0 },
    });
  });

  it.each(['start_date=bad&end_date=2026-08-14', 'start_date=2026-08-20&end_date=2026-08-14', 'start_date=2026-02-30&end_date=2026-03-02', 'start_date=2026-08-10', 'end_date=2026-08-14'])(
    'ignores an invalid date range from %s',
    (query) => {
      expect(parseDiscoverySearchParams(query).dateRange).toEqual({ from: null, to: null });
    },
  );

  it('accepts a valid leap day and trims an encoded location', () => {
    const parsed = parseDiscoverySearchParams('location=%20new-york%20&start_date=2028-02-29&end_date=2028-03-01&quantity=2');

    expect(parsed.location).toBe('new-york');
    expect(parsed.dateRange.from).toEqual(new Date(2028, 1, 29));
  });

  it.each(['', 'quantity=0', 'quantity=-2', 'quantity=2.5', 'quantity=nope'])('falls back to one adult for %s', (query) => {
    expect(parseDiscoverySearchParams(query).guests).toEqual({
      adults: 1,
      children: 0,
      infants: 0,
    });
  });

  it('serializes the canonical result URL', () => {
    expect(
      buildDiscoverySearchUrl({
        location: 'dubai',
        dateRange: {
          from: new Date(2026, 7, 10),
          to: new Date(2026, 7, 14),
        },
        guests: { adults: 1, children: 1, infants: 1 },
      }),
    ).toBe('/search?location=dubai&start_date=2026-08-10&end_date=2026-08-14&quantity=3');
  });

  it('omits invalid location and date values while preserving a safe quantity', () => {
    expect(
      buildDiscoverySearchUrl({
        location: '   ',
        dateRange: { from: new Date('invalid'), to: new Date(2026, 7, 14) },
        guests: { adults: -1, children: Number.NaN, infants: 0 },
      }),
    ).toBe('/search?quantity=1');
  });
});
