import type { Metadata } from "next";
import ScheduleClientPage from "./ScheduleClientPage";

export const metadata: Metadata = {
  title: "Operation Schedule — WinBot",
};

export default function SchedulePage() {
  return <ScheduleClientPage />;
}
