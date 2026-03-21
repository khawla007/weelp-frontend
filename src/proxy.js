import { NextResponse } from 'next/server';
import { auth } from './lib/auth/auth';

export async function proxy(req) {
  // Only apply auth check to dashboard routes
  const path = req.nextUrl.pathname;

  // Skip non-dashboard routes
  if (!path.startsWith('/dashboard/')) {
    return NextResponse.next();
  }

  try {
    const session = await auth();

    // Redirect unauthenticated users to login
    if (!session) {
      return NextResponse.redirect(new URL('/user/login', req.url));
    }

    const role = session.user?.role;

    // Role-based redirection
    if ((role === 'super_admin' || role === 'admin') && !path.startsWith('/dashboard/admin')) {
      return NextResponse.redirect(new URL('/dashboard/admin', req.url));
    }

    if (role === 'customer' && !path.startsWith('/dashboard/customer')) {
      return NextResponse.redirect(new URL('/dashboard/customer', req.url));
    }

    // If the role is not recognized, redirect to login
    if (!['super_admin', 'admin', 'customer'].includes(role)) {
      return NextResponse.redirect(new URL('/user/login', req.url));
    }

    // Allow access if the user is on the correct path
    return NextResponse.next();
  } catch (error) {
    // On any error, redirect to login
    return NextResponse.redirect(new URL('/user/login', req.url));
  }
}

export const proxyConfig = {
  matcher: ['/dashboard/:path*'], // Match all dashboard routes
};
