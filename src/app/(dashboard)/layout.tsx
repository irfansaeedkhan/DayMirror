import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export const metadata: Metadata = {
  title: "Chronos",
  description: "Hybrid productivity planner and hourly tracker",
};

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
