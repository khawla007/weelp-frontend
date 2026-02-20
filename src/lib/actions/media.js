'use server';
import { revalidatePath } from 'next/cache';
import { authApi } from '../axiosInstance';
import { delay } from '../utils';
import { log } from '../utils';

/**
 * Handles the upload of media files using FormData and Axios.
 * @param {FormData} formData - The FormData object containing the files to upload.
 * @returns {Object} - The success status and any relevant data or error message.
 */

export async function uploadMedia(formData) {
  try {
    // Ensure that 'formData' is not empty
    if (!formData || formData.entries().length === 0) {
      return {
        success: false,
        error: 'No files to upload',
      };
    }

    // Use axios to post FormData
    await delay(500);
    const res = await authApi.post('api/admin/media/store', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Ensure this header is set for file uploads
      },
    });

    // Returning response success
    return {
      success: true,
      data: res.data,
    };
  } catch (err) {
    // Return error response
    return {
      success: false,
      error: err?.message || 'Something went wrong during file upload.',
    };
  }
}

/**
 * Handles the update media image in media library files using FormData and Axios.
 * @param {object} formData data of the image
 * @returns []
 */
export async function updateMediaImage(formData) {
  try {
    await delay(500);
    const { id } = formData;

    // Use axios to post FormData
    if (id) {
      const res = await authApi.put(`api/admin/media/update/${id}`, formData, {
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
 * Delete Media Image By Id
 * @param {number} imageId Id of the image to delete
 * @returns []
 */
export async function deleteMediaImageById(imageId) {
  try {
    await delay(500);

    // Use axios to post FormData
    if (imageId) {
      const res = await authApi.delete(`api/admin/media/delete/${imageId}`);

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
