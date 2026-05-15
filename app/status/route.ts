import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BOT_ID = "gold-sniper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const balance = searchParams.get("balance");

  if (balance !== null) {
    await supabaseAdmin.from("bot_status").upsert({
      id: BOT_ID,
      balance: Number(searchParams.get("balance") ?? 0),
      equity: Number(searchParams.get("equity") ?? 0),
      drawdown: Number(searchParams.get("drawdown") ?? 0),
      floating_pl: Number(searchParams.get("floating_pl") ?? 0),
      open_trades: Number(searchParams.get("open_trades") ?? 0),
      today_pl: Number(searchParams.get("today_pl") ?? 0),
      last_heartbeat: new Date().toISOString(),
    });
  }

  const { data, error } = await supabaseAdmin
    .from("bot_status")
    .select("*")
    .eq("id", BOT_ID)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}