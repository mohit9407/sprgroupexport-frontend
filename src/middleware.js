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

// Function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) return true
    return decoded.exp * 1000 < Date.now()
  } catch (e) {
    console.error('Error checking token expiration:', e)
    return true
  }
}

// Function to decode JWT token
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

// Function to refresh access token
const refreshAccessToken = async (refreshToken) => {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(`${apiBase}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()
    const payload = data?.data || data
    if (!payload?.accessToken) {
      throw new Error('Invalid refresh response')
    }

    return {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken || refreshToken,
    }
  } catch (error) {
    console.error('Error refreshing token:', error)
    return null
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  const htmlNext = () => {
    const response = NextResponse.next()
    // Avoid caching HTML across deploys (stale HTML points at old CSS hashes → unstyled site)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    return response
  }

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

  const applyRefreshedTokens = (response, tokens) => {
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    })
    if (tokens.refreshToken) {
      response.cookies.set('refreshToken', tokens.refreshToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }
    return response
  }

  // Check if access token is expired but refresh token exists
  if (accessToken && refreshToken && isTokenExpired(accessToken)) {
    try {
      // Attempt to refresh the access token
      const tokens = await refreshAccessToken(refreshToken)
      if (tokens?.accessToken) {
        return applyRefreshedTokens(htmlNext(), tokens)
      } else {
        // If refresh fails, clear tokens and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('accessToken')
        response.cookies.delete('refreshToken')
        return response
      }
    } catch (error) {
      console.error('Error during token refresh:', error)
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('accessToken')
      response.cookies.delete('refreshToken')
      return response
    }
  }

  // Get user data from token if exists
  let user = null
  if (accessToken) {
    user = decodeToken(accessToken)
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

    if (!accessToken || !user || !hasAdminRole) {
      // If not an admin, redirect to home or unauthorized page
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Allow access to public paths for everyone
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
  if (isPublicPath) {
    // If user is logged in and tries to access auth pages, redirect to home
    if (
      accessToken &&
      (pathname.startsWith('/login') || pathname.startsWith('/register'))
    ) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return htmlNext()
  }

  // Check if path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  )

  if (isProtectedPath) {
    // Redirect to login if not authenticated
    if (!accessToken || !user) {
      // If refresh token exists but access token is missing/expired, try to refresh
      if (refreshToken) {
        try {
          const tokens = await refreshAccessToken(refreshToken)
          if (tokens?.accessToken) {
            return applyRefreshedTokens(htmlNext(), tokens)
          }
        } catch (error) {
          console.error('Error during token refresh:', error)
        }
      }

      // If we get here, either refresh token is missing or refresh failed
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('accessToken')
      response.cookies.delete('refreshToken')
      return response
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

  return htmlNext()
}

export const config = {
  matcher: ['/((?!api/|_next/static|_next/image|images/|favicon.ico|sw.js).*)'],
}
