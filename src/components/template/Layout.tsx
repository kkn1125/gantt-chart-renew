import CellInspector from "@/components/organism/CellInspector";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect } from "react";
import Footer from "../organism/Footer";
import GanttChart from "../organism/GanttChart";
import Header from "../organism/Header";
import { DirectContextMenu } from "../organism/DirectContextMenu";

interface LayoutProps {}
const Layout: React.FC<LayoutProps> = () => {
  const SidebarCloser: React.FC = () => {
    const { open, setOpen } = useSidebar();
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && open) setOpen(false);
      };
      const onMouseDown = (e: MouseEvent) => {
        if (!open) return;
        const target = e.target as HTMLElement;
        if (target.closest("table") && e.button === 2) {
          return;
        }
        const sidebarEl = document.querySelector(
          '[data-slot="sidebar-container"]'
        );
        if (
          sidebarEl &&
          e.target instanceof Node &&
          sidebarEl.contains(e.target)
        )
          return;
        setOpen(false);
      };
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("mousedown", onMouseDown);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("mousedown", onMouseDown);
      };
    }, [open, setOpen]);
    return null;
  };
  return (
    <SidebarProvider
      defaultOpen={false}
      style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
    >
      <SidebarCloser />
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
