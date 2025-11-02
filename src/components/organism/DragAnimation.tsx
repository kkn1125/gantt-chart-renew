import { useEditorStore } from "@/store/editor.store";
import { useGanttStore } from "@/store/gantt.store";
import { useEffect, useRef, useState } from "react";

type Rect = { left: number; right: number; top: number; bottom: number };
type SizeRect = { top: number; left: number; width: number; height: number };
type CellRect = { id: string; rect: Rect };

function intersects(a: Rect, b: Rect) {
  return (
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  );
}

interface DragAnimationProps {}
const DragAnimation: React.FC<DragAnimationProps> = () => {
  const getAllCells = useGanttStore((state) => state.getAllCells);
  const patchSelection = useGanttStore((state) => state.patchSelection);
  const clearSelection = useGanttStore((state) => state.clearSelection);
  const draggingRef = useRef(false);
  const anchorRef = useRef<{ x: number; y: number } | null>(null);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const isPressedKey = useEditorStore((state) => state.isPressedKey);

  // 측정 캐시: mousedown 때 1회
  const cellRectsRef = useRef<CellRect[]>([]);
  const prevSetRef = useRef<Set<string>>(new Set());

  const [box, setBox] = useState<SizeRect | null>(null);
  const [classes, setClasses] = useState({
    side1: "border-solid",
    side2: "border-green-300 bg-green-200/40",
  });

  const measureAllCells = () => {
    const cells = getAllCells(); // id, element 포함
    cellRectsRef.current = cells
      .filter((c) => c.element)
      .map((c) => {
        const r = c.element!.getBoundingClientRect();
        return {
          id: c.id,
          rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom },
        };
      });
  };

  const computeDragRect = (): Rect | null => {
    if (!anchorRef.current || !mouseRef.current) return null;
    const { x: x1, y: y1 } = anchorRef.current;
    const { x: x2, y: y2 } = mouseRef.current;
    return {
      left: Math.min(x1, x2),
      right: Math.max(x1, x2),
      top: Math.min(y1, y2),
      bottom: Math.max(y1, y2),
    };
  };

  const frame = () => {
    rafRef.current = null;
    if (!draggingRef.current) return;
    if (!anchorRef.current || !mouseRef.current) return null;

    const dragRect = computeDragRect();
    if (!dragRect) return;

    const { x: x1, y: y1 } = anchorRef.current;
    const { x: x2, y: y2 } = mouseRef.current;

    setBox({
      top: y1 - y2 >= 0 ? y2 : y1,
      left: x1 - x2 >= 0 ? x2 : x1,
      width: Math.abs(x1 - x2),
      height: Math.abs(y1 - y2),
    });

    const side1 = x1 - x2 >= 0 ? "border-solid" : "border-dashed";
    const side2 =
      y1 - y2 >= 0
        ? "border-green-300 bg-green-200/40"
        : "border-blue-300 bg-blue-200/40";
    setClasses({ side1, side2 });

    // 현재 프레임의 선택 집합 계산
    const next = new Set<string>();
    for (const c of cellRectsRef.current) {
      if (intersects(dragRect, c.rect)) next.add(c.id);
    }

    // Diff 계산
    const prev = prevSetRef.current;
    // 빠른 탈출
    if (prev.size === next.size) {
      let same = true;
      for (const id of next) {
        if (!prev.has(id)) {
          same = false;
          break;
        }
      }
      if (same) return; // 변화 없음 → 스토어 업데이트 불필요
    }

    const toAdd: string[] = [];
    const toRemove: string[] = [];
    for (const id of next) if (!prev.has(id)) toAdd.push(id);
    for (const id of prev) if (!next.has(id)) toRemove.push(id);

    // 스토어 증분 반영 (선택 축소 시 자동 해제)
    patchSelection({ add: toAdd, remove: toRemove });

    // prev 갱신
    prevSetRef.current = next;
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    if (isPressedKey("Shift")) return;
    const contextMenu = (e.target as HTMLElement).closest?.(
      "[data-radix-popper-content-wrapper]"
    );
    const sidebar = (e.target as HTMLElement).closest?.(
      '[data-slot="sidebar"]'
    );
    if (e.button === 0 && !contextMenu && !sidebar) {
      clearSelection();
    }

    // 필터링: 메인 영역 안일 때만
    const main = document.body.querySelector("main");
    if (!main?.contains(e.target as HTMLElement)) return;

    // 초기화

    prevSetRef.current = new Set();

    anchorRef.current = { x: e.clientX, y: e.clientY };
    mouseRef.current = { x: e.clientX, y: e.clientY };
    measureAllCells(); // 1회 측정
    draggingRef.current = true;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current) return;
    mouseRef.current = { x: e.clientX, y: e.clientY };
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(frame);
    }
  };

  const handleMouseUp = () => {
    if (!draggingRef.current) return;

    draggingRef.current = false;
    anchorRef.current = null;
    mouseRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    // 필요하면 여기서 최종 확정 이벤트 emit
    setBox(null);
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div>
      {box && (
        <div
          className={`absolute border-2 rounded-[2px] ${classes.side1} ${classes.side2}`}
          style={{
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
          }}
        />
      )}
    </div>
  );
};

export default DragAnimation;
