import { NextResponse } from 'next/server'
import { serverClient } from '@/utils/supabase/server'
import dbConnect from '@/utils/drizzle/connect'
import { usersTable } from '@/db/schema'
import { eq } from 'drizzle-orm'

const db = dbConnect()

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const username = searchParams.get('username')
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/'
  }

  if (code) {
    const supabase = await serverClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.session?.user) {
      if (!data.session.user.email) {
        throw new Error("Supabase did not return an email");
      }

      if (!username) {
        throw new Error("Username missing from query params");
      }

      const userExists = await db.select({ email: usersTable.email, username: usersTable.username }).from(usersTable).where(or(eq(usersTable.email, email), eq(usersTable.username, username)));


      if (userExists.length === 0) {
        await db.insert(usersTable).values({
          id: data.session.user.id,
          email: data.session.user.email,
          username
        });
      } else {
        if (userExists[0].username === username) {
          throw new Error("username already exists")
        } else if (userExists[0].email === data.session.user.email) {
          throw new Error("Email already exists")
        }
      }
    }
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
