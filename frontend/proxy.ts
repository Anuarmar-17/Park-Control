import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token  = request.cookies.get('token')?.value;
  const roleId = request.cookies.get('roleId')?.value;
  const path   = request.nextUrl.pathname;

  // Rutas protegidas sin token → redirigir al login
  if (!token && (path.startsWith('/admin') || path.startsWith('/operative'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si hay token y roleId, aplicar protección por roles
  if (token && roleId) {
    // Accede a /admin pero no es admin (rol_id 1)
    if (path.startsWith('/admin') && roleId !== '1') {
      const target = roleId === '2' ? '/operative' : '/';
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Accede a /operative pero no es operario (rol_id 2)
    if (path.startsWith('/operative') && roleId !== '2') {
      const target = roleId === '1' ? '/admin' : '/';
      return NextResponse.redirect(new URL(target, request.url));
    }

    // Ya está logueado y visita el login → redirigir a su dashboard
    if (path === '/') {
      if (roleId === '1') return NextResponse.redirect(new URL('/admin', request.url));
      if (roleId === '2') return NextResponse.redirect(new URL('/operative', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/operative/:path*'],
};
