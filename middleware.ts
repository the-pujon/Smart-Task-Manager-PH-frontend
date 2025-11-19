import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/register' || path === '/verification'
  
  // Define protected paths that require authentication
  const isProtectedPath = path.startsWith('/dashboard')
  
  // For root path, allow through (will be handled by client-side redirect)
  if (path === '/') {
    return NextResponse.next()
  }
  
  // Allow all paths through - authentication will be handled client-side
  // This is because we're using localStorage for persistence and can't access it in middleware
  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
