export function resolvePackageBasePricing(productData) {
  const rawPrice = productData?.pricing?.regular_price ?? productData?.base_pricing?.variations?.[0]?.regular_price ?? productData?.schedule_total_price ?? 0;
  const price = Number(rawPrice);

  return {
    price: Number.isFinite(price) ? price : 0,
    currency: productData?.pricing?.currency ?? productData?.base_pricing?.currency ?? productData?.schedule_total_currency ?? 'USD',
  };
}
