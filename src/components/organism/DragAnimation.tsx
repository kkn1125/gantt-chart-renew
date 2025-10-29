import { useGanttStore } from "@/store/gantt.store";
import { useEffect, useEffectEvent, useState } from "react";

interface DragAnimationProps {}
const DragAnimation: React.FC<DragAnimationProps> = () => {
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [dragMove, setDragMove] = useState<{ x: number; y: number } | null>(
    null
  );
  const [dragging, setDragging] = useState(false);
  const getAllCells = useGanttStore((state) => state.getAllCells);
  const setSelectCells = useGanttStore((state) => state.setSelectCells);
  const clearSelectedCells = useGanttStore((state) => state.clearSelectedCells);

  const moveX = dragMove?.x || 0;
  const moveY = dragMove?.y || 0;
  const startX = dragStart?.x || 0;
  const startY = dragStart?.y || 0;

  const width = moveX - startX;
  const height = moveY - startY;

  const handleMouseDragStart = useEffectEvent((e: MouseEvent) => {
    // 좌클릭만 시작
    if ((e.target as HTMLElement)?.closest?.('[data-sidebar="sidebar"]')) {
      return;
    }
    if (e.button !== 0) return;
    const main = document.body.querySelector("main");
    if (!main?.contains(e.target as HTMLElement)) return;
    clearSelectedCells();
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragging(true);
  });
  const handleMouseDragMove = useEffectEvent((e: MouseEvent) => {
    if (dragging) {
      setDragMove({ x: e.clientX, y: e.clientY });
    }
  });
  const handleMouseDragEnd = useEffectEvent(() => {
    setDragStart(null);
    setDragMove(null);
    setDragging(false);
  });

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDragStart);
    window.addEventListener("mousemove", handleMouseDragMove);
    window.addEventListener("mouseup", handleMouseDragEnd);
    return () => {
      window.removeEventListener("mousedown", handleMouseDragStart);
      window.removeEventListener("mousemove", handleMouseDragMove);
      window.removeEventListener("mouseup", handleMouseDragEnd);
    };
  }, []);

  useEffect(() => {
    const affectedCells = getAllCells();
    if (moveX > 0 || moveY > 0) {
      // 드래그 영역에 걸리는 테이블 내 셀 모두 선택 처리
      // TODO: 구현
      // 예시: 셀의 좌표(위치)정보를 받아오고, 드래그 영역 내에 포함된 셀의 id 목록을 선택 처리.
      // - 현재 프로젝트의 state(store) 구조에 맞는 핸들러를 찾아서,
      // - (예: useGanttStore에서 선택셀 업데이트 함수가 있다면)
      // - 드래그된 영역(startX, startY ~ moveX, moveY)과 테이블의 셀 위치 정보를 비교하여
      // - 해당 영역에 포함된 셀의 selected를 true로 변경 처리.
      // 구현예시 (실제 셀 위치 정보 필요 시, useGanttStore의 head/body 데이터를 가져와서 반복):
      // const affectedCells = ...; // 드래그 영역에 포함된 셀 id 리스트
      // affectedCells.forEach(id => useGanttStore.getState().setSelectedCell(id, region));

      // 드래그 영역 내에 포함된 셀의 selected를 true로, 나머지 false로 처리
      const [x1, x2] = [startX, moveX].sort((a, b) => a - b);
      const [y1, y2] = [startY, moveY].sort((a, b) => a - b);

      affectedCells.forEach((cell) => {
        const element = cell.element;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        // 셀의 중앙이 드래그 박스 안에 있으면 selected 처리
        const cellXIn = x2 > rect.left && x1 < rect.right;
        const cellYIn = y2 > rect.top && y1 < rect.bottom;
        const isInDrag = cellXIn && cellYIn;
        // selected 상태를 직접 업데이트 (store에)
        setSelectCells(cell.id, isInDrag);
      });
    }
  }, [moveX, moveY, startX, startY, dragMove]);

  // height < 0일 때 solid, 아닐 때 dashed 보더 스타일 적용
  const side1 = width >= 0 ? "border-solid" : "border-dashed";
  // width < 0: 초록 테두리+배경, width >= 0: 파랑 테두리+배경
  const side2 =
    height >= 0
      ? "border-green-300 bg-green-200/40" // 파스텔톤 초록 (tailwind green-300/200)
      : "border-blue-300 bg-blue-200/40"; // 파스텔톤 파랑 (tailwind blue-300/200)

  if (moveX === 0 && moveY === 0) return null;

  return (
    <div className="fixed inset-0 z-50">
      {dragging && (
        <div
          className={`absolute border-2 rounded-[2px] ${side1} ${side2}`}
          style={{
            top: height >= 0 ? startY : startY + height,
            left: width >= 0 ? startX : startX + width,
            width: Math.abs(moveX === 0 ? 0 : width),
            height: Math.abs(moveY === 0 ? 0 : height),
          }}
        />
      )}
    </div>
  );
};

export default DragAnimation;
