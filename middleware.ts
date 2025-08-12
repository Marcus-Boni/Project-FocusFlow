import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Simple middleware for now - we'll enhance with Supabase session checking later
  const { pathname } = req.nextUrl

  // Protect dashboard routes (redirect to login if no session)
  if (pathname.startsWith('/dashboard')) {
    // For now, we'll let the AuthProvider handle the redirect
    // This is a placeholder for future Supabase session checking
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*']
}
