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

export async function createTransferZone(data = {}) {
  try {
    const api = await getAuthApi();
    const res = await api.post('/api/admin/transfer-zones', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    revalidatePath('/dashboard/admin/transfers/zones');
    return { success: true, data: res.data, message: 'Zone created successfully' };
  } catch (err) {
    return errorPayload(err);
  }
}

export async function updateTransferZone(id, data = {}) {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/transfer-zones/${id}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    revalidatePath('/dashboard/admin/transfers/zones');
    return { success: true, data: res.data, message: 'Zone updated successfully' };
  } catch (err) {
    return errorPayload(err);
  }
}

export async function deleteTransferZone(id) {
  try {
    const api = await getAuthApi();
    await api.delete(`/api/admin/transfer-zones/${id}`);
    revalidatePath('/dashboard/admin/transfers/zones');
    return { success: true, message: 'Zone deleted successfully' };
  } catch (err) {
    return errorPayload(err);
  }
}

export async function bulkDeleteTransferZones(ids = []) {
  try {
    const api = await getAuthApi();
    await api.post('/api/admin/transfer-zones/bulk-delete', { ids });
    revalidatePath('/dashboard/admin/transfers/zones');
    return { success: true, message: `${ids.length} zone(s) deleted` };
  } catch (err) {
    return errorPayload(err);
  }
}

export async function toggleTransferZoneStatus(id, is_active) {
  try {
    const api = await getAuthApi();
    await api.put(`/api/admin/transfer-zones/${id}`, { is_active: !!is_active }, { headers: { 'Content-Type': 'application/json' } });
    revalidatePath('/dashboard/admin/transfers/zones');
    return { success: true };
  } catch (err) {
    return errorPayload(err);
  }
}
