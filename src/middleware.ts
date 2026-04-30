import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/generate',
  '/history',
  '/settings',
  '/api/generate',
  '/api/credits',
  '/api/history',
  '/api/user',
  '/api/payments/create-checkout',
];

const PUBLIC_PREFIXES = ['/', '/login', '/api/auth', '/api/payments/webhook'];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (!isProtected(pathname) || isPublic(pathname)) return NextResponse.next();

  const token =
    req.cookies.get('__Secure-authjs.session-token')?.value ??
    req.cookies.get('authjs.session-token')?.value ??
    req.cookies.get('__Secure-next-auth.session-token')?.value ??
    req.cookies.get('next-auth.session-token')?.value ??
    null;

  if (!token) {
    // For API routes, never redirect to HTML pages. Return JSON 401.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Not logged in', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const url = new URL('/login', req.nextUrl.origin);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};

