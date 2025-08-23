import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect dashboard routes (redirect to login if no session)
  if (pathname.startsWith('/dashboard')) {
    // For now, we'll let the AuthProvider handle the redirect
    // This is a placeholder for future Supabase session checking
    return NextResponse.next()
  }

  // Protected auth routes that need authentication
  const protectedAuthRoutes = ['/auth/reset-password']
  
  if (protectedAuthRoutes.some(route => pathname.startsWith(route))) {
    // Check if user has valid session - for now, we'll allow it
    // In a full implementation, we'd verify the Supabase session here
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
}
