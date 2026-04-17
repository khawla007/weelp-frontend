'use server';

import { revalidatePath } from 'next/cache';
import { getAuthApi } from '../axiosInstance';

const ROUTES_PATH = '/dashboard/admin/transfers/routes';

function errorPayload(err) {
  const status = err?.response?.status;
  return {
    success: false,
    status,
    message: err?.response?.data?.message || err?.message || 'Something went wrong',
    errors: err?.response?.data?.errors,
  };
}

export async function createTransferRoute(data = {}) {
  try {
    const api = await getAuthApi();
    const res = await api.post('/api/admin/transfer-routes', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    revalidatePath(ROUTES_PATH);
    return { success: true, data: res.data, message: 'Route created successfully' };
  } catch (err) {
    return errorPayload(err);
  }
}

export async function updateTransferRoute(id, data = {}) {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/transfer-routes/${id}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
    revalidatePath(ROUTES_PATH);
    return { success: true, data: res.data, message: 'Route updated successfully' };
  } catch (err) {
    return errorPayload(err);
  }
}

export async function deleteTransferRoute(id) {
  try {
    const api = await getAuthApi();
    await api.delete(`/api/admin/transfer-routes/${id}`);
    revalidatePath(ROUTES_PATH);
    return { success: true, message: 'Route deleted successfully' };
  } catch (err) {
    return errorPayload(err);
  }
}

export async function bulkDeleteTransferRoutes(ids = []) {
  try {
    const api = await getAuthApi();
    await api.post('/api/admin/transfer-routes/bulk-delete', { ids });
    revalidatePath(ROUTES_PATH);
    return { success: true, message: `${ids.length} route(s) deleted` };
  } catch (err) {
    return errorPayload(err);
  }
}

export async function toggleTransferRouteStatus(id) {
  try {
    const api = await getAuthApi();
    await api.patch(`/api/admin/transfer-routes/${id}/toggle-status`);
    revalidatePath(ROUTES_PATH);
    return { success: true };
  } catch (err) {
    return errorPayload(err);
  }
}

export async function toggleTransferRoutePopular(id) {
  try {
    const api = await getAuthApi();
    await api.patch(`/api/admin/transfer-routes/${id}/toggle-popular`);
    revalidatePath(ROUTES_PATH);
    return { success: true };
  } catch (err) {
    return errorPayload(err);
  }
}
