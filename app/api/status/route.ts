import { NextResponse } from "next/server";

let status = {
  balance: 0,
  equity: 0,
  drawdown: 0,
  floating_pl: 0,
  open_trades: 0,
  today_pl: 0,
  last_heartbeat: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json(status);
}

export async function POST(request: Request) {
  const body = await request.json();

  status = {
    ...status,
    ...body,
    last_heartbeat: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    status,
  });
}