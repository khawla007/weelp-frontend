import { NextResponse } from 'next/server';
import { auth } from './lib/auth/auth';

export default async function proxy(req) {
  const path = req.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/explore-creators', '/blogs', '/transfers', '/holiday', '/about-us', '/api/auth', '/user/login', '/user/forgot-password', '/user/reset-password', '/user/signup', '/assets'];

  // Skip auth check for public routes
  if (path === '/' || publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip auth check for static files and API routes (excluding protected ones)
  if (
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.includes('.') // static files like images, fonts
  ) {
    return NextResponse.next();
  }

  // For dashboard and user routes, check authentication
  if (path.startsWith('/dashboard/') || path.startsWith('/user/')) {
    try {
      const session = await auth();

      // Redirect unauthenticated users to login
      if (!session) {
        const loginUrl = new URL('/user/login', req.url);
        loginUrl.searchParams.set('callbackUrl', path);
        return NextResponse.redirect(loginUrl);
      }

      const role = session.user?.role;

      // Role-based redirection
      if ((role === 'super_admin' || role === 'admin') && path.startsWith('/dashboard/customer')) {
        // Admin can access customer dashboard too, so allow it
        return NextResponse.next();
      }

      if (role === 'customer' && path.startsWith('/dashboard/admin')) {
        return NextResponse.redirect(new URL('/dashboard/customer', req.url));
      }

      // Allow access if the user is on the correct path
      return NextResponse.next();
    } catch (error) {
      // On any error, redirect to login
      return NextResponse.redirect(new URL('/user/login', req.url));
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
