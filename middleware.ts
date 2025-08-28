import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Get environment variables for validation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return NextResponse.next()
  }

  // Skip auth check for public routes
  const publicRoutes = ['/demo', '/auth/login', '/auth/register', '/auth/forgot-password']
  if (publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/') {
    return NextResponse.next()
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    try {
      // Get session from cookie
      const token = req.cookies.get('supabase-auth-token')?.value
      
      if (!token) {
        const redirectUrl = new URL('/auth/login', req.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
      }

    } catch (error) {
      console.error('Auth middleware error:', error)
      // Fallback to login page on error
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Protected auth routes that need authentication
  const protectedAuthRoutes = ['/auth/reset-password']
  
  if (protectedAuthRoutes.some(route => pathname.startsWith(route))) {
    // For reset password, we allow it to pass through
    // The component will handle the validation
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
