import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
   const res = NextResponse.next();
   const supabase = createMiddlewareClient({ req, res });
   const session = await supabase.auth.getSession();
   if (!session?.data?.session) {
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
