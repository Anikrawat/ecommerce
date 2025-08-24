import { serverClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

  try {
    const { email, password } = await request.json()

    const supabase = await serverClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error;
    } else {
      console.log(data)
    }

    return NextResponse.json({
      message: "Signed in succcessfully"
    }, { status: 200 })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      message: "Internal Server Error: " + message
    }, { status: 500 })
  }

}
