export const BUILDING = "Amit Chakma Engineering Building (ACEB)";

export type BaseStatus = "Confirmed" | "Tentative";
export type DerivedStatus = "Active" | "Completed" | BaseStatus;

export interface ScheduleEntry {
  id: number;
  day: string;
  date: string;    // display, e.g. "Apr 7, 2026"
  dateISO: string; // "2026-04-07" — used for comparisons
  zone: string;
  startTime: string; // "9:30 AM"
  endTime: string;   // "11:30 AM"
  baseStatus: BaseStatus;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Fixed weekly rotation — dates are injected dynamically each week
// ---------------------------------------------------------------------------

interface DayRotation {
  day: string;
  zone: string;
  startTime: string;
  endTime: string;
  baseStatus: BaseStatus;
  notes?: string;
}

const ROTATION: DayRotation[] = [
  {
    day: "Monday",
    zone: "South Facade, Floors 1-2",
    startTime: "9:30 AM",
    endTime: "11:30 AM",
    baseStatus: "Confirmed",
  },
  {
    day: "Tuesday",
    zone: "East Facade, Floors 1-4",
    startTime: "6:30 AM",
    endTime: "10:00 AM",
    baseStatus: "Confirmed",
  },
  {
    day: "Wednesday",
    zone: "East Facade, Floors 3-4",
    startTime: "7:00 AM",
    endTime: "12:00 PM",
    baseStatus: "Confirmed",
  },
  {
    day: "Thursday",
    zone: "North Facade, Floors 1-3",
    startTime: "7:00 AM",
    endTime: "11:00 AM",
    baseStatus: "Confirmed",
  },
  {
    day: "Friday",
    zone: "West Facade, Full Height",
    startTime: "6:00 AM",
    endTime: "1:30 PM",
    baseStatus: "Tentative",
  },
  {
    day: "Saturday",
    zone: "Maintenance and System Check",
    startTime: "9:00 AM",
    endTime: "11:00 AM",
    baseStatus: "Tentative",
    notes: "No facade operation. Equipment maintenance only.",
  },
];

// ---------------------------------------------------------------------------
// Eastern Time helpers (all pure, no external deps)
// ---------------------------------------------------------------------------

/** Current date in ET as "YYYY-MM-DD". */
export function getEasternDateISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

/** Current time in ET as total minutes since midnight. */
export function getEasternMinutes(): number {
  const now = new Date();
  const h = parseInt(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/New_York",
    }).format(now),
    10
  );
  const m = parseInt(
    new Intl.DateTimeFormat("en-US", {
      minute: "numeric",
      timeZone: "America/New_York",
    }).format(now),
    10
  );
  return h * 60 + m;
}

/** Parse "9:30 AM" → total minutes since midnight. */
export function parseTimeMinutes(timeStr: string): number {
  const [time, period] = timeStr.split(" ");
  const [hRaw, mRaw] = time.split(":").map(Number);
  let h = hRaw;
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + (mRaw ?? 0);
}

// ---------------------------------------------------------------------------
// Dynamic schedule generation
// ---------------------------------------------------------------------------

const DATE_DISPLAY_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/**
 * Build the Mon–Sat schedule for the week that contains the current ET date.
 * The rotation pattern is fixed; only the calendar dates change each week.
 * Safe to call on every render — no side effects.
 */
export function generateWeekSchedule(): ScheduleEntry[] {
  const todayISO = getEasternDateISO();

  // Parse as local-midnight so date arithmetic stays in local space and
  // doesn't risk a UTC boundary shift changing the day.
  const today = new Date(`${todayISO}T00:00:00`);
  const dow = today.getDay(); // 0 = Sun … 6 = Sat
  const daysFromMonday = dow === 0 ? 6 : dow - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);

  return ROTATION.map((rot, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    // Build ISO string from local-time components to avoid UTC shift
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const dateISO = `${yyyy}-${mm}-${dd}`;

    return {
      id: i + 1,
      day: rot.day,
      date: DATE_DISPLAY_FMT.format(d), // "Apr 7, 2026"
      dateISO,
      zone: rot.zone,
      startTime: rot.startTime,
      endTime: rot.endTime,
      baseStatus: rot.baseStatus,
      notes: rot.notes,
    };
  });
}

// ---------------------------------------------------------------------------
// Status & countdown helpers
// ---------------------------------------------------------------------------

/**
 * Derive the live display status for a schedule entry.
 * Past day → Completed | During window → Active | Before window → baseStatus
 */
export function getDerivedStatus(entry: ScheduleEntry): DerivedStatus {
  const todayISO = getEasternDateISO();

  if (entry.dateISO < todayISO) return "Completed";
  if (entry.dateISO > todayISO) return entry.baseStatus;

  // Same calendar day — check the time window
  const now = getEasternMinutes();
  const start = parseTimeMinutes(entry.startTime);
  const end = parseTimeMinutes(entry.endTime);

  if (now >= start && now < end) return "Active";
  if (now >= end) return "Completed";
  return entry.baseStatus; // window hasn't started yet
}

/**
 * If today's entry hasn't started yet, return a human-readable countdown.
 * Returns null for past/active/future entries.
 */
export function getCountdown(entry: ScheduleEntry): string | null {
  const todayISO = getEasternDateISO();
  if (entry.dateISO !== todayISO) return null;

  const now = getEasternMinutes();
  const start = parseTimeMinutes(entry.startTime);
  if (now >= start) return null;

  const diff = start - now;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? `Starts in ${h}h ${m}m` : `Starts in ${m}m`;
}

/**
 * Return the next upcoming (or currently active) operation from the current
 * week's generated schedule. Returns null when all operations this week are done.
 */
export function getNextOperation(): ScheduleEntry | null {
  const schedule = generateWeekSchedule();
  const todayISO = getEasternDateISO();
  const nowMinutes = getEasternMinutes();

  for (const entry of schedule) {
    if (entry.dateISO > todayISO) return entry;
    if (entry.dateISO === todayISO) {
      const end = parseTimeMinutes(entry.endTime);
      if (nowMinutes < end) return entry;
    }
  }
  return null;
}
