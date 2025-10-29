import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useGanttStore, type Cell } from "@/store/gantt.store";
import { useState } from "react";

export function DirectContextMenu({ children }: { children: React.ReactNode }) {
  const getCellById = useGanttStore((state) => state.getCellById);
  const addRow = useGanttStore((state) => state.addRow);
  const addColumn = useGanttStore((state) => state.addColumn);
  const deleteRow = useGanttStore((state) => state.deleteRow);
  const deleteColumn = useGanttStore((state) => state.deleteColumn);
  const [clickedCell, setClickedCell] = useState<Cell | null>(null);

  function handleContextMenu(e: React.MouseEvent<HTMLDivElement>) {
    const targetCell = (e.target as HTMLElement)?.closest?.(":is(th,td)");
    if (!targetCell) return;

    const id = targetCell.id;
    const cell = getCellById(id);
    if (!cell) return;
    setClickedCell(cell);
  }

  function clearClickedCell() {
    setClickedCell(null);
  }

  function handleAddRowAbove() {
    addRow("head", "top", clickedCell?.row ?? 0);
    clearClickedCell();
  }

  function handleAddRowBelow() {
    addRow("body", "bottom", clickedCell?.row ?? 0);
    clearClickedCell();
  }

  function handleAddColumnLeft() {
    addColumn("left", clickedCell?.row ?? 0, clickedCell?.column ?? 0);
    clearClickedCell();
  }

  function handleAddColumnRight() {
    addColumn("right", clickedCell?.row ?? 0, clickedCell?.column ?? 0);
    clearClickedCell();
  }

  function handleDeleteRow() {
    deleteRow(clickedCell?.type ?? "head", clickedCell?.row ?? 0);
    clearClickedCell();
  }

  function handleDeleteColumn() {
    deleteColumn(clickedCell?.column ?? 0);
    clearClickedCell();
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger onContextMenu={handleContextMenu}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem inset onClick={handleAddRowAbove}>
          Add Row (Above)
          {/* <ContextMenuShortcut>⌘[</ContextMenuShortcut> */}
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleAddRowBelow}>
          Add Row (Below)
          {/* <ContextMenuShortcut>⌘[</ContextMenuShortcut> */}
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleAddColumnLeft}>
          Add Column (Left)
          {/* <ContextMenuShortcut>⌘]</ContextMenuShortcut> */}
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleAddColumnRight}>
          Add Column (Right)
          {/* <ContextMenuShortcut>⌘]</ContextMenuShortcut> */}
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleDeleteRow}>
          Delete Row
          {/* <ContextMenuShortcut>⌘R</ContextMenuShortcut> */}
        </ContextMenuItem>
        <ContextMenuItem inset onClick={handleDeleteColumn}>
          Delete Column
          {/* <ContextMenuShortcut>⌘R</ContextMenuShortcut> */}
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem>Save Page...</ContextMenuItem>
            <ContextMenuItem>Create Shortcut...</ContextMenuItem>
            <ContextMenuItem>Name Window...</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Developer Tools</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>
          Show Bookmarks
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="pedro">
          <ContextMenuLabel inset>People</ContextMenuLabel>
          <ContextMenuRadioItem value="pedro">
            Pedro Duarte
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
