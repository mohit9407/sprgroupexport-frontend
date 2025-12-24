import { NextResponse } from 'next/server'

// Public paths that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/_next',
  '/images',
  '/favicon.ico',
  '/cart',
  '/products',
  '/checkout',
  '/wishlist',
  '/order-confirmation',
  '/api/guest-cart',
]

// Protected paths that require authentication
const protectedPaths = ['/profile', '/orders', '/account', '/dashboard']

// Admin paths that require admin role
const adminPaths = [
  '/admin',
  '/dashboard', // Assuming dashboard is also admin-only
]

// Function to decode JWT token (client-side decoding - for demo purposes only)
// In production, consider using a proper JWT library or server-side validation
const decodeToken = (token) => {
  if (!token) return null
  try {
    // JWT token is in format: header.payload.signature
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Error decoding token:', e)
    return null
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('accessToken')?.value

  // Allow all static files
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

  // Get user data from token if exists
  let user = null
  if (token) {
    user = decodeToken(token)
  }

  // Check if path is admin path
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path))

  // Check admin access
  if (isAdminPath) {
    const hasAdminRole =
      user &&
      (user.role === 'admin' ||
        (Array.isArray(user.roles) && user.roles.includes('admin')) ||
        user.isAdmin === true)

    if (!token || !user || !hasAdminRole) {
      // If not an admin, redirect to home or unauthorized page
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Allow access to public paths for everyone
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
  if (isPublicPath) {
    // If user is logged in and tries to access auth pages, redirect to home
    if (
      token &&
      (pathname.startsWith('/login') || pathname.startsWith('/register'))
    ) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Check if path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  )

  if (isProtectedPath) {
    // Redirect to login if not authenticated
    if (!token || !user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user is an admin trying to access user routes
    const isAdmin =
      user.role === 'admin' ||
      (Array.isArray(user.roles) && user.roles.includes('admin')) ||
      user.isAdmin === true

    if (isAdmin && pathname.startsWith('/')) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // For all other routes, allow access (guest users can browse)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/|_next/static|_next/image|images/|favicon.ico|sw.js).*)'],
}
