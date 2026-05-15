import { NextResponse } from "next/server";

let settings = {
  lotsPer1000: "0.01",
  stopLoss: "70",
  takeProfit: "70",
  breakEven: "40",
  maxTrades: "15",
  sessionFilter: true,
  dxyFilter: true,
  trendlineFilter: true,
  pauseTrading: false,
  closeAll: false,
};

export async function GET() {
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const body = await request.json();

  settings = {
    ...settings,
    ...body,
  };

  return NextResponse.json({
    success: true,
    settings,
  });
}