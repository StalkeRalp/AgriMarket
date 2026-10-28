import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = {
  admin: /^\/admin/,
  auth: ['/connexion', '/inscription'],
};

const ADMIN_ROUTES = /^\/admin/;

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const userCookie = request.cookies.get('user');
  let user = null;
  try {
    user = userCookie ? JSON.parse(userCookie.value) : null;
  } catch {
    // An invalid or expired optional cookie must not block public navigation.
  }

  // Route de connexion/inscription
  if (PROTECTED_ROUTES.auth.includes(pathname)) {
    // Rediriger vers compte si déjà connecté
    if (user) {
      return NextResponse.redirect(new URL('/compte', request.url));
    }
    return NextResponse.next();
  }

  // Routes administrateur
  if (ADMIN_ROUTES.test(pathname)) {
    if (!user) {
      return NextResponse.redirect(new URL('/connexion', request.url));
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Routes publiques excluées
    '/((?!_next|static|favicon|logo|robots|sitemap).*)',
    '/connexion/:path*',
    '/inscription/:path*',
    '/admin/:path*',
    '/compte/:path*',
    '/adresses/:path*',
    '/commandes/:path*',
    '/favoris/:path*',
    '/panier/:path*',
  ],
};
