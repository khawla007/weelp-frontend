import { auth } from '@/lib/auth/auth';

export async function GET() {
  try {
    const session = await auth();

    return Response.json({
      sessionExists: !!session,
      hasToken: !!session?.access_token,
      userEmail: session?.user?.email,
      userRole: session?.user?.role,
      tokenPreview: session?.access_token?.substring(0, 30) + '...',
    });
  } catch (error) {
    return Response.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    );
  }
}
