import CellInspector from "@/components/organism/CellInspector";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useGanttStore } from "@/store/gantt.store";
import { useEffect } from "react";
import { DirectContextMenu } from "../organism/DirectContextMenu";
import Footer from "../organism/Footer";
import GanttChart from "../organism/GanttChart";
import Header from "../organism/Header";

interface LayoutProps {}
const Layout: React.FC<LayoutProps> = () => {
  const initializeGantt = useGanttStore((state) => state.initializeGantt);
  const clearSelection = useGanttStore((state) => state.clearSelection);

  useEffect(() => {
    clearSelection();
    initializeGantt();
  }, []);

  return (
    <SidebarProvider
      defaultOpen={true}
      style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
    >
      {/* <SidebarCloser /> */}
      <SidebarInset>
        <div className="flex h-full min-h-screen w-full flex-col">
          <Header />
          <main className="flex-1 overflow-hidden">
            <DirectContextMenu>
              <GanttChart />
            </DirectContextMenu>
          </main>
          <Footer />
        </div>
      </SidebarInset>
      <Sidebar
        side="right"
        collapsible="offcanvas"
        variant="sidebar"
        className="bg-background border-l"
      >
        <CellInspector />
      </Sidebar>
    </SidebarProvider>
  );
};

export default Layout;
