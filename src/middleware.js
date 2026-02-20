import { NextResponse } from 'next/server';
import { auth } from './lib/auth/auth';

export async function middleware(req) {
  const session = await auth();

  // Redirect unauthenticated users to login
  if (!session) {
    return NextResponse.redirect(new URL('/user/login', req.url));
  }

  const role = session.user.role;
  const path = req.nextUrl.pathname;

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
}

export const config = {
  matcher: ['/dashboard/:path*'], // Match all dashboard routes
};
