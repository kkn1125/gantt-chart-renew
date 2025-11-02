import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEditorStore } from "@/store/editor.store";
import { useGanttStore } from "@/store/gantt.store";

export function DirectContextMenu({ children }: { children: React.ReactNode }) {
  const getCellById = useGanttStore((state) => state.getCellById);
  const mergeCells = useGanttStore((state) => state.mergeCells);
  const unMergeCells = useGanttStore((state) => state.unMergeCells);
  const addAboveRow = useGanttStore((state) => state.addAboveRow);
  const addBelowRow = useGanttStore((state) => state.addBelowRow);
  const addLeftColumn = useGanttStore((state) => state.addLeftColumn);
  const addRightColumn = useGanttStore((state) => state.addRightColumn);
  const addTopSideSelected = useGanttStore((state) => state.addTopSideSelected);
  const addBottomSideSelected = useGanttStore(
    (state) => state.addBottomSideSelected
  );
  const addLeftSideSelected = useGanttStore(
    (state) => state.addLeftSideSelected
  );
  const addRightSideSelected = useGanttStore(
    (state) => state.addRightSideSelected
  );
  const getSelectedCells = useGanttStore((state) => state.getSelectedCells);
  const applyStyleToSelectedCells = useGanttStore(
    (state) => state.applyStyleToSelectedCells
  );
  const clearStyleToSelectedCells = useGanttStore(
    (state) => state.clearStyleToSelectedCells
  );
  const deleteRows = useGanttStore((state) => state.deleteRows);
  const deleteColumns = useGanttStore((state) => state.deleteColumns);
  const hasCopyStyle = useEditorStore((state) => state.hasStyle);
  const hasSelected = useGanttStore((state) => state.selectedIds.size > 0);
  const hasMergedCells = useGanttStore((state) =>
    state
      .getAllCells()
      .filter((c) => state.selectedIds.has(c.id))
      .some((c) => c.anchor)
  );
  const selectedIds = useGanttStore((state) => state.selectedIds);
  const setCopyStyle = useEditorStore((state) => state.setCopyStyle);
  const getCopyStyle = useEditorStore((state) => state.getCopyStyle);
  const clearCopyStyle = useEditorStore((state) => state.clearCopyStyle);
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
  function handleAddLeftSideColumn() {
    addLeftColumn();
  }
  function handleAddRightSideColumn() {
    addRightColumn();
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
  function handleUnMergeCells() {
    unMergeCells();
  }

  function handleMergeCellsAllDirections() {
    mergeCells(true, true);
  }
  function handleMergeCellsHorizontal() {
    mergeCells(true, false);
  }
  function handleMergeCellsVertical() {
    mergeCells(false, true);
  }

  function handleContextMenu(e: React.MouseEvent<HTMLDivElement>) {
    const targetCell = (e.target as HTMLElement)?.closest?.(":is(th,td)");
    if (!targetCell) return;

    const id = targetCell.id;
    const cell = getCellById(id);
    if (!cell) return;
  }

  function handleApplyStyle() {
    const style = getCopyStyle();
    applyStyleToSelectedCells(style);
  }

  async function handleCopyStyle() {
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
  function handleClearStyle() {
    clearStyleToSelectedCells();
    clearCopyStyle();
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger onContextMenu={handleContextMenu}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        {hasSelected ? (
          <>
            <ContextMenuItem inset onClick={handleAddTopSideSelected}>
              Add Row (Target Above)
              {/* <ContextMenuShortcut>⌘[</ContextMenuShortcut> */}
            </ContextMenuItem>
            <ContextMenuItem inset onClick={handleAddBottomSideSelected}>
              Add Row (Target Below)
              {/* <ContextMenuShortcut>⌘[</ContextMenuShortcut> */}
            </ContextMenuItem>
            <ContextMenuItem inset onClick={handleAddLeftSideSelected}>
              Add Column (Target Left)
              {/* <ContextMenuShortcut>⌘]</ContextMenuShortcut> */}
            </ContextMenuItem>
            <ContextMenuItem inset onClick={handleAddRightSideSelected}>
              Add Column (Target Right)
              {/* <ContextMenuShortcut>⌘]</ContextMenuShortcut> */}
            </ContextMenuItem>
          </>
        ) : (
          <>
            <ContextMenuItem inset onClick={handleAddHeadRowAbove}>
              Add Head Row (Above)
            </ContextMenuItem>
            <ContextMenuItem inset onClick={handleAddHeadRowBelow}>
              Add Head Row (Below)
            </ContextMenuItem>
            <ContextMenuItem inset onClick={handleAddBodyRowAbove}>
              Add Body Row (Above)
            </ContextMenuItem>
            <ContextMenuItem inset onClick={handleAddBodyRowBelow}>
              Add Body Row (Below)
            </ContextMenuItem>
            <ContextMenuItem inset onClick={handleAddLeftSideColumn}>
              Add Left Side Column
            </ContextMenuItem>
            <ContextMenuItem inset onClick={handleAddRightSideColumn}>
              Add Right Side Column
            </ContextMenuItem>
          </>
        )}

        <ContextMenuItem
          disabled={!hasSelected}
          inset
          onClick={handleDeleteRows}
        >
          Delete Row
          {/* <ContextMenuShortcut>⌘R</ContextMenuShortcut> */}
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!hasSelected}
          inset
          onClick={handleDeleteColumns}
        >
          Delete Column
          {/* <ContextMenuShortcut>⌘R</ContextMenuShortcut> */}
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>
            Concatenates Cells
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem
              disabled={selectedIds.size <= 1}
              onClick={handleMergeCellsAllDirections}
            >
              Concatenate Cells (All Directions)
            </ContextMenuItem>
            <ContextMenuItem
              disabled={selectedIds.size <= 1}
              onClick={handleMergeCellsHorizontal}
            >
              Concatenate Cells (Horizontal)
            </ContextMenuItem>
            <ContextMenuItem
              disabled={selectedIds.size <= 1}
              onClick={handleMergeCellsVertical}
            >
              Concatenate Cells (Vertical)
            </ContextMenuItem>
            <ContextMenuItem
              disabled={!hasMergedCells}
              onClick={handleUnMergeCells}
            >
              Unmerge Cells
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>Copy Style</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem disabled={!hasSelected} onClick={handleCopyStyle}>
              Copy Style
            </ContextMenuItem>
            <ContextMenuItem
              disabled={!hasSelected || !hasCopyStyle()}
              onClick={handleApplyStyle}
            >
              Apply Style
            </ContextMenuItem>
            <ContextMenuItem disabled={!hasSelected} onClick={handleClearStyle}>
              Clear Style
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}
