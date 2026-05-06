import { Toaster } from "sonner";
import { MjolnirSidebar } from "@/components/Dashboards/Sidebar";
import { MjolnirHeader } from "@/components/Dashboards/Header";
import { MobileLayout } from "@/components/Dashboards/MobileLayout";

export const metadata = {
  title: "Documentation • MjolnirUI",
  description: "Get started with MjolnirUI — installation, CLI reference, MCP integration, and the OdinAI agent.",
};

export default function DocsLayout({
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
          <main
            className="flex-1 overflow-y-auto bg-linear-to-br from-zinc-950/50 via-black to-zinc-950/50 px-6 md:px-10 lg:px-14 py-8"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}
          >
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
