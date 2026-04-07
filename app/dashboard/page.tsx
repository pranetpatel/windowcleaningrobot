"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { generateWeekSchedule, getDerivedStatus, BUILDING } from "@/lib/schedule";

// ─── SVG / animation constants ───────────────────────────────────────────────

const COLS   = 12;
const FLOORS = 4;
const WIN_W  = 36;
const WIN_H  = 54;
const GAP_X  = 4;
const GAP_Y  = 5;
const COL_W  = WIN_W + GAP_X;          // 40
const ROW_H  = WIN_H + GAP_Y;          // 30
const BLDG_X = 30;
const BLDG_Y = 64;
const BLDG_W = COLS * COL_W - GAP_X;   // 476
const BLDG_H = FLOORS * ROW_H - GAP_Y; // 266
const RAIL_Y = 26;
const SVG_W  = BLDG_X + BLDG_W + 28;  // 534
const SVG_H  = BLDG_Y + BLDG_H + 22;  // 352
const OPERATION_MS_REAL = 480_000; // 8 min — true operating speed
const OPERATION_MS_SIM  =  60_000; // 60 s  — simulation / demo mode

// ─── Types ───────────────────────────────────────────────────────────────────

type SystemState = "Idle" | "Traversing" | "Stopped" | "Complete";
type Tab        = "overview" | "liveview";
type LogLevel   = "info" | "warning" | "error" | "success";

interface LogEntry { id: number; timestamp: string; message: string; level: LogLevel; }

const STATE_DOT: Record<SystemState, string> = {
  Idle:       "bg-gray-500",
  Traversing: "bg-green-500 animate-pulse",
  Stopped:    "bg-red-500 animate-pulse",
  Complete:   "bg-blue-400",
};
const STATE_LABEL: Record<SystemState, string> = {
  Idle:       "text-gray-400",
  Traversing: "text-green-400",
  Stopped:    "text-red-400",
  Complete:   "text-blue-400",
};

// ─── Pure helpers ────────────────────────────────────────────────────────────

function tsNow() {
  return new Date().toLocaleTimeString("en-CA", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
}

function makeLog(msg: string, lvl: LogLevel = "info"): LogEntry {
  return { id: Date.now() + Math.random(), timestamp: tsNow(), message: msg, level: lvl };
}

/**
 * Derive all visual values from a single cartPct (0-100).
 * Cable: extends 0→1 during first 35 % of each column slot, holds 35-65 %,
 * retracts 1→0 during 65-100 %. Active glow fires during extend + hold.
 */
function computeAnim(pct: number) {
  const colF = (pct / 100) * COLS;
  const col  = Math.min(Math.floor(colF), COLS - 1);
  const cp   = colF - Math.floor(colF);  // 0-1 within current column

  const cable =
    cp < 0.35  ? cp / 0.35
    : cp <= 0.65 ? 1.0
    : 1.0 - (cp - 0.65) / 0.35;

  const cableLen    = cable * BLDG_H;
  const floor       = Math.min(Math.floor((cableLen / BLDG_H) * FLOORS), FLOORS - 1);
  const cartX       = BLDG_X + (pct / 100) * BLDG_W;
  const isDescending = cp < 0.65;
  const sway        = Math.sin(Date.now() / 600) * 1.4;

  return { col, floor, cable, cableLen, cartX, isDescending, sway };
}

// ─── Building SVG ────────────────────────────────────────────────────────────

function BuildingSVG({
  cartPct, cleanedCells, isOperating, mini = false,
}: {
  cartPct: number; cleanedCells: Set<string>; isOperating: boolean; mini?: boolean;
}) {
  const { col, floor, cable, cableLen, cartX, isDescending, sway } = computeAnim(cartPct);
  const showRope   = isOperating && cable > 0.01;
  const winbotX    = showRope ? cartX + sway : cartX;
  const cableBotY  = BLDG_Y + Math.min(cableLen, BLDG_H);
  const gId        = mini ? "g-m" : "g-f";
  const wId        = mini ? "w-m" : "w-f";

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={mini ? 220 : undefined}
      height={mini ? Math.round(220 * SVG_H / SVG_W) : undefined}
      className={mini ? undefined : "w-full"}
      style={{ display: "block" }}
    >
      <defs>
        <filter id={gId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id={wId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="rg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8eef8"/>
          <stop offset="100%" stopColor="#8898b8"/>
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={SVG_W} height={SVG_H} fill="#06101c"/>

      {/* Building body */}
      <rect
        x={BLDG_X - 1} y={BLDG_Y - 1}
        width={BLDG_W + 2} height={BLDG_H + 2}
        fill="#08111e" stroke="#172a42" strokeWidth={1.5} rx={1}
      />

      {/* Window grid */}
      {Array.from({ length: FLOORS }, (_, f) =>
        Array.from({ length: COLS }, (_, c) => {
          const key     = `${c}-${f}`;
          const cleaned = cleanedCells.has(key);
          const glow    = isOperating && c === col && f === floor && cable > 0.05 && isDescending;
          const fill    = glow ? "#5de8ff" : cleaned ? "#154d78" : "#0e1c2e";
          return (
            <rect key={key}
              x={BLDG_X + c * COL_W} y={BLDG_Y + f * ROW_H}
              width={WIN_W} height={WIN_H}
              fill={fill} stroke="#122440" strokeWidth={0.5}
              filter={glow ? `url(#${gId})` : undefined}
            />
          );
        })
      )}

      {/* Floor labels */}
      {!mini && Array.from({ length: FLOORS }, (_, f) => (
        <text key={f}
          x={BLDG_X - 5} y={BLDG_Y + f * ROW_H + WIN_H / 2 + 4}
          textAnchor="end" fontSize="8" fill="#2e4a6a" fontFamily="monospace"
        >{FLOORS - f}</text>
      ))}

      {/* Ground base */}
      <rect x={BLDG_X - 1} y={BLDG_Y + BLDG_H + 1} width={BLDG_W + 2} height={7}
        fill="#172a42" rx={1}/>
      <line x1={BLDG_X - 18} y1={BLDG_Y + BLDG_H + 8}
        x2={BLDG_X + BLDG_W + 18} y2={BLDG_Y + BLDG_H + 8}
        stroke="#0a1828" strokeWidth={4} strokeLinecap="round"/>

      {/* Rooftop rail */}
      <line
        x1={BLDG_X - 12} y1={RAIL_Y}
        x2={BLDG_X + BLDG_W + 12} y2={RAIL_Y}
        stroke="url(#rg)" strokeWidth={mini ? 2.5 : 4} strokeLinecap="round"
      />
      {/* Rail end stops */}
      {!mini && <>
        <rect x={BLDG_X - 14} y={RAIL_Y - 7} width={4} height={14} fill="#607090" rx={1.5}/>
        <rect x={BLDG_X + BLDG_W + 10} y={RAIL_Y - 7} width={4} height={14} fill="#607090" rx={1.5}/>
      </>}

      {/* Cable */}
      {showRope && (
        <line
          x1={winbotX} y1={RAIL_Y}
          x2={winbotX} y2={cableBotY}
          stroke="#bcc8dc" strokeWidth={mini ? 0.8 : 1.2} opacity={0.8}
        />
      )}

      {/* Cart */}
      <g>
        <rect x={cartX - 14} y={RAIL_Y - 16} width={28} height={16}
          fill="#ccd6e8" rx={2}/>
        {!mini && <>
          <rect x={cartX - 11} y={RAIL_Y - 13} width={10} height={8} fill="#9aabbc" rx={1}/>
          <rect x={cartX + 1}  y={RAIL_Y - 13} width={10} height={8} fill="#9aabbc" rx={1}/>
        </>}
        {/* Wheels */}
        {([-9, 9] as const).map(dx => (
          <circle key={dx} cx={cartX + dx} cy={RAIL_Y + (mini ? 1 : 2)}
            r={mini ? 2 : 3.5} fill="#506080"/>
        ))}
        <line x1={cartX - 9} y1={RAIL_Y + 2} x2={cartX + 9} y2={RAIL_Y + 2}
          stroke="#3a5070" strokeWidth={1}/>
      </g>

      {/* WINBOT module */}
      {showRope && (
        <g filter={`url(#${wId})`}>
          <rect
            x={winbotX - 11} y={cableBotY}
            width={22} height={14}
            fill="#e0f0ff" stroke="#70d0ff" strokeWidth={1} rx={2}
          />
          {/* Brush strip — visible only when at full extension */}
          {cable > 0.88 && !mini && (
            <line x1={winbotX - 10} y1={cableBotY + 14}
              x2={winbotX + 10} y2={cableBotY + 14}
              stroke="#38c0f0" strokeWidth={2.5} strokeLinecap="round" opacity={0.9}/>
          )}
        </g>
      )}
    </svg>
  );
}

// ─── Shared small sub-components ──────────────────────────────────────────────

function DashCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <h2 className="font-semibold text-gray-400 text-xs uppercase tracking-widest">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function CtrlBtn({
  label, colour, onClick, disabled, fullWidth = false,
}: {
  label: string; colour: string; onClick: () => void; disabled?: boolean; fullWidth?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`py-2.5 px-4 rounded-lg font-semibold text-white text-sm transition-colors
        ${colour} disabled:opacity-35 disabled:cursor-not-allowed ${fullWidth ? "w-full" : ""}`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value, sub, colour }: { label: string; value: string; sub: string; colour?: string }) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${colour ?? "text-white"}`}>{value}</p>
      <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
    </div>
  );
}

function ConfirmDialog({
  title, description, confirmLabel, confirmColour, onConfirm, onCancel,
}: {
  title: string; description: string; confirmLabel: string; confirmColour: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="font-bold text-white text-lg mb-2">{title}</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{description}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 font-semibold text-sm hover:bg-gray-700 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-3 rounded-lg text-white font-semibold text-sm transition-colors ${confirmColour}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Login gate ───────────────────────────────────────────────────────────────

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === "winbot2026") { onLogin(); }
    else { setError(true); setPassword(""); }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4F2D84] rounded-2xl mb-4">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-2xl font-bold text-white">WinBot Operator Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Authorized personnel only — Facilities Management</p>
        </div>
        <form onSubmit={handleSubmit}
          className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">Operator Password</label>
          <input
            type="password" value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            className={`w-full bg-gray-700 text-white rounded-lg px-4 py-3 text-sm border mb-4
              ${error ? "border-red-500" : "border-gray-600"}
              focus:outline-none focus:border-[#4F2D84] focus:ring-1 focus:ring-[#4F2D84]`}
            placeholder="Enter password" autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-4">Incorrect password. Please try again.</p>}
          <button type="submit"
            className="w-full bg-[#4F2D84] hover:bg-[#6b44a8] text-white font-semibold py-3 rounded-lg transition-colors">
            Sign In
          </button>
        </form>
        <p className="text-center text-gray-600 text-xs mt-6">
          University of Western Ontario — Facilities Management
        </p>
      </div>
    </div>
  );
}

// ─── System Overview tab ─────────────────────────────────────────────────────

interface OverviewProps {
  systemState: SystemState;
  cartPct: number;
  cleanedCells: Set<string>;
  battery: number;
  irStatus: string;
  irTimestamp: string;
  windSpeed: number;
  isOperating: boolean;
  logs: LogEntry[];
  onStart(): void; onEStop(): void; onDeploy(): void; onRetrieve(): void; onReset(): void;
}

function SystemOverview({
  systemState, cartPct, cleanedCells, battery,
  irStatus, irTimestamp, windSpeed, isOperating, logs,
  onStart, onEStop, onDeploy, onRetrieve, onReset,
}: OverviewProps) {
  const { col, floor, cable } = computeAnim(cartPct);
  const displayCol   = isOperating ? `${col + 1} / ${COLS}` : "— / 12";
  const displayFloor = isOperating && cable > 0.05 ? `${FLOORS - floor} / ${FLOORS}` : "— / 9";
  const battColour   = battery > 50 ? "text-green-400" : battery > 20 ? "text-amber-400" : "text-red-400";
  const battBar      = battery > 50 ? "bg-green-500"   : battery > 20 ? "bg-amber-500"   : "bg-red-500";
  const windColour   = windSpeed > 18 ? "text-red-400" : windSpeed > 13 ? "text-amber-400" : "text-green-400";

  return (
    <div className="space-y-5">

      {/* Row 1 — four stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <DashCard title="System Status" icon="🟢">
          <div className={`flex items-center gap-2 mt-3 font-bold text-lg ${STATE_LABEL[systemState]}`}>
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${STATE_DOT[systemState]}`}/>
            {systemState}
          </div>
          {systemState === "Complete" && (
            <p className="text-xs text-blue-400 mt-1">{COLS} columns cleaned ✓</p>
          )}
        </DashCard>

        <DashCard title="Battery" icon="🔋">
          <div className="mt-3">
            <span className={`font-bold text-3xl tabular-nums ${battColour}`}>{battery}%</span>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
              <div className={`${battBar} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${battery}%` }}/>
            </div>
          </div>
        </DashCard>

        <DashCard title="IR Sensor" icon="👁️">
          <div className="mt-3">
            <span className={`inline-flex items-center gap-2 font-semibold text-base
              ${irStatus === "Clear" ? "text-green-400" : "text-red-400"}`}>
              <span className={`w-3 h-3 rounded-full
                ${irStatus === "Clear" ? "bg-green-500" : "bg-red-500 animate-pulse"}`}/>
              {irStatus}
            </span>
            <p className="text-gray-500 text-xs mt-2">
              Last: <span className="text-gray-400 font-mono">{irTimestamp}</span>
            </p>
          </div>
        </DashCard>

        <DashCard title="Wind Speed" icon="💨">
          <div className="mt-3">
            <span className={`font-bold text-3xl tabular-nums ${windColour}`}>{windSpeed}</span>
            <span className="text-gray-500 text-sm ml-1">km/h</span>
            <p className={`text-xs mt-1 ${windSpeed > 25 ? "text-red-400" : "text-gray-500"}`}>
              {windSpeed > 25 ? "⚠ Exceeds safe limit" : "Within safe range"}
            </p>
          </div>
        </DashCard>
      </div>

      {/* Row 2 — position cards + mini building */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="space-y-4">
          <DashCard title="Column" icon="↔">
            <p className="text-3xl font-bold text-white tabular-nums mt-3">{displayCol}</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-[#4F2D84] h-2 rounded-full transition-all duration-200"
                style={{ width: `${cartPct}%` }}/>
            </div>
          </DashCard>
          <DashCard title="Floor" icon="↕">
            <p className="text-3xl font-bold text-white tabular-nums mt-3">{displayFloor}</p>
          </DashCard>
        </div>

        {/* Mini building */}
        <div className="xl:col-span-2 bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>🏢</span> Building Overview
            <span className="ml-auto text-gray-600 font-normal normal-case tracking-normal">
              {cleanedCells.size} / {COLS * FLOORS} panels
            </span>
          </h2>
          <div className="flex justify-center">
            <BuildingSVG cartPct={cartPct} cleanedCells={cleanedCells} isOperating={isOperating} mini/>
          </div>
        </div>
      </div>

      {/* Row 3 — controls + log */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">🕹️ Controls</h2>
          <div className="space-y-2.5">
            <CtrlBtn label="▶  Start Operation" colour="bg-green-700 hover:bg-green-600" fullWidth
              onClick={onStart} disabled={systemState === "Traversing"}/>
            <CtrlBtn label="⚡ Emergency Stop" colour="bg-red-700 hover:bg-red-600" fullWidth
              onClick={onEStop} disabled={systemState === "Idle" || systemState === "Stopped" || systemState === "Complete"}/>
            <CtrlBtn label="⬇  Deploy WINBOT" colour="bg-blue-700 hover:bg-blue-600" fullWidth
              onClick={onDeploy} disabled={systemState !== "Idle"}/>
            <CtrlBtn label="⬆  Retrieve WINBOT" colour="bg-blue-800 hover:bg-blue-700" fullWidth
              onClick={onRetrieve} disabled={systemState !== "Traversing"}/>
            {(systemState === "Stopped" || systemState === "Complete") && (
              <CtrlBtn label="↺  Reset System" colour="bg-gray-600 hover:bg-gray-500" fullWidth onClick={onReset}/>
            )}
          </div>
          <p className="text-[11px] text-gray-600 mt-4 pt-3 border-t border-gray-700 leading-relaxed">
            Start switches to Live View automatically. Emergency Stop requires manual inspection before resuming.
          </p>
        </div>

        <div className="xl:col-span-2 bg-gray-800 rounded-xl p-5 border border-gray-700">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            📋 Operation Log
            <span className="ml-auto text-xs text-gray-500 font-normal">{logs.length} events</span>
          </h2>
          <div className="h-64 overflow-y-auto space-y-0 font-mono text-xs pr-1">
            {logs.map(e => (
              <div key={e.id} className="flex gap-3 py-1.5 border-b border-gray-700/40">
                <span className="text-gray-600 flex-shrink-0 tabular-nums">{e.timestamp}</span>
                <span className={
                  e.level === "error"   ? "text-red-400"
                  : e.level === "warning" ? "text-amber-400"
                  : e.level === "success" ? "text-green-400"
                  : "text-gray-300"
                }>{e.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Live View tab ────────────────────────────────────────────────────────────

interface LiveViewProps {
  systemState: SystemState;
  cartPct: number;
  cleanedCells: Set<string>;
  windSpeed: number;
  isOperating: boolean;
  logs: LogEntry[];
  onStart(): void; onEStop(): void; onDeploy(): void; onRetrieve(): void; onReset(): void;
}

function LiveViewTab({
  systemState, cartPct, cleanedCells, windSpeed, isOperating, logs,
  onStart, onEStop, onDeploy, onRetrieve, onReset,
}: LiveViewProps) {
  const { col, floor, cable, isDescending } = computeAnim(cartPct);
  const displayCol   = `${col + 1} / ${COLS}`;
  const displayFloor = isOperating && cable > 0.05 ? `${FLOORS - floor} / ${FLOORS}` : "— / 9";
  const windColour   = windSpeed > 18 ? "text-red-400" : windSpeed > 13 ? "text-amber-400" : "text-green-400";
  const subStatus    = !isOperating ? null
    : cable < 0.05    ? "Traversing"
    : isDescending    ? "Lowering WINBOT"
    : "Retrieving WINBOT";

  return (
    <div className="flex gap-5">

      {/* Left: building + stat strip */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Building SVG */}
        <div className="bg-[#06101c] rounded-xl border border-gray-800 overflow-hidden">
          <BuildingSVG
            cartPct={cartPct}
            cleanedCells={cleanedCells}
            isOperating={isOperating}
          />
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Wind Speed" value={`${windSpeed} km/h`} colour={windColour}
            sub={windSpeed > 25 ? "⚠ Exceeds limit" : "Normal"}/>
          <StatCard label="Column" value={isOperating ? displayCol : "— / 12"}
            sub="Horizontal position"/>
          <StatCard label="Floor" value={isOperating ? displayFloor : "— / 9"}
            sub="Vertical position"/>
          <StatCard label="Activity" value={subStatus ?? systemState}
            sub={`${cleanedCells.size} / ${COLS * FLOORS} panels`}/>
        </div>
      </div>

      {/* Right: controls + mini log */}
      <div className="w-64 flex-shrink-0 space-y-4">
        {/* System state badge */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">System State</p>
          <div className={`flex items-center gap-2 font-bold text-lg ${STATE_LABEL[systemState]}`}>
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${STATE_DOT[systemState]}`}/>
            {systemState}
          </div>
          {systemState === "Complete" && (
            <p className="text-xs text-blue-400 mt-1">{COLS} columns cleaned ✓</p>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-2.5">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Controls</p>
          <CtrlBtn label="▶ Start" colour="bg-green-700 hover:bg-green-600" fullWidth
            onClick={onStart} disabled={systemState === "Traversing"}/>
          <CtrlBtn label="⚡ E-Stop" colour="bg-red-700 hover:bg-red-600" fullWidth
            onClick={onEStop} disabled={systemState === "Idle" || systemState === "Stopped" || systemState === "Complete"}/>
          <CtrlBtn label="⬇ Deploy" colour="bg-blue-700 hover:bg-blue-600" fullWidth
            onClick={onDeploy} disabled={systemState !== "Idle"}/>
          <CtrlBtn label="⬆ Retrieve" colour="bg-blue-800 hover:bg-blue-700" fullWidth
            onClick={onRetrieve} disabled={systemState !== "Traversing"}/>
          {(systemState === "Stopped" || systemState === "Complete") && (
            <CtrlBtn label="↺ Reset" colour="bg-gray-600 hover:bg-gray-500" fullWidth onClick={onReset}/>
          )}
        </div>

        {/* Mini log */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex-1">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Log</p>
          <div className="h-64 overflow-y-auto font-mono text-[10px] space-y-0 pr-1">
            {logs.map(e => (
              <div key={e.id} className="py-1 border-b border-gray-700/40">
                <span className="text-gray-700 mr-1.5 tabular-nums">{e.timestamp}</span>
                <span className={
                  e.level === "error"   ? "text-red-400"
                  : e.level === "warning" ? "text-amber-400"
                  : e.level === "success" ? "text-green-400"
                  : "text-gray-400"
                }>{e.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard (main logic + layout) ─────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab]     = useState<Tab>("overview");
  const [systemState, setSystemState] = useState<SystemState>("Idle");
  const [simMode, setSimMode]         = useState(false);

  // Animation
  const [cartPct, setCartPct]           = useState(0);
  const [cleanedCells, setCleanedCells] = useState<Set<string>>(new Set());
  const runRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef    = useRef<number | null>(null);
  const prevColRef  = useRef(-1);

  // Sensors
  const [battery, setBattery]       = useState(87);
  const [irStatus, setIrStatus]     = useState<"Clear" | "Obstacle detected">("Clear");
  const [irTimestamp, setIrTimestamp] = useState("—");
  const [windSpeed, setWindSpeed]   = useState(14);

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    makeLog("System initialised — all checks passed", "success"),
    makeLog(`Building: ${BUILDING}`, "info"),
    makeLog("Awaiting operator command", "info"),
  ]);

  // Dialogs
  const [showEstop,    setShowEstop]    = useState(false);
  const [showDeploy,   setShowDeploy]   = useState(false);
  const [showRetrieve, setShowRetrieve] = useState(false);

  // Schedule sync — show banner if within today's active window
  const [schedActive, setSchedActive] = useState(false);
  useEffect(() => {
    const schedule = generateWeekSchedule();
    const etToday  = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    const todayEntry = schedule.find(e => e.dateISO === etToday);
    if (todayEntry && getDerivedStatus(todayEntry) === "Active") setSchedActive(true);
  }, []);

  // Wind speed random walk
  useEffect(() => {
    const id = setInterval(() => {
      setWindSpeed(p => Math.max(8, Math.min(22, Math.round(p + (Math.random() - 0.5) * 3))));
    }, 2_000);
    return () => clearInterval(id);
  }, []);

  const addLog = useCallback((msg: string, lvl: LogLevel = "info") => {
    setLogs(prev => [makeLog(msg, lvl), ...prev].slice(0, 150));
  }, []);

  const stopRun = useCallback(() => {
    if (runRef.current) { clearInterval(runRef.current); runRef.current = null; }
  }, []);

  const handleStart = useCallback(() => {
    if (systemState === "Traversing") return;
    setCleanedCells(new Set());
    setCartPct(0);
    prevColRef.current = -1;
    setSystemState("Traversing");
    setActiveTab("liveview");
    const opMs = simMode ? OPERATION_MS_SIM : OPERATION_MS_REAL;
    addLog(
      `Operation started — ACEB South Facade [${simMode ? "SIMULATION" : "LIVE"}]`,
      "success",
    );
    addLog("IR sensor armed and monitoring", "info");

    startRef.current = Date.now();
    // IR trigger fires at 30–65 % of the total run duration
    const irAt = opMs * (0.30 + Math.random() * 0.35);
    let irFired = false;

    runRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current!;
      const pct = Math.min((elapsed / opMs) * 100, 100);
      setCartPct(pct);
      setBattery(p => Math.max(0, parseFloat((p - 0.007).toFixed(1))));

      const { col, floor, cable, isDescending } = computeAnim(pct);

      // Log new column arrival
      if (col !== prevColRef.current && cable > 0.05) {
        prevColRef.current = col;
        addLog(`Cart at Column ${col + 1} of ${COLS} — WINBOT descending`, "info");
      }

      // Update cleaned cells
      setCleanedCells(prev => {
        const next = new Set(prev);
        if (cable > 0.05) {
          const limit = isDescending ? floor : FLOORS - 1;
          for (let f = 0; f <= limit; f++) next.add(`${col}-${f}`);
        }
        return next;
      });

      // Random IR trigger
      if (!irFired && elapsed > irAt) {
        irFired = true;
        const { col: c, floor: f } = computeAnim(pct);
        setIrStatus("Obstacle detected");
        setIrTimestamp(tsNow());
        addLog(`IR trigger — Column ${c + 1}, Floor ${FLOORS - f} — obstacle detected`, "warning");
        setTimeout(() => {
          setIrStatus("Clear");
          addLog("IR sensor cleared — obstacle resolved", "info");
        }, 4_000);
      }

      if (pct >= 100) {
        stopRun();
        setSystemState("Complete");
        addLog("Cart reached end of facade — operation complete", "success");
        addLog(`ACEB South Facade: ${COLS * FLOORS} window panels cleaned successfully`, "success");
      }
    }, 50);
  }, [systemState, simMode, addLog, stopRun]);

  const handleEStop = useCallback(() => {
    stopRun();
    setSystemState("Stopped");
    setShowEstop(false);
    const { col, floor } = computeAnim(cartPct);
    addLog(`⚡ EMERGENCY STOP — Column ${col + 1}, Floor ${FLOORS - floor} — all motion halted`, "error");
    addLog("Manual inspection required before resuming", "warning");
  }, [stopRun, addLog, cartPct]);

  const handleReset = useCallback(() => {
    stopRun();
    setSystemState("Idle");
    setCartPct(0);
    setCleanedCells(new Set());
    prevColRef.current = -1;
    addLog("System reset — cart returned to home position", "info");
  }, [stopRun, addLog]);

  const handleDeploy = useCallback(() => {
    setShowDeploy(false);
    addLog("Deploy WINBOT — cradle descending to cleaning position", "info");
  }, [addLog]);

  const handleRetrieve = useCallback(() => {
    setShowRetrieve(false);
    addLog("Retrieve WINBOT — cradle ascending to rooftop", "info");
  }, [addLog]);

  useEffect(() => () => { if (runRef.current) clearInterval(runRef.current); }, []);

  const isOperating = systemState === "Traversing" || systemState === "Stopped";

  const sharedControls = {
    onStart: handleStart, onEStop: () => setShowEstop(true),
    onDeploy: () => setShowDeploy(true), onRetrieve: () => setShowRetrieve(true),
    onReset: handleReset,
  };

  return (
    <div className="flex min-h-screen bg-gray-900">

      {/* Sidebar */}
      <aside className="w-56 bg-[#050d1a] border-r border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 bg-[#4F2D84] rounded-lg flex items-center justify-center text-lg flex-shrink-0">🤖</div>
            <span className="font-bold text-white text-base">WinBot</span>
          </div>
          <p className="text-gray-500 text-[11px] leading-tight">Operator Dashboard</p>
          <p className="text-gray-600 text-[10px] mt-0.5 leading-tight">ACEB — Western University</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {([
            { id: "overview" as Tab, icon: "📊", label: "System Overview" },
            { id: "liveview" as Tab, icon: "🏢", label: "Live View" },
          ]).map(({ id, icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === id
                  ? "bg-[#4F2D84] text-white font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>

        {/* Mode toggle */}
        <div className="px-3 pb-3">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2 px-1">Mode</p>
          <button
            onClick={() => {
              if (systemState === "Traversing") return; // don't switch mid-run
              setSimMode(m => !m);
            }}
            disabled={systemState === "Traversing"}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed
              ${simMode
                ? "bg-amber-900/40 border-amber-700/60 text-amber-300"
                : "bg-gray-800 border-gray-700 text-gray-300"
              }`}
          >
            <span>{simMode ? "⚡ Simulation" : "🔴 Live"}</span>
            <span className="text-[10px] font-normal opacity-70">
              {simMode ? "60 s" : "8 min"}
            </span>
          </button>
          {simMode && (
            <p className="text-[10px] text-amber-600 mt-1.5 px-1 leading-tight">
              Demo speed — not for real operations
            </p>
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <p className="text-[11px] text-gray-500 mb-0.5">Logged in as:</p>
          <p className="text-gray-300 font-medium text-sm">Facilities Operator</p>
          <button onClick={onLogout}
            className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-white text-xl">
              {activeTab === "overview" ? "System Overview" : "Live View — ACEB Facade"}
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              {BUILDING} · {new Date().toLocaleDateString("en-CA", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${STATE_DOT[systemState]}`}/>
            <span className={`text-sm font-semibold ${STATE_LABEL[systemState]}`}>{systemState}</span>
          </div>
        </header>

        {schedActive && (
          <div className="bg-green-900/40 border-b border-green-700/50 px-6 py-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0"/>
            <p className="text-green-300 text-sm">Scheduled operation window is active for today.</p>
          </div>
        )}

        <div className="p-6">
          {activeTab === "overview"
            ? <SystemOverview
                systemState={systemState} cartPct={cartPct} cleanedCells={cleanedCells}
                battery={battery} irStatus={irStatus} irTimestamp={irTimestamp}
                windSpeed={windSpeed} isOperating={isOperating} logs={logs}
                {...sharedControls}
              />
            : <LiveViewTab
                systemState={systemState} cartPct={cartPct} cleanedCells={cleanedCells}
                windSpeed={windSpeed} isOperating={isOperating} logs={logs}
                {...sharedControls}
              />
          }
        </div>
      </main>

      {/* Confirmation dialogs */}
      {showEstop && (
        <ConfirmDialog
          title="Emergency Stop"
          description="This will immediately halt all motor operations. Manual inspection is required before resuming."
          confirmLabel="Activate Emergency Stop"
          confirmColour="bg-red-600 hover:bg-red-500"
          onConfirm={handleEStop} onCancel={() => setShowEstop(false)}
        />
      )}
      {showDeploy && (
        <ConfirmDialog
          title="Deploy WINBOT"
          description="This will lower the cleaning cradle from the cart to the facade. Ensure the 5-metre clearance zone is established."
          confirmLabel="Confirm Deploy"
          confirmColour="bg-blue-600 hover:bg-blue-500"
          onConfirm={handleDeploy} onCancel={() => setShowDeploy(false)}
        />
      )}
      {showRetrieve && (
        <ConfirmDialog
          title="Retrieve WINBOT"
          description="This will raise the cleaning cradle back to the rooftop cart. Confirm cables are clear and unobstructed."
          confirmLabel="Confirm Retrieve"
          confirmColour="bg-blue-700 hover:bg-blue-600"
          onConfirm={handleRetrieve} onCancel={() => setShowRetrieve(false)}
        />
      )}
    </div>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [authed, setAuthed] = useState(false);
  if (!authed) return <LoginGate onLogin={() => setAuthed(true)}/>;
  return <Dashboard onLogout={() => setAuthed(false)}/>;
}
