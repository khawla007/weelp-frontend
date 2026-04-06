'use server';

import { getAuthApi } from '../axiosInstance';

/**
 * Submit a creator application
 * @param {FormData} formData - Application form data
 * @returns {object} { success, message, data }
 */
export const submitCreatorApplication = async (formData) => {
  try {
    const api = await getAuthApi();
    const res = await api.post('/api/customer/creator/apply', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { success: true, message: res.data?.message, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to submit application.';
    return { success: false, message };
  }
};

/**
 * Get current user's creator application status
 * @returns {object} { success, data }
 */
export const getApplicationStatus = async () => {
  try {
    const api = await getAuthApi();
    const res = await api.get('/api/customer/creator/application-status');
    return { success: true, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to fetch application status.';
    return { success: false, message };
  }
};

/**
 * Approve a creator application (admin)
 * @param {number} id - Application ID
 * @returns {object} { success, message }
 */
export const approveApplication = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/creator-applications/${id}/approve`);
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to approve application.';
    return { success: false, message };
  }
};

/**
 * Update a creator application (admin)
 * @param {number} id - Application ID
 * @param {object} data - Fields to update
 * @returns {object} { success, message, data }
 */
export const updateApplication = async (id, data) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/creator-applications/${id}`, data);
    return { success: true, message: res.data?.message, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to update application.';
    return { success: false, message };
  }
};

/**
 * Delete a creator application (admin)
 * @param {number} id - Application ID
 * @returns {object} { success, message }
 */
export const deleteApplication = async (id) => {
  try {
    const api = await getAuthApi();
    const res = await api.delete(`/api/admin/creator-applications/${id}`);
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to delete application.';
    return { success: false, message };
  }
};

/**
 * Reject a creator application (admin)
 * @param {number} id - Application ID
 * @param {string} adminNotes - Rejection reason
 * @returns {object} { success, message }
 */
export const rejectApplication = async (id, adminNotes) => {
  try {
    const api = await getAuthApi();
    const res = await api.put(`/api/admin/creator-applications/${id}/reject`, {
      admin_notes: adminNotes,
    });
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to reject application.';
    return { success: false, message };
  }
};
