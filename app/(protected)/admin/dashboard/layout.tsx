import { Toaster } from "sonner";
import { MjolnirSidebar } from "@/components/ui/Dashboards/sidebar";
import { MjolnirHeader } from "@/components/ui/Dashboards/header";

export const metadata = {
  title: "MjolnirUI Admin • Dashboard",
  description: "Admin area for MjolnirUI project management.",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white flex">
      <MjolnirSidebar />
      <div className="flex-1 flex flex-col">
        <MjolnirHeader />
        <main className="flex-1 p-6 md:p-10 bg-linear-to-br from-zinc-950/50 via-black to-zinc-950/50 overflow-auto">
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" richColors theme="dark" />
    </div>
  );
}
