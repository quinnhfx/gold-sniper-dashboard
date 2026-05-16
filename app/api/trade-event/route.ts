import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BOT_ID = "gold-sniper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const ticket = searchParams.get("ticket");
  const eventType = searchParams.get("event_type");

  if (ticket || eventType) {
    const { error } = await supabaseAdmin.from("trade_events").insert({
      bot_id: BOT_ID,
      ticket: Number(ticket ?? 0),
      event_type: eventType ?? "event",
      message: searchParams.get("message") ?? "",
      price: Number(searchParams.get("price") ?? 0),
      equity: Number(searchParams.get("equity") ?? 0),
      balance: Number(searchParams.get("balance") ?? 0),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  const { data, error } = await supabaseAdmin
    .from("trade_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}