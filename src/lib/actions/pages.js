'use server';

import { revalidatePath } from 'next/cache';
import { getAuthApi } from '../axiosInstance';
import { delay } from '../utils';
import { normalizePageFormPayload } from '../pages/normalizers';

const validationError = (err, fallback = 'Validation error') => {
  const errors = err?.response?.data?.errors;
  if (!errors) return fallback;

  return (
    Object.entries(errors)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
      .join('\n') || fallback
  );
};

export const createPage = async (data = {}) => {
  try {
    await delay(300);
    const api = await getAuthApi();
    const res = await api.post('/api/admin/pages', normalizePageFormPayload(data), {
      headers: { 'Content-Type': 'application/json' },
    });

    revalidatePath('/api/admin/pages');
    return { success: true, message: res.data?.message || 'Page created successfully' };
  } catch (err) {
    console.error('Page creation error:', err?.response?.data || err);
    const status = err?.response?.status;

    if (status === 400 || status === 422) {
      return { success: false, message: validationError(err), errors: err?.response?.data?.errors };
    }

    if (status === 409) {
      return { success: false, message: err?.response?.data?.error || 'Page already exists' };
    }

    return { success: false, message: 'Something went wrong' };
  }
};

export const updatePage = async (id, data = {}) => {
  try {
    if (!id) {
      return { success: false, message: 'Invalid page id' };
    }

    await delay(300);
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/pages/${id}`, normalizePageFormPayload(data), {
      headers: { 'Content-Type': 'application/json' },
    });

    revalidatePath('/api/admin/pages');
    revalidatePath(`/api/admin/pages/${id}`);
    return { success: true, message: res.data?.message || 'Page updated successfully' };
  } catch (err) {
    console.error('Page update error:', err?.response?.data || err);
    const status = err?.response?.status;

    if (status === 400 || status === 422) {
      return { success: false, message: validationError(err), errors: err?.response?.data?.errors };
    }

    if (status === 409) {
      return { success: false, message: err?.response?.data?.error || 'Page already exists' };
    }

    return { success: false, message: 'Something went wrong' };
  }
};

export async function deletePage(pageId) {
  try {
    if (!pageId) {
      return { success: false, message: 'Page id not found' };
    }

    const api = await getAuthApi();
    const res = await api.delete(`/api/admin/pages/${pageId}`);

    revalidatePath('/api/admin/pages');
    return { success: true, message: res?.data?.message || 'Page deleted successfully' };
  } catch (error) {
    console.error('Delete page error:', error?.response?.data || error);

    if (error?.response?.status === 404) {
      return { success: false, message: 'Page not found' };
    }

    return { success: false, message: 'Something went wrong' };
  }
}
