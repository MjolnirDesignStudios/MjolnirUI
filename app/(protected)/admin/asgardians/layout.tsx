import { Toaster } from "sonner";
import { MjolnirSidebar } from "@/components/Dashboards/Sidebar";
import { MjolnirHeader } from "@/components/Dashboards/Header";

export const metadata = {
  title: "MjolnirUI Admin • Asgardians",
  description: "Associate Management / HR — resume enhancement, job screening, onboarding.",
};

export default function AsgardiansLayout({ children }: { children: React.ReactNode }) {
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
