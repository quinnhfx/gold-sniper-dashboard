import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BOT_ID = "gold-sniper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("reset_close_all") === "true") {
    await supabaseAdmin
      .from("bot_settings")
      .update({ close_all: false })
      .eq("id", BOT_ID);
  }

  if (searchParams.get("reset_force_test_trade") === "true") {
    await supabaseAdmin
      .from("bot_settings")
      .update({ force_test_trade: false })
      .eq("id", BOT_ID);
  }

  const { data, error } = await supabaseAdmin
    .from("bot_settings")
    .select("*")
    .eq("id", BOT_ID)
    .single();

  if (error || !data) {
    return NextResponse.json({
      lot_size: 0.01,
      stop_loss: 70,
      take_profit: 140,
      risk_percent: 1,
      allow_trading: true,
      close_all: false,
      force_test_trade: false,
    });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("bot_settings")
    .upsert({
      id: BOT_ID,
      ...body,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    settings: data,
  });
}