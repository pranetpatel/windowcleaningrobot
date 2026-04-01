import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operator Dashboard — WinBot",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-900 text-gray-100">{children}</div>;
}
