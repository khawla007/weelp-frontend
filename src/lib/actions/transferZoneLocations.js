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

export async function assignLocationsToZone(zoneId, locations = []) {
  try {
    const api = await getAuthApi();
    const res = await api.post(`/api/admin/transfer-zones/${zoneId}/locations/assign`, { locations }, { headers: { 'Content-Type': 'application/json' } });
    revalidatePath('/dashboard/admin/transfers/zones');
    return { success: true, data: res.data, message: `${res.data?.assigned ?? locations.length} location(s) assigned` };
  } catch (err) {
    return errorPayload(err);
  }
}

export async function unassignLocationsFromZone(zoneId, locations = []) {
  try {
    const api = await getAuthApi();
    const res = await api.delete(`/api/admin/transfer-zones/${zoneId}/locations/unassign`, { data: { locations }, headers: { 'Content-Type': 'application/json' } });
    revalidatePath('/dashboard/admin/transfers/zones');
    return { success: true, data: res.data, message: `${res.data?.unassigned ?? locations.length} location(s) removed` };
  } catch (err) {
    return errorPayload(err);
  }
}
