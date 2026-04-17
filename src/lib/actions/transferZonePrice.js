'use server';

import { revalidatePath } from 'next/cache';
import { getAuthApi } from '../axiosInstance';

function errorPayload(err) {
  const status = err?.response?.status;
  return {
    success: false,
    status,
    message: err?.response?.data?.message || err?.message || 'Something went wrong',
    errors: err?.response?.data?.errors,
  };
}

export async function upsertTransferZonePrice({ from_zone_id, to_zone_id, price, currency = 'USD' }) {
  try {
    const api = await getAuthApi();
    const res = await api.post(
      '/api/admin/transfer-zone-prices/upsert',
      { from_zone_id, to_zone_id, price, currency },
      { headers: { 'Content-Type': 'application/json' } },
    );
    revalidatePath('/dashboard/admin/transfers/zones/pricing-matrix');
    return { success: true, data: res.data, message: 'Price saved' };
  } catch (err) {
    return errorPayload(err);
  }
}

export async function bulkUpsertTransferZonePrices(cells = []) {
  try {
    const api = await getAuthApi();
    const res = await api.post(
      '/api/admin/transfer-zone-prices/bulk-upsert',
      { cells },
      { headers: { 'Content-Type': 'application/json' } },
    );
    revalidatePath('/dashboard/admin/transfers/zones/pricing-matrix');
    return { success: true, data: res.data, message: 'Prices saved' };
  } catch (err) {
    return errorPayload(err);
  }
}
