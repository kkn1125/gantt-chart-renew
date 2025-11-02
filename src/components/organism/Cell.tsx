import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor.store";
import { useGanttStore, type Cell as GanttCell } from "@/store/gantt.store";
import { memo, useEffect, useState } from "react";

const CellTag = memo(
  ({
    type,
    ...props
  }: React.ComponentProps<"th" | "td"> & { type: "head" | "body" }) =>
    type === "head" ? <th {...props} /> : <td {...props} />
);

interface CellProps {
  type: "head" | "body";
  cell: GanttCell;
  rid: number;
  cid: number;
}
const Cell: React.FC<CellProps> = memo(({ type, cell, rid, cid }) => {
  const updateCellContent = useGanttStore((state) => state.updateCellContent);
  const setSelection = useGanttStore((state) => state.setSelection);
  const clearSelection = useGanttStore((state) => state.clearSelection);
  const isSelected = useGanttStore((state) => state.isSelected);
  const getCellById = useGanttStore((state) => state.getCellById);
  const getAllCells = useGanttStore((state) => state.getAllCells);
  const patchSelection = useGanttStore((state) => state.patchSelection);
  const selectedIds = useGanttStore((state) => state.selectedIds);

  const setEditMode = useEditorStore((state) => state.setEditMode);
  const editMode = useEditorStore((state) => state.editMode);

  const [cellStyle, setCellStyle] = useState("");
  const setPressedKey = useEditorStore((state) => state.setPressedKey);
  const isPressedKey = useEditorStore((state) => state.isPressedKey);
  const clearPressedKey = useEditorStore((state) => state.clearPressedKey);

  function handleClick(e: React.MouseEvent<HTMLTableCellElement>) {
    if (e.button !== 0) return;
    if (editMode === cell.id) return;
    if (isPressedKey("Shift")) {
      const target = e.target! as HTMLElement;
      if (!target) return;
      const cellTag = target.closest(":is(th,td)");
      if (!cellTag) return;
      const id = selectedIds.values().next().value;
      if (!id) return;
      const [oneCell, twoCell] = [
        getCellById(id),
        getCellById(cellTag.id),
      ].filter(Boolean);
      if (!oneCell || !twoCell) return;
      const maxRow = Math.max(oneCell.row, twoCell.row);
      const maxColumn = Math.max(oneCell.column, twoCell.column);
      const minRow = Math.min(oneCell.row, twoCell.row);
      const minColumn = Math.min(oneCell.column, twoCell.column);
      const toAdd: string[] = [];
      const cells = getAllCells().filter(
        (c) =>
          c.type === oneCell.type &&
          c.row >= minRow &&
          c.row <= maxRow &&
          c.column >= minColumn &&
          c.column <= maxColumn
      );
      for (let i = minRow; i <= maxRow; i++) {
        for (let j = minColumn; j <= maxColumn; j++) {
          const c = cells.find((c) => c.row === i && c.column === j);
          if (c) {
            toAdd.push(c.id);
          }
        }
      }
      patchSelection({ add: toAdd, remove: [] });
      return;
    }
    setSelection(new Set([cell.id]));
  }

  function handleContextMenu(e: React.MouseEvent<HTMLTableCellElement>) {
    if (e.button !== 2) return;
    if (editMode === cell.id) return;
    if (isSelected(cell.id)) return;
    setSelection(new Set([cell.id]));
  }

  function handleDoubleClick(e: React.MouseEvent<HTMLTableCellElement>) {
    if (e.button !== 0) return;
    if (editMode === cell.id) return;
    setEditMode(cell.id);
    clearSelection();
  }

  function handleBlur(_e: React.FocusEvent<HTMLTextAreaElement>) {
    setEditMode("none");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.shiftKey && e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLTextAreaElement).blur();
      return;
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    updateCellContent(cell.id, e.currentTarget.value, cell.type);
  }

  const handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (!isPressedKey("Shift") && e.shiftKey) {
      setPressedKey("Shift");
    }
  };
  const handleGlobalKeyUp = (e: KeyboardEvent) => {
    if (isPressedKey("Shift") && !e.shiftKey) {
      clearPressedKey();
    }
  };

  useEffect(() => {
    const unsubscribe = useGanttStore.subscribe(
      (state) => state.isSelected(cell.id),
      (isSelected) => {
        setCellStyle(
          isSelected
            ? "shadow-[0_0_0_2px_#86efac,inset_0_0_0_1000px_rgba(187,247,208,0.4)]"
            : ""
        );
      }
    );
    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("keyup", handleGlobalKeyUp);
    return () => {
      unsubscribe();
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("keyup", handleGlobalKeyUp);
    };
  }, []);

  if (cell.ghost) return null;

  return (
    <CellTag
      type={type}
      key={cell.id}
      id={cell.id}
      data-row={rid}
      data-column={cid}
      className={`relative w-4 h-4 user-select-none whitespace-pre-wrap text-left ${cellStyle}`}
      style={cell.style}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      // onInputCapture={handleChange}
      // onBlur={handleBlur}
      spellCheck={false}
      contentEditable={editMode === cell.id}
      suppressContentEditableWarning
      {...cell.cellProps}
    >
      <pre className={cn(editMode === cell.id ? "hidden" : "")}>
        {cell.content}
      </pre>
      {editMode === cell.id && (
        <textarea
          name={cell.id}
          value={cell.content}
          className="absolute top-0 left-0 min-w-[100px] w-full max-h-20 resize-none z-10 border border-input rounded-md p-2 bg-background field-sizing-content"
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          autoFocus={editMode === cell.id}
          onFocus={(e) => {
            if (e.target) {
              e.target.select();
            }
          }}
        />
      )}
    </CellTag>
  );
});

Cell.displayName = "Cell";

export default Cell;
