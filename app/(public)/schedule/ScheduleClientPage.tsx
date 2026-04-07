"use client";

import { useEffect, useState } from "react";
import {
  BUILDING,
  DerivedStatus,
  generateWeekSchedule,
  getDerivedStatus,
  getCountdown,
  getEasternDateISO,
} from "@/lib/schedule";

const STATUS_STYLES: Record<DerivedStatus, string> = {
  Active:    "bg-green-100 text-green-800",
  Confirmed: "bg-green-100 text-green-800",
  Tentative: "bg-yellow-100 text-yellow-800",
  Completed: "bg-gray-100 text-gray-600",
};

const ALL_STATUSES: DerivedStatus[] = ["Active", "Confirmed", "Tentative", "Completed"];

// ---------------------------------------------------------------------------
// Live clock — ticks every second
// ---------------------------------------------------------------------------

function LiveClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const tick = () => setTime(fmt.format(new Date()) + " ET");
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-sm text-gray-500 tabular-nums">{time}</span>
  );
}

// ---------------------------------------------------------------------------
// Main schedule component
// ---------------------------------------------------------------------------

export default function ScheduleClientPage() {
  // Tick every 60 s so statuses and countdown strings stay current.
  // generateWeekSchedule() is called on every render, so dates also stay fresh
  // across a midnight boundary without needing a page reload.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const schedule = generateWeekSchedule();
  const todayISO = getEasternDateISO();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <p className="text-sm font-semibold text-[#4F2D84] uppercase tracking-wide">
            {BUILDING}
          </p>
          <LiveClock />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Operation Schedule
        </h1>
        <p className="text-gray-600 text-lg">
          Planned WinBot operation windows for the current week. All times are
          Eastern Time. Schedules are subject to change based on weather, wind
          conditions, and building access.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-sm font-semibold text-gray-700">Status key:</span>
        {ALL_STATUSES.map((s) => (
          <span
            key={s}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s]}`}
          >
            {s === "Active" && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
            {s}
          </span>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 shadow-sm mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#4F2D84] text-white">
              <th className="px-4 py-3 text-left font-semibold">Day</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Zone / Area</th>
              <th className="px-4 py-3 text-left font-semibold">Start</th>
              <th className="px-4 py-3 text-left font-semibold">End</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schedule.map((entry, i) => {
              const derived = getDerivedStatus(entry);
              const isToday = entry.dateISO === todayISO;
              const countdown = isToday ? getCountdown(entry) : null;

              return (
                <tr
                  key={entry.id}
                  className={`${
                    isToday
                      ? "bg-purple-50"
                      : i % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50"
                  } hover:bg-purple-50 transition-colors`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {entry.day}
                    {isToday && (
                      <span className="ml-2 text-xs text-[#4F2D84] font-semibold">
                        Today
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{entry.date}</td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900">{entry.zone}</span>
                    {entry.notes && (
                      <p className="text-xs text-gray-500 mt-0.5">{entry.notes}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-mono">{entry.startTime}</td>
                  <td className="px-4 py-3 text-gray-700 font-mono">{entry.endTime}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${STATUS_STYLES[derived]}`}
                      >
                        {derived === "Active" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        )}
                        {derived}
                      </span>
                      {countdown && (
                        <span className="text-xs text-[#4F2D84] font-medium tabular-nums">
                          {countdown}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 mb-8">
        {schedule.map((entry) => {
          const derived = getDerivedStatus(entry);
          const isToday = entry.dateISO === todayISO;
          const countdown = isToday ? getCountdown(entry) : null;

          return (
            <div
              key={entry.id}
              className={`rounded-xl border p-4 shadow-sm ${
                isToday
                  ? "border-[#4F2D84] bg-purple-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-bold text-gray-900">{entry.day}</span>
                  {isToday && (
                    <span className="ml-2 text-xs text-[#4F2D84] font-semibold">
                      Today
                    </span>
                  )}
                  <p className="text-xs text-gray-500">{entry.date}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[derived]}`}
                  >
                    {derived === "Active" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    )}
                    {derived}
                  </span>
                  {countdown && (
                    <span className="text-xs text-[#4F2D84] font-medium tabular-nums">
                      {countdown}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{entry.zone}</p>
              <p className="text-xs text-gray-600 mb-2">{BUILDING}</p>
              <div className="flex gap-4 text-sm">
                <span className="text-gray-600">
                  <span className="font-medium">Start:</span>{" "}
                  <span className="font-mono">{entry.startTime}</span>
                </span>
                <span className="text-gray-600">
                  <span className="font-medium">End:</span>{" "}
                  <span className="font-mono">{entry.endTime}</span>
                </span>
              </div>
              {entry.notes && (
                <p className="mt-2 text-xs text-gray-500 italic">{entry.notes}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex gap-3">
          <span className="text-amber-600 text-xl flex-shrink-0">ℹ️</span>
          <div>
            <p className="font-semibold text-amber-900 mb-1">Schedule Updates</p>
            <p className="text-amber-800 text-sm leading-relaxed">
              Operations may be postponed due to wind speeds above 25 km/h, rain, or building access issues. Updates are posted here and communicated via Facilities Management. For urgent questions, call{" "}
              <span className="font-mono font-semibold">519-661-3698</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
