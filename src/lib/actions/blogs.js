'use server';

import { revalidatePath } from 'next/cache';
import { authApi } from '../axiosInstance';
import { delay, log } from '../utils';
import { redirect } from 'next/navigation';

/**
 * Action for Create Blog
 * @param {BlogPostForm} data form data related to create blog
 * @returns {Promise<{ success: boolean; message?: string }>} f
 */
export const createBlog = async (data = {}) => {
  try {
    await delay(500);
    const res = await authApi.post('/api/admin/blogs', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    log('Blog Reponse', res);

    // revalidatePath('/dashboard/admin/blogs'); // revalidate api
    return {
      success: true,
      message: res.data?.message,
    };
  } catch (err) {
    const status = err?.response?.status;

    if (status === 400) {
      return {
        success: false,
        message: 'Validation error',
        errors: err?.response?.data?.errors,
      };
    }

    // if email alrady exist
    if (status === 409) {
      return {
        success: false,
        message: err?.response?.data?.error || 'Already Exist',
      };
    }

    if (status === 422) {
      return {
        success: false,
        message: 'Vendor already exists',
      };
    }

    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

/**
 * Updates an existing blog post.
 * @param {number|string} id - Id of the blog post to update.
 * @param {BlogPostForm} data - Form data for updated blog fields.
 * @returns {Promise<{
 *   success: boolean;
 *   message: string;
 *   errors?: Record<string, string[]>;
 * }>}
 *
 * @example
 * await updateBlog(12, {
 *   title: "Updated Title",
 *   content: "Updated content"
 * });
 */
export const updateBlog = async (id, data) => {
  try {
    if (!Number.isFinite(id)) {
      return {
        success: false,
        message: 'Invalid blog id',
      };
    }

    await delay(500);

    const res = await authApi.put(`/api/admin/blogs/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    revalidatePath(`/api/admin/blogs`); // refresh data
    revalidatePath(`/api/admin/blogs/${id}`); // refresh data

    return {
      success: true,
      message: res.data?.message || 'Blog updated successfully',
    };
  } catch (err) {
    const status = err?.response?.status;
    const apiError = err?.response?.data;

    switch (status) {
      case 400:
        return {
          success: false,
          message: 'Validation error',
          errors: apiError?.errors,
        };

      case 409:
        return {
          success: false,
          message: apiError?.error || 'Already exists',
        };

      case 422:
        return {
          success: false,
          message: 'Invalid request data',
        };

      default:
        return {
          success: false,
          message: 'Something went wrong',
        };
    }
  }
};

/**
 * Action to delete Blog
 * @param {number} blogId
 * @returns {Promise<{success:boolean,message:string}>}
 */

export async function deleteBlog(blogId) {
  try {
    // check if blogId is not null
    if (!blogId) {
      return {
        success: false,
        message: 'Blog id not exist',
      };
    }
    const res = await authApi.delete(`/api/admin/blogs/${blogId}/`);

    log(res);
    // revalidate path
    revalidatePath('/api/admin/blogs'); // revalidating path
    return { success: true, message: res?.data?.message || 'Blog deleted successfully' };
  } catch (error) {
    // response status
    const status = error?.response?.status;

    if (status === 404) {
      return {
        status: false,
        message: 'Item Not Found',
      };
    }
    console.error('Delete Blog Api', error);
    return { success: false, message: 'Something Went Wrong' };
  }
}

/**
 * Action to delete multiple Activity
 * @param {number[]} blog_ids
 * @returns {Promise<{success:boolean,message:string}>}
 */
export async function deleteMultipleBlogs(blog_ids = []) {
  try {
    const res = await authApi.post(`/api/admin/blogs/bulk-delete`, {
      blog_ids,
    });

    // revalidate path
    revalidatePath('/api/admin/blogs'); // revalidating api
    return { success: true, message: 'Blogs Delete Succesfully' };
  } catch (error) {
    return { success: false, message: 'Something Went Wrong While deleted Blogs' };
  }
}
