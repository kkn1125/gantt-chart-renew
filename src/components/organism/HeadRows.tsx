import { useGanttStore } from "@/store/gantt.store";
import Cell from "./Cell";

interface HeadRowsProps {}
const HeadRows: React.FC<HeadRowsProps> = () => {
  const currentHead = useGanttStore((state) => state.getCurrentHead());
  if (!currentHead) return null;
  return (
    <thead className="border-b-2 bg-background z-10">
      {currentHead.map((row, rid) => (
        <tr key={rid} data-row={rid} className="min-h-5 text-left font-medium">
          {row.map((cell, cid) => (
            <Cell key={cell.id} type="head" cell={cell} rid={rid} cid={cid} />
          ))}
        </tr>
      ))}
    </thead>
  );
};

export default HeadRows;
