"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Settings = {
  lots_per_1000: number;
  stop_loss_pips: number;
  take_profit_pips: number;
  break_even_pips: number;
  max_trades_per_day: number;
  max_open_trades: number;

  max_daily_dd: number;
  max_floating_dd: number;
  max_loss_streak: number;

  lookback_bars: number;
  min_sweep_pips: number;
  max_sweep_pips: number;
  min_candle_body_pips: number;

  use_candle_confirmation: boolean;
  use_session_filter: boolean;
  use_dxy_filter: boolean;
  use_trendline_filter: boolean;

  allow_buys: boolean;
  allow_sells: boolean;

  risk_lock: boolean;
  pause_trading: boolean;
  close_all: boolean;
  force_test_trade: boolean;
};

type BotStatus = {
  balance: number;
  equity: number;
  drawdown: number;
  floating_pl: number;
  open_trades: number;
  today_pl: number;
  last_heartbeat: string;
};

const defaultSettings: Settings = {
  lots_per_1000: 0.01,
  stop_loss_pips: 70,
  take_profit_pips: 70,
  break_even_pips: 40,

  max_trades_per_day: 15,
  max_open_trades: 1,

  max_daily_dd: 5,
  max_floating_dd: 8,
  max_loss_streak: 3,

  lookback_bars: 32,
  min_sweep_pips: 10,
  max_sweep_pips: 60,
  min_candle_body_pips: 0,

  use_candle_confirmation: true,
  use_session_filter: true,
  use_dxy_filter: true,
  use_trendline_filter: true,

  allow_buys: true,
  allow_sells: true,

  risk_lock: false,
  pause_trading: false,
  close_all: false,
  force_test_trade: false,
};

const defaultStatus: BotStatus = {
  balance: 0,
  equity: 0,
  drawdown: 0,
  floating_pl: 0,
  open_trades: 0,
  today_pl: 0,
  last_heartbeat: "",
};

export default function Home() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [status, setStatus] = useState<BotStatus>(defaultStatus);
  const [equityCurve, setEquityCurve] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      const [settingsRes, statusRes, equityRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/status"),
        fetch("/api/equity"),
      ]);

      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (statusRes.ok) setStatus(await statusRes.json());
      if (equityRes.ok) setEquityCurve(await equityRes.json());
    } catch {
      console.log("Waiting for API connection...");
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, []);

  async function saveSettings(nextSettings = settings) {
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextSettings),
      });

      const data = await res.json();

      setSettings(data.settings ?? nextSettings);
    } finally {
      setSaving(false);
    }
  }

  const heartbeatAge = status.last_heartbeat
    ? Math.round(
        (Date.now() - new Date(status.last_heartbeat).getTime()) / 1000
      )
    : null;

  const botOnline = heartbeatAge !== null && heartbeatAge < 20;

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <div className="relative mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-72 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:block">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
            Gold Sniper
          </p>

          <h1 className="mt-3 text-2xl font-bold">AI Control</h1>

          <div className="mt-10 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
            <p className="text-sm text-cyan-200">Bot Status</p>

            <p
              className={`mt-2 text-2xl font-bold ${
                botOnline ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {botOnline ? "ONLINE" : "OFFLINE"}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Last heartbeat:{" "}
              {heartbeatAge === null ? "never" : `${heartbeatAge}s ago`}
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
              XAUUSD Sniper Portal
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
              Gold AI Command Centre
            </h2>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Balance"
              value={`£${Number(status.balance).toFixed(2)}`}
              sub="Live from MT4"
            />

            <Metric
              label="Equity"
              value={`£${Number(status.equity).toFixed(2)}`}
              sub="Floating included"
            />

            <Metric
              label="Drawdown"
              value={`${Number(status.drawdown).toFixed(2)}%`}
              sub="Current equity DD"
            />

            <Metric
              label="Open Trades"
              value={`${status.open_trades}`}
              sub="XAUUSD only"
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <Panel title="Live Equity Curve" wide>
              <div className="h-64 rounded-3xl border border-white/10 bg-[#020617] p-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={equityCurve}>
                    <XAxis dataKey="created_at" hide />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="equity"
                      stroke="#22d3ee"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Execution State">
              <Status label="Symbol" value="XAUUSD" />
              <Status label="Server Time" value="GMT+1" />
              <Status label="USDX Feed" value="Connected" good />
              <Status
                label="Daily P/L"
                value={`£${Number(status.today_pl).toFixed(2)}`}
              />
            </Panel>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <Panel title="Risk Parameters">
              <Field
                label="Lots / £1000"
                value={settings.lots_per_1000}
                step={0.01}
                onChange={(v) =>
                  setSettings({ ...settings, lots_per_1000: v })
                }
              />

              <Field
                label="Stop Loss"
                value={settings.stop_loss_pips}
                step={10}
                suffix="pips"
                onChange={(v) =>
                  setSettings({ ...settings, stop_loss_pips: v })
                }
              />

              <Field
                label="Take Profit"
                value={settings.take_profit_pips}
                step={10}
                suffix="pips"
                onChange={(v) =>
                  setSettings({ ...settings, take_profit_pips: v })
                }
              />

              <Field
                label="Break Even"
                value={settings.break_even_pips}
                step={5}
                suffix="pips"
                onChange={(v) =>
                  setSettings({ ...settings, break_even_pips: v })
                }
              />

              <Field
                label="Max Trades"
                value={settings.max_trades_per_day}
                step={1}
                onChange={(v) =>
                  setSettings({ ...settings, max_trades_per_day: v })
                }
              />

              <Field
                label="Max Daily DD"
                value={settings.max_daily_dd}
                step={1}
                suffix="%"
                onChange={(v) =>
                  setSettings({ ...settings, max_daily_dd: v })
                }
              />

              <Field
                label="Max Floating DD"
                value={settings.max_floating_dd}
                step={1}
                suffix="%"
                onChange={(v) =>
                  setSettings({ ...settings, max_floating_dd: v })
                }
              />

              <Field
                label="Max Loss Streak"
                value={settings.max_loss_streak}
                step={1}
                onChange={(v) =>
                  setSettings({ ...settings, max_loss_streak: v })
                }
              />
            </Panel>

            <Panel title="Strategy Tuning">
              <Field
                label="Lookback Bars"
                value={settings.lookback_bars}
                step={1}
                onChange={(v) =>
                  setSettings({ ...settings, lookback_bars: v })
                }
              />

              <Field
                label="Min Sweep"
                value={settings.min_sweep_pips}
                step={1}
                suffix="pips"
                onChange={(v) =>
                  setSettings({ ...settings, min_sweep_pips: v })
                }
              />

              <Field
                label="Max Sweep"
                value={settings.max_sweep_pips}
                step={1}
                suffix="pips"
                onChange={(v) =>
                  setSettings({ ...settings, max_sweep_pips: v })
                }
              />

              <Field
                label="Min Candle Body"
                value={settings.min_candle_body_pips}
                step={1}
                suffix="pips"
                onChange={(v) =>
                  setSettings({
                    ...settings,
                    min_candle_body_pips: v,
                  })
                }
              />

              <Toggle
                label="Use Candle Confirmation"
                checked={settings.use_candle_confirmation}
                onChange={(v) =>
                  setSettings({
                    ...settings,
                    use_candle_confirmation: v,
                  })
                }
              />

              <Toggle
                label="Allow Buys"
                checked={settings.allow_buys}
                onChange={(v) =>
                  setSettings({
                    ...settings,
                    allow_buys: v,
                  })
                }
              />

              <Toggle
                label="Allow Sells"
                checked={settings.allow_sells}
                onChange={(v) =>
                  setSettings({
                    ...settings,
                    allow_sells: v,
                  })
                }
              />
            </Panel>

            <Panel title="Control Panel">
              <button
                onClick={() => {
                  const next = {
                    ...settings,
                    pause_trading: !settings.pause_trading,
                  };

                  setSettings(next);
                  saveSettings(next);
                }}
                className={`mb-3 w-full rounded-2xl px-5 py-4 font-bold ${
                  settings.pause_trading
                    ? "bg-emerald-400 text-black"
                    : "bg-orange-500 text-white"
                }`}
              >
                {settings.pause_trading
                  ? "Resume Trading"
                  : "Pause New Trades"}
              </button>

              <button
                onClick={() => {
                  const next = {
                    ...settings,
                    close_all: true,
                  };

                  setSettings(next);
                  saveSettings(next);
                }}
                className="mb-3 w-full rounded-2xl bg-red-600 px-5 py-4 font-bold text-white"
              >
                Emergency Close All
              </button>

              <button
                onClick={() => saveSettings()}
                className="w-full rounded-2xl bg-cyan-400 px-5 py-4 font-bold text-black"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>

              <button
                onClick={() => {
                  const next = {
                    ...settings,
                    force_test_trade: true,
                  };

                  setSettings(next);
                  saveSettings(next);
                }}
                className="mt-3 w-full rounded-2xl bg-purple-500 px-5 py-4 font-bold text-white"
              >
                Force Test Trade
              </button>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <p className="text-sm text-slate-400">{label}</p>

      <h3 className="mt-3 text-3xl font-bold text-white">{value}</h3>

      <p className="mt-2 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function Panel({
  title,
  children,
  wide,
}: {
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl ${
        wide ? "xl:col-span-2" : ""
      }`}
    >
      <h3 className="mb-5 text-xl font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Status({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="flex justify-between border-b border-white/10 py-3 text-sm">
      <span className="text-slate-400">{label}</span>

      <span className={good ? "text-emerald-300" : "text-white"}>
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  value,
  suffix,
  step,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center justify-between border-b border-white/10 py-3 text-sm">
      <span className="text-slate-400">{label}</span>

      <div className="flex items-center gap-2">
        <input
          type="number"
          step={step ?? 1}
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-right text-white outline-none focus:border-cyan-400"
        />

        {suffix && (
          <span className="text-xs text-slate-500">{suffix}</span>
        )}
      </div>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between border-b border-white/10 py-3 text-sm">
      <span className="text-slate-400">{label}</span>

      <button
        onClick={() => onChange(!checked)}
        className={`rounded-xl px-3 py-1 text-xs font-bold ${
          checked
            ? "bg-emerald-400 text-black"
            : "bg-red-500 text-white"
        }`}
      >
        {checked ? "ON" : "OFF"}
      </button>
    </label>
  );
}