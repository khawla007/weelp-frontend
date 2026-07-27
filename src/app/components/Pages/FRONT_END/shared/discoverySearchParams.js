const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const DEFAULT_DISCOVERY_GUESTS = Object.freeze({
  adults: 1,
  children: 0,
  infants: 0,
});

export const EMPTY_DISCOVERY_DATE_RANGE = Object.freeze({
  from: null,
  to: null,
});

function parseLocalDate(value) {
  const match = ISO_DATE_PATTERN.exec(value || '');
  if (!match) return null;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

export function formatDiscoveryDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeGuestCount(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

export function parseDiscoverySearchParams(input) {
  const params = input instanceof URLSearchParams ? input : new URLSearchParams(input || '');
  const location = (params.get('location') || '').trim().toLowerCase();
  const from = parseLocalDate(params.get('start_date'));
  const to = parseLocalDate(params.get('end_date'));
  const hasValidRange = from && to && from.getTime() <= to.getTime();
  const quantityValue = Number(params.get('quantity'));
  const quantity = Number.isInteger(quantityValue) && quantityValue > 0 ? quantityValue : 1;

  return {
    location,
    dateRange: hasValidRange ? { from, to } : { ...EMPTY_DISCOVERY_DATE_RANGE },
    guests: { adults: quantity, children: 0, infants: 0 },
  };
}

export function buildDiscoverySearchUrl({ location, dateRange, guests }) {
  const params = new URLSearchParams();
  const normalizedLocation = typeof location === 'string' ? location.trim().toLowerCase() : '';
  const from = formatDiscoveryDate(dateRange?.from);
  const to = formatDiscoveryDate(dateRange?.to);

  if (normalizedLocation) params.set('location', normalizedLocation);
  if (from && to && dateRange.from.getTime() <= dateRange.to.getTime()) {
    params.set('start_date', from);
    params.set('end_date', to);
  }

  const total = ['adults', 'children', 'infants'].reduce((sum, key) => sum + normalizeGuestCount(guests?.[key]), 0);
  params.set('quantity', String(Math.max(1, total)));

  return `/search?${params.toString()}`;
}
