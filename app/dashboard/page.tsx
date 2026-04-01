"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SystemState =
  | "Idle"
  | "Traversing"
  | "Lowering WINBOT"
  | "Retrieving"
  | "Stopped";

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  level: "info" | "warning" | "error" | "success";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function makeLog(message: string, level: LogEntry["level"] = "info"): LogEntry {
  return { id: Date.now() + Math.random(), timestamp: now(), message, level };
}

const STATE_COLOURS: Record<SystemState, string> = {
  Idle: "bg-gray-500",
  Traversing: "bg-green-500",
  "Lowering WINBOT": "bg-blue-500",
  Retrieving: "bg-blue-400",
  Stopped: "bg-red-500",
};

const STATE_TEXT: Record<SystemState, string> = {
  Idle: "text-gray-300",
  Traversing: "text-green-400",
  "Lowering WINBOT": "text-blue-400",
  Retrieving: "text-blue-300",
  Stopped: "text-red-400",
};

const TOTAL_LENGTH = 12; // metres

// ─── Login Gate ──────────────────────────────────────────────────────────────

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === "winbot2026") {
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4F2D84] rounded-2xl mb-4">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-2xl font-bold text-white">WinBot Operator Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Authorized personnel only — Facilities Management
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700"
        >
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Operator Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            className={`w-full bg-gray-700 text-white rounded-lg px-4 py-3 text-sm border ${
              error ? "border-red-500" : "border-gray-600"
            } focus:outline-none focus:border-[#4F2D84] focus:ring-1 focus:ring-[#4F2D84] transition-colors mb-4`}
            placeholder="Enter password"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-sm mb-4">
              Incorrect password. Please try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-[#4F2D84] hover:bg-[#6b44a8] text-white font-semibold py-3 rounded-lg transition-colors"
          >
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [systemState, setSystemState] = useState<SystemState>("Idle");
  const [cartPosition, setCartPosition] = useState(0); // 0-100%
  const [battery, setBattery] = useState(87);
  const [irStatus, setIrStatus] = useState<"Clear" | "Obstacle detected">("Clear");
  const [irTimestamp, setIrTimestamp] = useState<string>("—");
  const [logs, setLogs] = useState<LogEntry[]>([
    makeLog("System initialised — all checks passed", "success"),
    makeLog("Awaiting operator command", "info"),
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [showEstop, setShowEstop] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  const [showRetrieve, setShowRetrieve] = useState(false);

  const runIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const irTriggeredRef = useRef(false);

  const addLog = useCallback((message: string, level: LogEntry["level"] = "info") => {
    setLogs((prev) => [makeLog(message, level), ...prev].slice(0, 100));
  }, []);

  const stopRun = useCallback(() => {
    if (runIntervalRef.current) {
      clearInterval(runIntervalRef.current);
      runIntervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const handleStart = useCallback(() => {
    if (isRunning || systemState !== "Idle") return;

    setIsRunning(true);
    setCartPosition(0);
    irTriggeredRef.current = false;
    setIrStatus("Clear");
    setSystemState("Traversing");
    addLog("Operation started — cart traversal initiated", "success");
    addLog("IR sensor armed and monitoring", "info");

    const DURATION_MS = 40_000;
    const TICK_MS = 400;
    const TICKS = DURATION_MS / TICK_MS;
    let tick = 0;
    const irTick = Math.floor(Math.random() * (TICKS * 0.8 - TICKS * 0.2) + TICKS * 0.2);

    runIntervalRef.current = setInterval(() => {
      tick++;

      // progress
      const progress = Math.min((tick / TICKS) * 100, 100);
      setCartPosition(progress);

      // battery drain ~0.3% per tick over 100 ticks
      setBattery((prev) => Math.max(0, parseFloat((prev - 0.12).toFixed(1))));

      // random IR trigger
      if (!irTriggeredRef.current && tick === irTick) {
        irTriggeredRef.current = true;
        const ts = now();
        setIrStatus("Obstacle detected");
        setIrTimestamp(ts);
        addLog(`IR sensor triggered at ${(progress).toFixed(1)}% — obstacle detected`, "warning");
        setTimeout(() => {
          setIrStatus("Clear");
          addLog("IR sensor cleared — obstacle resolved", "info");
        }, 4000);
      }

      if (progress >= 100) {
        stopRun();
        setCartPosition(100);
        addLog("Cart reached end of facade — initiating descent", "success");

        // Lowering
        setSystemState("Lowering WINBOT");
        addLog("Lowering WINBOT cradle to cleaning position", "info");

        setTimeout(() => {
          setSystemState("Retrieving");
          addLog("Cradle deployed — beginning retrieval sequence", "info");

          setTimeout(() => {
            setSystemState("Idle");
            setCartPosition(0);
            addLog("Retrieval complete — system returned to home position", "success");
            addLog("Operation cycle finished. Ready for next command.", "info");
          }, 8000);
        }, 8000);
      }
    }, TICK_MS);
  }, [isRunning, systemState, addLog, stopRun]);

  const handleEStop = useCallback(() => {
    stopRun();
    setSystemState("Stopped");
    setShowEstop(false);
    addLog("⚡ EMERGENCY STOP ACTIVATED — all motion halted", "error");
    addLog("Manual inspection required before resuming operations", "warning");
  }, [stopRun, addLog]);

  const handleDeploy = useCallback(() => {
    setShowDeploy(false);
    addLog("Deploy WINBOT command issued — cradle descending", "info");
    setSystemState("Lowering WINBOT");
    setTimeout(() => {
      addLog("WINBOT cradle at cleaning position", "success");
    }, 8000);
  }, [addLog]);

  const handleRetrieve = useCallback(() => {
    setShowRetrieve(false);
    addLog("Retrieve WINBOT command issued — cradle ascending", "info");
    setSystemState("Retrieving");
    setTimeout(() => {
      addLog("WINBOT cradle retrieved and secured", "success");
      setSystemState("Idle");
    }, 8000);
  }, [addLog]);

  // Reset Stopped state
  const handleReset = useCallback(() => {
    if (systemState !== "Stopped") return;
    setSystemState("Idle");
    setCartPosition(0);
    addLog("System reset — returning to Idle state", "info");
  }, [systemState, addLog]);

  useEffect(() => {
    return () => {
      if (runIntervalRef.current) clearInterval(runIntervalRef.current);
    };
  }, []);

  const distanceM = ((cartPosition / 100) * TOTAL_LENGTH).toFixed(1);
  const batteryColour =
    battery > 50 ? "bg-green-500" : battery > 20 ? "bg-amber-500" : "bg-red-500";
  const batteryTextColour =
    battery > 50 ? "text-green-400" : battery > 20 ? "text-amber-400" : "text-red-400";

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-[#4F2D84] rounded-lg flex items-center justify-center text-lg">
              🤖
            </div>
            <span className="font-bold text-white text-lg">WinBot</span>
          </div>
          <p className="text-gray-500 text-xs">Operator Dashboard</p>
          <p className="text-gray-600 text-xs">Ivey Spencer Leadership Centre</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem icon="📊" label="System Overview" active />
          <SidebarItem icon="🗓️" label="Schedule" />
          <SidebarItem icon="🔧" label="Maintenance" />
          <SidebarItem icon="📋" label="Reports" />
          <SidebarItem icon="⚙️" label="Settings" />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500 mb-3">
            <p>Logged in as:</p>
            <p className="text-gray-300 font-medium">Facilities Operator</p>
          </div>
          <button
            onClick={onLogout}
            className="w-full text-left text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-white text-xl">System Overview</h1>
            <p className="text-gray-500 text-xs">
              Real-time monitoring — {new Date().toLocaleDateString("en-CA", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-2 text-sm font-medium ${STATE_TEXT[systemState]}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${STATE_COLOURS[systemState]} animate-pulse`} />
              {systemState}
            </span>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Low battery banner */}
          {battery < 20 && (
            <div className="bg-red-900/50 border border-red-700 rounded-xl px-5 py-4 flex items-center gap-3">
              <span className="text-red-400 text-xl">🪫</span>
              <div>
                <p className="font-semibold text-red-300">Low Battery Warning</p>
                <p className="text-red-400 text-sm">
                  Battery at {battery}%. Return system to base and charge before next operation.
                </p>
              </div>
            </div>
          )}

          {/* Cards row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* System Status */}
            <DashCard title="System Status" icon="🟢">
              <div className="flex items-center gap-3 mt-3">
                <div className={`w-4 h-4 rounded-full ${STATE_COLOURS[systemState]}`} />
                <span className={`font-bold text-xl ${STATE_TEXT[systemState]}`}>
                  {systemState}
                </span>
              </div>
              {systemState === "Stopped" && (
                <button
                  onClick={handleReset}
                  className="mt-4 w-full text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 py-2 rounded-lg transition-colors"
                >
                  Reset System
                </button>
              )}
            </DashCard>

            {/* Battery */}
            <DashCard title="Battery" icon="🔋">
              <div className="mt-3">
                <div className="flex items-end gap-2 mb-2">
                  <span className={`font-bold text-3xl ${batteryTextColour}`}>{battery}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`${batteryColour} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${battery}%` }}
                  />
                </div>
              </div>
            </DashCard>

            {/* IR Sensor */}
            <DashCard title="IR Sensor" icon="👁️">
              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-2 font-semibold text-base ${
                    irStatus === "Clear" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      irStatus === "Clear" ? "bg-green-500" : "bg-red-500 animate-pulse"
                    }`}
                  />
                  {irStatus}
                </span>
                <p className="text-gray-500 text-xs mt-2">
                  Last trigger: <span className="text-gray-400 font-mono">{irTimestamp}</span>
                </p>
              </div>
            </DashCard>

            {/* Cart Position */}
            <DashCard title="Cart Position" icon="📍">
              <div className="mt-3">
                <p className="text-2xl font-bold text-white mb-1">
                  {distanceM}m{" "}
                  <span className="text-gray-500 font-normal text-base">
                    / {TOTAL_LENGTH}m
                  </span>
                </p>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-1">
                  <div
                    className="bg-[#4F2D84] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${cartPosition}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs text-right">
                  {cartPosition.toFixed(1)}% of facade
                </p>
              </div>
            </DashCard>
          </div>

          {/* Controls + Log */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Controls */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>🕹️</span> Controls
              </h2>
              <div className="space-y-3">
                <ControlButton
                  label="▶ Start Operation"
                  colour="bg-green-600 hover:bg-green-500"
                  onClick={handleStart}
                  disabled={isRunning || systemState !== "Idle"}
                />
                <ControlButton
                  label="⚡ Emergency Stop"
                  colour="bg-red-700 hover:bg-red-600"
                  onClick={() => setShowEstop(true)}
                  disabled={systemState === "Idle" || systemState === "Stopped"}
                />
                <ControlButton
                  label="⬇ Deploy WINBOT"
                  colour="bg-blue-700 hover:bg-blue-600"
                  onClick={() => setShowDeploy(true)}
                  disabled={isRunning || systemState !== "Idle"}
                />
                <ControlButton
                  label="⬆ Retrieve WINBOT"
                  colour="bg-blue-800 hover:bg-blue-700"
                  onClick={() => setShowRetrieve(true)}
                  disabled={isRunning || systemState === "Idle" || systemState === "Stopped"}
                />
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  All operations require operator confirmation. Emergency Stop halts all
                  motion immediately.
                </p>
              </div>
            </div>

            {/* Operation Log */}
            <div className="xl:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>📋</span> Operation Log
                <span className="ml-auto text-xs text-gray-500 font-normal">
                  {logs.length} events
                </span>
              </h2>
              <div className="h-72 overflow-y-auto space-y-1 font-mono text-xs pr-2">
                {logs.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex gap-3 py-1.5 border-b border-gray-700/50"
                  >
                    <span className="text-gray-600 flex-shrink-0">{entry.timestamp}</span>
                    <span
                      className={
                        entry.level === "error"
                          ? "text-red-400"
                          : entry.level === "warning"
                          ? "text-amber-400"
                          : entry.level === "success"
                          ? "text-green-400"
                          : "text-gray-300"
                      }
                    >
                      {entry.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Dialogs */}
      {showEstop && (
        <ConfirmDialog
          title="Emergency Stop"
          description="This will immediately halt all motor operations. The system must be manually inspected before resuming. Are you sure?"
          confirmLabel="Activate Emergency Stop"
          confirmColour="bg-red-600 hover:bg-red-500"
          onConfirm={handleEStop}
          onCancel={() => setShowEstop(false)}
        />
      )}
      {showDeploy && (
        <ConfirmDialog
          title="Deploy WINBOT"
          description="This will lower the cleaning cradle to the facade. Ensure the area below is clear and exclusion zones are in place."
          confirmLabel="Confirm Deploy"
          confirmColour="bg-blue-600 hover:bg-blue-500"
          onConfirm={handleDeploy}
          onCancel={() => setShowDeploy(false)}
        />
      )}
      {showRetrieve && (
        <ConfirmDialog
          title="Retrieve WINBOT"
          description="This will raise the cleaning cradle back to the rooftop. Confirm that cables are clear and unobstructed."
          confirmLabel="Confirm Retrieve"
          confirmColour="bg-blue-700 hover:bg-blue-600"
          onConfirm={handleRetrieve}
          onCancel={() => setShowRetrieve(false)}
        />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-[#4F2D84] text-white font-medium"
          : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function DashCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <h2 className="font-semibold text-gray-400 text-sm uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

function ControlButton({
  label,
  colour,
  onClick,
  disabled,
}: {
  label: string;
  colour: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 px-4 rounded-lg font-semibold text-white text-sm transition-colors ${colour} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmColour,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  confirmColour: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="font-bold text-white text-lg mb-2">{title}</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 font-semibold text-sm hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-lg text-white font-semibold text-sm transition-colors ${confirmColour}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page Root ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [authed, setAuthed] = useState(false);

  if (!authed) {
    return <LoginGate onLogin={() => setAuthed(true)} />;
  }

  return <Dashboard onLogout={() => setAuthed(false)} />;
}
