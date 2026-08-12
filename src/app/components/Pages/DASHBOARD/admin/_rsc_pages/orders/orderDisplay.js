import { formatCurrency } from '@/lib/utils';

export const ADMIN_ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];
export const ORDER_VALUE_NOT_PROVIDED = 'Not provided';
export const ORDER_TIME_NOT_AVAILABLE = 'Not available';

export function formatCompactTimeAgo(dateValue, now = Date.now()) {
  if (!dateValue) return ORDER_TIME_NOT_AVAILABLE;
  const timestamp = new Date(dateValue).getTime();
  if (!Number.isFinite(timestamp)) return ORDER_TIME_NOT_AVAILABLE;

  const elapsedSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (elapsedSeconds < 60) return `${elapsedSeconds}s ago`;
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function displayOrderValue(value) {
  return value === undefined || value === null || value === '' ? ORDER_VALUE_NOT_PROVIDED : value;
}

export function formatOrderTravelDate(value) {
  const datePart = typeof value === 'string' ? value.slice(0, 10) : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return ORDER_VALUE_NOT_PROVIDED;
  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return ORDER_VALUE_NOT_PROVIDED;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function pluralizeOrderCount(count, singular, plural) {
  if (count === undefined || count === null || count === '') return ORDER_VALUE_NOT_PROVIDED;
  const value = Number(count);
  return Number.isFinite(value) ? `${value} ${value === 1 ? singular : plural}` : ORDER_VALUE_NOT_PROVIDED;
}

export function getOrderAmountValue(payment) {
  if (!payment) return null;
  const customValue = payment.custom_amount;
  const totalValue = payment.total_amount ?? payment.amount;
  const custom = customValue === undefined || customValue === null || customValue === '' ? Number.NaN : Number(customValue);
  const total = totalValue === undefined || totalValue === null || totalValue === '' ? Number.NaN : Number(totalValue);
  const amount = payment.is_custom_amount && Number.isFinite(custom) && Number.isFinite(total) ? total + custom : total;
  return Number.isFinite(amount) ? amount : null;
}

export function formatOrderAmount(payment) {
  const amount = getOrderAmountValue(payment);
  if (amount === null) return ORDER_VALUE_NOT_PROVIDED;
  const currency = /^[A-Z]{3}$/.test(payment.currency ?? '') ? payment.currency : 'USD';
  try {
    return formatCurrency(amount, currency);
  } catch {
    return ORDER_VALUE_NOT_PROVIDED;
  }
}
