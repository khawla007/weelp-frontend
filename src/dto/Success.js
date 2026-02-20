// /dto/ApiError.js
/**
 * Factory to create consistent API success responses
 * @param {Object} params
 * @param {any} params.data - Paylod data
 * @param {number} [params.status=200] - HTTP status code (default: 200)
 * @returns {{data: any, status: number,}}
 */
export const ApiResponse = ({ data, success = false, status = 200 }) => ({
  data,
  success,
  status,
});
