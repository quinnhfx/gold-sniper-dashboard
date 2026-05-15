import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BOT_ID = "gold-sniper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "open") {
    const { error } = await supabaseAdmin.from("trade_history").upsert({
      bot_id: BOT_ID,
      ticket: Number(searchParams.get("ticket") ?? 0),
      symbol: searchParams.get("symbol"),
      direction: searchParams.get("direction"),
      lot_size: Number(searchParams.get("lot_size") ?? 0),
      entry_price: Number(searchParams.get("entry_price") ?? 0),
      stop_loss: Number(searchParams.get("stop_loss") ?? 0),
      take_profit: Number(searchParams.get("take_profit") ?? 0),
      session_name: searchParams.get("session_name"),
      strategy_preset: searchParams.get("strategy_preset"),
      analysis_timeframe: searchParams.get("analysis_timeframe"),
      entry_timeframe: searchParams.get("entry_timeframe"),
      sweep_pips: Number(searchParams.get("sweep_pips") ?? 0),
      confirmation_used: searchParams.get("confirmation_used") === "true",
      layered_trade: searchParams.get("layered_trade") === "true",
      opened_at: new Date().toISOString(),
      status: "open",
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  }

  if (action === "close") {
    const ticket = Number(searchParams.get("ticket") ?? 0);
    const profit = Number(searchParams.get("profit") ?? 0);

    const { error } = await supabaseAdmin
      .from("trade_history")
      .update({
        close_price: Number(searchParams.get("close_price") ?? 0),
        profit,
        total_pl: profit,
        closed_at: new Date().toISOString(),
        status: "closed",
      })
      .eq("ticket", ticket);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  }

  const { data, error } = await supabaseAdmin
    .from("trade_history")
    .select("*")
    .order("opened_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}