import { getAuthApi } from '@/lib/axiosInstance';

/**
 * GET ALL MEDIA IMAGES USING CLIENT SIDE
 * @returns [{}]
 */
export async function GET(request) {
  try {
    const api = await getAuthApi();
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const response = await api.get(`api/admin/media${queryString ? `?${queryString}` : ''}`);

    // Return the fetched media data
    return new Response(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    // Error handling
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch media data',
        details: error.response?.data?.message || 'Service unavailable',
      }),
      { status: 500 },
    );
  }
}

/**
 * UPLOAD MEDIA - proxied from client-side
 */
export async function POST(request) {
  try {
    const api = await getAuthApi();
    const formData = await request.formData();
    const response = await api.post('api/admin/media/store', formData);
    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to upload media',
        details: error.response?.data?.message || 'Service unavailable',
      }),
      { status: error.response?.status || 500 },
    );
  }
}
