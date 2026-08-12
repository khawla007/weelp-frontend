import { displayOrderValue, formatCompactTimeAgo, formatOrderAmount, formatOrderTravelDate, getOrderAmountValue, pluralizeOrderCount } from '../orderDisplay';

const NOW = Date.parse('2026-08-11T12:00:00.000Z');

describe('formatCompactTimeAgo', () => {
  it.each([
    [0, '0s ago'],
    [59 * 1000, '59s ago'],
    [60 * 1000, '1m ago'],
    [(60 * 60 - 1) * 1000, '59m ago'],
    [60 * 60 * 1000, '1h ago'],
    [(24 * 60 * 60 - 1) * 1000, '23h ago'],
    [24 * 60 * 60 * 1000, '1d ago'],
    [(30 * 24 * 60 * 60 - 1) * 1000, '29d ago'],
    [30 * 24 * 60 * 60 * 1000, '1mo ago'],
    [359 * 24 * 60 * 60 * 1000, '11mo ago'],
    [360 * 24 * 60 * 60 * 1000, '12mo ago'],
    [364 * 24 * 60 * 60 * 1000, '12mo ago'],
    [365 * 24 * 60 * 60 * 1000, '1y ago'],
    [(2 * 365 * 24 * 60 * 60 - 1) * 1000, '1y ago'],
    [2 * 365 * 24 * 60 * 60 * 1000, '2y ago'],
  ])('formats %i elapsed milliseconds', (elapsed, expected) => {
    expect(formatCompactTimeAgo(new Date(NOW - elapsed).toISOString(), NOW)).toBe(expected);
  });

  it.each([null, undefined, '', 'not-a-date'])('returns Not available for %p', (value) => {
    expect(formatCompactTimeAgo(value, NOW)).toBe('Not available');
  });

  it('clamps future timestamps', () => {
    expect(formatCompactTimeAgo(new Date(NOW + 5000).toISOString(), NOW)).toBe('0s ago');
  });
});

describe('order detail display helpers', () => {
  it('formats fallbacks, dates, counts, and effective payment amounts', () => {
    expect(displayOrderValue(null)).toBe('Not provided');
    expect(formatOrderTravelDate('2026-08-20')).toBe('Aug 20, 2026');
    expect(formatOrderTravelDate('2026-02-30')).toBe('Not provided');
    expect(pluralizeOrderCount(1, 'adult', 'adults')).toBe('1 adult');
    expect(pluralizeOrderCount(2, 'adult', 'adults')).toBe('2 adults');
    expect(pluralizeOrderCount(0, 'child', 'children')).toBe('0 children');
    expect(pluralizeOrderCount(null, 'adult', 'adults')).toBe('Not provided');
    expect(pluralizeOrderCount(undefined, 'adult', 'adults')).toBe('Not provided');
    expect(pluralizeOrderCount('', 'adult', 'adults')).toBe('Not provided');
    expect(formatOrderAmount({ total_amount: 185, currency: 'USD' })).toBe('$185.00');
    expect(formatOrderAmount({ is_custom_amount: true, custom_amount: 25, total_amount: 185, currency: 'USD' })).toBe('$210.00');
    expect(formatOrderAmount({ is_custom_amount: true, custom_amount: null, total_amount: 185, currency: 'USD' })).toBe('$185.00');
    expect(formatOrderAmount()).toBe('Not provided');
    expect(formatOrderAmount({ total_amount: 'invalid' })).toBe('Not provided');
  });
});

describe('getOrderAmountValue', () => {
  it('returns the parsed effective amount or null', () => {
    expect(getOrderAmountValue({ total_amount: '185' })).toBe(185);
    expect(getOrderAmountValue({ amount: '90' })).toBe(90);
    expect(getOrderAmountValue({ is_custom_amount: true, custom_amount: '25', total_amount: '185' })).toBe(210);
    expect(getOrderAmountValue({ total_amount: 'invalid' })).toBeNull();
  });
});
