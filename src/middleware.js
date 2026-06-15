import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
   const res = NextResponse.next();
   const supabase = createMiddlewareClient({ req, res });
   const session = await supabase.auth.getSession();
   if (!session?.data?.session) {
      // API routes (every matched API path is /api/admin/*) return a real 401
      // so fetch clients get a clean error instead of transparently following a
      // redirect to the login HTML. Page routes keep redirecting to /login.
      if (req.nextUrl.pathname.startsWith('/api/')) {
         return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
      const loginURL = new URL('/login', req.url);
      loginURL.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      loginURL.searchParams.set(
         'error',
         'You must be logged in to access that page'
      );
      return NextResponse.redirect(loginURL);
   }

   return res;
}

export const config = {
   matcher: [
      /*
       * Match all routes starting with /admin or /api/admin
       */
      '/admin/:path*',
      '/api/admin/:path*',
   ],
};
