import { Toaster } from "sonner";
import { MjolnirSidebar } from "@/components/ui/Dashboards/sidebar";
import { MjolnirHeader } from "@/components/ui/Dashboards/header";

export const metadata = {
  title: "MjolnirUI Pro • Dashboard",
  description: "Welcome to the Asgardian Realm of MjolnirUI Pro!",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Permanent Sidebar */}
      <MjolnirSidebar />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <MjolnirHeader />
        {/* Page Content */}
        <main className="flex-1 p-6 md:p-10 bg-linear-to-br from-zinc-950/50 via-black to-zinc-950/50 overflow-auto">
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" richColors theme="dark" />
    </div>
  );
}
