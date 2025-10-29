import { useGanttStore } from "@/store/gantt.store";
import Cell from "./Cell";

interface BodyRowsProps {}
const BodyRows: React.FC<BodyRowsProps> = () => {
  const currentBody = useGanttStore((state) => state.getCurrentBody());
  return (
    <tbody>
      {currentBody?.map((row, rid) => (
        <tr key={rid} data-row={rid} className="min-h-5">
          {row.map((cell, cid) => (
            <Cell key={cell.id} type="body" cell={cell} rid={rid} cid={cid} />
          ))}
        </tr>
      ))}
    </tbody>
  );
};

export default BodyRows;
