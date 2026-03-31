import { NextResponse } from 'next/server';

// Public auth pages that should NOT require login
const PUBLIC_AUTH_PATHS = [
  '/user/login',
  '/user/register',
  '/user/forgot-password',
  '/user/reset-password',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public auth pages through
  if (PUBLIC_AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for NextAuth session token cookie
  // In dev: "authjs.session-token", in prod with secure cookies: "__Secure-authjs.session-token"
  const token =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value;

  if (!token) {
    const loginUrl = new URL('/user/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/user/:path*', '/dashboard/:path*'],
};
