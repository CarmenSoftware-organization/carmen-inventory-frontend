import type { Metadata } from "next";
import MainDashboard from "./_components/main-dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return <MainDashboard />;
}
