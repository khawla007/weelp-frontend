import {
  calculateActivityPrice,
  pickGroupDiscount,
  computeGroupDiscount,
  matchSeason,
  applyDiscount,
} from './calculateActivityPrice';

describe('calculateActivityPrice helpers', () => {
  describe('pickGroupDiscount', () => {
    it('returns null for empty discounts array', () => {
      expect(pickGroupDiscount([], 4)).toBeNull();
    });

    it('returns null for null discounts', () => {
      expect(pickGroupDiscount(null, 4)).toBeNull();
    });

    it('returns null if headcount is 0', () => {
      const discounts = [{ min_people: 4, discount_amount: '10', discount_type: 'percentage' }];
      expect(pickGroupDiscount(discounts, 0)).toBeNull();
    });

    it('returns null if no discounts qualify', () => {
      const discounts = [
        { min_people: 10, discount_amount: '10', discount_type: 'percentage' },
      ];
      expect(pickGroupDiscount(discounts, 4)).toBeNull();
    });

    it('picks the discount with highest min_people threshold', () => {
      const discounts = [
        { min_people: 4, discount_amount: '5', discount_type: 'percentage' },
        { min_people: 10, discount_amount: '15', discount_type: 'percentage' },
        { min_people: 6, discount_amount: '10', discount_type: 'percentage' },
      ];
      const result = pickGroupDiscount(discounts, 12);
      expect(result.min_people).toBe(10);
      expect(result.discount_amount).toBe('15');
    });

    it('handles string min_people by coercing to number', () => {
      const discounts = [
        { min_people: '4', discount_amount: '10', discount_type: 'percentage' },
      ];
      const result = pickGroupDiscount(discounts, 5);
      expect(result).not.toBeNull();
    });
  });

  describe('matchSeason', () => {
    it('returns null if fromDate is null', () => {
      const seasons = [
        {
          enable_seasonal_pricing: true,
          season_start: '2025-06-01',
          season_end: '2025-08-31',
          season_price: '149.99',
        },
      ];
      expect(matchSeason(seasons, null)).toBeNull();
    });

    it('returns null if seasonalPricing is empty', () => {
      expect(matchSeason([], new Date('2025-07-15'))).toBeNull();
    });

    it('returns null if no seasons are enabled', () => {
      const seasons = [
        {
          enable_seasonal_pricing: false,
          season_start: '2025-06-01',
          season_end: '2025-08-31',
          season_price: '149.99',
        },
      ];
      expect(matchSeason(seasons, new Date('2025-07-15'))).toBeNull();
    });

    it('returns matching season within date range', () => {
      const seasons = [
        {
          enable_seasonal_pricing: true,
          season_start: '2025-06-01',
          season_end: '2025-08-31',
          season_price: '149.99',
        },
      ];
      const result = matchSeason(seasons, new Date('2025-07-15'));
      expect(result).not.toBeNull();
      expect(result.season_price).toBe('149.99');
    });

    it('returns null if date is before season start', () => {
      const seasons = [
        {
          enable_seasonal_pricing: true,
          season_start: '2025-06-01',
          season_end: '2025-08-31',
          season_price: '149.99',
        },
      ];
      expect(matchSeason(seasons, new Date('2025-05-15'))).toBeNull();
    });

    it('returns null if date is after season end', () => {
      const seasons = [
        {
          enable_seasonal_pricing: true,
          season_start: '2025-06-01',
          season_end: '2025-08-31',
          season_price: '149.99',
        },
      ];
      expect(matchSeason(seasons, new Date('2025-09-15'))).toBeNull();
    });

    it('includes boundary dates (start and end)', () => {
      const seasons = [
        {
          enable_seasonal_pricing: true,
          season_start: '2025-06-01',
          season_end: '2025-08-31',
          season_price: '149.99',
        },
      ];
      expect(matchSeason(seasons, new Date('2025-06-01'))).not.toBeNull();
      expect(matchSeason(seasons, new Date('2025-08-31'))).not.toBeNull();
    });

    it('returns first matching season when multiple exist', () => {
      const seasons = [
        {
          enable_seasonal_pricing: true,
          season_start: '2025-06-01',
          season_end: '2025-08-31',
          season_price: '149.99',
        },
        {
          enable_seasonal_pricing: true,
          season_start: '2025-06-15',
          season_end: '2025-07-15',
          season_price: '159.99',
        },
      ];
      const result = matchSeason(seasons, new Date('2025-07-01'));
      expect(result.season_price).toBe('149.99');
    });
  });

  describe('applyDiscount', () => {
    it('returns amount unchanged if discount is null', () => {
      expect(applyDiscount(100, null, 2)).toBe(100);
    });

    it('applies percentage discount correctly', () => {
      const discount = { discount_type: 'percentage', discount_amount: '10' };
      expect(applyDiscount(100, discount, 2)).toBe(90);
    });

    it('applies percentage discount with string coercion', () => {
      const discount = { discount_type: 'percentage', discount_amount: '25' };
      expect(applyDiscount(100, discount, 1)).toBe(75);
    });

    it('applies fixed discount correctly', () => {
      const discount = { discount_type: 'fixed', discount_amount: '5' };
      expect(applyDiscount(100, discount, 2)).toBe(90);
    });

    it('clamps result to 0 for percentage discount', () => {
      const discount = { discount_type: 'percentage', discount_amount: '150' };
      expect(applyDiscount(100, discount, 2)).toBe(0);
    });

    it('clamps result to 0 for fixed discount', () => {
      const discount = { discount_type: 'fixed', discount_amount: '100' };
      expect(applyDiscount(50, discount, 2)).toBe(0);
    });
  });
});

describe('calculateActivityPrice', () => {
  const baseActivity = {
    pricing: { regular_price: '100', currency: 'USD' },
    seasonalPricing: [],
    groupDiscounts: [],
    earlyBirdDiscount: null,
    lastMinuteDiscount: null,
  };

  describe('basic pricing without discounts', () => {
    it('calculates price for adults only', () => {
      const result = calculateActivityPrice({
        activity: baseActivity,
        dateRange: { from: null, to: null },
        people: { adults: 2, children: 0, infants: 0 },
      });

      expect(result.headcount).toBe(2);
      expect(result.pricePerHead).toBe(100);
      expect(result.subtotal).toBe(200);
      expect(result.groupDiscount).toBeNull();
      expect(result.timeDiscount).toBeNull();
      expect(result.addonsTotal).toBe(0);
      expect(result.final).toBe(200);
      expect(result.currency).toBe('USD');
    });

    it('includes children in headcount but excludes infants', () => {
      const result = calculateActivityPrice({
        activity: baseActivity,
        dateRange: { from: null, to: null },
        people: { adults: 2, children: 1, infants: 2 },
      });

      expect(result.headcount).toBe(3); // 2 adults + 1 child, infants not counted
      expect(result.subtotal).toBe(300);
    });

    it('handles null pricing gracefully', () => {
      const activityNoPrice = {
        ...baseActivity,
        pricing: null,
      };

      const result = calculateActivityPrice({
        activity: activityNoPrice,
        dateRange: { from: null, to: null },
        people: { adults: 2, children: 0, infants: 0 },
      });

      expect(result.pricePerHead).toBe(0);
      expect(result.subtotal).toBe(0);
      expect(result.final).toBe(0);
    });

    it('coerces string prices to numbers', () => {
      const result = calculateActivityPrice({
        activity: {
          ...baseActivity,
          pricing: { regular_price: '99.99', currency: 'USD' },
        },
        dateRange: { from: null, to: null },
        people: { adults: 1, children: 0, infants: 0 },
      });

      expect(result.pricePerHead).toBe(99.99);
      expect(result.final).toBe(99.99);
    });
  });

  describe('seasonal pricing', () => {
    it('applies seasonal price when date falls in season', () => {
      const activity = {
        ...baseActivity,
        seasonalPricing: [
          {
            enable_seasonal_pricing: true,
            season_start: '2025-06-01',
            season_end: '2025-08-31',
            season_price: '150',
          },
        ],
      };

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: new Date('2025-07-15'), to: null },
        people: { adults: 1, children: 0, infants: 0 },
      });

      expect(result.pricePerHead).toBe(150);
      expect(result.final).toBe(150);
    });

    it('falls back to regular price if date is outside season', () => {
      const activity = {
        ...baseActivity,
        seasonalPricing: [
          {
            enable_seasonal_pricing: true,
            season_start: '2025-06-01',
            season_end: '2025-08-31',
            season_price: '150',
          },
        ],
      };

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: new Date('2025-05-01'), to: null },
        people: { adults: 1, children: 0, infants: 0 },
      });

      expect(result.pricePerHead).toBe(100);
      expect(result.final).toBe(100);
    });

    it('ignores disabled seasonal pricing', () => {
      const activity = {
        ...baseActivity,
        seasonalPricing: [
          {
            enable_seasonal_pricing: false,
            season_start: '2025-06-01',
            season_end: '2025-08-31',
            season_price: '150',
          },
        ],
      };

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: new Date('2025-07-15'), to: null },
        people: { adults: 1, children: 0, infants: 0 },
      });

      expect(result.pricePerHead).toBe(100);
    });
  });

  describe('group discounts', () => {
    it('applies group percentage discount at min_people threshold', () => {
      const activity = {
        ...baseActivity,
        groupDiscounts: [
          {
            min_people: 4,
            discount_amount: '20',
            discount_type: 'percentage',
          },
        ],
      };

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: null, to: null },
        people: { adults: 4, children: 0, infants: 0 },
      });

      expect(result.headcount).toBe(4);
      expect(result.subtotal).toBe(400);
      expect(result.groupDiscount).not.toBeNull();
      expect(result.groupDiscount.amount).toBe(80); // 20% of 400
      expect(result.final).toBe(320);
    });

    it('does not apply group discount below threshold', () => {
      const activity = {
        ...baseActivity,
        groupDiscounts: [
          {
            min_people: 4,
            discount_amount: '20',
            discount_type: 'percentage',
          },
        ],
      };

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: null, to: null },
        people: { adults: 3, children: 0, infants: 0 },
      });

      expect(result.groupDiscount).toBeNull();
      expect(result.final).toBe(300);
    });

    it('applies group fixed discount correctly (flat per bundle)', () => {
      const activity = {
        ...baseActivity,
        groupDiscounts: [
          {
            min_people: 2,
            discount_amount: '10',
            discount_type: 'fixed',
          },
        ],
      };

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: null, to: null },
        people: { adults: 2, children: 0, infants: 0 },
      });

      expect(result.subtotal).toBe(200);
      // For 2 people with min_people=2: bundles=1, amount=$10 (flat per bundle, not per-head)
      expect(result.groupDiscount.amount).toBe(10);
      expect(result.groupDiscount.bundles).toBe(1);
      expect(result.final).toBe(190);
    });

    it('picks highest threshold discount when multiple qualify', () => {
      const activity = {
        ...baseActivity,
        groupDiscounts: [
          {
            min_people: 4,
            discount_amount: '10',
            discount_type: 'percentage',
          },
          {
            min_people: 10,
            discount_amount: '25',
            discount_type: 'percentage',
          },
        ],
      };

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: null, to: null },
        people: { adults: 12, children: 0, infants: 0 },
      });

      // Should apply 25% discount (min_people: 10), not 10% (min_people: 4)
      // Bundles = floor(12/10) = 1, discountedQty = 10, amount = 100 * 10 * 0.25 = 250
      expect(result.groupDiscount.rule.discount_amount).toBe(25);
      expect(result.groupDiscount.amount).toBe(250); // 25% of (10 * 100)
      expect(result.final).toBe(950);
    });
  });

  describe('computeGroupDiscount bundles', () => {
    // Dubai Marina seeds: T1={min:5, 35%, percentage}, T2={min:13, $10, fixed}
    // Seasonal price: $133/head
    const tiers = [
      { min_people: 5, discount_amount: 35, discount_type: 'percentage' },
      { min_people: 13, discount_amount: 10, discount_type: 'fixed' },
    ];
    const pricePerHead = 133;

    it('headcount 0: no active tier, upgrade hint to tier 1', () => {
      const result = computeGroupDiscount(tiers, 0, pricePerHead);
      expect(result.amount).toBe(0);
      expect(result.bundles).toBe(0);
      expect(result.rule).toBeNull();
      expect(result.hint).not.toBeNull();
      expect(result.hint.needed).toBe(5);
      expect(result.hint.type).toBe('upgrade');
    });

    it('headcount 4: below lowest, upgrade hint to tier 1 (needed 1)', () => {
      const result = computeGroupDiscount(tiers, 4, pricePerHead);
      expect(result.amount).toBe(0);
      expect(result.bundles).toBe(0);
      expect(result.rule).toBeNull();
      expect(result.hint).not.toBeNull();
      expect(result.hint.needed).toBe(1);
      expect(result.hint.type).toBe('upgrade');
    });

    it('headcount 5: bundles 1, amount 232.75 (35% of 5*133), upgrade hint', () => {
      const result = computeGroupDiscount(tiers, 5, pricePerHead);
      expect(result.bundles).toBe(1);
      expect(result.discountedQty).toBe(5);
      expect(result.fullQty).toBe(0);
      expect(result.minPeople).toBe(5);
      // 35% of (5 * 133) = 0.35 * 665 = 232.75
      expect(result.amount).toBeCloseTo(232.75);
      expect(result.hint).not.toBeNull();
      expect(result.hint.type).toBe('upgrade');
      expect(result.hint.needed).toBe(8); // 13 - 5
    });

    it('headcount 6: bundles 1, fullQty 1, amount 232.75, complete hint', () => {
      const result = computeGroupDiscount(tiers, 6, pricePerHead);
      expect(result.bundles).toBe(1);
      expect(result.discountedQty).toBe(5);
      expect(result.fullQty).toBe(1);
      expect(result.amount).toBeCloseTo(232.75);
      expect(result.hint).not.toBeNull();
      expect(result.hint.type).toBe('complete');
      expect(result.hint.needed).toBe(4); // 5 - (6 % 5)
    });

    it('headcount 9: bundles 1, fullQty 4, amount 232.75, complete hint (needed 1)', () => {
      const result = computeGroupDiscount(tiers, 9, pricePerHead);
      expect(result.bundles).toBe(1);
      expect(result.discountedQty).toBe(5);
      expect(result.fullQty).toBe(4);
      expect(result.amount).toBeCloseTo(232.75);
      expect(result.hint).not.toBeNull();
      expect(result.hint.type).toBe('complete');
      expect(result.hint.needed).toBe(1); // 5 - (9 % 5)
    });

    it('headcount 10: bundles 2, fullQty 0, amount 465.50, upgrade hint (bundleNeeds=0)', () => {
      const result = computeGroupDiscount(tiers, 10, pricePerHead);
      expect(result.bundles).toBe(2);
      expect(result.discountedQty).toBe(10);
      expect(result.fullQty).toBe(0);
      // 35% of (10 * 133) = 0.35 * 1330 = 465.50
      expect(result.amount).toBeCloseTo(465.50);
      expect(result.hint).not.toBeNull();
      expect(result.hint.type).toBe('upgrade');
      expect(result.hint.needed).toBe(3); // 13 - 10
    });

    it('headcount 12: bundles 2, fullQty 2, amount 465.50, upgrade hint (tierNeeds 1 <= bundleNeeds 3)', () => {
      const result = computeGroupDiscount(tiers, 12, pricePerHead);
      expect(result.bundles).toBe(2);
      expect(result.discountedQty).toBe(10);
      expect(result.fullQty).toBe(2);
      expect(result.amount).toBeCloseTo(465.50);
      expect(result.hint).not.toBeNull();
      expect(result.hint.type).toBe('upgrade');
      expect(result.hint.needed).toBe(1); // 13 - 12
    });

    it('headcount 13: active tier 2, bundles 1, amount 10 (fixed), no hint', () => {
      const result = computeGroupDiscount(tiers, 13, pricePerHead);
      expect(result.minPeople).toBe(13);
      expect(result.bundles).toBe(1);
      expect(result.discountedQty).toBe(13);
      expect(result.fullQty).toBe(0);
      // Fixed: 10 * 1 bundle
      expect(result.amount).toBe(10);
      expect(result.hint).toBeNull();
    });

    it('headcount 14: active tier 2, bundles 1, fullQty 1, amount 10, complete hint', () => {
      const result = computeGroupDiscount(tiers, 14, pricePerHead);
      expect(result.bundles).toBe(1);
      expect(result.discountedQty).toBe(13);
      expect(result.fullQty).toBe(1);
      expect(result.amount).toBe(10);
      expect(result.hint).not.toBeNull();
      expect(result.hint.type).toBe('complete');
      expect(result.hint.needed).toBe(12); // 13 - (14 % 13)
    });

    it('headcount 26: active tier 2, bundles 2, amount 20 (fixed), no hint', () => {
      const result = computeGroupDiscount(tiers, 26, pricePerHead);
      expect(result.bundles).toBe(2);
      expect(result.discountedQty).toBe(26);
      expect(result.fullQty).toBe(0);
      // Fixed: 10 * 2 bundles
      expect(result.amount).toBe(20);
      expect(result.hint).toBeNull();
    });

    it('fixed discount clamp: amount clamped to subtotal on calculateActivityPrice', () => {
      const activity = {
        ...baseActivity,
        groupDiscounts: [
          {
            min_people: 1,
            discount_amount: '100',
            discount_type: 'fixed',
          },
        ],
      };

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: null, to: null },
        people: { adults: 1, children: 0, infants: 0 },
      });

      // Subtotal = 100, discount = 100 * 1 bundle = 100, clamped to 100
      expect(result.subtotal).toBe(100);
      expect(result.groupDiscount.amount).toBe(100); // Clamped to subtotal
      expect(result.final).toBe(0);
    });
  });

  describe('early bird discount', () => {
    const today = new Date('2025-06-01');

    it('applies early bird when daysUntil >= days_before_start', () => {
      const activity = {
        ...baseActivity,
        earlyBirdDiscount: {
          enabled: true,
          days_before_start: 30,
          discount_amount: '15',
          discount_type: 'percentage',
        },
      };

      // 31 days in the future
      const bookingDate = new Date('2025-07-02');

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: bookingDate, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        today,
      });

      expect(result.timeDiscount).not.toBeNull();
      expect(result.timeDiscount.type).toBe('early_bird');
      expect(result.timeDiscount.amount).toBe(15); // 15% of 100
      expect(result.final).toBe(85);
    });

    it('does not apply early bird when daysUntil < days_before_start', () => {
      const activity = {
        ...baseActivity,
        earlyBirdDiscount: {
          enabled: true,
          days_before_start: 30,
          discount_amount: '15',
          discount_type: 'percentage',
        },
      };

      // 15 days in the future (less than 30)
      const bookingDate = new Date('2025-06-16');

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: bookingDate, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        today,
      });

      expect(result.timeDiscount).toBeNull();
      expect(result.final).toBe(100);
    });

    it('does not apply early bird if disabled', () => {
      const activity = {
        ...baseActivity,
        earlyBirdDiscount: {
          enabled: false,
          days_before_start: 30,
          discount_amount: '15',
          discount_type: 'percentage',
        },
      };

      const bookingDate = new Date('2025-07-02');

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: bookingDate, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        today,
      });

      expect(result.timeDiscount).toBeNull();
      expect(result.final).toBe(100);
    });
  });

  describe('last minute discount', () => {
    const today = new Date('2025-06-01');

    it('applies last minute when daysUntil <= days_before_start and >= 0', () => {
      const activity = {
        ...baseActivity,
        lastMinuteDiscount: {
          enabled: true,
          days_before_start: 3,
          discount_amount: '25',
          discount_type: 'percentage',
        },
      };

      // 2 days in the future
      const bookingDate = new Date('2025-06-03');

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: bookingDate, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        today,
      });

      expect(result.timeDiscount).not.toBeNull();
      expect(result.timeDiscount.type).toBe('last_minute');
      expect(result.timeDiscount.amount).toBe(25); // 25% of 100
      expect(result.final).toBe(75);
    });

    it('does not apply last minute if daysUntil > days_before_start', () => {
      const activity = {
        ...baseActivity,
        lastMinuteDiscount: {
          enabled: true,
          days_before_start: 3,
          discount_amount: '25',
          discount_type: 'percentage',
        },
      };

      // 5 days in the future (more than 3)
      const bookingDate = new Date('2025-06-06');

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: bookingDate, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        today,
      });

      expect(result.timeDiscount).toBeNull();
      expect(result.final).toBe(100);
    });

    it('does not apply last minute if daysUntil < 0 (past date)', () => {
      const activity = {
        ...baseActivity,
        lastMinuteDiscount: {
          enabled: true,
          days_before_start: 3,
          discount_amount: '25',
          discount_type: 'percentage',
        },
      };

      // 1 day in the past
      const bookingDate = new Date('2025-05-31');

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: bookingDate, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        today,
      });

      expect(result.timeDiscount).toBeNull();
      expect(result.final).toBe(100);
    });

    it('does not apply last minute if disabled', () => {
      const activity = {
        ...baseActivity,
        lastMinuteDiscount: {
          enabled: false,
          days_before_start: 3,
          discount_amount: '25',
          discount_type: 'percentage',
        },
      };

      const bookingDate = new Date('2025-06-03');

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: bookingDate, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        today,
      });

      expect(result.timeDiscount).toBeNull();
      expect(result.final).toBe(100);
    });
  });

  describe('early bird vs last minute precedence', () => {
    const today = new Date('2025-06-01');

    it('prefers early bird when both qualify', () => {
      const activity = {
        ...baseActivity,
        earlyBirdDiscount: {
          enabled: true,
          days_before_start: 5,
          discount_amount: '10',
          discount_type: 'percentage',
        },
        lastMinuteDiscount: {
          enabled: true,
          days_before_start: 30,
          discount_amount: '20',
          discount_type: 'percentage',
        },
      };

      // 10 days in the future (qualifies for both EB and LM)
      const bookingDate = new Date('2025-06-11');

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: bookingDate, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        today,
      });

      // Early bird should win (10% discount)
      expect(result.timeDiscount.type).toBe('early_bird');
      expect(result.final).toBe(90);
    });
  });

  describe('addons', () => {
    it('adds selected addons to final price', () => {
      const result = calculateActivityPrice({
        activity: baseActivity,
        dateRange: { from: null, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        selectedAddons: [
          { addon_price: '20', addon_sale_price: '15' },
          { addon_price: '10', addon_sale_price: '8' },
        ],
      });

      expect(result.addonsTotal).toBe(23); // 15 + 8
      expect(result.final).toBe(123); // 100 + 23
    });

    it('uses addon_sale_price if available, fallback to addon_price', () => {
      const result = calculateActivityPrice({
        activity: baseActivity,
        dateRange: { from: null, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        selectedAddons: [
          { addon_price: '20', addon_sale_price: '15' }, // Uses sale_price
          { addon_price: '10' }, // Uses price (no sale_price)
        ],
      });

      expect(result.addonsTotal).toBe(25); // 15 + 10
      expect(result.final).toBe(125);
    });

    it('coerces addon prices to numbers', () => {
      const result = calculateActivityPrice({
        activity: baseActivity,
        dateRange: { from: null, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        selectedAddons: [{ addon_price: '29.99', addon_sale_price: '24.99' }],
      });

      expect(result.addonsTotal).toBe(24.99);
      expect(result.final).toBe(124.99);
    });

    it('handles empty addons array', () => {
      const result = calculateActivityPrice({
        activity: baseActivity,
        dateRange: { from: null, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        selectedAddons: [],
      });

      expect(result.addonsTotal).toBe(0);
      expect(result.final).toBe(100);
    });

    it('handles missing selectedAddons parameter', () => {
      const result = calculateActivityPrice({
        activity: baseActivity,
        dateRange: { from: null, to: null },
        people: { adults: 1, children: 0, infants: 0 },
      });

      expect(result.addonsTotal).toBe(0);
      expect(result.final).toBe(100);
    });
  });

  describe('complex scenarios', () => {
    const today = new Date('2025-06-01');

    it('combines seasonal + group + early bird discounts', () => {
      const activity = {
        pricing: { regular_price: '100', currency: 'USD' },
        seasonalPricing: [
          {
            enable_seasonal_pricing: true,
            season_start: '2025-06-01',
            season_end: '2025-08-31',
            season_price: '150',
          },
        ],
        groupDiscounts: [
          {
            min_people: 4,
            discount_amount: '10',
            discount_type: 'percentage',
          },
        ],
        earlyBirdDiscount: {
          enabled: true,
          days_before_start: 30,
          discount_amount: '15',
          discount_type: 'percentage',
        },
        lastMinuteDiscount: null,
      };

      const bookingDate = new Date('2025-07-02'); // 31 days out

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: bookingDate, to: null },
        people: { adults: 4, children: 0, infants: 1 },
        today,
      });

      // Seasonal price: 150 per head
      // Subtotal: 150 * 4 = 600
      // Group 10% off: 600 * 0.9 = 540
      // Early bird 15% off: 540 * 0.85 = 459
      expect(result.pricePerHead).toBe(150);
      expect(result.headcount).toBe(4);
      expect(result.subtotal).toBe(600);
      expect(result.groupDiscount).not.toBeNull();
      expect(result.timeDiscount).not.toBeNull();
      expect(result.final).toBe(459);
    });

    it('handles all null/empty discount structures', () => {
      const activity = {
        pricing: { regular_price: '100', currency: 'USD' },
        seasonalPricing: null,
        groupDiscounts: null,
        earlyBirdDiscount: null,
        lastMinuteDiscount: null,
      };

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: null, to: null },
        people: { adults: 2, children: 0, infants: 0 },
      });

      expect(result.final).toBe(200);
      expect(result.groupDiscount).toBeNull();
      expect(result.timeDiscount).toBeNull();
    });

    it('uses default currency USD when not specified', () => {
      const activity = {
        pricing: { regular_price: '100' }, // No currency
      };

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: null, to: null },
        people: { adults: 1, children: 0, infants: 0 },
      });

      expect(result.currency).toBe('USD');
    });
  });

  describe('edge cases', () => {
    it('clamps negative final price to 0', () => {
      const activity = {
        ...baseActivity,
        groupDiscounts: [
          {
            min_people: 1,
            discount_amount: '200',
            discount_type: 'percentage',
          },
        ],
      };

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: null, to: null },
        people: { adults: 1, children: 0, infants: 0 },
      });

      expect(result.final).toBe(0);
    });

    it('handles zero headcount', () => {
      const result = calculateActivityPrice({
        activity: baseActivity,
        dateRange: { from: null, to: null },
        people: { adults: 0, children: 0, infants: 5 },
      });

      expect(result.headcount).toBe(0);
      expect(result.subtotal).toBe(0);
      expect(result.final).toBe(0);
    });

    it('handles undefined people object gracefully', () => {
      const result = calculateActivityPrice({
        activity: baseActivity,
        dateRange: { from: null, to: null },
        people: undefined,
      });

      expect(result.headcount).toBe(0);
      expect(result.final).toBe(0);
    });

    it('calculates correctly with exact boundary times (midnight)', () => {
      const today = new Date('2025-06-01T00:00:00Z');
      const bookingDate = new Date('2025-07-01T00:00:00Z'); // Exactly 30 days

      const activity = {
        ...baseActivity,
        earlyBirdDiscount: {
          enabled: true,
          days_before_start: 30,
          discount_amount: '10',
          discount_type: 'percentage',
        },
      };

      const result = calculateActivityPrice({
        activity,
        dateRange: { from: bookingDate, to: null },
        people: { adults: 1, children: 0, infants: 0 },
        today,
      });

      expect(result.timeDiscount).not.toBeNull();
    });
  });
});
