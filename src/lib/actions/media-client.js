// Client-side media upload action
import axios from 'axios';

// Media uploads go through Next.js proxy route

/**
 * Client-side upload media function - fetches token from cookies and uploads directly
 * @param {FormData} formData - The FormData object containing the files to upload.
 * @returns {Object} - The success status and any relevant data or error message.
 */
export async function uploadMedia(formData) {
  // Debug: Log formData entries (convert to array for proper logging)
  const entries = [];
  for (const pair of formData.entries()) {
    entries.push(pair);
  }

  console.log(`[uploadMedia] Total entries in formData: ${entries.length}`);
  console.log(`[uploadMedia] FormData entries:`, entries);

  try {
    // Ensure that 'formData' is not empty
    if (!formData || formData.entries().length === 0) {
      return {
        success: false,
        error: 'No files to upload',
      };
    }

    // Get session token from NextAuth
    const response = await fetch('/api/auth/session');
    const session = await response.json();

    if (!session?.access_token) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    // Make direct API call to backend
    // NOTE: Don't set Content-Type manually - axios will set it with correct boundary for FormData
    const res = await axios.post('/api/admin/media', formData, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    // Returning response success
    return {
      success: true,
      data: res.data,
    };
  } catch (err) {
    // Axios errors have different structure - log everything for debugging
    console.error('[uploadMedia] Full error object:', err);
    console.error('[uploadMedia] Error keys:', Object.keys(err || {}));
    console.error('[uploadMedia] err.response:', err?.response);
    console.error('[uploadMedia] err.request:', err?.request);
    console.error('[uploadMedia] err.message:', err?.message);

    // Handle different error structures
    let errorMessage = 'Something went wrong during file upload.';
    let errorDetails = null;

    if (err?.response) {
      // Server responded with error status
      errorDetails = err.response.data;
      errorMessage = err.response.data?.message || err.response.data?.error?.message?.[0] || err.response.data?.error?.file?.[0] || `Server error: ${err.response.status}`;
    } else if (err?.request) {
      // Request was made but no response received (network error, CORS, timeout)
      errorMessage = 'Network error - unable to reach server. Please check your connection.';
      errorDetails = { request: 'Request sent but no response received' };
    } else {
      // Error in setting up the request
      errorMessage = err?.message || 'Unknown error occurred';
      errorDetails = { setup_error: err?.message };
    }

    console.error('[uploadMedia] Final error message:', errorMessage);

    return {
      success: false,
      error: errorMessage,
      details: errorDetails,
    };
  }
}
