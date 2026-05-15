import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("bot_status")
      .select("*");

    if (error) {
      return NextResponse.json({
        supabase_error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    return NextResponse.json({
      crash: err.message,
    });
  }
}