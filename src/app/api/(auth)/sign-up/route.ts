import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/drizzle/connect";
import { usersTable } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { serverClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const db = dbConnect();

export async function POST(request: NextRequest) {
  try {
    const { provider, email, password, username } = await request.json()
    const userExists = await db.select({ email: usersTable.email, username: usersTable.username }).from(usersTable).where(or(eq(usersTable.email, email), eq(usersTable.username, username)));

    const supabase = await serverClient();

    if (provider === "google") {
      const redirectUrl = new URL('http://localhost:3000/api/callback')
      redirectUrl.searchParams.set('username', username)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl.toString(), // must exist in Supabase + Google Console
        },
      });
      if (data.url) redirect(data.url);
      if (error) throw error;

      return NextResponse.json({
        message: "Redirecting to Google OAuth...",
        url: data.url,
      });
    }
    if (userExists.length > 0) {
      const user = userExists[0]
      if (user.username === username) {
        return NextResponse.json({
          message: "Username Already Exists."
        }, { status: 400 })
      }
      if (user.email === email) {
        return NextResponse.json({
          message: "Email Already Exists.",
        }, { status: 400 })
      }
    }


    const { data: insertData, error: insertError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:3000/email-verify'
      }
    })

    if (insertError) throw insertError

    await db.insert(usersTable).values({
      id: insertData.user?.id,
      email,
      username,
    })

    return NextResponse.json({
      message: "Signed up successfully"
    }, { status: 200 })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      message: "Internal Server Error: " + message
    }, { status: 500 })
  }
}
