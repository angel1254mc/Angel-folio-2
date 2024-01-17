import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = formData.get('email')
  const password = formData.get('password')
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  if (email != process.env.ANGEL_ADMIN_EMAIL) {
    return Response.json({
      message: "Unable to sign in: Invalid Email"
    }, {status: 403})
  }

  await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return NextResponse.redirect(`${requestUrl.origin}/admin`, {
    status: 301,
  })
}