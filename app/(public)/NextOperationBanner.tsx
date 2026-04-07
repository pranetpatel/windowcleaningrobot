"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNextOperation, getDerivedStatus, ScheduleEntry, BUILDING } from "@/lib/schedule";

export default function NextOperationBanner() {
  const [next, setNext] = useState<ScheduleEntry | null>(null);

  useEffect(() => {
    const update = () => setNext(getNextOperation());
    update();
    // Re-evaluate every minute so the banner advances automatically
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!next) return null;

  const derived = getDerivedStatus(next);
  const isActive = derived === "Active";

  return (
    <section className="bg-purple-50 border-b border-purple-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-[#4F2D84] rounded-lg flex items-center justify-center text-white text-2xl">
              {isActive ? "🟢" : "📅"}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#4F2D84] uppercase tracking-wide mb-1">
              {isActive ? "Currently Active" : "Next Scheduled Operation"}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {next.day}, {next.date} &middot; {next.startTime} to {next.endTime} ET
            </p>
            <p className="text-sm text-gray-600">
              {BUILDING} — {next.zone}
            </p>
          </div>
          <Link
            href="/schedule"
            className="text-sm font-semibold text-[#4F2D84] hover:underline whitespace-nowrap"
          >
            Full schedule →
          </Link>
        </div>
      </div>
    </section>
  );
}
