import { authApi } from '@/lib/axiosInstance';

/**
 * GET ALL MEDIA IMAGES USING CLIENT SIDE
 * @returns [{}]
 */
export async function GET() {
  try {
    const response = await authApi.get('api/admin/media');

    // Return the fetched media data
    return new Response(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    // Error handling
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch media data',
        details: error.message,
      }),
      { status: 500 },
    );
  }
}
