export function parseOrderQuery(value) {
  const values = Array.isArray(value) ? value : [value];

  if (values.length !== 1 || typeof values[0] !== 'string' || !/^[1-9]\d*$/.test(values[0])) return null;

  const orderId = Number(values[0]);
  return Number.isSafeInteger(orderId) ? orderId : null;
}

export function replaceOrderQuery(pathname, currentSearch, orderId) {
  const query = new URLSearchParams(currentSearch?.toString() ?? '');
  const parsedOrderId = typeof orderId === 'number' ? parseOrderQuery(String(orderId)) : null;

  if (parsedOrderId === null) {
    query.delete('order');
  } else {
    query.set('order', String(parsedOrderId));
  }

  const search = query.toString();
  return search ? `${pathname}?${search}` : pathname;
}
