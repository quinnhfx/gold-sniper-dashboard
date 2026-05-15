import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BOT_ID = "gold-sniper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const ticket = Number(searchParams.get("ticket") ?? 0);
  const eventType = searchParams.get("event_type") ?? "event";

  await supabaseAdmin.from("trade_events").insert({
    bot_id: BOT_ID,
    ticket,
    event_type: eventType,
    message: searchParams.get("message") ?? "",
    price: Number(searchParams.get("price") ?? 0),
    equity: Number(searchParams.get("equity") ?? 0),
    balance: Number(searchParams.get("balance") ?? 0),
  });

  return NextResponse.json({ success: true });
}