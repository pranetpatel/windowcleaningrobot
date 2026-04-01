import Link from "next/link";

const CURRENT_STATUS: "Active" | "Scheduled" | "Offline" = "Scheduled";

const STATUS_CONFIG = {
  Active: {
    badge: "bg-green-100 text-green-800 border-green-300",
    dot: "bg-green-500",
    label: "Active",
    description: "The WinBot system is currently operating on the building facade.",
  },
  Scheduled: {
    badge: "bg-blue-100 text-blue-800 border-blue-300",
    dot: "bg-blue-500",
    label: "Scheduled",
    description: "WinBot has upcoming operations scheduled this week.",
  },
  Offline: {
    badge: "bg-gray-100 text-gray-700 border-gray-300",
    dot: "bg-gray-400",
    label: "Offline",
    description: "WinBot is not currently scheduled for operation.",
  },
};

const NEXT_SCHEDULED_RUN = {
  date: "Thursday, April 3, 2026",
  time: "7:00 AM – 11:00 AM",
  building: "Ivey Spencer Leadership Centre",
  zone: "South Facade, Floors 3–6",
};

export default function HomePage() {
  const status = STATUS_CONFIG[CURRENT_STATUS];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-[#4F2D84] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${status.badge}`}
              >
                <span className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                {status.label}
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
              WinBot
            </h1>
            <p className="text-xl sm:text-2xl text-purple-200 mb-8 leading-relaxed">
              Western University&apos;s automated rooftop window-cleaning robot —
              keeping campus buildings clear, safe, and looking their best.
            </p>
            <p className="text-purple-300 text-base mb-10">
              {status.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/schedule"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#4F2D84] font-semibold rounded-lg hover:bg-purple-50 transition-colors"
              >
                View Full Schedule
              </Link>
              <Link
                href="/safety"
                className="inline-flex items-center justify-center px-6 py-3 border border-purple-300 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Safety Information
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Next Scheduled Run Banner */}
      <section className="bg-purple-50 border-b border-purple-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-[#4F2D84] rounded-lg flex items-center justify-center text-white text-2xl">
                📅
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#4F2D84] uppercase tracking-wide mb-1">
                Next Scheduled Operation
              </p>
              <p className="text-lg font-bold text-gray-900">
                {NEXT_SCHEDULED_RUN.date} &middot; {NEXT_SCHEDULED_RUN.time}
              </p>
              <p className="text-sm text-gray-600">
                {NEXT_SCHEDULED_RUN.building} — {NEXT_SCHEDULED_RUN.zone}
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

      {/* Info Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          What you need to know
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon="🤖"
            title="What is WinBot?"
            description="WinBot is an autonomous rail-mounted robot that travels along a rooftop gantry to clean the exterior windows of the Ivey Spencer Leadership Centre using environmentally safe water-fed brushes."
            link={{ href: "/faq", label: "Read the FAQ" }}
          />
          <InfoCard
            icon="⚠️"
            title="Safety Zones"
            description="A 5-metre clearance perimeter is established around the base of the building during all operations. Barriers and signage are placed by Facilities Management staff prior to each run."
            link={{ href: "/safety", label: "Safety details" }}
          />
          <InfoCard
            icon="🗓️"
            title="Operation Schedule"
            description="WinBot typically operates Tuesday through Thursday mornings between 6:00 AM and 2:00 PM, weather permitting. Night operations occur occasionally for low-disruption maintenance."
            link={{ href: "/schedule", label: "View schedule" }}
          />
        </div>
      </section>

      {/* Alert Banner */}
      {CURRENT_STATUS === "Active" && (
        <section className="bg-green-50 border-t border-b border-green-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <span className="text-green-600 text-xl">🟢</span>
              <p className="text-green-800 font-medium">
                WinBot is currently active. Please observe all posted clearance
                zones around the Ivey Spencer Leadership Centre.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Quick status reference */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            System Status Guide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatusGuideItem
              color="bg-green-500"
              label="Active"
              description="Robot is traversing the facade. Clearance zones are in effect."
            />
            <StatusGuideItem
              color="bg-blue-500"
              label="Scheduled"
              description="An operation is planned. Check the schedule for exact timing."
            />
            <StatusGuideItem
              color="bg-gray-400"
              label="Offline"
              description="No operations currently planned or weather conditions prevent operation."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function InfoCard({
  icon,
  title,
  description,
  link,
}: {
  icon: string;
  title: string;
  description: string;
  link: { href: string; label: string };
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>
      <Link
        href={link.href}
        className="text-sm font-semibold text-[#4F2D84] hover:underline"
      >
        {link.label} →
      </Link>
    </div>
  );
}

function StatusGuideItem({
  color,
  label,
  description,
}: {
  color: string;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-4 h-4 rounded-full ${color} mt-0.5 flex-shrink-0`} />
      <div>
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        <p className="text-gray-600 text-xs mt-0.5">{description}</p>
      </div>
    </div>
  );
}
