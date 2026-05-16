import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BOT_ID = "gold-sniper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const incomingBalance = searchParams.get("balance");
  const incomingEquity = searchParams.get("equity");

  const balanceValue = Number(incomingBalance ?? 0);
  const equityValue = Number(incomingEquity ?? 0);

  // Only update Supabase if MT4 sends valid non-zero account values
  if (incomingBalance !== null && balanceValue > 0 && equityValue > 0) {
    await supabaseAdmin.from("bot_status").upsert({
      id: BOT_ID,
      balance: balanceValue,
      equity: equityValue,
      drawdown: Number(searchParams.get("drawdown") ?? 0),
      floating_pl: Number(searchParams.get("floating_pl") ?? 0),
      open_trades: Number(searchParams.get("open_trades") ?? 0),
      today_pl: Number(searchParams.get("today_pl") ?? 0),
      last_heartbeat: new Date().toISOString(),
    });
  }

  // Always return the last saved row
  const { data, error } = await supabaseAdmin
    .from("bot_status")
    .select("*")
    .eq("id", BOT_ID)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No bot status row found" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      balance: Number(data.balance ?? 0),
      equity: Number(data.equity ?? 0),
      drawdown: Number(data.drawdown ?? 0),
      floating_pl: Number(data.floating_pl ?? 0),
      open_trades: Number(data.open_trades ?? 0),
      today_pl: Number(data.today_pl ?? 0),
      last_heartbeat: data.last_heartbeat ?? null,
   },
   {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
     },
    }
  )}