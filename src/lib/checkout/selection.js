const toTravelDate = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const buildCheckoutSelection = (item = {}) => ({
  order_type: item.type,
  orderable_id: item.id,
  travel_date: toTravelDate(item.dateRange?.from),
  preferred_time: item.preferred_time || item.preferredTime || '09:00:00',
  number_of_adults: Number(item.howMany?.adults ?? 1),
  number_of_children: Number(item.howMany?.children ?? 0),
  variation_id: item.variation_id,
  addon_ids: (item.addons || [])
    .map((addon) => addon.addon_id)
    .filter((id) => id !== null && id !== undefined && Number.isInteger(Number(id)) && Number(id) > 0)
    .map(Number),
  bag_count: item.type === 'transfer' ? Number(item.bag_count ?? 0) : undefined,
  waiting_minutes: item.type === 'transfer' ? Number(item.waiting_minutes ?? 0) : undefined,
  currency: String(item.currency || 'usd').toLowerCase(),
});
