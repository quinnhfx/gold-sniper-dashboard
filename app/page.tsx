"use client";

import { useEffect, useState, type ReactNode } from "react";

type Settings = {
  lots_per_1000: number;
  stop_loss_pips: number;
  take_profit_pips: number;
  break_even_pips: number;
  max_trades_per_day: number;
  max_open_trades: number;
  use_session_filter: boolean;
  use_dxy_filter: boolean;
  use_trendline_filter: boolean;
  pause_trading: boolean;
  close_all: boolean;
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
  use_session_filter: true,
  use_dxy_filter: true,
  use_trendline_filter: true,
  pause_trading: false,
  close_all: false,
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
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      const [settingsRes, statusRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/status"),
      ]);

      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (statusRes.ok) setStatus(await statusRes.json());
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

      if (!res.ok) {
        alert("Failed to save settings");
        return;
      }

      const data = await res.json();
      setSettings(data.settings ?? nextSettings);
      alert("Settings saved");
    } catch {
      alert("API not connected yet");
    } finally {
      setSaving(false);
    }
  }

  const heartbeatAge = status.last_heartbeat
    ? Math.round((Date.now() - new Date(status.last_heartbeat).getTime()) / 1000)
    : null;

  const botOnline = heartbeatAge !== null && heartbeatAge < 20;

  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#164e63_0%,transparent_35%),radial-gradient(circle_at_top_right,#1e1b4b_0%,transparent_30%)] opacity-60" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-72 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:block">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
            Gold Sniper
          </p>
          <h1 className="mt-3 text-2xl font-bold">AI Control</h1>

          <nav className="mt-10 space-y-2 text-sm">
            {["Dashboard", "Risk Engine", "Strategy", "Sessions", "Logs"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl px-4 py-3 text-slate-300 hover:bg-white/10"
                >
                  {item}
                </div>
              )
            )}
          </nav>

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
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
                  XAUUSD Sniper Portal
                </p>
                <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
                  Gold AI Command Centre
                </h2>
                <p className="mt-3 max-w-2xl text-slate-400">
                  Real-time account monitoring, risk control and live strategy
                  management for the gold sniper execution engine.
                </p>
              </div>

              <div
                className={`rounded-full border px-5 py-3 text-sm font-bold ${
                  settings.pause_trading
                    ? "border-orange-400/40 bg-orange-400/10 text-orange-300"
                    : "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                }`}
              >
                {settings.pause_trading ? "TRADING PAUSED" : "LIVE EXECUTION"}
              </div>
            </div>
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
              danger={status.equity < status.balance}
            />
            <Metric
              label="Drawdown"
              value={`${Number(status.drawdown).toFixed(2)}%`}
              sub="Current equity DD"
              danger={status.drawdown > 0}
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
                <div className="flex h-full items-end gap-3">
                  {[35, 42, 38, 55, 48, 63, 70, 62, 78, 88, 81, 92].map(
                    (h, i) => (
                      <div key={i} className="flex flex-1 items-end">
                        <div
                          className="w-full rounded-t-xl bg-gradient-to-t from-cyan-500 to-emerald-300"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </Panel>

            <Panel title="Execution State">
              <Status label="Symbol" value="XAUUSD" />
              <Status label="Server Time" value="GMT+1" />
              <Status label="USDX Feed" value="Pending" />
              <Status label="Mode" value="Liquidity Sweep" />
              <Status
                label="Daily P/L"
                value={`£${Number(status.today_pl).toFixed(2)}`}
                good={status.today_pl >= 0}
              />
            </Panel>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <Panel title="Risk Parameters">
              <Field
                label="Lots / £1000"
                value={settings.lots_per_1000}
                onChange={(v) =>
                  setSettings({ ...settings, lots_per_1000: v })
                }
              />
              <Field
                label="Stop Loss"
                value={settings.stop_loss_pips}
                suffix="pips"
                onChange={(v) =>
                  setSettings({ ...settings, stop_loss_pips: v })
                }
              />
              <Field
                label="Take Profit"
                value={settings.take_profit_pips}
                suffix="pips"
                onChange={(v) =>
                  setSettings({ ...settings, take_profit_pips: v })
                }
              />
              <Field
                label="Break Even"
                value={settings.break_even_pips}
                suffix="pips"
                onChange={(v) =>
                  setSettings({ ...settings, break_even_pips: v })
                }
              />
              <Field
                label="Max Trades"
                value={settings.max_trades_per_day}
                suffix="/ day"
                onChange={(v) =>
                  setSettings({ ...settings, max_trades_per_day: v })
                }
              />
            </Panel>

            <Panel title="Strategy Filters">
              <Toggle
                label="Asia + London Sessions"
                checked={settings.use_session_filter}
                onChange={(v) =>
                  setSettings({ ...settings, use_session_filter: v })
                }
              />
              <Toggle
                label="USDX M30 Invalidation"
                checked={settings.use_dxy_filter}
                onChange={(v) =>
                  setSettings({ ...settings, use_dxy_filter: v })
                }
              />
              <Toggle
                label="Auto Trendline Touch"
                checked={settings.use_trendline_filter}
                onChange={(v) =>
                  setSettings({ ...settings, use_trendline_filter: v })
                }
              />
              <Toggle label="Liquidity Sweep Required" checked locked />
              <Toggle label="Candle Rejection Required" checked locked />
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
                {settings.pause_trading ? "Resume Trading" : "Pause New Trades"}
              </button>

              <button
                onClick={() => {
                  if (!confirm("Emergency close all trades?")) return;
                  const next = { ...settings, close_all: true };
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
  danger,
}: {
  label: string;
  value: string;
  sub: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <p className="text-sm text-slate-400">{label}</p>
      <h3
        className={`mt-3 text-3xl font-bold ${
          danger ? "text-red-300" : "text-white"
        }`}
      >
        {value}
      </h3>
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
      <span className={good ? "text-emerald-300" : "text-white"}>{value}</span>
    </div>
  );
}

function Field({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center justify-between border-b border-white/10 py-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-right text-white outline-none focus:border-cyan-400"
        />
        {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
      </div>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  locked,
}: {
  label: string;
  checked: boolean;
  onChange?: (v: boolean) => void;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <button
        disabled={locked}
        onClick={() => onChange?.(!checked)}
        className={`rounded-full px-4 py-1 text-xs font-bold ${
          checked ? "bg-emerald-400 text-black" : "bg-slate-700 text-slate-300"
        } ${locked ? "opacity-60" : ""}`}
      >
        {checked ? "ON" : "OFF"}
      </button>
    </div>
  );
}