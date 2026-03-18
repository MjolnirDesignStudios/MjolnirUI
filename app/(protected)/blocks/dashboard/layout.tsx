import { Toaster } from "sonner";
import { MjolnirSidebar } from "@/components/Dashboards/Sidebar";
import { MjolnirHeader } from "@/components/Dashboards/Header";

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
    <div className="h-screen bg-black text-white flex overflow-hidden">
      {/* Permanent Sidebar */}
      <MjolnirSidebar />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <MjolnirHeader />
        {/* Page Content — scrolls independently inside fixed viewport */}
        <main className="flex-1 overflow-y-auto bg-linear-to-br from-zinc-950/50 via-black to-zinc-950/50 px-6 md:px-10 lg:px-14 py-8"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" richColors theme="dark" />
    </div>
  );
}
