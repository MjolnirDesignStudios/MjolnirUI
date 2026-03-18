import { MjolnirSidebar } from "@/components/Dashboards/Sidebar";
import { MjolnirHeader } from "@/components/Dashboards/Header";

export const metadata = {
  title: "Component Library • MjolnirUI",
  description: "Browse 34+ premium React components, GLSL shaders, and 3D animations.",
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      <MjolnirSidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <MjolnirHeader />
        <main className="flex-1 bg-linear-to-br from-zinc-950/50 via-black to-zinc-950/50 overflow-hidden min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
