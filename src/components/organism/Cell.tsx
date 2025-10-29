import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor.store";
import { useGanttStore, type Cell as GanttCell } from "@/store/gantt.store";
import { memo, useCallback } from "react";
import { useSidebar } from "../ui/sidebar";

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
const Cell: React.FC<CellProps> = ({ type, cell, rid, cid }) => {
  const updateCellContent = useGanttStore((state) => state.updateCellContent);
  const setSelectedCell = useGanttStore((state) => state.setSelectedCell);
  const clearSelectedCells = useGanttStore((state) => state.clearSelectedCells);
  const hasSelectedCells = useGanttStore((state) => state.hasSelectedCells);
  const { setOpen } = useSidebar();
  const editMode = useEditorStore((state) => state.editMode);
  const setEditMode = useEditorStore((state) => state.setEditMode);

  function handleClick(e: React.MouseEvent<HTMLTableCellElement>) {
    if (e.button !== 0) return;
    clearSelectedCells();
    if (editMode === cell.id) return;
    setSelectedCell(cell.id);
  }

  function handleContextMenu(e: React.MouseEvent<HTMLTableCellElement>) {
    if (e.button !== 2) return;
    if (hasSelectedCells()) {
      e.preventDefault();
      setOpen(true);
    }
  }

  function handleDoubleClick(e: React.MouseEvent<HTMLTableCellElement>) {
    if (e.button !== 0) return;
    if (editMode === cell.id) return;
    setEditMode(cell.id);
    clearSelectedCells();
  }

  function handleBlur(e: React.FocusEvent<HTMLTextAreaElement>) {
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

  const getToggleStyle = useCallback((cell: GanttCell) => {
    return cell.selected
      ? "shadow-[0_0_0_2px_#86efac,inset_0_0_0_1000px_rgba(187,247,208,0.4)]"
      : "";
  }, []);

  return (
    <CellTag
      type={type}
      key={cell.id}
      id={cell.id}
      data-row={rid}
      data-column={cid}
      className={`relative w-[10px] h-[1rem] user-select-none whitespace-pre-wrap text-left ${getToggleStyle(
        cell
      )}`}
      style={cell.style}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      // onInputCapture={handleChange}
      // onBlur={handleBlur}
      spellCheck={false}
      contentEditable={editMode === cell.id}
      suppressContentEditableWarning
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
};

export default memo(Cell);
