import { useGanttStore } from "@/store/gantt.store";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface SizeInfoProps {}
const SizeInfo: React.FC<SizeInfoProps> = () => {
  const [size, setSize] = useState({
    head: { width: 0, height: 0 },
    body: { width: 0, height: 0 },
  });

  useEffect(() => {
    const unsubscribe = useGanttStore.subscribe((state) => {
      const sheet = state.getCurrentSheet();
      if (sheet) {
        setSize({
          head: {
            width: sheet.gantt.head[0].length,
            height: sheet.gantt.head.length,
          },
          body: {
            width: sheet.gantt.body[0].length,
            height: sheet.gantt.body.length,
          },
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="absolute bottom-3 right-3 p-3 border rounded-md bg-background">
      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
        <InfoIcon className="w-4 h-4" />
        Table Information
      </div>
      <table className="text-xs text-muted-foreground">
        <tbody>
          <tr className="border-b">
            <th className="p-1">Head</th>
            <td className="p-1">
              {size.head.height}r x {size.head.width}c ={" "}
              {size.head.height * size.head.width}cell
              {size.head.height * size.head.width > 1 ? "s" : ""}
            </td>
          </tr>
          <tr className="border-b">
            <th className="p-1">Body</th>
            <td className="p-1">
              {size.body.height}r x {size.body.width}c ={" "}
              {size.body.height * size.body.width}cell
              {size.body.height * size.body.width > 1 ? "s" : ""}
            </td>
          </tr>
          <tr className="border-b">
            <th className="p-1">Total</th>
            <td className="p-1">
              {size.body.height + size.head.height}r x{" "}
              {size.body.width + size.head.width}c ={" "}
              {size.body.height * size.body.width +
                size.head.height * size.head.width}
              cell
              {size.body.height * size.body.width +
                size.head.height * size.head.width >
              1
                ? "s"
                : ""}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SizeInfo;
