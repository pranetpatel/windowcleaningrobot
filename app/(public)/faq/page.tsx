"use client";

import { useState } from "react";
import type { Metadata } from "next";

const FAQS = [
  {
    id: 1,
    question: "What does WinBot look like?",
    answer:
      "WinBot consists of two main parts: a rooftop cart (approximately 1.2 m wide, purple and grey aluminium frame) that travels on rails mounted on the building roof, and a suspended cleaning cradle that hangs below on cables. The cradle holds rotating nylon brushes and a water-feed nozzle. When operating, you'll see the cradle moving slowly down and across the building's windows. Purple and yellow 'WinBot Operating' signs are placed at ground level by our staff before operations begin.",
  },
  {
    id: 2,
    question: "How much noise does WinBot make?",
    answer:
      "WinBot operates at approximately 60 to 70 decibels at a distance of 5 metres — roughly equivalent to a normal conversation or light traffic. The dominant sounds are from the drive motors and the rotating brushes. Operations are generally scheduled between 6:00 AM and 2:00 PM on weekdays to reduce disruption to lectures and meetings. If noise is particularly noticeable from inside the building, please close the nearest windows or raise it with Facilities Management.",
  },
  {
    id: 3,
    question: "Is WinBot safe? What are the risks?",
    answer:
      "WinBot is designed with multiple safety systems, including infrared obstacle detection, cable tension monitoring, and automatic emergency stops. Physical barriers are placed at ground level before every operation to keep pedestrians out of the exclusion zone. The system uses only purified water (no chemicals), so there is no chemical exposure risk. The primary residual risk is light water misting during windy conditions and the very low possibility of water droplets reaching pedestrians in Zone B. These risks are managed with appropriate signage and rerouting.",
  },
  {
    id: 4,
    question: "Does WinBot operate at night?",
    answer:
      "Occasional night operations (typically between 10:00 PM and 4:00 AM) are scheduled during periods of low campus activity, such as reading week or statutory holidays. This minimises disruption and allows maintenance during low-visibility periods when the building is unoccupied. Night operations use the same safety zones and are pre-announced via the schedule on this site. Lighting rigs are deployed by Facilities Management staff for visibility. The public schedule is always updated at least 48 hours in advance of any night operations.",
  },
  {
    id: 5,
    question: "What happens if the weather is bad?",
    answer:
      "Operations are automatically postponed if wind speeds exceed 25 km/h at rooftop level, during rain or precipitation, in temperatures below 2°C (risk of ice on surfaces), or during thunderstorm warnings. The system's onboard sensors feed real-time data to the operator dashboard. If conditions deteriorate mid-operation, the system can be halted remotely and the cradle secured. Postponed operations are rescheduled and reflected on this site's schedule page within 24 hours.",
  },
  {
    id: 6,
    question: "Which buildings does WinBot service?",
    answer:
      "The current WinBot deployment is configured for the Amit Chakma Engineering Building (ACEB). The rail system is building-specific and cannot be easily moved. Western Facilities Management is looking at additional buildings for future deployments, but there is no confirmed timeline yet.",
  },
  {
    id: 7,
    question: "How often are windows cleaned?",
    answer:
      "The full facade of the Amit Chakma Engineering Building (ACEB) is cleaned on a quarterly schedule, with touch-up passes done monthly for high-traffic areas. A full cleaning cycle typically takes 3 to 5 working days depending on weather. The schedule on this site reflects the current active cycle.",
  },
  {
    id: 8,
    question: "What should I do if WinBot seems to have stopped or malfunctioned?",
    answer:
      "If you notice WinBot has stopped unexpectedly, is making unusual sounds, or you see any equipment issue (loose cables, sparking, fallen components), do not approach the building perimeter. Call Facilities Management immediately at 519-661-3698. This line is staffed 24/7 during all active operations. Operators can halt the system remotely within seconds. Please do not attempt to interact with or touch any part of the system.",
  },
];

export default function FAQPage() {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-semibold text-[#4F2D84] uppercase tracking-wide mb-2">
          Frequently Asked Questions
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          WinBot FAQ
        </h1>
        <p className="text-gray-600 text-lg">
          Common questions about the WinBot automated window-cleaning system from students,
          faculty, and staff.
        </p>
      </div>

      {/* FAQ Items */}
      <div className="space-y-3 mb-12">
        {FAQS.map((faq) => (
          <FAQItem
            key={faq.id}
            faq={faq}
            isOpen={openId === faq.id}
            onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
          />
        ))}
      </div>

      {/* Contact CTA */}
      <div className="bg-[#4F2D84] text-white rounded-xl p-8 text-center">
        <p className="text-2xl mb-2">Still have questions?</p>
        <p className="text-purple-200 mb-6">
          Contact Facilities Management directly for anything not covered above.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="bg-white text-[#4F2D84] rounded-lg px-6 py-3 font-semibold">
            📞 519-661-3698
          </div>
          <div className="text-purple-300 text-sm">
            Mon to Fri, 7:30 AM to 4:30 PM ET
            <br />
            <span className="italic">24/7 during active operations</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: { id: number; question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${
        isOpen ? "border-[#4F2D84] shadow-md" : "border-gray-200"
      }`}
    >
      <button
        className="w-full text-left px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-colors mt-0.5 ${
            isOpen ? "bg-[#4F2D84] text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          {isOpen ? "−" : "+"}
        </span>
        <span className="font-semibold text-gray-900 text-base">{faq.question}</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-5 pt-0 ml-10">
          <p className="text-gray-700 leading-relaxed text-sm">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}
