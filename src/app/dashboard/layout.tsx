import { SidebarNav } from "@/components/ui/SidebarNav";
import { GrainOverlay } from "@/components/ui/GrainOverlay";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <GrainOverlay />
      <SidebarNav />
      <main className="flex-1 md:ml-64 p-8 md:p-12 lg:p-16">
        {children}
      </main>
    </div>
  );
}
