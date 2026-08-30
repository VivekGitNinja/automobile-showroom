import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

/**
 * Admin route protection: the admin-token cookie must contain a valid,
 * unexpired access JWT signed with the API's JWT_ACCESS_SECRET. Forged or
 * stale cookies are redirected to the login screen.
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      const secret = process.env.JWT_ACCESS_SECRET
      if (!secret) {
        // No secret configured — fail closed rather than trusting the cookie.
        console.error('JWT_ACCESS_SECRET is not set; admin middleware cannot validate sessions')
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
      const role = (payload as any).role
      if (!role || ['viewer', 'editor', 'admin', 'super_admin'].indexOf(role) === -1) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
