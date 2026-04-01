import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <nav className="bg-[#4F2D84] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                <svg
                  viewBox="0 0 32 32"
                  className="w-6 h-6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="4" y="4" width="24" height="18" rx="2" fill="#4F2D84" />
                  <rect x="7" y="7" width="7" height="9" rx="1" fill="#a78bdb" opacity="0.6" />
                  <rect x="16" y="7" width="7" height="9" rx="1" fill="#a78bdb" opacity="0.6" />
                  <rect x="7" y="18" width="18" height="2" rx="1" fill="#6b44a8" />
                  <circle cx="16" cy="26" r="3" fill="#4F2D84" />
                  <rect x="13" y="20" width="6" height="6" rx="1" fill="#6b44a8" />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight group-hover:text-purple-200 transition-colors">
                WinBot
                <span className="hidden sm:inline font-normal text-purple-300 ml-1">
                  — Western University
                </span>
              </span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-2">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/schedule">Schedule</NavLink>
              <NavLink href="/safety">Safety</NavLink>
              <NavLink href="/faq">FAQ</NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#4F2D84] text-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="font-semibold text-lg mb-2">WinBot</p>
              <p className="text-purple-300 text-sm">
                Automated rooftop window-cleaning system operated by Facilities
                Management, University of Western Ontario.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Emergency Contact</p>
              <p className="text-purple-300 text-sm">Facilities Management</p>
              <p className="text-white font-mono text-sm mt-1">519-661-3698</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Quick Links</p>
              <ul className="space-y-1 text-sm text-purple-300">
                <li>
                  <Link href="/schedule" className="hover:text-white transition-colors">
                    Operation Schedule
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-white transition-colors">
                    Safety Information
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-purple-700">
            <p className="text-purple-400 text-xs text-center">
              ⚠ SAFETY DISCLAIMER: The WinBot system operates on rooftops and building
              facades. Always observe clearance zones during operation. Do not approach
              the building perimeter within designated safety boundaries while the system
              is active. Report any concerns immediately to Facilities Management at
              519-661-3698.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-md text-sm font-medium text-purple-200 hover:text-white hover:bg-purple-700 transition-colors"
    >
      {children}
    </Link>
  );
}
