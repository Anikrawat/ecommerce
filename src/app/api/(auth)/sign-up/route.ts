import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/drizzle/connect";
import { usersTable } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { serverClient } from "@/utils/supabase/server";

const db = dbConnect();

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json()
    const userExists = await db.select({ email: usersTable.email, username: usersTable.username }).from(usersTable).where(or(eq(usersTable.email, email), eq(usersTable.username, username)));

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
    const supabase = await serverClient();


    const { data: insertData, error: insertError } = await supabase.auth.signUp({
      email,
      password,
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
