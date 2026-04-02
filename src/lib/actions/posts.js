'use server';

import { getAuthApi } from '../axiosInstance';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const createPost = async (formData) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.post('/api/creator/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { success: true, message: res.data?.message, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to create post.';
    return { success: false, message };
  }
};

export const updatePost = async (id, formData) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.put(`/api/creator/posts/${id}`, formData);
    return { success: true, message: res.data?.message, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to update post.';
    return { success: false, message };
  }
};

export const deletePost = async (id) => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.delete(`/api/creator/posts/${id}`);
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to delete post.';
    return { success: false, message };
  }
};

export const toggleLike = async (postId) => {
  try {
    const api = await getAuthApi();
    const res = await api.post(`/api/posts/${postId}/like`);
    return { success: true, liked: res.data?.liked, likes_count: res.data?.likes_count };
  } catch (err) {
    return { success: false, message: 'Failed to toggle like.' };
  }
};

export const incrementShare = async (postId) => {
  try {
    const api = await getAuthApi();
    const res = await api.post(`/api/posts/${postId}/share`);
    return { success: true, shares_count: res.data?.shares_count };
  } catch (err) {
    return { success: false, message: 'Failed to record share.' };
  }
};

export const upgradeToCreator = async () => {
  try {
    await delay(500);
    const api = await getAuthApi();
    const res = await api.post('/api/customer/upgrade-to-creator');
    return { success: true, message: res.data?.message };
  } catch (err) {
    const message = err?.response?.data?.message || 'Failed to upgrade.';
    return { success: false, message };
  }
};

export const getCreatorStats = async () => {
  try {
    const api = await getAuthApi();
    const res = await api.get('/api/creator/dashboard/stats');
    return { success: true, data: res.data?.data };
  } catch (err) {
    return { success: false, message: 'Failed to fetch stats.' };
  }
};

export const getCompletedBookings = async () => {
  try {
    const api = await getAuthApi();
    const res = await api.get('/api/creator/completed-bookings');
    return { success: true, data: res.data?.data || [] };
  } catch (err) {
    return { success: false, message: 'Failed to fetch bookings.', data: [] };
  }
};

export const resolveLink = async (url) => {
  try {
    const api = await getAuthApi();
    const res = await api.post('/api/creator/resolve-link', { url });
    return { success: true, data: res.data?.data };
  } catch (err) {
    const message = err?.response?.data?.message || 'Could not find this item. Please check the link and try again.';
    return { success: false, message };
  }
};

export const getCreatorPosts = async () => {
  try {
    const api = await getAuthApi();
    const res = await api.get('/api/creator/posts');
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: 'Failed to fetch creator posts.' };
  }
};
