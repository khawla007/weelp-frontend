'use server';

import { createAuthenticatedServerApi } from '../axiosInstance';
import { log } from '../utils';

/**
 * Get All Blogs Admin
 * @param {string} search
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */

export async function getAllBlogsAdmin(search = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/blogs/${search ? search : ''}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.status == 200) {
      return { success: false, message: 'Something Went wrong' };
    }

    return response?.data;
  } catch (error) {
    console.error(error);
    return { success: false, data: [], message: 'Failed to fetch blogs' };
  }
}

/**
 * Get All Blogs
 * @param {string} search
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */

export async function getAllBlogs(search = '') {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/blogs/${search ? search : ''}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.status == 200) {
      return { success: false, message: 'Something Went wrong' };
    }

    return response?.data;
  } catch (error) {
    console.error(error);
    return { success: false, data: [], message: 'Failed to fetch blogs' };
  }
}

/**
 * Get a blog by ID (Admin)
 * @param {string} blogId - ID of the blog
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export async function getSingleBlogAdmin(blogId) {
  try {
    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/admin/blogs/${blogId}`, {
      headers: { Accept: 'application/json' },
    });

    return {
      success: true,
      data: response?.data,
    };
  } catch (error) {
    console.error('getSingleBlogAdmin error:', error);

    const status = error?.response?.status;

    return {
      success: false,
      message: status === 404 ? 'Blog not found' : error?.message || 'Something went wrong',
    };
  }
}

/**
 * Get a blog by blogSlug
 * @param {string} blogSlug - SLUG of the blog
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export async function getSingleBlog(blogSlug) {
  try {
    if (!blogSlug) {
      return { success: false, message: 'Slug Not Found' };
    }

    const api = await createAuthenticatedServerApi();
    const response = await api.get(`/api/blogs/${blogSlug}`, {
      headers: { Accept: 'application/json' },
    });

    return {
      success: true,
      data: response?.data,
    };
  } catch (error) {
    console.error('getSingleBlog Public error:', error);

    const status = error?.response?.status;

    return {
      success: false,
      message: status === 404 ? 'Blog not found' : error?.message || 'Something went wrong',
    };
  }
}
