'use server';

import { createAuthenticatedServerApi } from '../axiosInstance';

export async function getAllPagesAdmin(search = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/pages/${search || ''}`, {
      headers: { Accept: 'application/json' },
    });

    return response?.data;
  } catch (error) {
    console.error('getAllPagesAdmin error:', error);
    return { success: false, data: [], message: 'Failed to fetch pages' };
  }
}

export async function getSinglePageAdmin(pageId) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/pages/${pageId}`, {
      headers: { Accept: 'application/json' },
    });

    return {
      success: true,
      data: response?.data?.data || response?.data,
    };
  } catch (error) {
    console.error('getSinglePageAdmin error:', error);

    return {
      success: false,
      message: error?.response?.status === 404 ? 'Page not found' : error?.message || 'Something went wrong',
    };
  }
}

export async function getPublishedPage(pageSlug) {
  try {
    if (!pageSlug) {
      return { success: false, message: 'Slug not found' };
    }

    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/pages/${pageSlug}`, {
      headers: { Accept: 'application/json' },
    });

    return {
      success: true,
      data: response?.data?.data || response?.data,
    };
  } catch (error) {
    console.error('getPublishedPage error:', error);

    return {
      success: false,
      message: error?.response?.status === 404 ? 'Page not found' : error?.message || 'Something went wrong',
    };
  }
}
