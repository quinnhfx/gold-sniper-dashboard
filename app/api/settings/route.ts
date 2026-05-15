import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BOT_ID = "gold-sniper";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("bot_status")
    .select("*")
    .eq("id", BOT_ID)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("bot_status")
    .update({
      balance: body.balance,
      equity: body.equity,
      drawdown: body.drawdown,
      floating_pl: body.floating_pl,
      open_trades: body.open_trades,
      today_pl: body.today_pl,
      last_heartbeat: new Date().toISOString(),
    })
    .eq("id", BOT_ID)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, status: data });
}