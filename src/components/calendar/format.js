import { format } from 'date-fns';

const SHORT_DAY_MONTH = 'd MMM';
const SHORT_DAY_MONTH_YEAR = 'd MMM yyyy';

export function formatRange(from, to, { locale } = {}) {
  if (!from || !to) return '';
  const opts = locale ? { locale } : undefined;
  const sameYear = from.getFullYear() === to.getFullYear();
  const left = sameYear ? format(from, SHORT_DAY_MONTH, opts) : format(from, SHORT_DAY_MONTH_YEAR, opts);
  const right = format(to, SHORT_DAY_MONTH_YEAR, opts);
  return `${left} - ${right}`;
}

export function formatSingle(date, { locale } = {}) {
  if (!date) return '';
  const opts = locale ? { locale } : undefined;
  return format(date, SHORT_DAY_MONTH_YEAR, opts);
}
