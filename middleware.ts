import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // All /blocks/* routes require authentication (any tier, including free)
  if (pathname.startsWith('/blocks')) {
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Admin routes require authentication + admin role
  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/blocks/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/blocks/:path*', '/admin/:path*'],
};
