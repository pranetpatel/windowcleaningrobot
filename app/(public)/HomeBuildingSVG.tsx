"use client";

import { useState, useEffect, useRef } from "react";

// SVG layout constants — 4 floors (actual ACEB building)
const COLS   = 12;
const FLOORS = 4;
const WIN_W  = 36;
const WIN_H  = 50;
const GAP_X  = 4;
const GAP_Y  = 5;
const COL_W  = WIN_W + GAP_X;           // 40
const ROW_H  = WIN_H + GAP_Y;           // 55
const BLDG_X = 32;
const BLDG_Y = 52;
const BLDG_W = COLS * COL_W - GAP_X;   // 476
const BLDG_H = FLOORS * ROW_H - GAP_Y; // 215
const RAIL_Y = 20;
const SVG_W  = BLDG_X + BLDG_W + 28;  // 536
const SVG_H  = BLDG_Y + BLDG_H + 14;  // 281
const LOOP_MS = 90_000; // 90-second loop cycle

function computeAnim(pct: number) {
  const colF = (pct / 100) * COLS;
  const col  = Math.min(Math.floor(colF), COLS - 1);
  const cp   = colF - Math.floor(colF);
  const cable =
    cp < 0.35  ? cp / 0.35
    : cp <= 0.65 ? 1.0
    : 1.0 - (cp - 0.65) / 0.35;
  const cableLen     = cable * BLDG_H;
  const floor        = Math.min(Math.floor((cableLen / BLDG_H) * FLOORS), FLOORS - 1);
  const cartX        = BLDG_X + (pct / 100) * BLDG_W;
  const isDescending = cp < 0.65;
  const sway         = Math.sin(Date.now() / 600) * 1.4;
  return { col, floor, cable, cableLen, cartX, isDescending, sway };
}

export default function HomeBuildingSVG() {
  const [cartPct, setCartPct]           = useState(0);
  const [cleanedCells, setCleanedCells] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let startTime  = Date.now();
    let localClean: Set<string> = new Set();
    let pausing    = false;
    let pauseEnd   = 0;

    intervalRef.current = setInterval(() => {
      if (pausing) {
        if (Date.now() < pauseEnd) return;
        pausing    = false;
        startTime  = Date.now();
        localClean = new Set();
        setCleanedCells(new Set());
        setCartPct(0);
        return;
      }

      const elapsed = Date.now() - startTime;
      const pct     = Math.min((elapsed / LOOP_MS) * 100, 100);
      setCartPct(pct);

      const { col, floor, cable, isDescending } = computeAnim(pct);
      if (cable > 0.05) {
        const limit   = isDescending ? floor : FLOORS - 1;
        let changed   = false;
        for (let f = 0; f <= limit; f++) {
          const key = `${col}-${f}`;
          if (!localClean.has(key)) { localClean.add(key); changed = true; }
        }
        if (changed) setCleanedCells(new Set(localClean));
      }

      if (pct >= 100) {
        pausing  = true;
        pauseEnd = Date.now() + 2_000;
      }
    }, 50);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const { col, floor, cable, cableLen, cartX, isDescending, sway } = computeAnim(cartPct);
  const showRope  = cable > 0.01;
  const winbotX   = showRope ? cartX + sway : cartX;
  const cableBotY = BLDG_Y + Math.min(cableLen, BLDG_H);
  const activity  = !showRope ? "Traversing" : isDescending ? "Cleaning" : "Retrieving";

  return (
    <div>
      {/* Building SVG */}
      <div className="rounded-xl overflow-hidden bg-[#07101e] border border-purple-900/40">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width="100%"
          style={{ display: "block" }}
        >
          <defs>
            <filter id="hglow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="hwglow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <linearGradient id="hrg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e8d8ff"/>
              <stop offset="100%" stopColor="#9878d0"/>
            </linearGradient>
          </defs>

          {/* Background */}
          <rect width={SVG_W} height={SVG_H} fill="#07101e"/>

          {/* Building body */}
          <rect
            x={BLDG_X - 1} y={BLDG_Y - 1}
            width={BLDG_W + 2} height={BLDG_H + 2}
            fill="#0a0e1c" stroke="#2a1a4a" strokeWidth={1.5} rx={1}
          />

          {/* Window grid */}
          {Array.from({ length: FLOORS }, (_, f) =>
            Array.from({ length: COLS }, (_, c) => {
              const key     = `${c}-${f}`;
              const cleaned = cleanedCells.has(key);
              const glow    = c === col && f === floor && cable > 0.05 && isDescending;
              const fill    = glow ? "#d4b8ff"
                : cleaned   ? "#4a2890"
                : "#180d38";
              return (
                <rect key={key}
                  x={BLDG_X + c * COL_W} y={BLDG_Y + f * ROW_H}
                  width={WIN_W} height={WIN_H}
                  fill={fill} stroke="#1e0e3e" strokeWidth={0.5}
                  filter={glow ? "url(#hglow)" : undefined}
                />
              );
            })
          )}

          {/* Floor labels */}
          {Array.from({ length: FLOORS }, (_, f) => (
            <text key={f}
              x={BLDG_X - 5} y={BLDG_Y + f * ROW_H + WIN_H / 2 + 4}
              textAnchor="end" fontSize="9" fill="#4a3070" fontFamily="monospace"
            >{FLOORS - f}</text>
          ))}

          {/* Ground */}
          <rect x={BLDG_X - 1} y={BLDG_Y + BLDG_H + 1}
            width={BLDG_W + 2} height={6} fill="#1e0e40" rx={1}/>

          {/* Rail */}
          <line
            x1={BLDG_X - 12} y1={RAIL_Y}
            x2={BLDG_X + BLDG_W + 12} y2={RAIL_Y}
            stroke="url(#hrg)" strokeWidth={4} strokeLinecap="round"
          />
          <rect x={BLDG_X - 14} y={RAIL_Y - 7} width={4} height={14} fill="#7060a0" rx={1.5}/>
          <rect x={BLDG_X + BLDG_W + 10} y={RAIL_Y - 7} width={4} height={14} fill="#7060a0" rx={1.5}/>

          {/* Cable */}
          {showRope && (
            <line
              x1={winbotX} y1={RAIL_Y}
              x2={winbotX} y2={cableBotY}
              stroke="#c8b8f0" strokeWidth={1.2} opacity={0.8}
            />
          )}

          {/* Cart */}
          <g>
            <rect x={cartX - 14} y={RAIL_Y - 16} width={28} height={16}
              fill="#f0eaff" rx={2}/>
            <rect x={cartX - 11} y={RAIL_Y - 13} width={10} height={8} fill="#b0a0d8" rx={1}/>
            <rect x={cartX + 1}  y={RAIL_Y - 13} width={10} height={8} fill="#b0a0d8" rx={1}/>
            {([-9, 9] as const).map(dx => (
              <circle key={dx} cx={cartX + dx} cy={RAIL_Y + 2} r={3.5} fill="#6050a0"/>
            ))}
            <line x1={cartX - 9} y1={RAIL_Y + 2} x2={cartX + 9} y2={RAIL_Y + 2}
              stroke="#4a3880" strokeWidth={1}/>
          </g>

          {/* WINBOT module */}
          {showRope && (
            <g filter="url(#hwglow)">
              <rect
                x={winbotX - 11} y={cableBotY}
                width={22} height={14}
                fill="#f0eaff" stroke="#c090ff" strokeWidth={1} rx={2}
              />
              {cable > 0.88 && (
                <line x1={winbotX - 10} y1={cableBotY + 14}
                  x2={winbotX + 10} y2={cableBotY + 14}
                  stroke="#9060f0" strokeWidth={2.5} strokeLinecap="round" opacity={0.9}/>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Stat strip */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-900/60 rounded-lg py-2 px-3 border border-purple-900/30">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Column</p>
          <p className="text-sm font-bold text-white tabular-nums">{col + 1} / {COLS}</p>
        </div>
        <div className="bg-gray-900/60 rounded-lg py-2 px-3 border border-purple-900/30">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Floor</p>
          <p className="text-sm font-bold text-white tabular-nums">
            {cable > 0.05 ? `${FLOORS - floor} / ${FLOORS}` : `- / ${FLOORS}`}
          </p>
        </div>
        <div className="bg-gray-900/60 rounded-lg py-2 px-3 border border-purple-900/30">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Activity</p>
          <p className="text-sm font-bold text-purple-300">{activity}</p>
        </div>
      </div>
    </div>
  );
}
