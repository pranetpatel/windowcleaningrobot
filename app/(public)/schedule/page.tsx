import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operation Schedule — WinBot",
};

type OperationStatus = "Confirmed" | "Tentative" | "Completed" | "Cancelled";

interface ScheduleEntry {
  id: number;
  day: string;
  date: string;
  building: string;
  zone: string;
  startTime: string;
  endTime: string;
  status: OperationStatus;
  notes?: string;
}

const WEEKLY_SCHEDULE: ScheduleEntry[] = [
  {
    id: 1,
    day: "Monday",
    date: "Mar 30, 2026",
    building: "Ivey Spencer Leadership Centre",
    zone: "North Facade, Floors 2–4",
    startTime: "7:00 AM",
    endTime: "10:30 AM",
    status: "Completed",
  },
  {
    id: 2,
    day: "Tuesday",
    date: "Apr 1, 2026",
    building: "Ivey Spencer Leadership Centre",
    zone: "East Facade, Floors 2–6",
    startTime: "6:30 AM",
    endTime: "11:00 AM",
    status: "Completed",
  },
  {
    id: 3,
    day: "Wednesday",
    date: "Apr 2, 2026",
    building: "Ivey Spencer Leadership Centre",
    zone: "East Facade, Floors 6–9 (Upper)",
    startTime: "7:00 AM",
    endTime: "12:00 PM",
    status: "Confirmed",
    notes: "High-reach equipment in use",
  },
  {
    id: 4,
    day: "Thursday",
    date: "Apr 3, 2026",
    building: "Ivey Spencer Leadership Centre",
    zone: "South Facade, Floors 3–6",
    startTime: "7:00 AM",
    endTime: "11:00 AM",
    status: "Confirmed",
  },
  {
    id: 5,
    day: "Thursday",
    date: "Apr 3, 2026",
    building: "Ivey Spencer Leadership Centre",
    zone: "South Facade, Floors 6–9",
    startTime: "11:30 AM",
    endTime: "2:00 PM",
    status: "Tentative",
    notes: "Subject to weather conditions",
  },
  {
    id: 6,
    day: "Friday",
    date: "Apr 4, 2026",
    building: "Ivey Spencer Leadership Centre",
    zone: "West Facade, Full Height",
    startTime: "6:00 AM",
    endTime: "1:30 PM",
    status: "Tentative",
    notes: "Extended run — night guard on standby",
  },
  {
    id: 7,
    day: "Saturday",
    date: "Apr 5, 2026",
    building: "Ivey Spencer Leadership Centre",
    zone: "Maintenance & System Check",
    startTime: "9:00 AM",
    endTime: "11:00 AM",
    status: "Confirmed",
    notes: "No facade operation — equipment maintenance only",
  },
];

const STATUS_STYLES: Record<OperationStatus, string> = {
  Confirmed: "bg-green-100 text-green-800",
  Tentative: "bg-yellow-100 text-yellow-800",
  Completed: "bg-gray-100 text-gray-600",
  Cancelled: "bg-red-100 text-red-800",
};

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function SchedulePage() {
  const today = "Wednesday"; // mock current day

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-[#4F2D84] uppercase tracking-wide mb-2">
          Ivey Spencer Leadership Centre
        </p>
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
        {(Object.keys(STATUS_STYLES) as OperationStatus[]).map((s) => (
          <span
            key={s}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s]}`}
          >
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
              <th className="px-4 py-3 text-left font-semibold">Building</th>
              <th className="px-4 py-3 text-left font-semibold">Zone / Area</th>
              <th className="px-4 py-3 text-left font-semibold">Start</th>
              <th className="px-4 py-3 text-left font-semibold">End</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {WEEKLY_SCHEDULE.map((entry, i) => (
              <tr
                key={entry.id}
                className={`${
                  entry.day === today ? "bg-purple-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-purple-50 transition-colors`}
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {entry.day}
                  {entry.day === today && (
                    <span className="ml-2 text-xs text-[#4F2D84] font-semibold">Today</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{entry.date}</td>
                <td className="px-4 py-3 text-gray-700">{entry.building}</td>
                <td className="px-4 py-3">
                  <span className="text-gray-900">{entry.zone}</span>
                  {entry.notes && (
                    <p className="text-xs text-gray-500 mt-0.5">{entry.notes}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700 font-mono">{entry.startTime}</td>
                <td className="px-4 py-3 text-gray-700 font-mono">{entry.endTime}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[entry.status]}`}
                  >
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 mb-8">
        {WEEKLY_SCHEDULE.map((entry) => (
          <div
            key={entry.id}
            className={`rounded-xl border p-4 shadow-sm ${
              entry.day === today ? "border-[#4F2D84] bg-purple-50" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-bold text-gray-900">{entry.day}</span>
                {entry.day === today && (
                  <span className="ml-2 text-xs text-[#4F2D84] font-semibold">Today</span>
                )}
                <p className="text-xs text-gray-500">{entry.date}</p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[entry.status]}`}
              >
                {entry.status}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">{entry.zone}</p>
            <p className="text-xs text-gray-600 mb-2">{entry.building}</p>
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
        ))}
      </div>

      {/* Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex gap-3">
          <span className="text-amber-600 text-xl flex-shrink-0">ℹ️</span>
          <div>
            <p className="font-semibold text-amber-900 mb-1">Schedule Updates</p>
            <p className="text-amber-800 text-sm leading-relaxed">
              Operations may be postponed or cancelled due to wind speeds exceeding 25 km/h,
              precipitation, or building access restrictions. Updates are posted here and
              communicated via Western&apos;s Facilities Management alerts. For urgent schedule
              questions, contact{" "}
              <span className="font-mono font-semibold">519-661-3698</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
