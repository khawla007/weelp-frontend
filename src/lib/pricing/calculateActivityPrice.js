/**
 * calculateActivityPrice.js
 * Pure utility for computing final booking price for Weelp activities.
 * No React imports, no side effects.
 */

/**
 * Pick the best matching group discount for the given headcount.
 * Implements the backend ActivityDiscountService algorithm: maximise discount_total,
 * with tie-breaks: percentage > fixed, higher discount_amount (%), smaller min_people (fixed), smaller id.
 *
 * @param {Array} groupDiscounts - Array of { min_people, discount_amount, discount_type, id }
 * @param {number} headcount - Adult + children count (excludes infants)
 * @param {number} pricePerHead - Price per person for discount calculation
 * @returns {Object|null} The best tier, or null if none qualify
 */
export function pickGroupDiscount(groupDiscounts, headcount, pricePerHead = 0) {
  if (!groupDiscounts || groupDiscounts.length === 0 || headcount === 0) {
    return null;
  }

  const qualifying = groupDiscounts
    .map((d) => ({
      ...d,
      min_people: Number(d.min_people),
      discount_amount: Number(d.discount_amount),
      id: d.id || 0,
    }))
    .filter((t) => t.min_people <= headcount)
    .map((tier) => ({ ...tier, discountTotal: discountTotalFor(tier, headcount, pricePerHead) }));

  if (qualifying.length === 0) {
    return null;
  }

  qualifying.sort(compareTiers);
  const { discountTotal: _ignored, ...best } = qualifying[0];
  return best;
}

function discountTotalFor(tier, headcount, pricePerHead) {
  const completeGroups = Math.floor(headcount / tier.min_people);
  const discountedPax = completeGroups * tier.min_people;
  if (tier.discount_type === 'percentage') {
    const clamped = Math.min(tier.discount_amount, 100);
    return roundCents((clamped / 100) * pricePerHead * discountedPax);
  }
  return roundCents(tier.discount_amount * completeGroups);
}

function compareTiers(a, b) {
  if (a.discountTotal !== b.discountTotal) {
    return b.discountTotal - a.discountTotal;
  }
  const aPct = a.discount_type === 'percentage';
  const bPct = b.discount_type === 'percentage';
  if (aPct !== bPct) {
    return aPct ? -1 : 1;
  }
  if (aPct) {
    const aAmount = Math.min(a.discount_amount, 100);
    const bAmount = Math.min(b.discount_amount, 100);
    if (aAmount !== bAmount) {
      return bAmount - aAmount;
    }
  }
  if (a.min_people !== b.min_people) {
    return a.min_people - b.min_people;
  }
  return a.id - b.id;
}

function roundCents(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Compute group discount aligned with backend ActivityDiscountService algorithm.
 * Maximises total discount amount and applies correct math for fixed vs percentage.
 *
 * @param {Array} groupDiscounts - Array of { min_people, discount_amount, discount_type, id }
 * @param {number} headcount - Adult + children count (excludes infants)
 * @param {number} pricePerHead - Active price per person (seasonal if matched, else regular)
 * @returns {Object} { amount, rule, bundles, discountedQty, fullQty, minPeople, hint }
 *   - amount: Discount total in currency units (matches backend discount_total)
 *   - rule: The selected tier rule (or null if no tier qualifies)
 *   - bundles: floor(headcount / min_people) for both fixed and percentage
 *   - discountedQty: bundles * min_people (pax inside complete groups)
 *   - fullQty: headcount - discountedQty (leftover pax pay regular price)
 *   - minPeople: Minimum group size for selected tier
 *   - hint: Upgrade/complete hint for sidebar, or null
 */
export function computeGroupDiscount(groupDiscounts, headcount, pricePerHead) {
  // Initialize result
  const result = {
    amount: 0,
    rule: null,
    bundles: 0,
    discountedQty: 0,
    fullQty: headcount,
    minPeople: null,
    hint: null,
  };

  // Early return if no tiers or zero headcount
  if (!groupDiscounts || groupDiscounts.length === 0 || headcount === 0) {
    // Below-lowest-tier special case: hint toward lowest tier
    if (groupDiscounts && groupDiscounts.length > 0) {
      const sorted = groupDiscounts.map((d) => ({ ...d, min_people: Number(d.min_people) })).sort((a, b) => a.min_people - b.min_people);
      const lowestTier = sorted[0];
      result.hint = {
        needed: lowestTier.min_people - headcount,
        type: 'upgrade',
        rule: lowestTier,
      };
    }
    return result;
  }

  // Use pickGroupDiscount to select the best tier (backend-aligned)
  const selectedTier = pickGroupDiscount(groupDiscounts, headcount, pricePerHead);

  if (!selectedTier) {
    // No qualifying tier: hint toward lowest
    const sorted = groupDiscounts.map((d) => ({ ...d, min_people: Number(d.min_people) })).sort((a, b) => a.min_people - b.min_people);
    const lowestTier = sorted[0];
    result.hint = {
      needed: lowestTier.min_people - headcount,
      type: 'upgrade',
      rule: lowestTier,
    };
    return result;
  }

  const minPeople = selectedTier.min_people;
  result.rule = selectedTier;
  result.minPeople = minPeople;

  const bundles = Math.floor(headcount / minPeople);
  const discountedQty = bundles * minPeople;
  result.bundles = bundles;
  result.discountedQty = discountedQty;
  result.fullQty = headcount - discountedQty;

  if (selectedTier.discount_type === 'percentage') {
    const clamped = Math.min(selectedTier.discount_amount, 100);
    result.amount = (clamped / 100) * pricePerHead * discountedQty;
  } else {
    result.amount = selectedTier.discount_amount * bundles;
  }

  // Round to 2 decimals
  result.amount = Math.round(result.amount * 100) / 100;

  // Hint logic
  const sorted = groupDiscounts
    .map((d) => ({
      ...d,
      min_people: Number(d.min_people),
    }))
    .sort((a, b) => a.min_people - b.min_people);

  if (selectedTier.discount_type === 'fixed') {
    // For fixed tiers: hint about completing next bundle or upgrading
    const bundleRemainder = headcount % minPeople;
    const bundleNeeds = bundleRemainder === 0 ? 0 : minPeople - bundleRemainder;
    const nextTier = sorted.find((t) => t.min_people > headcount) || null;
    const tierNeeds = nextTier ? nextTier.min_people - headcount : Infinity;

    if (nextTier && (bundleNeeds === 0 || tierNeeds <= bundleNeeds)) {
      // Upgrade hint
      result.hint = {
        needed: tierNeeds,
        type: 'upgrade',
        rule: nextTier,
      };
    } else if (bundleNeeds > 0) {
      // Complete hint
      result.hint = {
        needed: bundleNeeds,
        type: 'complete',
        rule: selectedTier,
      };
    }
  } else {
    // For percentage tiers: hint about upgrading to next tier
    const nextTier = sorted.find((t) => t.min_people > headcount) || null;
    if (nextTier) {
      result.hint = {
        needed: nextTier.min_people - headcount,
        type: 'upgrade',
        rule: nextTier,
      };
    }
  }

  return result;
}

/**
 * Match a season from seasonalPricing array based on date.
 * Returns the first season where enable_seasonal_pricing is true and
 * season_start <= fromDate <= season_end, or null if no match.
 *
 * @param {Array} seasonalPricing - Array of seasonal pricing rules
 * @param {Date|null} fromDate - Start date of booking
 * @returns {Object|null}
 */
export function matchSeason(seasonalPricing, fromDate) {
  if (!fromDate || !seasonalPricing || seasonalPricing.length === 0) {
    return null;
  }

  for (const season of seasonalPricing) {
    if (!season.enable_seasonal_pricing) {
      continue;
    }

    const start = new Date(season.season_start);
    const end = new Date(season.season_end);

    if (fromDate >= start && fromDate <= end) {
      return season;
    }
  }

  return null;
}

/**
 * Calculate the final booking price for an activity with all discounts applied.
 *
 * @param {Object} params
 * @param {Object} params.activity - Activity object with pricing, seasonalPricing, groupDiscounts, earlyBirdDiscount, lastMinuteDiscount
 * @param {Object} params.dateRange - { from: Date|null, to: Date|null }
 * @param {Object} params.people - { adults: number, children: number, infants: number }
 * @param {Array} params.selectedAddons - Array of { addon_price, addon_sale_price } (optional)
 * @param {Date} params.today - Reference date for time discounts (optional, defaults to new Date())
 *
 * @returns {Object} Pricing breakdown:
 *   {
 *     pricePerHead: number,
 *     headcount: number,
 *     subtotal: number,
 *     season: { name: string, savings: number, regularPrice: number } | null,
 *     groupDiscount: { amount: number, rule: Object, bundles: number, discountedQty: number, fullQty: number, minPeople: number } | null,
 *     groupHint: { needed: number, type: 'upgrade' | 'complete', rule: Object } | null,
 *     earlyBirdDiscount: { amount: number, rule: Object } | null,
 *     lastMinuteDiscount: { amount: number, rule: Object } | null,
 *     combinedDiscount: number,
 *     addonsTotal: number,
 *     final: number,
 *     currency: string
 *   }
 */
export function calculateActivityPrice({ activity, dateRange, people, selectedAddons = [], today = new Date() }) {
  // Defaults
  const defaultCurrency = activity?.pricing?.currency ?? 'USD';
  const headcount = Number(people?.adults ?? 0) + Number(people?.children ?? 0);

  // Step 1: Determine price per head
  const matchedSeason = matchSeason(activity?.seasonalPricing, dateRange?.from);
  const regularPrice = Number(activity?.pricing?.regular_price ?? 0);
  const pricePerHead = Number(matchedSeason?.season_price ?? regularPrice);

  // Step 2: Calculate subtotal
  const subtotal = pricePerHead * headcount;
  const seasonalSavings = matchedSeason ? Math.max(0, (regularPrice - pricePerHead) * headcount) : 0;

  // Step 3: Apply group discount (bundle-based)
  const groupInfo = computeGroupDiscount(activity?.groupDiscounts, headcount, pricePerHead);
  const groupDiscountAmount = Math.max(0, Math.min(groupInfo?.amount ?? 0, subtotal));

  // Step 4: Time discounts — both compute on regular `subtotal` and stack additively
  const ebAmount = computeEarlyBirdDiscount(activity?.earlyBirdDiscount, subtotal, dateRange?.from, today);
  const lmAmount = computeLastMinuteDiscount(activity?.lastMinuteDiscount, subtotal, dateRange?.from, today);

  // Step 5: Combined discount applied once against subtotal, clamp at 0
  const combinedDiscount = roundCents(groupDiscountAmount + ebAmount + lmAmount);
  const afterDiscounts = Math.max(0, roundCents(subtotal - combinedDiscount));

  // Step 6: Add addons
  const addonsTotal = selectedAddons.reduce((sum, addon) => {
    return sum + Number(addon.addon_sale_price ?? addon.addon_price ?? 0);
  }, 0);

  // Step 7: Final price
  const final = Math.max(0, afterDiscounts + addonsTotal);

  return {
    pricePerHead,
    headcount,
    subtotal,
    season: matchedSeason
      ? {
          name: matchedSeason.season_name,
          savings: seasonalSavings,
          regularPrice,
        }
      : null,
    groupDiscount:
      groupDiscountAmount > 0
        ? {
            amount: groupDiscountAmount,
            rule: groupInfo?.rule ?? null,
            bundles: groupInfo?.bundles ?? 0,
            discountedQty: groupInfo?.discountedQty ?? 0,
            fullQty: groupInfo?.fullQty ?? 0,
            minPeople: groupInfo?.minPeople ?? null,
          }
        : null,
    groupHint: groupInfo?.hint ?? null,
    earlyBirdDiscount: ebAmount > 0 ? { amount: ebAmount, rule: activity?.earlyBirdDiscount ?? null } : null,
    lastMinuteDiscount: lmAmount > 0 ? { amount: lmAmount, rule: activity?.lastMinuteDiscount ?? null } : null,
    combinedDiscount,
    addonsTotal,
    final,
    currency: defaultCurrency,
  };
}

function dateKey(d) {
  // Normalise a Date to UTC midnight ms so frontend math matches backend CarbonImmutable::today()/startOfDay().
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function daysAheadOf(fromDate, today) {
  if (!fromDate) return null;
  const ms = dateKey(fromDate) - dateKey(today);
  return Math.floor(ms / 86400000);
}

function timeDiscountAmount(rule, subtotal) {
  const amt = Number(rule.discount_amount);
  if (rule.discount_type === 'percentage') {
    const pct = Math.min(amt, 100);
    return roundCents((pct / 100) * subtotal);
  }
  return roundCents(amt);
}

export function computeEarlyBirdDiscount(rule, subtotal, fromDate, today = new Date()) {
  if (!rule?.enabled) return 0;
  const daysAhead = daysAheadOf(fromDate, today);
  if (daysAhead === null || daysAhead < Number(rule.days_before_start)) return 0;
  return timeDiscountAmount(rule, subtotal);
}

export function computeLastMinuteDiscount(rule, subtotal, fromDate, today = new Date()) {
  if (!rule?.enabled) return 0;
  const daysAhead = daysAheadOf(fromDate, today);
  if (daysAhead === null || daysAhead < 0 || daysAhead > Number(rule.days_before_start)) return 0;
  return timeDiscountAmount(rule, subtotal);
}
