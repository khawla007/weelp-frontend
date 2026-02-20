// app/api/customer/profile/route.js
import { getUserProfile } from '@/lib/services/users';

export async function GET() {
  try {
    const result = await getUserProfile();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ user: null, error: 'Something went wrong.' }), {
      status: 500,
    });
  }
}
