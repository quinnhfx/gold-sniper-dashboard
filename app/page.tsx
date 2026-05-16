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

type Tab = "dashboard" | "strategy" | "risk" | "replay" | "logs";

type LogEvent = {
  id: number;
  ticket: number;
  event_type: string;
  message: string;
  price: number;
  equity: number;
  balance: number;
  created_at: string;
};

type Trade = {
  id: number;
  ticket: number;
  symbol: string;
  direction: string;
  lot_size: number;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  close_price: number | null;
  profit: number;
  total_pl: number;
  session_name: string;
  strategy_preset: string;
  analysis_timeframe: string;
  entry_timeframe: string;
  sweep_pips: number;
  confirmation_used: boolean;
  layered_trade: boolean;
  opened_at: string;
  closed_at: string | null;
  status: string;
};

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
  risk_lock: boolean;

  lookback_bars: number;
  min_sweep_pips: number;
  max_sweep_pips: number;
  min_candle_body_pips: number;

  use_asia_session: boolean;
  use_london_session: boolean;
  use_newyork_session: boolean;

  analysis_timeframe: string;
  entry_timeframe: string;

  use_candle_confirmation: boolean;
  use_session_filter: boolean;
  use_dxy_filter: boolean;
  use_trendline_filter: boolean;
  use_breakout_retest: boolean;
  use_structure_invalidation: boolean;

  invalidation_pips: number;
  max_spread_points: number;
  trade_cooldown_minutes: number;

  use_layering: boolean;
  layer_distance_pips: number;
  max_layers: number;
  layer_multiplier: number;

  strategy_preset: string;

  resistance_zone: number;
  support_zone: number;

  allow_buys: boolean;
  allow_sells: boolean;

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
  risk_lock: false,

  lookback_bars: 32,
  min_sweep_pips: 10,
  max_sweep_pips: 60,
  min_candle_body_pips: 0,

  use_asia_session: true,
  use_london_session: true,
  use_newyork_session: false,

  analysis_timeframe: "M15",
  entry_timeframe: "M15",

  use_candle_confirmation: true,
  use_session_filter: true,
  use_dxy_filter: true,
  use_trendline_filter: true,
  use_breakout_retest: false,
  use_structure_invalidation: false,

  invalidation_pips: 80,
  max_spread_points: 100,
  trade_cooldown_minutes: 15,

  use_layering: false,
  layer_distance_pips: 50,
  max_layers: 1,
  layer_multiplier: 1,

  strategy_preset: "balanced",

  resistance_zone: 0,
  support_zone: 0,

  allow_buys: true,
  allow_sells: true,

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
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [status, setStatus] = useState<BotStatus>(defaultStatus);
  const [equityCurve, setEquityCurve] = useState<any[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [dirty, setDirty] = useState(false);

  async function loadData() {
    try {
      const settingsRes = await fetch(`/api/settings?t=${Date.now()}`, {
        cache: "no-store",
      });

      const statusRes = await fetch(`/api/status?t=${Date.now()}`, {
        cache: "no-store",
      });


      const equityRes = await fetch(`/api/equity?t=${Date.now()}`, {
        cache: "no-store",
      });

      const tradesRes = await fetch(`/api/trades?t=${Date.now()}`, {
        cache: "no-store",
      });

      const logsRes = await fetch(`/api/trade-event?t=${Date.now()}`, {
        cache: "no-store",
      });

      if (settingsRes.ok && !dirty) {
        const data = await settingsRes.json();
        setSettings({ ...defaultSettings, ...data });
      }

      if (logsRes.ok) {
        const logData = await logsRes.json();
        setLogs(Array.isArray(logData) ? logData : []);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();

        setStatus({
          balance: Number(statusData.balance ?? 0),
          equity: Number(statusData.equity ?? 0),
          drawdown: Number(statusData.drawdown ?? 0),
          floating_pl: Number(statusData.floating_pl ?? 0),
          open_trades: Number(statusData.open_trades ?? 0),
          today_pl: Number(statusData.today_pl ?? 0),
          last_heartbeat: statusData.last_heartbeat ?? "",
        });
      }

      if (equityRes.ok) {
        const equityData = await equityRes.json();
        setEquityCurve(Array.isArray(equityData) ? equityData : []);
      }

      if (tradesRes.ok) {
        const tradeData = await tradesRes.json();
        setTrades(Array.isArray(tradeData) ? tradeData : []);
      }
      if (logsRes.ok) {
        const logData = await logsRes.json();
        setLogs(Array.isArray(logData) ? logData : []);
      }
    } catch (error) {
      console.log("Dashboard load error:", error);
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
      setSettings({ ...defaultSettings, ...(data.settings ?? nextSettings) });
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

          <nav className="mt-10 space-y-2 text-sm">
            <SidebarButton
              label="Dashboard"
              active={activeTab === "dashboard"}
              onClick={() => setActiveTab("dashboard")}
            
            />
            <SidebarButton
              label="Replay Lab"
              active={activeTab === "replay"}
              onClick={() => setActiveTab("replay")}
            />

            <SidebarButton
              label="Strategy Tuning"
              active={activeTab === "strategy"}
              onClick={() => setActiveTab("strategy")}
            />
            <SidebarButton
              label="Risk Engine"
              active={activeTab === "risk"}
              onClick={() => setActiveTab("risk")}
            />
            <SidebarButton
              label="Logs"
              active={activeTab === "logs"}
              onClick={() => setActiveTab("logs")}
            />
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
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
              XAUUSD Sniper Portal
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
              {activeTab === "dashboard" && "Gold AI Command Centre"}
              {activeTab === "strategy" && "Strategy Tuning Lab"}
              {activeTab === "risk" && "Risk Engine"}
              {activeTab === "logs" && "Activity Logs"}
              {activeTab === "replay" && "Trade Replay Lab"}
            </h2>
          </header>

          {activeTab === "dashboard" && (
            <DashboardTab
              status={status}
              equityCurve={equityCurve}
              settings={settings}
              setSettings={setSettings}
              saveSettings={saveSettings}
              saving={saving}
            />
          )}

          {activeTab === "strategy" && (
            <StrategyTab
              settings={settings}
              setSettings={setSettings}
              saveSettings={saveSettings}
              saving={saving}
            />
          )}

          {activeTab === "risk" && (
            <RiskTab
              settings={settings}
              setSettings={setSettings}
              saveSettings={saveSettings}
              saving={saving}
            />
          )}

          {activeTab === "logs" && <LogsTab logs={logs} />}
          {activeTab === "replay" && <ReplayTab trades={trades} />}
        </section>
      </div>
    </main>
  );
}

function DashboardTab({
  status,
  equityCurve,
  settings,
  setSettings,
  saveSettings,
  saving,
}: {
  status: BotStatus;
  equityCurve: any[];
  settings: Settings;
  setSettings: (v: Settings) => void;
  saveSettings: (v?: Settings) => void;
  saving: boolean;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Balance"
          value={`£${Number(status.balance ?? 0).toFixed(2)}`}
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
        <Panel title="Core Risk">
          <Field
            label="Lots / £1000"
            value={settings.lots_per_1000}
            step={0.01}
            onChange={(v) => setSettings({ ...settings, lots_per_1000: v })}
          />

          <Field
            label="Stop Loss"
            value={settings.stop_loss_pips}
            step={10}
            suffix="pips"
            onChange={(v) => setSettings({ ...settings, stop_loss_pips: v })}
          />

          <Field
            label="Take Profit"
            value={settings.take_profit_pips}
            step={10}
            suffix="pips"
            onChange={(v) => setSettings({ ...settings, take_profit_pips: v })}
          />

          <Field
            label="Break Even"
            value={settings.break_even_pips}
            step={5}
            suffix="pips"
            onChange={(v) => setSettings({ ...settings, break_even_pips: v })}
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
            {settings.pause_trading ? "Resume Trading" : "Pause New Trades"}
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
    </>
  );
}

function StrategyTab({
  settings,
  setSettings,
  saveSettings,
  saving,
}: {
  settings: Settings;
  setSettings: (v: Settings) => void;
  saveSettings: (v?: Settings) => void;
  saving: boolean;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Panel title="Session Selection">
        <Toggle
          label="Asia Session"
          checked={settings.use_asia_session}
          onChange={(v) => {
            setSettings({ ...settings, use_asia_session: v });
          }}
        />
        <p className="mb-3 text-xs text-slate-500">23:00 - 07:00 GMT</p>

        <Toggle
          label="London Session"
          checked={settings.use_london_session}
          onChange={(v) => setSettings({ ...settings, use_london_session: v })}
        />
        <p className="mb-3 text-xs text-slate-500">08:00 - 11:00 GMT</p>

        <Toggle
          label="New York Session"
          checked={settings.use_newyork_session}
          onChange={(v) => setSettings({ ...settings, use_newyork_session: v })}
        />
        <p className="mb-3 text-xs text-slate-500">13:00 - 21:00 GMT</p>

        <Toggle
          label="Use Session Filter"
          checked={settings.use_session_filter}
          onChange={(v) => setSettings({ ...settings, use_session_filter: v })}
        />
      </Panel>

      <Panel title="Zone Detection">
        <AlertBox
          title="Resistance Zone Detected"
          value={
            Number(settings.resistance_zone) > 0
              ? `@ ${Number(settings.resistance_zone).toFixed(2)}`
              : "Waiting for EA..."
          }
        />

        <AlertBox
          title="Support Zone Detected"
          value={
            Number(settings.support_zone) > 0
              ? `@ ${Number(settings.support_zone).toFixed(2)}`
              : "Waiting for EA..."
          }
        />

        <Field
          label="Lookback Bars"
          value={settings.lookback_bars}
          step={1}
          onChange={(v) => setSettings({ ...settings, lookback_bars: v })}
        />
      </Panel>

      <Panel title="Liquidity Grab Settings">
        <Field
          label="Minimum Grab"
          value={settings.min_sweep_pips}
          step={1}
          suffix="pips"
          onChange={(v) => setSettings({ ...settings, min_sweep_pips: v })}
        />

        <Field
          label="Maximum Grab"
          value={settings.max_sweep_pips}
          step={1}
          suffix="pips"
          onChange={(v) => setSettings({ ...settings, max_sweep_pips: v })}
        />

        <Field
          label="Min Candle Body"
          value={settings.min_candle_body_pips}
          step={1}
          suffix="pips"
          onChange={(v) =>
            setSettings({ ...settings, min_candle_body_pips: v })
          }
        />

        <Toggle
          label="Wait For Confirmation Candle"
          checked={settings.use_candle_confirmation}
          onChange={(v) =>
            setSettings({ ...settings, use_candle_confirmation: v })
          }
        />
      </Panel>

      <Panel title="Timeframe Control">
        <SelectField
          label="Analysis Timeframe"
          value={settings.analysis_timeframe}
          options={["M1", "M5", "M15", "M30", "H1", "H4"]}
          onChange={(v) => setSettings({ ...settings, analysis_timeframe: v })}
        />

        <SelectField
          label="Entry Timeframe"
          value={settings.entry_timeframe}
          options={["M1", "M5", "M15", "M30", "H1"]}
          onChange={(v) => setSettings({ ...settings, entry_timeframe: v })}
        />
      </Panel>

      <Panel title="Filters & Direction">
        <Toggle
          label="Allow Buys"
          checked={settings.allow_buys}
          onChange={(v) => setSettings({ ...settings, allow_buys: v })}
        />

        <Toggle
          label="Allow Sells"
          checked={settings.allow_sells}
          onChange={(v) => setSettings({ ...settings, allow_sells: v })}
        />

        <Toggle
          label="DXY Filter"
          checked={settings.use_dxy_filter}
          onChange={(v) => setSettings({ ...settings, use_dxy_filter: v })}
        />

        <Toggle
          label="Trendline Touch Filter"
          checked={settings.use_trendline_filter}
          onChange={(v) =>
            setSettings({ ...settings, use_trendline_filter: v })
          }
        />

        <Toggle
          label="Breakout Retest Required"
          checked={settings.use_breakout_retest}
          onChange={(v) =>
            setSettings({ ...settings, use_breakout_retest: v })
          }
        />
      </Panel>

      <Panel title="Layering Controls">
        <Toggle
          label="Enable Layering"
          checked={settings.use_layering}
          onChange={(v) => setSettings({ ...settings, use_layering: v })}
        />

        {settings.use_layering && (
          <>
            <Field
              label="Layer Distance"
              value={settings.layer_distance_pips}
              step={5}
              suffix="pips"
              onChange={(v) =>
                setSettings({ ...settings, layer_distance_pips: v })
              }
            />

            <Field
              label="Max Layers"
              value={settings.max_layers}
              step={1}
              onChange={(v) => setSettings({ ...settings, max_layers: v })}
            />

            <Field
              label="Layer Multiplier"
              value={settings.layer_multiplier}
              step={0.1}
              onChange={(v) =>
                setSettings({ ...settings, layer_multiplier: v })
              }
            />
          </>
        )}
      </Panel>

      <Panel title="Invalidation & Execution">
        <Toggle
          label="Structure Invalidation"
          checked={settings.use_structure_invalidation}
          onChange={(v) =>
            setSettings({ ...settings, use_structure_invalidation: v })
          }
        />

        <Field
          label="Invalidation Distance"
          value={settings.invalidation_pips}
          step={10}
          suffix="pips"
          onChange={(v) => setSettings({ ...settings, invalidation_pips: v })}
        />

        <Field
          label="Max Spread"
          value={settings.max_spread_points}
          step={10}
          suffix="points"
          onChange={(v) => setSettings({ ...settings, max_spread_points: v })}
        />

        <Field
          label="Cooldown"
          value={settings.trade_cooldown_minutes}
          step={5}
          suffix="mins"
          onChange={(v) =>
            setSettings({ ...settings, trade_cooldown_minutes: v })
          }
        />
      </Panel>

      <Panel title="Strategy Preset">
        <SelectField
          label="Preset"
          value={settings.strategy_preset}
          options={["aggressive", "balanced", "strict"]}
          onChange={(v) => setSettings({ ...settings, strategy_preset: v })}
        />

        <button
          onClick={() => saveSettings()}
          className="mt-5 w-full rounded-2xl bg-cyan-400 px-5 py-4 font-bold text-black"
        >
          {saving ? "Saving..." : "Save Strategy Settings"}
        </button>
      </Panel>
    </div>
  );
}

function RiskTab({
  settings,
  setSettings,
  saveSettings,
  saving,
}: {
  settings: Settings;
  setSettings: (v: Settings) => void;
  saveSettings: (v?: Settings) => void;
  saving: boolean;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Panel title="Risk Engine">
        <Field
          label="Max Daily DD"
          value={settings.max_daily_dd}
          step={1}
          suffix="%"
          onChange={(v) => setSettings({ ...settings, max_daily_dd: v })}
        />

        <Field
          label="Max Floating DD"
          value={settings.max_floating_dd}
          step={1}
          suffix="%"
          onChange={(v) => setSettings({ ...settings, max_floating_dd: v })}
        />

        <Field
          label="Max Loss Streak"
          value={settings.max_loss_streak}
          step={1}
          onChange={(v) => setSettings({ ...settings, max_loss_streak: v })}
        />

        <button
          onClick={() => saveSettings()}
          className="mt-5 w-full rounded-2xl bg-cyan-400 px-5 py-4 font-bold text-black"
        >
          {saving ? "Saving..." : "Save Risk Settings"}
        </button>
      </Panel>
    </div>
  );
}

function LogsTab({ logs }: { logs: LogEvent[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric
          label="Total Events"
          value={`${logs.length}`}
          sub="Latest 100 journal logs"
        />

        <Metric
          label="Trade Opens"
          value={`${logs.filter((l) => l.event_type === "OPEN").length}`}
          sub="EA open events"
        />

        <Metric
          label="Trade Closes"
          value={`${logs.filter((l) => l.event_type === "CLOSE").length}`}
          sub="EA close events"
        />
      </div>

      <Panel title="Trade Journal / Activity Log">
        <div className="space-y-3">
          {logs.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              No activity logged yet. New EA actions will appear here.
            </p>
          )}

          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl border border-white/10 bg-[#020617] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
                    {log.event_type}
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-white">
                    {log.message || "EA event"}
                  </h3>
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                  Ticket #{log.ticket || "-"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
                <MiniStat label="Price" value={Number(log.price ?? 0).toFixed(2)} />
                <MiniStat label="Equity" value={`£${Number(log.equity ?? 0).toFixed(2)}`} />
                <MiniStat label="Balance" value={`£${Number(log.balance ?? 0).toFixed(2)}`} />
                <MiniStat
                  label="Time"
                  value={
                    log.created_at
                      ? new Date(
                          new Date(log.created_at).getTime() - 60 * 60 * 1000
                        ).toLocaleString("en-GB", {
                          hour12: false,
                        })
                      : "-"
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-bold text-white">{value}</p>
    </div>
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

function SidebarButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl px-4 py-3 text-left transition ${
        active
          ? "bg-cyan-400 text-black"
          : "text-slate-300 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
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
          className="w-24 rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-right text-white outline-none focus:border-cyan-400"
        />

        {suffix && (
          <span className="text-xs text-slate-500">
            {suffix}
          </span>
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
    <div className="flex items-center justify-between border-b border-white/10 py-3 text-sm">
      <span className="text-slate-400">{label}</span>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`rounded-xl px-3 py-1 text-xs font-bold ${
          checked
            ? "bg-emerald-400 text-black"
            : "bg-red-500 text-white"
        }`}
      >
        {checked ? "ON" : "OFF"}
      </button>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between border-b border-white/10 py-3 text-sm">
      <span className="text-slate-400">{label}</span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/10 bg-[#020617] px-3 py-2 text-white outline-none focus:border-cyan-400"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className="bg-[#020617]"
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function AlertBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
function ReplayTab({ trades }: { trades: Trade[] }) {
  const totalTrades = trades.length;

  const closedTrades =
    trades.filter((t) => t.status === "closed");

  const wins =
    closedTrades.filter(
      (t) => Number(t.total_pl ?? 0) > 0
    ).length;

  const losses =
    closedTrades.filter(
      (t) => Number(t.total_pl ?? 0) < 0
    ).length;

  const netPL =
    closedTrades.reduce(
      (sum, t) => sum + Number(t.total_pl ?? 0),
      0
    );

  const winRate =
    closedTrades.length > 0
      ? (wins / closedTrades.length) * 100
      : 0;

  return (
    <div className="space-y-6">

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        <Metric
          label="Logged Trades"
          value={`${totalTrades}`}
          sub="Stored in Supabase"
        />

        <Metric
          label="Closed Trades"
          value={`${closedTrades.length}`}
          sub={`${wins} wins / ${losses} losses`}
        />

        <Metric
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          sub="Closed trades only"
        />

        <Metric
          label="Net P/L"
          value={`£${netPL.toFixed(2)}`}
          sub="Closed EA trades"
        />

      </div>

      <Panel title="Trade Replay / Backtest Log">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px] text-left text-sm">

            <thead className="text-xs uppercase tracking-wider text-slate-500">

              <tr>
                <th className="pb-3">Ticket</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Direction</th>
                <th className="pb-3">Lots</th>
                <th className="pb-3">Entry</th>
                <th className="pb-3">Close</th>
                <th className="pb-3">P/L</th>
                <th className="pb-3">Session</th>
                <th className="pb-3">Preset</th>
                <th className="pb-3">TF</th>
                <th className="pb-3">Opened</th>
              </tr>

            </thead>

            <tbody>

              {trades.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="py-8 text-center text-slate-500"
                  >
                    No logged trades yet.
                  </td>
                </tr>
              )}

              {trades.map((trade) => {

                const pl =
                  Number(
                    trade.total_pl ??
                    trade.profit ??
                    0
                  );

                return (
                  <tr
                    key={trade.id}
                    className="border-t border-white/10"
                  >

                    <td className="py-3 text-slate-300">
                      {trade.ticket}
                    </td>

                    <td className="py-3">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          trade.status === "closed"
                            ? "bg-slate-700 text-slate-200"
                            : "bg-emerald-400 text-black"
                        }`}
                      >
                        {trade.status}
                      </span>

                    </td>

                    <td className="py-3">
                      {trade.direction}
                    </td>

                    <td className="py-3">
                      {Number(
                        trade.lot_size ?? 0
                      ).toFixed(2)}
                    </td>

                    <td className="py-3">
                      {Number(
                        trade.entry_price ?? 0
                      ).toFixed(2)}
                    </td>

                    <td className="py-3">

                      {trade.close_price
                        ? Number(
                            trade.close_price
                          ).toFixed(2)
                        : "-"}

                    </td>

                    <td
                      className={`py-3 font-bold ${
                        pl >= 0
                          ? "text-emerald-300"
                          : "text-red-300"
                      }`}
                    >
                      £{pl.toFixed(2)}
                    </td>

                    <td className="py-3">
                      {trade.session_name ?? "-"}
                    </td>

                    <td className="py-3">
                      {trade.strategy_preset ?? "-"}
                    </td>

                    <td className="py-3">
                      {trade.entry_timeframe ?? "-"}
                    </td>

                    <td className="py-3 text-slate-400">

                      {trade.opened_at
                        ? new Date(
                            trade.opened_at
                          ).toLocaleString()
                        : "-"}

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </Panel>

    </div>
  );
}