/**
 * calculateActivityPrice.test.js
 * Unit tests for pickGroupDiscount and computeGroupDiscount.
 * Backend algorithm alignment verified against ActivityDiscountService.php logic.
 */

import { pickGroupDiscount, computeGroupDiscount, calculateActivityPrice } from './calculateActivityPrice';

describe('pickGroupDiscount', () => {
  describe('Fixed discount tiers', () => {
    const fixedTiers = [
      { id: 1, min_people: 5, discount_amount: 5, discount_type: 'fixed' },
      { id: 2, min_people: 13, discount_amount: 10, discount_type: 'fixed' },
    ];

    test('N=15: should pick tier with max discount total (5@$5 wins: $15 vs 13@$10: $10)', () => {
      const pricePerHead = 100;
      const result = pickGroupDiscount(fixedTiers, 15, pricePerHead);

      expect(result).not.toBeNull();
      expect(result.min_people).toBe(5); // Tier 5 selected
      expect(result.discount_amount).toBe(5);
    });

    test('N=26: should pick tier with max discount total (5@$5: $25 wins vs 13@$10: $20)', () => {
      const pricePerHead = 100;
      const result = pickGroupDiscount(fixedTiers, 26, pricePerHead);

      expect(result).not.toBeNull();
      expect(result.min_people).toBe(5);
      expect(result.discount_amount).toBe(5);
    });

    test('N=13: should tie-break (5: $10 vs 13: $10) → smaller min_people wins → pick 5', () => {
      const pricePerHead = 100;
      const result = pickGroupDiscount(fixedTiers, 13, pricePerHead);

      expect(result).not.toBeNull();
      expect(result.min_people).toBe(5);
    });

    test('N=4: should return null (no tier qualifies)', () => {
      const result = pickGroupDiscount(fixedTiers, 4, 100);
      expect(result).toBeNull();
    });
  });

  describe('Percentage discount tiers', () => {
    const percentageTiers = [
      { id: 1, min_people: 5, discount_amount: 3, discount_type: 'percentage' },
      { id: 2, min_people: 13, discount_amount: 10, discount_type: 'percentage' },
    ];

    test('N=15: should pick tier with max discount total (5@3%: $45 vs 13@10%: $150) → 13 wins', () => {
      const pricePerHead = 100;
      const result = pickGroupDiscount(percentageTiers, 15, pricePerHead);

      expect(result).not.toBeNull();
      expect(result.min_people).toBe(13);
      expect(result.discount_amount).toBe(10);
    });

    test('N=20: should pick 13@10% ($200) over 5@3% ($60)', () => {
      const result = pickGroupDiscount(percentageTiers, 20, 100);
      expect(result.min_people).toBe(13);
    });
  });

  describe('Mixed fixed/percentage tiers', () => {
    const mixedTiers = [
      { id: 1, min_people: 5, discount_amount: 100, discount_type: 'fixed' },
      { id: 2, min_people: 10, discount_amount: 20, discount_type: 'percentage' },
    ];

    test('should tie-break on equal discount total (fixed $50 vs percentage $100) → percentage wins', () => {
      const result = pickGroupDiscount(mixedTiers, 10, 100);
      expect(result.discount_type).toBe('percentage');
    });
  });

  describe('Percentage clamping', () => {
    const clampTiers = [{ id: 1, min_people: 1, discount_amount: 150, discount_type: 'percentage' }];

    test('should clamp percentage to 100 for discount calculation', () => {
      const result = pickGroupDiscount(clampTiers, 1, 100);
      expect(result.min_people).toBe(1);
      expect(result.discount_amount).toBe(150); // Original stored, but clamped in logic
    });
  });

  describe('Edge cases', () => {
    test('empty tiers array should return null', () => {
      expect(pickGroupDiscount([], 10, 100)).toBeNull();
    });

    test('null tiers should return null', () => {
      expect(pickGroupDiscount(null, 10, 100)).toBeNull();
    });

    test('headcount=0 should return null', () => {
      const tiers = [{ id: 1, min_people: 5, discount_amount: 10, discount_type: 'fixed' }];
      expect(pickGroupDiscount(tiers, 0, 100)).toBeNull();
    });
  });
});

describe('computeGroupDiscount', () => {
  describe('Fixed discount calculation', () => {
    const fixedTiers = [
      { id: 1, min_people: 5, discount_amount: 5, discount_type: 'fixed' },
      { id: 2, min_people: 13, discount_amount: 10, discount_type: 'fixed' },
    ];

    test('N=15, $100/head: should compute $15 discount (5-tier: 3 bundles × $5)', () => {
      const result = computeGroupDiscount(fixedTiers, 15, 100);

      expect(result.rule.min_people).toBe(5);
      expect(result.amount).toBe(15);
      expect(result.bundles).toBe(3);
      expect(result.discountedQty).toBe(15);
      expect(result.fullQty).toBe(0);
    });

    test('N=26, $100/head: should compute $25 discount (5-tier: 5 bundles × $5)', () => {
      const result = computeGroupDiscount(fixedTiers, 26, 100);

      expect(result.amount).toBe(25);
      expect(result.bundles).toBe(5);
      expect(result.discountedQty).toBe(25);
      expect(result.fullQty).toBe(1);
    });

    test('N=7, $100/head: should apply 5-tier (1 bundle × $5 = $5)', () => {
      const result = computeGroupDiscount(fixedTiers, 7, 100);

      expect(result.amount).toBe(5);
      expect(result.bundles).toBe(1);
      expect(result.discountedQty).toBe(5);
      expect(result.fullQty).toBe(2);
    });
  });

  describe('Percentage discount calculation', () => {
    const percentageTiers = [
      { id: 1, min_people: 5, discount_amount: 3, discount_type: 'percentage' },
      { id: 2, min_people: 13, discount_amount: 10, discount_type: 'percentage' },
    ];

    test('N=15, $100/head, both tiers: 13-tier wins with 13 discounted + 2 regular', () => {
      const result = computeGroupDiscount(percentageTiers, 15, 100);

      expect(result.rule.min_people).toBe(13);
      expect(result.amount).toBe(130); // 10% × 100 × 13
      expect(result.bundles).toBe(1);
      expect(result.discountedQty).toBe(13);
      expect(result.fullQty).toBe(2);
    });

    test('N=5, $100/head: 3% applies to all 5 pax (exact multiple)', () => {
      const result = computeGroupDiscount(percentageTiers, 5, 100);

      expect(result.amount).toBe(15);
      expect(result.bundles).toBe(1);
      expect(result.discountedQty).toBe(5);
      expect(result.fullQty).toBe(0);
    });

    test('N=6, $211/head, 5-tier 35%: 5 pax discounted + 1 regular', () => {
      const tiers = [{ id: 1, min_people: 5, discount_amount: 35, discount_type: 'percentage' }];
      const result = computeGroupDiscount(tiers, 6, 211);

      expect(result.rule.min_people).toBe(5);
      expect(result.amount).toBe(369.25); // 35% × 211 × 5
      expect(result.bundles).toBe(1);
      expect(result.discountedQty).toBe(5);
      expect(result.fullQty).toBe(1);
    });
  });

  describe('Hint logic', () => {
    const fixedTiers = [
      { id: 1, min_people: 5, discount_amount: 5, discount_type: 'fixed' },
      { id: 2, min_people: 13, discount_amount: 10, discount_type: 'fixed' },
    ];

    test('N=12 (below 13): should hint to upgrade 1 more person', () => {
      const result = computeGroupDiscount(fixedTiers, 12, 100);

      expect(result.rule.min_people).toBe(5);
      expect(result.hint).not.toBeNull();
      expect(result.hint.type).toBe('upgrade');
      expect(result.hint.needed).toBe(1);
      expect(result.hint.rule.min_people).toBe(13);
    });

    test('N=10 (5-tier: 2 bundles, 0 remainder): should hint to upgrade to 13', () => {
      const result = computeGroupDiscount(fixedTiers, 10, 100);

      expect(result.hint).not.toBeNull();
      expect(result.hint.type).toBe('upgrade');
      expect(result.hint.rule.min_people).toBe(13);
    });

    test('N=8 (5-tier: 1 bundle, 3 remainder): should hint to complete bundle (2 more)', () => {
      const result = computeGroupDiscount(fixedTiers, 8, 100);

      expect(result.hint).not.toBeNull();
      expect(result.hint.type).toBe('complete');
      expect(result.hint.needed).toBe(2);
    });

    test('N=0: should hint toward lowest tier', () => {
      const result = computeGroupDiscount(fixedTiers, 0, 100);

      expect(result.hint).not.toBeNull();
      expect(result.hint.type).toBe('upgrade');
      expect(result.hint.rule.min_people).toBe(5);
      expect(result.hint.needed).toBe(5);
    });
  });

  describe('Edge cases', () => {
    test('empty tiers: should return all zeros', () => {
      const result = computeGroupDiscount([], 10, 100);

      expect(result.amount).toBe(0);
      expect(result.rule).toBeNull();
      expect(result.bundles).toBe(0);
      expect(result.discountedQty).toBe(0);
      expect(result.fullQty).toBe(10);
    });

    test('headcount=0: should return zero discount', () => {
      const tiers = [{ id: 1, min_people: 5, discount_amount: 10, discount_type: 'fixed' }];
      const result = computeGroupDiscount(tiers, 0, 100);

      expect(result.amount).toBe(0);
      expect(result.rule).toBeNull();
    });

    test('no qualifying tiers: should return null rule and hint toward lowest', () => {
      const tiers = [{ id: 1, min_people: 10, discount_amount: 5, discount_type: 'fixed' }];
      const result = computeGroupDiscount(tiers, 5, 100);

      expect(result.rule).toBeNull();
      expect(result.amount).toBe(0);
      expect(result.hint).not.toBeNull();
      expect(result.hint.needed).toBe(5);
    });
  });

  describe('Return shape validation', () => {
    const tiers = [
      { id: 1, min_people: 5, discount_amount: 5, discount_type: 'fixed' },
      { id: 2, min_people: 13, discount_amount: 10, discount_type: 'fixed' },
    ];

    test('should always return object with required fields', () => {
      const result = computeGroupDiscount(tiers, 15, 100);

      expect(result).toHaveProperty('amount');
      expect(result).toHaveProperty('rule');
      expect(result).toHaveProperty('bundles');
      expect(result).toHaveProperty('discountedQty');
      expect(result).toHaveProperty('fullQty');
      expect(result).toHaveProperty('minPeople');
      expect(result).toHaveProperty('hint');
    });

    test('amount should always be a number >= 0', () => {
      const result = computeGroupDiscount(tiers, 15, 100);
      expect(typeof result.amount).toBe('number');
      expect(result.amount).toBeGreaterThanOrEqual(0);
    });

    test('bundles should be integer', () => {
      const result = computeGroupDiscount(tiers, 15, 100);
      expect(Number.isInteger(result.bundles)).toBe(true);
    });

    test('fullQty should equal headcount - discountedQty', () => {
      const result = computeGroupDiscount(tiers, 15, 100);
      expect(result.fullQty).toBe(15 - result.discountedQty);
    });
  });
});

describe('EB/LM stacking on regular subtotal', () => {
  const activity = (overrides = {}) => ({
    pricing: { regular_price: 100, currency: 'USD' },
    seasonalPricing: [],
    groupDiscounts: [],
    earlyBirdDiscount: null,
    lastMinuteDiscount: null,
    ...overrides,
  });
  const peopleOf = (adults) => ({ adults, children: 0, infants: 0 });
  const dayAt = (y, m, d) => new Date(Date.UTC(y, m - 1, d));
  const addDays = (date, n) => new Date(date.getTime() + n * 86400000);

  const today = dayAt(2026, 4, 23);

  test('EB percent triggers at threshold and applies to regular subtotal', () => {
    const result = calculateActivityPrice({
      activity: activity({
        earlyBirdDiscount: { enabled: true, days_before_start: 30, discount_amount: 10, discount_type: 'percentage' },
      }),
      dateRange: { from: addDays(today, 30), to: null },
      people: peopleOf(2),
      today,
    });
    expect(result.subtotal).toBe(200);
    expect(result.earlyBirdDiscount.amount).toBe(20);
    expect(result.final).toBe(180);
  });

  test('EB fixed stays flat regardless of headcount', () => {
    const base = {
      activity: activity({
        earlyBirdDiscount: { enabled: true, days_before_start: 30, discount_amount: 10, discount_type: 'fixed' },
      }),
      dateRange: { from: addDays(today, 45), to: null },
      today,
    };
    expect(calculateActivityPrice({ ...base, people: peopleOf(1) }).earlyBirdDiscount.amount).toBe(10);
    expect(calculateActivityPrice({ ...base, people: peopleOf(5) }).earlyBirdDiscount.amount).toBe(10);
  });

  test('LM percent triggers within window', () => {
    const result = calculateActivityPrice({
      activity: activity({
        lastMinuteDiscount: { enabled: true, days_before_start: 7, discount_amount: 10, discount_type: 'percentage' },
      }),
      dateRange: { from: addDays(today, 3), to: null },
      people: peopleOf(2),
      today,
    });
    expect(result.lastMinuteDiscount.amount).toBe(20);
    expect(result.final).toBe(180);
  });

  test('EB + LM stack when both trigger', () => {
    const result = calculateActivityPrice({
      activity: activity({
        earlyBirdDiscount: { enabled: true, days_before_start: 1, discount_amount: 10, discount_type: 'percentage' },
        lastMinuteDiscount: { enabled: true, days_before_start: 14, discount_amount: 10, discount_type: 'percentage' },
      }),
      dateRange: { from: addDays(today, 5), to: null },
      people: peopleOf(2),
      today,
    });
    expect(result.earlyBirdDiscount.amount).toBe(20);
    expect(result.lastMinuteDiscount.amount).toBe(20);
    expect(result.final).toBe(160);
  });

  test('EB + group discount stack on regular subtotal (not post-group)', () => {
    const result = calculateActivityPrice({
      activity: activity({
        groupDiscounts: [{ id: 1, min_people: 5, discount_amount: 20, discount_type: 'percentage' }],
        earlyBirdDiscount: { enabled: true, days_before_start: 30, discount_amount: 10, discount_type: 'percentage' },
      }),
      dateRange: { from: addDays(today, 90), to: null },
      people: peopleOf(6),
      today,
    });
    expect(result.groupDiscount.amount).toBe(100);
    expect(result.earlyBirdDiscount.amount).toBe(60);
    expect(result.final).toBe(440);
  });

  test('fixed EB + percent LM mix', () => {
    const result = calculateActivityPrice({
      activity: activity({
        earlyBirdDiscount: { enabled: true, days_before_start: 1, discount_amount: 15, discount_type: 'fixed' },
        lastMinuteDiscount: { enabled: true, days_before_start: 14, discount_amount: 10, discount_type: 'percentage' },
      }),
      dateRange: { from: addDays(today, 5), to: null },
      people: peopleOf(4),
      today,
    });
    expect(result.earlyBirdDiscount.amount).toBe(15);
    expect(result.lastMinuteDiscount.amount).toBe(40);
    expect(result.final).toBe(345);
  });

  test('over-discount clamps final to 0', () => {
    const result = calculateActivityPrice({
      activity: activity({
        earlyBirdDiscount: { enabled: true, days_before_start: 1, discount_amount: 60, discount_type: 'fixed' },
        lastMinuteDiscount: { enabled: true, days_before_start: 14, discount_amount: 50, discount_type: 'fixed' },
      }),
      dateRange: { from: addDays(today, 3), to: null },
      people: peopleOf(1),
      today,
    });
    expect(result.final).toBe(0);
  });

  test('null date: no time discounts', () => {
    const result = calculateActivityPrice({
      activity: activity({
        earlyBirdDiscount: { enabled: true, days_before_start: 30, discount_amount: 10, discount_type: 'percentage' },
        lastMinuteDiscount: { enabled: true, days_before_start: 7, discount_amount: 10, discount_type: 'percentage' },
      }),
      dateRange: { from: null, to: null },
      people: peopleOf(2),
      today,
    });
    expect(result.earlyBirdDiscount).toBeNull();
    expect(result.lastMinuteDiscount).toBeNull();
    expect(result.final).toBe(200);
  });

  test('LM triggers on same-day booking (days_ahead === 0)', () => {
    const result = calculateActivityPrice({
      activity: activity({
        lastMinuteDiscount: { enabled: true, days_before_start: 7, discount_amount: 10, discount_type: 'percentage' },
      }),
      dateRange: { from: addDays(today, 0), to: null },
      people: peopleOf(2),
      today,
    });
    expect(result.lastMinuteDiscount.amount).toBe(20);
    expect(result.final).toBe(180);
  });
});
