import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety Information | WinBot",
};

export default function SafetyPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-semibold text-[#4F2D84] uppercase tracking-wide mb-2">
          Safety Information
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          WinBot Safety Guidelines
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl">
          The safety of all students, staff, and visitors is our top priority. Please review the following guidelines before, during, and after WinBot operations at the Amit Chakma Engineering Building (ACEB).
        </p>
      </div>

      {/* Emergency Banner */}
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 mb-10">
        <div className="flex gap-3">
          <span className="text-red-600 text-2xl flex-shrink-0">🚨</span>
          <div>
            <p className="font-bold text-red-900 text-lg mb-1">Emergency Contact</p>
            <p className="text-red-800 mb-2">
              If you observe an unsafe condition, equipment malfunction, or fallen debris,
              contact Facilities Management immediately:
            </p>
            <p className="font-mono text-2xl font-bold text-red-900">519-661-3698</p>
            <p className="text-red-700 text-sm mt-1">
              Available 24/7 during active operations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* What to Expect */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#4F2D84] rounded-lg flex items-center justify-center text-white text-xl">
              🤖
            </div>
            <h2 className="text-xl font-bold text-gray-900">What to Expect</h2>
          </div>
          <ul className="space-y-3 text-gray-700 text-sm">
            <li className="flex gap-3">
              <span className="text-[#4F2D84] font-bold mt-0.5">•</span>
              <span>
                <strong>Visible movement:</strong> The robot travels horizontally along a
                rooftop rail system at approximately 0.3 m/s. You may see it moving along
                the building facade.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#4F2D84] font-bold mt-0.5">•</span>
              <span>
                <strong>Cleaning cradle:</strong> A suspended cleaning unit descends from
                the rooftop gantry on cables to reach each window section.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#4F2D84] font-bold mt-0.5">•</span>
              <span>
                <strong>Water spray:</strong> Purified water is sprayed via brushes onto
                window surfaces. Light misting may be noticeable at ground level in windy
                conditions.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#4F2D84] font-bold mt-0.5">•</span>
              <span>
                <strong>Noise level:</strong> Motor and brush sounds are audible from
                within 10 metres. The system operates at approximately 65 dB, similar to a
                normal conversation.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#4F2D84] font-bold mt-0.5">•</span>
              <span>
                <strong>Signage &amp; barriers:</strong> Facilities Management staff place
                physical barriers and safety signs at least 30 minutes before operations
                begin.
              </span>
            </li>
          </ul>
        </section>

        {/* Clearance Zones */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white text-xl">
              🚧
            </div>
            <h2 className="text-xl font-bold text-gray-900">Clearance Zones</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            The following perimeter zones are enforced during all active operations:
          </p>
          <div className="space-y-3">
            <ClearanceZoneItem
              zone="Zone A: Exclusion Zone"
              distance="0–5 metres from building base"
              colour="bg-red-100 border-red-300 text-red-800"
              description="No access. Barriers in place. Only authorized Facilities Management staff permitted."
            />
            <ClearanceZoneItem
              zone="Zone B: Caution Zone"
              distance="5–10 metres from building base"
              colour="bg-amber-100 border-amber-300 text-amber-800"
              description="Reduced speed pedestrian zone. Stay alert and avoid lingering. No parking."
            />
            <ClearanceZoneItem
              zone="Zone C: Awareness Zone"
              distance="10–15 metres from building base"
              colour="bg-yellow-50 border-yellow-200 text-yellow-800"
              description="Normal access with awareness. Watch for wet ground. No vehicles."
            />
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Zone boundaries may expand based on wind conditions or building geometry.
          </p>
        </section>

        {/* If You See Something */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl">
              👁️
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              If You See Something Unusual
            </h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Please act quickly if you notice any of the following:
          </p>
          <ul className="space-y-3 text-sm">
            <UnusualItem
              icon="⚠️"
              text="Robot appears to have stopped unexpectedly or is making unusual sounds"
            />
            <UnusualItem icon="🪨" text="Falling debris, water, or equipment near the building" />
            <UnusualItem
              icon="🔌"
              text="Visible cable issues, sparking, or smoke from the system"
            />
            <UnusualItem
              icon="🚷"
              text="Unauthorized persons entering the exclusion zone"
            />
            <UnusualItem
              icon="💧"
              text="Excessive water pooling creating slip hazards beyond Zone C"
            />
          </ul>
          <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-semibold text-sm">
              Call <span className="font-mono">519-661-3698</span> immediately. Do not
              attempt to approach or touch the equipment.
            </p>
          </div>
        </section>

        {/* What the robot looks like */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#4F2D84] rounded-lg flex items-center justify-center text-white text-xl">
              📋
            </div>
            <h2 className="text-xl font-bold text-gray-900">Identifying the System</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            WinBot consists of several visible components:
          </p>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="font-bold text-[#4F2D84] w-24 flex-shrink-0">Rooftop cart</span>
              <span>Purple and grey aluminium chassis mounted on rooftop rails, approximately 1.2m wide.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-[#4F2D84] w-24 flex-shrink-0">Cradle</span>
              <span>White suspended cleaning unit on 4 cables, approximately 0.8m × 0.6m.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-[#4F2D84] w-24 flex-shrink-0">Brushes</span>
              <span>Rotating blue nylon brushes visible from the ground. Water-fed, no chemicals.</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-[#4F2D84] w-24 flex-shrink-0">Signage</span>
              <span>Purple &amp; yellow "WinBot Operating" signs placed by staff at all entry points.</span>
            </div>
          </div>
        </section>
      </div>

      {/* Best Practices */}
      <section className="bg-[#4F2D84] text-white rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6">Best Practices During Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <BestPracticeCard icon="🚶" title="Use alternate entrances" description="Facilities Management will indicate alternate building access points." />
          <BestPracticeCard icon="☂️" title="Carry an umbrella" description="Light water misting may occur, especially on windy days near active zones." />
          <BestPracticeCard icon="📵" title="Don't distract staff" description="Operators need full concentration. Direct questions to 519-661-3698." />
          <BestPracticeCard icon="📸" title="Photography is fine" description="You may photograph the robot at a safe distance from Zone C or beyond." />
        </div>
      </section>
    </div>
  );
}

function ClearanceZoneItem({
  zone,
  distance,
  colour,
  description,
}: {
  zone: string;
  distance: string;
  colour: string;
  description: string;
}) {
  return (
    <div className={`border rounded-lg p-3 ${colour}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
        <span className="font-bold text-sm">{zone}</span>
        <span className="text-xs font-mono opacity-80">{distance}</span>
      </div>
      <p className="text-xs leading-relaxed">{description}</p>
    </div>
  );
}

function UnusualItem({ icon, text }: { icon: string; text: string }) {
  return (
    <li className="flex gap-3 text-gray-700">
      <span className="text-lg flex-shrink-0">{icon}</span>
      <span>{text}</span>
    </li>
  );
}

function BestPracticeCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-purple-700 rounded-lg p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="font-semibold text-white mb-1">{title}</p>
      <p className="text-purple-200 text-xs leading-relaxed">{description}</p>
    </div>
  );
}
