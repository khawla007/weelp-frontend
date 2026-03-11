'use server';
import { revalidatePath } from 'next/cache';
import { getAuthApi } from '../axiosInstance';
import { delay } from '../utils';
import { log } from '../utils';

/**
 * Update media image - still a server action (works for updates)
 * @param {object} formData data of the image
 * @returns []
 */
export async function updateMediaImage(formData) {
  try {
    await delay(500);
    const { id } = formData;

    // Use axios to post FormData
    if (id) {
      const api = await getAuthApi();
      const res = await api.put(`api/admin/media/update/${id}`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // path refresh
      revalidatePath('/dashboard/admin/media');

      // Returning response success
      return {
        success: true,
        data: res.data,
      };
    }
    return { success: false, data: 'Something Went Wrong' };
  } catch (err) {
    // Return error response
    return {
      success: false,
      error: err?.message || 'Something went wrong during file upload.',
    };
  }
}

/**
 * Delete Media Image By Id - still a server action (works for deletes)
 * @param {number} imageId Id of the image to delete
 * @returns []
 */
export async function deleteMediaImageById(imageId) {
  try {
    await delay(500);

    // Use axios to post FormData
    if (imageId) {
      const api = await getAuthApi();
      const res = await api.delete(`api/admin/media/delete/${imageId}`);

      // path refresh
      revalidatePath('/dashboard/admin/media');

      // Returning response success
      return {
        success: true,
      };
    }
    return { success: false, data: 'Something Went Wrong' };
  } catch (err) {
    // Return error response
    return {
      success: false,
      error: err?.message || 'Something went wrong during file upload.',
    };
  }
}

/**
 * Action to delete multiple media items
 * @param {number[]} media_ids
 * @returns {{success: boolean, data?: any, error?: string}}
 */
export async function deleteMultipleMedia(media_ids = []) {
  try {
    const api = await getAuthApi();
    const res = await api.post('/api/admin/media/bulk-delete', {
      media_ids,
    });

    // revalidate path
    revalidatePath('/dashboard/admin/media');
    return { success: true, data: res.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
