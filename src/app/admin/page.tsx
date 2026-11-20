import type { Metadata } from "next";
import ConnectedAdminDashboard from "@/components/ConnectedAdminDashboard";

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <ConnectedAdminDashboard />;
}
