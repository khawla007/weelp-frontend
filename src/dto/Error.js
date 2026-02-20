// /dto/ApiError.js

/**
 * Factory to create consistent API error objects
 * @param {Object} params
 * @param {string} params.message - Human-readable error message
 * @param {number} [params.status] - HTTP status code
 * @param {any} [params.errors] - Optional validation or detailed errors
 * @returns {{success: boolean, message: string, status?: number, errors?: any}}
 */
export const ApiError = ({ message, status, errors } = {}) => ({
  success: false,
  message: message || 'Something went wrong',
  status,
  errors,
});
