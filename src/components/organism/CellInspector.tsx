import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useGanttStore } from "@/store/gantt.store";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  TrashIcon,
} from "lucide-react";
import { useMemo } from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const SectionLabel: React.FC<{ title: string }> = ({ title }) => (
  <SidebarGroupLabel className="text-sm font-semibold">
    {title}
  </SidebarGroupLabel>
);

const ColorSwatch: React.FC<{ color: string; onPick: (c: string) => void }> = ({
  color,
  onPick,
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        aria-label={color}
        onClick={() => onPick(color)}
        className="h-6 w-6 rounded-sm border"
        style={{ backgroundColor: color }}
      />
    </TooltipTrigger>
    <TooltipContent>
      <p>{color}</p>
    </TooltipContent>
  </Tooltip>
);

const palette = [
  "none",
  "#ffffff",
  "#f1f5f9",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#fef3c7",
  "#fde68a",
  "#fca5a5",
  "#86efac",
  "#93c5fd",
  "#f97316",
  "#ef4444",
  "#22c55e",
  "#3b82f6",
  "#a78bfa",
];

const CellInspector: React.FC = () => {
  const getAllCells = useGanttStore((s) => s.getAllCells);
  const updateCellStyle = useGanttStore((s) => s.updateCellStyle);
  const addRow = useGanttStore((s) => s.addRow);
  const addColumn = useGanttStore((s) => s.addColumn);
  const deleteRow = useGanttStore((s) => s.deleteRow);
  const deleteColumn = useGanttStore((s) => s.deleteColumn);
  const disabled = useMemo(() => getAllCells().length === 0, [getAllCells]);

  const applyStyle = (style: React.CSSProperties) => {
    const selectedCells = getAllCells().filter((c) => c.selected);
    if (selectedCells.length === 0) return;
    selectedCells.forEach((cell) => updateCellStyle(cell.id, style));
  };

  function handleTopSideRowAdd() {
    const selectedCells = getAllCells().filter((c) => c.selected);
    let topSideCellRowIndex = 0;
    let type: "head" | "body" = "head";
    selectedCells.forEach((cell) => {
      if (cell.row < topSideCellRowIndex) {
        topSideCellRowIndex = cell.row;
      }
      type = cell.type;
    });
    addRow(type, "top", topSideCellRowIndex);
  }
  function handleBottomSideRowAdd() {
    const selectedCells = getAllCells().filter((c) => c.selected);
    let bottomSideCellRowIndex = 0;
    let type: "head" | "body" = "head";
    selectedCells.forEach((cell) => {
      if (cell.row > bottomSideCellRowIndex) {
        bottomSideCellRowIndex = cell.row;
        type = cell.type;
      }
    });
    addRow(type, "bottom", bottomSideCellRowIndex);
  }
  function handleLeftSideColumnAdd() {
    const selectedCells = getAllCells().filter((c) => c.selected);
    let leftSideCellColumnIndex = 0;
    selectedCells.forEach((cell) => {
      if (cell.column < leftSideCellColumnIndex) {
        leftSideCellColumnIndex = cell.column;
      }
    });
    addColumn("left", leftSideCellColumnIndex, leftSideCellColumnIndex);
  }
  function handleRightSideColumnAdd() {
    const selectedCells = getAllCells().filter((c) => c.selected);
    let rightSideCellColumnIndex = 0;
    selectedCells.forEach((cell) => {
      if (cell.column > rightSideCellColumnIndex) {
        rightSideCellColumnIndex = cell.column;
      }
    });
    addColumn("right", rightSideCellColumnIndex, rightSideCellColumnIndex);
  }

  function handleRowDelete() {
    const selectedCells = getAllCells().filter((c) => c.selected);
    selectedCells.forEach((cell) => {
      deleteRow(cell.type, cell.row);
    });
  }
  function handleColumnDelete() {
    const selectedCells = getAllCells().filter((c) => c.selected);
    selectedCells.forEach((cell) => {
      deleteColumn(cell.column);
    });
  }

  return (
    <>
      <SidebarHeader>
        <div className="px-2 py-1">
          <h3 className="text-base font-semibold">셀 속성</h3>
          <p className="text-xs text-muted-foreground">
            우클릭한 셀을 편집합니다.
          </p>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="p-2 gap-4">
        <SidebarGroup>
          <SectionLabel title="선택 이동" />
          <SidebarGroupContent className="flex justify-center gap-2">
            <Button variant="outline">Left</Button>
            <Button variant="outline">Right</Button>
            <Button variant="outline">Up</Button>
            <Button variant="outline">Down</Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="행 추가" />
          <SidebarGroupContent className="flex justify-center gap-2">
            <Button variant="outline" onClick={handleTopSideRowAdd}>
              <ArrowUpIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleBottomSideRowAdd}>
              <ArrowDownIcon className="w-4 h-4" />
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="열 추가" />
          <SidebarGroupContent className="flex justify-center gap-2">
            <Button variant="outline" onClick={handleLeftSideColumnAdd}>
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleRightSideColumnAdd}>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="행/열 삭제" />
          <SidebarGroupContent className="flex justify-center gap-2">
            <Button variant="outline" onClick={handleRowDelete}>
              <TrashIcon className="w-4 h-4" /> Row
            </Button>
            <Button variant="outline" onClick={handleColumnDelete}>
              <TrashIcon className="w-4 h-4" /> Column
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="색상" />
          <SidebarGroupContent className="grid grid-cols-8 gap-2">
            {palette.map((c) => (
              <ColorSwatch
                key={c}
                color={c}
                onPick={(color) =>
                  applyStyle({
                    backgroundColor: color === "none" ? undefined : color,
                  })
                }
              />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="셀 테두리" />
          <SidebarGroupContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-14 text-xs text-muted-foreground">두께</span>
              <Input
                type="number"
                min={0}
                step={1}
                disabled={disabled}
                onChange={(e) =>
                  applyStyle({ borderWidth: Number(e.target.value) })
                }
                placeholder="px"
                className="h-8 w-24"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-14 text-xs text-muted-foreground">스타일</span>
              <select
                disabled={disabled}
                className="h-8 rounded-md border bg-background px-2"
                onChange={(e) =>
                  applyStyle({ borderStyle: e.target.value as any })
                }
              >
                <option value="solid">solid</option>
                <option value="dashed">dashed</option>
                <option value="dotted">dotted</option>
                <option value="double">double</option>
                <option value="none">none</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-14 text-xs text-muted-foreground">색상</span>
              <input
                type="color"
                disabled={disabled}
                onChange={(e) => applyStyle({ borderColor: e.target.value })}
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="셀 배경색" />
          <SidebarGroupContent className="flex items-center gap-3">
            <input
              type="color"
              disabled={disabled}
              onChange={(e) => applyStyle({ backgroundColor: e.target.value })}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="폰트색" />
          <SidebarGroupContent className="flex items-center gap-3">
            <input
              type="color"
              disabled={disabled}
              onChange={(e) => applyStyle({ color: e.target.value })}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="폰트 사이즈" />
          <SidebarGroupContent className="flex items-center gap-2">
            <Input
              type="number"
              min={8}
              max={72}
              step={1}
              disabled={disabled}
              onChange={(e) => applyStyle({ fontSize: `${e.target.value}px` })}
              placeholder="px"
              className="h-8 w-24"
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
};

export default CellInspector;
