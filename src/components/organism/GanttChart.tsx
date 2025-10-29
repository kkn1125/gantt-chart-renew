import { useGanttStore } from "@/store/gantt.store";
import { memo, useEffect } from "react";
import BodyRows from "./BodyRows";
import HeadRows from "./HeadRows";
import DragAnimation from "./DragAnimation";

interface GanttChartProps {}
const GanttChart: React.FC<GanttChartProps> = () => {
  const initializeGantt = useGanttStore((state) => state.initializeGantt);

  useEffect(() => {
    initializeGantt();
  }, []);

  return (
    <section className="mx-auto max-w-screen-2xl h-full overflow-hidden">
      <div className="border w-full h-full px-4 py-4 overflow-auto flex justify-center items-center">
        <table className="border-collapse text-sm">
          <HeadRows />
          <BodyRows />
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        엑셀 시트 느낌의 가짜 테이블입니다. 이후 zustand 연동 예정.
      </p>
      <DragAnimation />
    </section>
  );
};

export default memo(GanttChart);
