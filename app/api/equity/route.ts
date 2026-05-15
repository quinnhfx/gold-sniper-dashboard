import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BOT_ID = "gold-sniper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const equity = searchParams.get("equity");

  if (equity !== null) {
    await supabaseAdmin.from("equity_curve").insert({
      bot_id: BOT_ID,
      balance: Number(searchParams.get("balance") ?? 0),
      equity: Number(searchParams.get("equity") ?? 0),
      drawdown: Number(searchParams.get("drawdown") ?? 0),
      floating_pl: Number(searchParams.get("floating_pl") ?? 0),
    });
  }

  const { data, error } = await supabaseAdmin
    .from("equity_curve")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}