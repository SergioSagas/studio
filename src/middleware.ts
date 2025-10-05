import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/'];
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const currentUser = request.cookies.get('firebaseAuth')?.value;
  const { pathname } = request.nextUrl;

  // Si el usuario está autenticado y trata de acceder a una ruta de autenticación,
  // redirigirlo al panel principal.
  if (currentUser && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si el usuario no está autenticado y trata de acceder a una ruta protegida,
  // redirigirlo a la página de inicio de sesión.
  if (!currentUser && protectedRoutes.some(route => pathname.startsWith(route))) {
     // Excluir sub-rutas de autenticación que podrían estar bajo '/'
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Coincidir con todas las rutas excepto las de la API, _next/static, _next/image, y archivos de assets
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
