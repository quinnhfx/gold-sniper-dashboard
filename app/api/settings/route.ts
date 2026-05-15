import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BOT_ID = "gold-sniper";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("bot_settings")
    .select("*")
    .eq("id", BOT_ID)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("bot_settings")
    .upsert({
      id: BOT_ID,
      lots_per_1000: body.lots_per_1000,
      stop_loss_pips: body.stop_loss_pips,
      take_profit_pips: body.take_profit_pips,
      break_even_pips: body.break_even_pips,
      max_trades_per_day: body.max_trades_per_day,
      max_open_trades: body.max_open_trades,
      use_session_filter: body.use_session_filter,
      use_dxy_filter: body.use_dxy_filter,
      use_trendline_filter: body.use_trendline_filter,
      pause_trading: body.pause_trading,
      close_all: body.close_all,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, settings: data });
}