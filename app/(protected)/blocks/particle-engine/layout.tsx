import { Toaster } from "sonner";
import { MjolnirSidebar } from "@/components/Dashboards/Sidebar";
import { MjolnirHeader } from "@/components/Dashboards/Header";
import { MobileLayout } from "@/components/Dashboards/MobileLayout";

export const metadata = {
  title: "Particle Engine • MjolnirUI",
  description: "Interactive geometric particle designer — Pro tier and above.",
};

export default function ParticleEngineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Desktop layout — hidden below md */}
      <div className="hidden md:flex h-screen bg-black text-white overflow-hidden">
        <MjolnirSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <MjolnirHeader />
          <main className="flex-1 overflow-hidden bg-linear-to-br from-zinc-950/50 via-black to-zinc-950/50 min-h-0">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile layout — visible below md */}
      <div className="md:hidden bg-black text-white min-h-screen w-full overflow-x-hidden">
        <MobileLayout>{children}</MobileLayout>
      </div>

      <Toaster position="bottom-right" richColors theme="dark" />
    </>
  );
}
