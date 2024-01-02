import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const session = await supabase.auth.getSession()
  if (!session?.data?.session) {
    return NextResponse.redirect(req.nextUrl.origin);
  }

  return res
}

export const config = {
  matcher: [
    /*
    * Match all routes starting with /admin or /api/admin
    */
    '/admin/:path*',
    '/api/admin/:path*'
  ],
}