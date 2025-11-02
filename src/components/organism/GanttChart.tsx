import { useEditorStore } from "@/store/editor.store";
import { useGanttStore } from "@/store/gantt.store";
import { useEffect } from "react";
import SizeInfo from "../atom/SizeInfo";
import BodyRows from "./BodyRows";
import DragAnimation from "./DragAnimation";
import HeadRows from "./HeadRows";

interface GanttChartProps {}
const GanttChart: React.FC<GanttChartProps> = () => {
  const getSelectedCells = useGanttStore((state) => state.getSelectedCells);
  const pasteContentToSelectedCells = useGanttStore(
    (state) => state.pasteContentToSelectedCells
  );
  const deleteContentToSelectedCells = useGanttStore(
    (state) => state.deleteContentToSelectedCells
  );
  const applyStyleToSelectedCells = useGanttStore(
    (state) => state.applyStyleToSelectedCells
  );
  const setCopyContent = useEditorStore((state) => state.setCopyContent);
  const setCopyStyle = useEditorStore((state) => state.setCopyStyle);
  const getCopyStyle = useEditorStore((state) => state.getCopyStyle);
  const getCopyContent = useEditorStore((state) => state.getCopyContent);
  const clearContentAndStyleToSelectedCells = useGanttStore(
    (state) => state.clearContentAndStyleToSelectedCells
  );
  const clearStyleToSelectedCells = useGanttStore(
    (state) => state.clearStyleToSelectedCells
  );
  const selectAllCells = useGanttStore((state) => state.selectAllCells);
  /* key binding */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.shiftKey) {
          if (e.key === "C") {
            const cells = getSelectedCells();
            if (cells.length === 0) return;

            e.preventDefault();
            e.stopPropagation();
            const minCol = Math.min(...cells.map((c) => c.column));
            const minRow = Math.min(...cells.map((c) => c.row));
            let getCell = null;
            for (const cell of cells) {
              if (cell.column === minCol && cell.row === minRow) {
                getCell = cell;
                break;
              }
            }
            if (!getCell) return;

            setCopyStyle(getCell.style);
            return;
          }
          if (e.key === "V") {
            e.preventDefault();
            const style = getCopyStyle();
            if (Object.keys(style).length === 0) {
              clearStyleToSelectedCells();
              return;
            }
            applyStyleToSelectedCells(style);
            return;
          }
        }

        if (e.key === "a") {
          e.preventDefault();
          selectAllCells();
          return;
        }

        if (e.key === "c") {
          const cells = getSelectedCells();
          const minCol = Math.min(...cells.map((c) => c.column));
          const minRow = Math.min(...cells.map((c) => c.row));
          let getCell = null;
          for (const cell of cells) {
            if (cell.column === minCol && cell.row === minRow) {
              getCell = cell;
              break;
            }
          }
          if (!getCell) return;

          setCopyContent(getCell.content);
          return;
        }
        if (e.key === "v") {
          const content = getCopyContent();
          pasteContentToSelectedCells(content);
          return;
        }
      }
      if (e.key === "Backspace") {
        deleteContentToSelectedCells();
        return;
      }
      if (e.key === "Delete") {
        console.log(e.key);
        clearContentAndStyleToSelectedCells();
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className=" mx-auto max-w-screen-2xl h-full overflow-hidden">
      <div className="relative border w-full h-full px-4 py-4 overflow-auto flex justify-center items-center">
        <table className="border-collapse text-sm">
          <HeadRows />
          <BodyRows />
        </table>
        <SizeInfo />
      </div>
      <DragAnimation />
    </section>
  );
};

export default GanttChart;
