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
import { useEditorStore } from "@/store/editor.store";
import { useGanttStore } from "@/store/gantt.store";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowLeftRightIcon,
  ArrowRightIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ClipboardPasteIcon,
  CopyIcon,
  Paintbrush2Icon,
  TableCellsMergeIcon,
  TableCellsSplitIcon,
  TextCursorIcon,
  Trash2Icon,
  TrashIcon,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const mergeCells = useGanttStore((s) => s.mergeCells);
  const unMergeCells = useGanttStore((s) => s.unMergeCells);
  const batchUpdateCellStyles = useGanttStore((s) => s.batchUpdateCellStyles);
  const addAboveRow = useGanttStore((s) => s.addAboveRow);
  const addBelowRow = useGanttStore((s) => s.addBelowRow);
  const addTopSideSelected = useGanttStore((s) => s.addTopSideSelected);
  const addBottomSideSelected = useGanttStore((s) => s.addBottomSideSelected);
  const addLeftSideSelected = useGanttStore((s) => s.addLeftSideSelected);
  const addRightSideSelected = useGanttStore((s) => s.addRightSideSelected);
  const pasteContentToSelectedCells = useGanttStore(
    (s) => s.pasteContentToSelectedCells
  );
  const clearStyleToSelectedCells = useGanttStore(
    (s) => s.clearStyleToSelectedCells
  );
  const deleteContentToSelectedCells = useGanttStore(
    (s) => s.deleteContentToSelectedCells
  );
  const clearContentAndStyleToSelectedCells = useGanttStore(
    (s) => s.clearContentAndStyleToSelectedCells
  );
  const deleteRows = useGanttStore((s) => s.deleteRows);
  const deleteColumns = useGanttStore((s) => s.deleteColumns);
  const getSelectedCells = useGanttStore((s) => s.getSelectedCells);
  // const disabled = useMemo(() => getAllCells().length === 0, [getAllCells]);
  const setCopyStyle = useEditorStore((state) => state.setCopyStyle);
  const getCopyStyle = useEditorStore((state) => state.getCopyStyle);
  const setCopyContent = useEditorStore((state) => state.setCopyContent);
  const getCopyContent = useEditorStore((state) => state.getCopyContent);
  const applyStyleToSelectedCells = useGanttStore(
    (s) => s.applyStyleToSelectedCells
  );
  const isSelected = useGanttStore((s) => s.isSelected);
  const hasSelected = useGanttStore((s) => s.selectedIds.size > 0);
  const selectedIds = useGanttStore((s) => s.selectedIds);
  const hasMergedCells = useGanttStore((state) =>
    state
      .getAllCells()
      .filter((c) => state.selectedIds.has(c.id))
      .some((c) => c.anchor)
  );
  // 디바운싱을 위한 ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStyleRef = useRef<React.CSSProperties | null>(null);
  const selectedCellIdsRef = useRef<string[]>([]);

  const applyStyle = useCallback(
    (style: React.CSSProperties, immediate = false) => {
      const selectedCells = getAllCells().filter((c) => isSelected(c.id));
      if (selectedCells.length === 0) return;
      const selectedIds = selectedCells.map((c) => c.id);

      if (immediate) {
        // 즉시 업데이트 (색상 팔레트 클릭 등)
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        batchUpdateCellStyles(selectedIds, style);
        pendingStyleRef.current = null;
        selectedCellIdsRef.current = [];
      } else {
        // 디바운싱 적용 (색상 피커 드래그 등)
        pendingStyleRef.current = style;
        selectedCellIdsRef.current = selectedIds;

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          if (
            pendingStyleRef.current &&
            selectedCellIdsRef.current.length > 0
          ) {
            batchUpdateCellStyles(
              selectedCellIdsRef.current,
              pendingStyleRef.current
            );
            pendingStyleRef.current = null;
            selectedCellIdsRef.current = [];
          }
          debounceTimerRef.current = null;
        }, 100); // 100ms 디바운싱
      }
    },
    [getAllCells, isSelected, batchUpdateCellStyles]
  );

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  function handleAddHeadRowAbove() {
    addAboveRow("head");
  }
  function handleAddHeadRowBelow() {
    addBelowRow("head");
  }
  function handleAddBodyRowAbove() {
    addAboveRow("body");
  }
  function handleAddBodyRowBelow() {
    addBelowRow("body");
  }

  function handleAddTopSideSelected() {
    addTopSideSelected();
  }
  function handleAddBottomSideSelected() {
    addBottomSideSelected();
  }
  function handleAddLeftSideSelected() {
    addLeftSideSelected();
  }
  function handleAddRightSideSelected() {
    addRightSideSelected();
  }
  function handleDeleteRows() {
    deleteRows();
  }
  function handleDeleteColumns() {
    deleteColumns();
  }

  function handleMergeCells() {
    mergeCells(true, true);
  }
  function handleUnmergeCells() {
    unMergeCells();
  }
  function handleHorizontalMergeCells() {
    mergeCells(true, false);
  }
  function handleVerticalMergeCells() {
    mergeCells(false, true);
  }

  // --- Cell border inspector state & handlers ---
  type BorderEdge = "top" | "right" | "bottom" | "left";
  type BorderStyleValues = {
    width: number;
    style: React.CSSProperties["borderStyle"];
    color: string;
  };
  const defaultBorder: BorderStyleValues = {
    width: 0,
    style: "none",
    color: "#d1d5db",
  };

  const [selectedBorders, setSelectedBorders] = useState<
    Record<BorderEdge, boolean>
  >({
    top: false,
    right: false,
    bottom: false,
    left: false,
  });

  const [borderStyles, setBorderStyles] = useState<
    Record<BorderEdge, BorderStyleValues>
  >({
    top: { ...defaultBorder },
    right: { ...defaultBorder },
    bottom: { ...defaultBorder },
    left: { ...defaultBorder },
  });

  const selectedEdges = useMemo(
    () =>
      (Object.keys(selectedBorders) as BorderEdge[]).filter(
        (e) => selectedBorders[e]
      ),
    [selectedBorders]
  );

  const selectedEdgeCount = selectedEdges.length;

  const currBorderValues: BorderStyleValues = useMemo(() => {
    const selectedCells = getSelectedCells();
    if (selectedCells.length === 0) return defaultBorder;
    if (selectedEdges.length === 0) return defaultBorder;

    // 선택된 셀 기준으로 선택된 변에 해당하는 border의 width, style, color를 계산
    if (selectedCells.length > 0 && selectedEdges.length > 0) {
      // width: 소수점 버린 평균값, style: 가장 많이 가진 값, color: 기본 색상(아래서 처리)
      let widthSum = 0;
      let widthCount = 0;
      const allWidths: number[] = [];
      const allStyles: string[] = [];
      const styleCounts: Record<string, number> = {};
      const allColors: string[] = [];
      const colorCounts: Record<string, number> = {};

      for (const edge of selectedEdges) {
        for (const cell of selectedCells) {
          // cell.cellProps?.borders의 구조: { top: {width, style, color}, ... }
          let borderVal: BorderStyleValues = { ...defaultBorder };
          switch (edge) {
            case "left":
              borderVal = cell.style
                ? ({
                    width: cell.style.borderLeftWidth,
                    style: cell.style.borderLeftStyle,
                    color: cell.style.borderLeftColor,
                  } as BorderStyleValues)
                : { ...defaultBorder };
              break;
            case "top":
              borderVal = cell.style
                ? ({
                    width: cell.style.borderTopWidth,
                    style: cell.style.borderTopStyle,
                    color: cell.style.borderTopColor,
                  } as BorderStyleValues)
                : { ...defaultBorder };
              break;
            case "right":
              borderVal = cell.style
                ? ({
                    width: cell.style.borderRightWidth,
                    style: cell.style.borderRightStyle,
                    color: cell.style.borderRightColor,
                  } as BorderStyleValues)
                : { ...defaultBorder };
              break;
            case "bottom":
              borderVal = cell.style
                ? ({
                    width: cell.style.borderBottomWidth,
                    style: cell.style.borderBottomStyle,
                    color: cell.style.borderBottomColor,
                  } as BorderStyleValues)
                : { ...defaultBorder };
              break;
          }
          // width
          let w =
            typeof borderVal.width === "number" ? borderVal.width : undefined;
          if (w == null) w = defaultBorder.width;
          widthSum += w;
          widthCount++;
          allWidths.push(w);
          // style
          const s = borderVal.style ?? defaultBorder.style ?? "none";
          styleCounts[s] = (styleCounts[s] || 0) + 1;
          allStyles.push(s);
          // color
          const c = borderVal.color ?? defaultBorder.color;
          colorCounts[c] = (colorCounts[c] || 0) + 1;
          allColors.push(c);
        }
      }

      // width: 모든 width가 같다? 그 값을, 아니면 소수점버린 평균
      let width;
      const firstWidth = allWidths[0];
      if (allWidths.every((v) => v === firstWidth)) {
        width = firstWidth;
      } else {
        width = Math.floor(widthSum / widthCount);
      }

      // style: 모두 같으면 그 값, 아니면 count가 가장 많은 값
      let style;
      const firstStyle = allStyles[0];
      if (allStyles.every((v) => v === firstStyle)) {
        style = firstStyle;
      } else {
        // get most frequent
        let maxCount = 0;
        let mostFrequent = defaultBorder.style;
        for (const k in styleCounts) {
          if (styleCounts[k] > maxCount) {
            maxCount = styleCounts[k];
            mostFrequent = k;
          }
        }
        style = mostFrequent;
      }

      // color: 기본 색상으로. 모두 같으면 그 값을, 아니면 defaultBorder.color
      let color;
      const firstColor = allColors[0];
      if (allColors.every((v) => v === firstColor)) {
        color = firstColor;
      } else {
        color = defaultBorder.color;
      }

      return { width, style, color };
    }
    return defaultBorder;
  }, [selectedEdges, selectedIds.size, borderStyles, getSelectedCells]);

  function handleBorderSelect(edge: BorderEdge) {
    setSelectedBorders((prev) => ({ ...prev, [edge]: !prev[edge] }));
  }

  function handleSelectAllBorders() {
    const allOn = Object.values(selectedBorders).every(Boolean);
    const next = {
      top: !allOn,
      right: !allOn,
      bottom: !allOn,
      left: !allOn,
    } as Record<BorderEdge, boolean>;
    setSelectedBorders(next);
  }

  function handleBorderChange(
    kind: keyof BorderStyleValues,
    value: number | string
  ) {
    if (selectedEdges.length === 0) return;

    setBorderStyles((prev) => {
      const next = { ...prev } as typeof prev;
      selectedEdges.forEach((edge) => {
        next[edge] = {
          ...next[edge],
          [kind]: kind === "width" ? Number(value) : (value as any),
        } as BorderStyleValues;
      });
      return next;
    });

    const style: React.CSSProperties = {};
    const propSuffix: Record<BorderEdge, string> = {
      top: "Top",
      right: "Right",
      bottom: "Bottom",
      left: "Left",
    };
    selectedEdges.forEach((edge) => {
      const suffix = propSuffix[edge];
      if (kind === "width") {
        (style as any)[`border${suffix}Width`] = Number(value) || 0;
      } else if (kind === "style") {
        (style as any)[`border${suffix}Style`] =
          value as React.CSSProperties["borderStyle"];
      } else if (kind === "color") {
        (style as any)[`border${suffix}Color`] = value as string;
      }
    });

    applyStyle(style);
  }

  function handleCopyStyle() {
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
    setCopyStyle(getCell.style);
  }
  function handlePasteStyle() {
    const style = getCopyStyle();
    applyStyleToSelectedCells(style);
  }
  function handleCopyContent() {
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
  }
  function handlePasteContent() {
    const content = getCopyContent();
    pasteContentToSelectedCells(content);
  }
  function handleRemoveStyle() {
    clearStyleToSelectedCells();
  }
  function handleRemoveContent() {
    deleteContentToSelectedCells();
  }
  function handleRemoveAll() {
    clearContentAndStyleToSelectedCells();
  }

  return (
    <>
      <SidebarHeader>
        <div className="px-2 py-1">
          <h3 className="text-base font-semibold">셀 속성</h3>
          <p className="text-xs text-muted-foreground">
            선택한 셀들을 편집합니다.
          </p>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="p-2 gap-4">
        <SidebarGroup className="flex flex-col gap-2">
          <SectionLabel title="스타일 복사/붙여넣기" />
          <SidebarGroupContent className="flex justify-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyStyle}
                  disabled={!hasSelected}
                >
                  <CopyIcon className="w-4 h-4" />
                  복사
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>스타일 복사</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handlePasteStyle}
                  disabled={!hasSelected}
                >
                  <ClipboardPasteIcon className="w-4 h-4" />
                  붙여넣기
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>스타일 붙여넣기</p>
              </TooltipContent>
            </Tooltip>
          </SidebarGroupContent>
          <SectionLabel title="내용 복사/붙여넣기" />
          <SidebarGroupContent className="flex justify-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyContent}
                  disabled={!hasSelected}
                >
                  <CopyIcon className="w-4 h-4" />
                  복사
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>내용 복사</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handlePasteContent}
                  disabled={!hasSelected}
                >
                  <ClipboardPasteIcon className="w-4 h-4" />
                  붙여넣기
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>내용 붙여넣기</p>
              </TooltipContent>
            </Tooltip>
          </SidebarGroupContent>
          <SectionLabel title="스타일/내용 제거" />
          <SidebarGroupContent className="flex justify-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleRemoveStyle}
                  disabled={!hasSelected}
                >
                  <Paintbrush2Icon className="w-4 h-4" />
                  스타일 제거
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>스타일 제거</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleRemoveContent}
                  disabled={!hasSelected}
                >
                  <TextCursorIcon className="w-4 h-4" />
                  내용 제거
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>내용 제거</p>
              </TooltipContent>
            </Tooltip>
          </SidebarGroupContent>
          <SidebarGroupContent className="flex justify-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleRemoveAll}
                  disabled={!hasSelected}
                >
                  <Trash2Icon className="w-4 h-4" />
                  스타일/내용 제거
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>스타일/내용 제거</p>
              </TooltipContent>
            </Tooltip>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="선택 이동" />
          <SidebarGroupContent className="flex justify-center gap-2">
            <Button variant="outline" disabled={!hasSelected}>
              Left
            </Button>
            <Button variant="outline" disabled={!hasSelected}>
              Right
            </Button>
            <Button variant="outline" disabled={!hasSelected}>
              Up
            </Button>
            <Button variant="outline" disabled={!hasSelected}>
              Down
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        {hasSelected ? (
          <SidebarGroup className="flex flex-row gap-2">
            <SidebarGroup className="p-0">
              <SectionLabel title="행 추가" />
              <SidebarGroupContent className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleAddTopSideSelected}
                  disabled={!hasSelected}
                >
                  <ArrowUpIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAddBottomSideSelected}
                  disabled={!hasSelected}
                >
                  <ArrowDownIcon className="w-4 h-4" />
                </Button>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarGroup>
        ) : (
          <SidebarGroup className="flex flex-row gap-2">
            <SidebarGroup className="p-0">
              <SectionLabel title="헤더 행 추가" />
              <SidebarGroupContent className="flex justify-center gap-2">
                <Button variant="outline" onClick={handleAddHeadRowAbove}>
                  <ArrowUpIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={handleAddHeadRowBelow}>
                  <ArrowDownIcon className="w-4 h-4" />
                </Button>
              </SidebarGroupContent>
            </SidebarGroup>

            <Separator orientation="vertical" className="h-4 w-px" />

            <SidebarGroup className="p-0">
              <SectionLabel title="바디 행 추가" />
              <SidebarGroupContent className="flex justify-center gap-2">
                <Button variant="outline" onClick={handleAddBodyRowAbove}>
                  <ArrowUpIcon className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={handleAddBodyRowBelow}>
                  <ArrowDownIcon className="w-4 h-4" />
                </Button>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarGroup>
        )}

        <Separator />

        <SidebarGroup>
          <SectionLabel title="열 추가" />
          <SidebarGroupContent className="flex justify-center gap-2">
            <Button variant="outline" onClick={handleAddLeftSideSelected}>
              <ArrowLeftIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleAddRightSideSelected}>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="행/열 삭제" />
          <SidebarGroupContent className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={!hasSelected}
              onClick={handleDeleteRows}
            >
              <TrashIcon className="w-4 h-4" /> Row
            </Button>
            <Button
              variant="outline"
              disabled={!hasSelected}
              onClick={handleDeleteColumns}
            >
              <TrashIcon className="w-4 h-4" /> Column
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="셀 병합 / 분할" />
          <SidebarGroupContent className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={selectedIds.size <= 1}
              onClick={handleMergeCells}
            >
              <TableCellsMergeIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              disabled={selectedIds.size <= 1}
              onClick={handleVerticalMergeCells}
            >
              <ArrowUpDownIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              disabled={selectedIds.size <= 1}
              onClick={handleHorizontalMergeCells}
            >
              <ArrowLeftRightIcon className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-4 w-px" />
            <Button
              variant="outline"
              disabled={!hasMergedCells}
              onClick={handleUnmergeCells}
            >
              <TableCellsSplitIcon className="w-4 h-4" />
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
                  applyStyle(
                    {
                      backgroundColor: color === "none" ? undefined : color,
                    },
                    true
                  )
                }
              />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="셀 테두리" />
          <SidebarGroupContent className="space-y-2">
            {/* 셀 테두리 조작기 - shadcn 스타일, 2컬럼 레이아웃 */}
            <div className="flex gap-4">
              {/* 왼쪽: 셀 도식화 */}
              <div className="flex flex-col items-center justify-center select-none">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Top border */}
                  <button
                    className={`
                      absolute top-0 left-2 right-2 h-5 flex items-center justify-center
                      border-t-4 rounded-t-md
                      ${
                        selectedBorders.top
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white"
                      }
                      transition-colors cursor-pointer
                    `}
                    style={{
                      borderTopWidth: 2,
                      borderTopStyle: hasSelected
                        ? currBorderValues.style
                        : (borderStyles.top.style as any) || "none",
                      borderTopColor: hasSelected
                        ? currBorderValues.color
                        : borderStyles.top.color || "#d1d5db",
                    }}
                    onClick={() => handleBorderSelect("top")}
                  >
                    <span className="text-xs text-gray-700 font-bold">
                      {hasSelected
                        ? currBorderValues.width
                        : borderStyles.top.width || 0}
                      px
                    </span>
                  </button>
                  {/* Bottom border */}
                  <button
                    className={`
                      absolute bottom-0 left-2 right-2 h-5 flex items-center justify-center
                      border-b-4 rounded-b-md
                      ${
                        selectedBorders.bottom
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white"
                      }
                      transition-colors cursor-pointer
                    `}
                    style={{
                      borderBottomWidth: 2,
                      borderBottomStyle: hasSelected
                        ? currBorderValues.style
                        : (borderStyles.bottom.style as any) || "none",
                      borderBottomColor: hasSelected
                        ? currBorderValues.color
                        : borderStyles.bottom.color || "#d1d5db",
                    }}
                    onClick={() => handleBorderSelect("bottom")}
                  >
                    <span className="text-xs text-gray-700 font-bold">
                      {hasSelected
                        ? currBorderValues.width
                        : borderStyles.bottom.width || 0}
                      px
                    </span>
                  </button>
                  {/* Left border */}
                  <button
                    className={`
                      absolute left-0 top-2 bottom-2 w-5 flex items-center justify-center
                      border-l-4 rounded-l-md
                      ${
                        selectedBorders.left
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white"
                      }
                      transition-colors cursor-pointer
                    `}
                    style={{
                      borderLeftWidth: 2,
                      borderLeftStyle: hasSelected
                        ? currBorderValues.style
                        : (borderStyles.left.style as any) || "none",
                      borderLeftColor: hasSelected
                        ? currBorderValues.color
                        : borderStyles.left.color || "#d1d5db",
                    }}
                    onClick={() => handleBorderSelect("left")}
                  >
                    <span className="-rotate-90 text-xs text-gray-700 font-bold">
                      {hasSelected
                        ? currBorderValues.width
                        : borderStyles.left.width || 0}
                      px
                    </span>
                  </button>
                  {/* Right border */}
                  <button
                    className={`
                      absolute right-0 top-2 bottom-2 w-5 flex items-center justify-center
                      border-r-4 rounded-r-md
                      ${
                        selectedBorders.right
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white"
                      }
                      transition-colors cursor-pointer
                    `}
                    style={{
                      borderRightWidth: 2,
                      borderRightStyle: hasSelected
                        ? currBorderValues.style
                        : (borderStyles.right.style as any) || "none",
                      borderRightColor: hasSelected
                        ? currBorderValues.color
                        : borderStyles.right.color || "#d1d5db",
                    }}
                    onClick={() => handleBorderSelect("right")}
                  >
                    <span className="-rotate-90 text-xs text-gray-700 font-bold">
                      {hasSelected
                        ? currBorderValues.width
                        : borderStyles.right.width || 0}
                      px
                    </span>
                  </button>
                  {/* 중앙 십자 전체선택 */}
                  <button
                    className={`
                      absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
                      rounded-full border-2 border-dashed flex items-center justify-center
                      w-8 h-8 z-10
                      ${
                        Object.values(selectedBorders).every(Boolean)
                          ? "border-blue-500 bg-blue-100"
                          : "border-gray-300 bg-white"
                      }
                      transition-colors cursor-pointer
                    `}
                    onClick={handleSelectAllBorders}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <line
                        x1="6"
                        y1="0"
                        x2="6"
                        y2="12"
                        stroke="#60a5fa"
                        strokeWidth="2"
                      />
                      <line
                        x1="0"
                        y1="6"
                        x2="12"
                        y2="6"
                        stroke="#60a5fa"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>
                  {/* 중앙 사각형(셀) */}
                  <div className="absolute left-5 top-5 w-14 h-14 bg-white border border-gray-200 rounded-md" />
                </div>
                <span className="mt-2 text-xs text-gray-500">테두리 선택</span>
              </div>
              {/* 오른쪽: 선택한 변 스타일 */}
              <div className="flex-1 flex flex-col gap-2 justify-center">
                <div className="flex items-center gap-2">
                  <span className="w-10 text-xs text-muted-foreground shrink-0">
                    두께
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={currBorderValues.width}
                    disabled={!hasSelected || selectedEdgeCount === 0}
                    onChange={(e) =>
                      handleBorderChange("width", Number(e.target.value))
                    }
                    placeholder="px"
                    className="h-8 w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-10 text-xs text-muted-foreground shrink-0">
                    스타일
                  </span>
                  <select
                    disabled={!hasSelected || selectedEdgeCount === 0}
                    value={currBorderValues.style}
                    className="h-8 rounded-md border bg-background px-2"
                    onChange={(e) =>
                      handleBorderChange("style", e.target.value)
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
                  <span className="w-10 text-xs text-muted-foreground shrink-0">
                    색상
                  </span>
                  <input
                    type="color"
                    value={currBorderValues.color}
                    disabled={!hasSelected || selectedEdgeCount === 0}
                    onChange={(e) =>
                      handleBorderChange("color", e.target.value)
                    }
                    onMouseUp={(e) => {
                      // 마우스 업 시 즉시 최종 값 적용
                      handleBorderChange(
                        "color",
                        (e.target as HTMLInputElement).value
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SectionLabel title="셀 패딩/마진" />
          <SidebarGroupContent className="space-y-2">
            {/* 셀 테두리 조작기 - shadcn 스타일, 2컬럼 레이아웃 */}
            <div className="flex gap-4">
              {/* 왼쪽: 셀 도식화 */}
              <div className="flex flex-col items-center justify-center select-none">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Top border */}
                  <button
                    className={`
                      absolute top-0 left-2 right-2 h-5 flex items-center justify-center
                      border-t-4 rounded-t-md
                      ${
                        selectedBorders.top
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white"
                      }
                      transition-colors cursor-pointer
                    `}
                    style={{
                      borderTopWidth: 2,
                      borderTopStyle: hasSelected
                        ? currBorderValues.style
                        : (borderStyles.top.style as any) || "none",
                      borderTopColor: hasSelected
                        ? currBorderValues.color
                        : borderStyles.top.color || "#d1d5db",
                    }}
                    onClick={() => handleBorderSelect("top")}
                  >
                    <span className="text-xs text-gray-700 font-bold">
                      {hasSelected
                        ? currBorderValues.width
                        : borderStyles.top.width || 0}
                      px
                    </span>
                  </button>
                  {/* Bottom border */}
                  <button
                    className={`
                      absolute bottom-0 left-2 right-2 h-5 flex items-center justify-center
                      border-b-4 rounded-b-md
                      ${
                        selectedBorders.bottom
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white"
                      }
                      transition-colors cursor-pointer
                    `}
                    style={{
                      borderBottomWidth: 2,
                      borderBottomStyle: hasSelected
                        ? currBorderValues.style
                        : (borderStyles.bottom.style as any) || "none",
                      borderBottomColor: hasSelected
                        ? currBorderValues.color
                        : borderStyles.bottom.color || "#d1d5db",
                    }}
                    onClick={() => handleBorderSelect("bottom")}
                  >
                    <span className="text-xs text-gray-700 font-bold">
                      {hasSelected
                        ? currBorderValues.width
                        : borderStyles.bottom.width || 0}
                      px
                    </span>
                  </button>
                  {/* Left border */}
                  <button
                    className={`
                      absolute left-0 top-2 bottom-2 w-5 flex items-center justify-center
                      border-l-4 rounded-l-md
                      ${
                        selectedBorders.left
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white"
                      }
                      transition-colors cursor-pointer
                    `}
                    style={{
                      borderLeftWidth: 2,
                      borderLeftStyle: hasSelected
                        ? currBorderValues.style
                        : (borderStyles.left.style as any) || "none",
                      borderLeftColor: hasSelected
                        ? currBorderValues.color
                        : borderStyles.left.color || "#d1d5db",
                    }}
                    onClick={() => handleBorderSelect("left")}
                  >
                    <span className="-rotate-90 text-xs text-gray-700 font-bold">
                      {hasSelected
                        ? currBorderValues.width
                        : borderStyles.left.width || 0}
                      px
                    </span>
                  </button>
                  {/* Right border */}
                  <button
                    className={`
                      absolute right-0 top-2 bottom-2 w-5 flex items-center justify-center
                      border-r-4 rounded-r-md
                      ${
                        selectedBorders.right
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 bg-white"
                      }
                      transition-colors cursor-pointer
                    `}
                    style={{
                      borderRightWidth: 2,
                      borderRightStyle: hasSelected
                        ? currBorderValues.style
                        : (borderStyles.right.style as any) || "none",
                      borderRightColor: hasSelected
                        ? currBorderValues.color
                        : borderStyles.right.color || "#d1d5db",
                    }}
                    onClick={() => handleBorderSelect("right")}
                  >
                    <span className="-rotate-90 text-xs text-gray-700 font-bold">
                      {hasSelected
                        ? currBorderValues.width
                        : borderStyles.right.width || 0}
                      px
                    </span>
                  </button>
                  {/* 중앙 십자 전체선택 */}
                  <button
                    className={`
                      absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
                      rounded-full border-2 border-dashed flex items-center justify-center
                      w-8 h-8 z-10
                      ${
                        Object.values(selectedBorders).every(Boolean)
                          ? "border-blue-500 bg-blue-100"
                          : "border-gray-300 bg-white"
                      }
                      transition-colors cursor-pointer
                    `}
                    onClick={handleSelectAllBorders}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <line
                        x1="6"
                        y1="0"
                        x2="6"
                        y2="12"
                        stroke="#60a5fa"
                        strokeWidth="2"
                      />
                      <line
                        x1="0"
                        y1="6"
                        x2="12"
                        y2="6"
                        stroke="#60a5fa"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>
                  {/* 중앙 사각형(셀) */}
                  <div className="absolute left-5 top-5 w-14 h-14 bg-white border border-gray-200 rounded-md" />
                </div>
                <span className="mt-2 text-xs text-gray-500">테두리 선택</span>
              </div>
              {/* 오른쪽: 선택한 변 스타일 */}
              <div className="flex-1 flex flex-col gap-2 justify-center">
                <div className="flex items-center gap-2">
                  <span className="w-10 text-xs text-muted-foreground shrink-0">
                    패딩
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={currBorderValues.width}
                    disabled={!hasSelected || selectedEdgeCount === 0}
                    onChange={(e) =>
                      handleBorderChange("width", Number(e.target.value))
                    }
                    placeholder="px"
                    className="h-8 w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-10 text-xs text-muted-foreground shrink-0">
                    마진
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={currBorderValues.width}
                    disabled={!hasSelected || selectedEdgeCount === 0}
                    onChange={(e) =>
                      handleBorderChange("width", Number(e.target.value))
                    }
                    placeholder="px"
                    className="h-8 w-20"
                  />
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup className="flex flex-row items-center gap-2">
          <SidebarGroup className="p-0">
            <SectionLabel title="셀 배경색" />
            <SidebarGroupContent className="flex items-center gap-3">
              <input
                type="color"
                disabled={!hasSelected}
                onChange={(e) =>
                  applyStyle({ backgroundColor: e.target.value })
                }
                onMouseUp={(e) => {
                  // 마우스 업 시 즉시 최종 값 적용
                  applyStyle(
                    { backgroundColor: (e.target as HTMLInputElement).value },
                    true
                  );
                }}
              />
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator orientation="vertical" />

          <SidebarGroup>
            <SectionLabel title="폰트색" />
            <SidebarGroupContent className="flex items-center gap-3">
              <input
                type="color"
                disabled={!hasSelected}
                onChange={(e) => applyStyle({ color: e.target.value })}
                onMouseUp={(e) => {
                  // 마우스 업 시 즉시 최종 값 적용
                  applyStyle(
                    { color: (e.target as HTMLInputElement).value },
                    true
                  );
                }}
              />
            </SidebarGroupContent>
          </SidebarGroup>
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
              disabled={!hasSelected}
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
