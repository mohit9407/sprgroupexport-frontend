import { NextResponse } from 'next/server'

/*
// Authentication is currently disabled
const publicPaths = [
  '/login', 
  '/forgot-password', 
  '/reset-password', 
  '/_next', 
  '/images', 
  '/favicon.ico',
  '/cart',
  '/products'
]
*/

export function middleware() {
  // Authentication is currently disabled - all routes are public
  return NextResponse.next()

  /*
  // Original authentication logic (currently disabled)
  const { pathname } = request.nextUrl
  const token = request.cookies.get('accessToken')

  // Allow all static files and public paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.webp')
  ) {
    return NextResponse.next()
  }

  // Allow access to home page, cart, and products for everyone
  if (pathname === '/' || pathname.startsWith('/cart') || pathname.startsWith('/products')) {
    return NextResponse.next()
  }

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Redirect authenticated users away from public auth paths
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Protect non-public paths that require authentication
  if (!isPublicPath && pathname !== '/' && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
  */
}

export const config = {
  // Match all routes (authentication disabled)
  matcher: ['/((?!api/|_next/static|_next/image|images/|favicon.ico).*)'],
}
