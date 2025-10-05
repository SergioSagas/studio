import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// El middleware ya no es necesario para la protección de rutas.
// La lógica en src/app/(main)/layout.tsx se encarga de esto.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
