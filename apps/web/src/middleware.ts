import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check for JWT token in cookies or Authorization header
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')
  
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')

  // Allow API routes to handle their own auth
  if (isApiRoute) {
    return NextResponse.next()
  }

  // If no token and trying to access protected route, redirect to login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If has token and trying to access auth page, redirect to dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
