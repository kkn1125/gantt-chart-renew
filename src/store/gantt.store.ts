import { enableMapSet } from "immer";
import { nanoid } from "nanoid";
import { create } from "zustand";
import {
  combine,
  devtools,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
enableMapSet();

export const DEFAULT_CONTENT = "-";

export interface Cell {
  id: string;
  row: number;
  column: number;
  content: string;
  type: "head" | "body";
  style: React.CSSProperties;
  cellProps: React.ComponentProps<"th" | "td">;
  ghost: boolean;
  anchor: boolean;
}

export interface Gantt {
  head: Cell[][];
  body: Cell[][];
}

export interface Sheet {
  id: string;
  title: string;
  description: string | null;
  gantt: Gantt;
  createdAt: Date;
  updatedAt: Date;
}

interface GanttState {
  sheets: Sheet[];
  currentSheetIndex: number;
  selectedIds: Set<string>;
}

const initialState: GanttState = {
  sheets: [],
  currentSheetIndex: -1,
  selectedIds: new Set<string>(),
};

export const useGanttStore = create(
  devtools(
    subscribeWithSelector(
      persist(
        immer(
          combine(initialState, (set, get) => {
            function changeSheetIndex(index: number) {
              if (index < 0 || index >= get().sheets.length) {
                return;
              }
              set((state) => {
                if (typeof index !== "number") return;
                state.currentSheetIndex = index;
              });
            }
            function moveSheet(sheetId: string, direction: "left" | "right") {
              const sheetIndex = get().sheets.findIndex(
                (s) => s.id === sheetId
              );
              if (sheetIndex === -1) return;
              set((state) => {
                if (direction === "left" && sheetIndex > 0) {
                  [state.sheets[sheetIndex - 1], state.sheets[sheetIndex]] = [
                    state.sheets[sheetIndex],
                    state.sheets[sheetIndex - 1],
                  ];
                  state.currentSheetIndex =
                    sheetIndex - 1 > 0 ? sheetIndex - 1 : 0;
                } else if (
                  direction === "right" &&
                  sheetIndex < get().sheets.length - 1
                ) {
                  [state.sheets[sheetIndex + 1], state.sheets[sheetIndex]] = [
                    state.sheets[sheetIndex],
                    state.sheets[sheetIndex + 1],
                  ];
                  state.currentSheetIndex =
                    sheetIndex + 1 < get().sheets.length - 1
                      ? sheetIndex + 1
                      : get().sheets.length - 1;
                }
              });
            }
            function initializeIndex() {
              const isOne = get().sheets.length === 1;
              set((state) => {
                state.currentSheetIndex = isOne
                  ? state.sheets.length - 1
                  : state.currentSheetIndex ?? 0;
              });
              set((state) => {
                state.sheets = state.sheets.filter((sheet) => !!sheet);
              });
            }
            function initializeGantt() {
              if (get().sheets.length === 0) {
                addNewSheet();
              }
              initializeIndex();
            }
            function addSheet(newSheet: Sheet) {
              set((state) => {
                if (!newSheet) return;
                state.sheets.push(
                  newSheet as unknown as (typeof state.sheets)[number]
                );
              });
            }
            function selectAllCells() {
              set((state) => {
                state.selectedIds = new Set([
                  ...state.sheets[state.currentSheetIndex].gantt.head.flatMap(
                    (row) => row.map((cell) => cell.id)
                  ),
                  ...state.sheets[state.currentSheetIndex].gantt.body.flatMap(
                    (row) => row.map((cell) => cell.id)
                  ),
                ]);
              });
            }
            function addRow(
              region: "head" | "body",
              direction: "top" | "bottom",
              rowIndex: number
            ) {
              set((state) => {
                const regionRow =
                  state.sheets[state.currentSheetIndex].gantt[region];
                const newRow = Array.from(
                  { length: regionRow[0].length },
                  (_, i) => ({
                    id: nanoid(),
                    row: regionRow.length,
                    column: i,
                    selected: false,
                    type: region,
                    style: {},
                    content: DEFAULT_CONTENT,
                    cellProps: {},
                    ghost: false,
                    anchor: false,
                  })
                );
                if (direction === "top") {
                  regionRow.splice(rowIndex, 0, newRow);
                } else {
                  regionRow.splice(rowIndex + 1, 0, newRow);
                }
              });
              formattingCellIndex();
            }
            function addColumn(
              direction: "left" | "right",
              rowIndex: number,
              columnIndex: number
            ) {
              set((state) => {
                state.sheets[state.currentSheetIndex].gantt.head.forEach(
                  (row) => {
                    const newRow = {
                      id: nanoid(),
                      row: rowIndex,
                      column: columnIndex,
                      selected: false,
                      type: "head" as const,
                      style: {},
                      content: DEFAULT_CONTENT,
                      cellProps: {},
                      ghost: false,
                      anchor: false,
                    };
                    if (direction === "left") {
                      row.splice(columnIndex, 0, newRow);
                    } else {
                      row.splice(columnIndex + 1, 0, newRow);
                    }
                  }
                );
                state.sheets[state.currentSheetIndex].gantt.body.forEach(
                  (row) => {
                    const newRow = {
                      id: nanoid(),
                      row: rowIndex,
                      column: columnIndex,
                      selected: false,
                      type: "body" as const,
                      style: {},
                      content: DEFAULT_CONTENT,
                      cellProps: {},
                      ghost: false,
                      anchor: false,
                    };
                    if (direction === "left") {
                      row.splice(columnIndex, 0, newRow);
                    } else {
                      row.splice(columnIndex + 1, 0, newRow);
                    }
                  }
                );
              });
              formattingCellIndex();
            }
            function addAboveRow(region: "head" | "body") {
              addRow(region, "top", 0);
            }
            function addBelowRow(region: "head" | "body") {
              addRow(
                region,
                "bottom",
                get().sheets[get().currentSheetIndex].gantt[region].length - 1
              );
            }
            function addLeftColumn() {
              addColumn("left", 0, 0);
            }
            function addRightColumn() {
              addColumn(
                "right",
                0,
                get().sheets[get().currentSheetIndex].gantt.body[0].length - 1
              );
            }
            function addTopSideSelected() {
              const selectedCells = getAllCells().filter((c) =>
                get().selectedIds.has(c.id)
              );
              let topSideCellRowIndex = Infinity;
              selectedCells.forEach((cell) => {
                if (cell.row < topSideCellRowIndex) {
                  topSideCellRowIndex = cell.row;
                }
              });
              let type: "head" | "body" | null = null;
              for (const cell of selectedCells) {
                if (type !== null && type !== cell.type) {
                  return;
                }
                type = cell.type;
              }
              addRow(type ?? "head", "top", topSideCellRowIndex);
              clearSelectedCells();
            }
            function addBottomSideSelected() {
              const selectedCells = getAllCells().filter((c) =>
                get().selectedIds.has(c.id)
              );
              let bottomSideCellRowIndex = -Infinity;
              selectedCells.forEach((cell) => {
                if (cell.row > bottomSideCellRowIndex) {
                  bottomSideCellRowIndex = cell.row;
                }
              });
              let type: "head" | "body" | null = null;
              for (const cell of selectedCells) {
                if (type !== null && type !== cell.type) {
                  return;
                }
                type = cell.type;
              }
              addRow(type ?? "body", "bottom", bottomSideCellRowIndex);
              clearSelectedCells();
            }
            function addLeftSideSelected() {
              console.log("여기 안오나?");
              const selectedCells = getAllCells().filter((c) =>
                get().selectedIds.has(c.id)
              );
              let leftSideCellColumnIndex = Infinity;
              selectedCells.forEach((cell) => {
                if (cell.column < leftSideCellColumnIndex) {
                  leftSideCellColumnIndex = cell.column;
                }
              });
              addColumn(
                "left",
                0,
                leftSideCellColumnIndex === Infinity
                  ? 0
                  : leftSideCellColumnIndex
              );
              clearSelectedCells();
            }
            function addRightSideSelected() {
              const selectedCells = getAllCells().filter((c) =>
                get().selectedIds.has(c.id)
              );
              let rightSideCellColumnIndex = -Infinity;
              selectedCells.forEach((cell) => {
                if (cell.column > rightSideCellColumnIndex) {
                  rightSideCellColumnIndex = cell.column;
                }
              });
              addColumn(
                "right",
                0,
                rightSideCellColumnIndex === -Infinity
                  ? get().sheets[get().currentSheetIndex].gantt.body[0].length -
                      1
                  : rightSideCellColumnIndex
              );
              clearSelectedCells();
            }
            function deleteRow(region: "head" | "body", rowIndex: number) {
              set((state) => {
                if (
                  state.sheets[state.currentSheetIndex].gantt[region].length ===
                  1
                ) {
                  return;
                }
                state.sheets[state.currentSheetIndex].gantt[region].splice(
                  rowIndex,
                  1
                );
              });
              formattingCellIndex();
            }
            function deleteColumn(columnIndex: number) {
              set((state) => {
                if (
                  state.sheets[state.currentSheetIndex].gantt.head[0].length ===
                  1
                ) {
                  return;
                }

                state.sheets[state.currentSheetIndex].gantt.head.forEach(
                  (row) => {
                    row.splice(columnIndex, 1);
                  }
                );
                state.sheets[state.currentSheetIndex].gantt.body.forEach(
                  (row) => {
                    row.splice(columnIndex, 1);
                  }
                );
              });
              formattingCellIndex();
            }
            function addNewSheet(title?: string) {
              const newSheet: Sheet = {
                id: nanoid(),
                title: title ?? "새 시트",
                description: null,
                gantt: {
                  head: [
                    [
                      {
                        id: nanoid(),
                        row: 0,
                        column: 0,
                        type: "head",
                        style: {},
                        content: DEFAULT_CONTENT,
                        cellProps: {},
                        ghost: false,
                        anchor: false,
                      },
                    ],
                  ],
                  body: [
                    [
                      {
                        id: nanoid(),
                        row: 0,
                        column: 0,
                        type: "body",
                        style: {},
                        content: DEFAULT_CONTENT,
                        cellProps: {},
                        ghost: false,
                        anchor: false,
                      },
                    ],
                  ],
                },
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              if (title) {
                const filtered = get().sheets.filter((s) =>
                  s.title.startsWith(title)
                );
                if (filtered.length > 0) {
                  newSheet.title = `${title} (${filtered.length + 1})`;
                }
              }

              addSheet(newSheet);
            }
            function updateSheet(id: string, values: Partial<Sheet>) {
              set((state) => ({
                sheets: state.sheets.map((s) =>
                  s.id === id ? { ...s, ...values } : s
                ),
              }));
            }
            function removeSheet(id: string) {
              set((state) => {
                state.sheets = state.sheets.filter((s) => s.id !== id);
                const totalLength = state.sheets.length;
                const nextIndex = totalLength - 1;
                if (state.currentSheetIndex !== -1 && nextIndex >= 0) {
                  state.currentSheetIndex = nextIndex;
                } else {
                  state.currentSheetIndex = -1;
                }
              });
              if (get().currentSheetIndex === -1) {
                initializeGantt();
              }
            }
            function updateCellContent(
              id: string,
              content: string,
              region: "head" | "body"
            ) {
              const sheetIndex = get().currentSheetIndex;
              if (sheetIndex === -1) return;
              const sheet = get().sheets[sheetIndex];
              if (!sheet) return;
              set((state) => {
                state.sheets[sheetIndex].gantt[region].forEach((row) => {
                  row.forEach((cell) => {
                    if (cell.id === id) cell.content = content;
                  });
                });
              });
            }
            function updateCellStyle(
              id: string,
              style: Partial<React.CSSProperties>
            ) {
              const sheetIndex = get().currentSheetIndex;
              if (sheetIndex === -1) return;
              set((state) => {
                state.sheets[sheetIndex].gantt.head.forEach((row) =>
                  row.forEach((cell) => {
                    if (cell.id === id)
                      cell.style = { ...cell.style, ...style };
                  })
                );
                state.sheets[sheetIndex].gantt.body.forEach((row) =>
                  row.forEach((cell) => {
                    if (cell.id === id)
                      cell.style = { ...cell.style, ...style };
                  })
                );
              });
            }
            function batchUpdateCellStyles(
              ids: string[],
              style: Partial<React.CSSProperties>
            ) {
              const sheetIndex = get().currentSheetIndex;
              if (sheetIndex === -1) return;
              const idSet = new Set(ids);
              set((state) => {
                state.sheets[sheetIndex].gantt.head.forEach((row) =>
                  row.forEach((cell) => {
                    if (idSet.has(cell.id))
                      cell.style = { ...cell.style, ...style };
                  })
                );
                state.sheets[sheetIndex].gantt.body.forEach((row) =>
                  row.forEach((cell) => {
                    if (idSet.has(cell.id))
                      cell.style = { ...cell.style, ...style };
                  })
                );
              });
            }
            function clearCellStyle(id: string) {
              const sheetIndex = get().currentSheetIndex;
              if (sheetIndex === -1) return;
              set((state) => {
                state.sheets[sheetIndex].gantt.head.forEach((row) =>
                  row.forEach((cell) => {
                    if (cell.id === id) cell.style = {};
                  })
                );
                state.sheets[sheetIndex].gantt.body.forEach((row) =>
                  row.forEach((cell) => {
                    if (cell.id === id) cell.style = {};
                  })
                );
              });
            }
            function getCurrentSheet() {
              const index = get().currentSheetIndex;
              return index !== -1 ? get().sheets[index] : null;
            }
            function getCurrentHead() {
              const index = get().currentSheetIndex;
              return index !== -1 ? get().sheets[index].gantt.head : [];
            }
            function getCurrentBody() {
              const index = get().currentSheetIndex;
              return index !== -1 ? get().sheets[index].gantt.body : [];
            }
            function getAllCells() {
              const index = get().currentSheetIndex;
              return index !== -1
                ? get()
                    .sheets[index].gantt.head.concat(
                      get().sheets[index].gantt.body
                    )
                    .flatMap((item) =>
                      item.map((cell) => ({
                        ...cell,
                        element: document.querySelector(`[id="${cell.id}"]`),
                      }))
                    )
                : [];
            }
            function getSheetList() {
              return get().sheets.map((s) => ({ id: s.id, title: s.title }));
            }
            function clearSelectedCells() {
              set((state) => {
                state.sheets[state.currentSheetIndex].gantt.head.forEach(
                  (row) => {
                    row.forEach((c) => {
                      state.selectedIds.delete(c.id);
                    });
                  }
                );
                state.sheets[state.currentSheetIndex].gantt.body.forEach(
                  (row) => {
                    row.forEach((c) => {
                      state.selectedIds.delete(c.id);
                    });
                  }
                );
              });
            }
            function getCellById(id: string) {
              return getAllCells().find((c) => c.id === id);
            }
            function formattingCellIndex() {
              set((state) => {
                state.sheets[state.currentSheetIndex].gantt.head.forEach(
                  (row, rowIndex) => {
                    row.forEach((cell, columnIndex) => {
                      cell.row = rowIndex;
                      cell.column = columnIndex;
                    });
                  }
                );
                state.sheets[state.currentSheetIndex].gantt.body.forEach(
                  (row, rowIndex) => {
                    row.forEach((cell, columnIndex) => {
                      cell.row = rowIndex;
                      cell.column = columnIndex;
                    });
                  }
                );
              });
            }
            function mergeCells(horizontal: boolean, vertical: boolean) {
              if (!horizontal && !vertical) {
                return;
              }

              set((state) => {
                const originalCells = state.sheets[
                  state.currentSheetIndex
                ].gantt.head
                  .concat(state.sheets[state.currentSheetIndex].gantt.body)
                  .flat();
                const selectedCells = originalCells.filter((c) =>
                  isSelected(c.id)
                );

                const typeSet = new Set(selectedCells.map((c) => c.type));
                if (typeSet.size > 1) {
                  alert("선택 셀의 타입이 다릅니다.");
                  return;
                }
                const columnIdx = new Set(selectedCells.map((c) => c.column));
                const rowIdx = new Set(selectedCells.map((c) => c.row));

                for (const cell of selectedCells.filter((c) => c.anchor)) {
                  if (cell.cellProps.colSpan && cell.cellProps.colSpan > 1) {
                    columnIdx.add(
                      cell.column +
                        (cell.cellProps.colSpan
                          ? cell.cellProps.colSpan - 1
                          : 0)
                    );
                  }
                  if (cell.cellProps.rowSpan && cell.cellProps.rowSpan > 1) {
                    rowIdx.add(
                      cell.row +
                        (cell.cellProps.rowSpan
                          ? cell.cellProps.rowSpan - 1
                          : 0)
                    );
                  }
                }

                const minColumnIndex = Math.min(...columnIdx);
                const maxColumnIndex = Math.max(...columnIdx);
                const minRowIndex = Math.min(...rowIdx);
                const maxRowIndex = Math.max(...rowIdx);
                const tempCell = selectedCells[0];
                const mainType = tempCell.type;
                const virtualSelectedCells = [...selectedCells];
                for (
                  let rowIndex = minRowIndex;
                  rowIndex <= maxRowIndex;
                  rowIndex++
                ) {
                  for (
                    let columnIndex = minColumnIndex;
                    columnIndex <= maxColumnIndex;
                    columnIndex++
                  ) {
                    const cell = originalCells.find(
                      (c) =>
                        c.row === rowIndex &&
                        c.column === columnIndex &&
                        c.type === mainType
                    );
                    if (
                      !cell ||
                      virtualSelectedCells.some((c) => c.id === cell.id)
                    ) {
                      continue;
                    }
                    virtualSelectedCells.push(cell);
                  }
                }
                const typeCheck = new Set(
                  virtualSelectedCells.map((c) => c.type)
                );
                if (typeCheck.size > 1) {
                  alert("선택 셀의 타입이 다릅니다.");
                  return;
                }

                if (horizontal && vertical) {
                  for (
                    let rowIndex = minRowIndex;
                    rowIndex <= maxRowIndex;
                    rowIndex++
                  ) {
                    for (
                      let columnIndex = minColumnIndex;
                      columnIndex <= maxColumnIndex;
                      columnIndex++
                    ) {
                      const cell = virtualSelectedCells.find(
                        (c) => c.row === rowIndex && c.column === columnIndex
                      );
                      if (!cell) continue;
                      if (
                        cell.row === minRowIndex &&
                        cell.column === minColumnIndex
                      ) {
                        cell.anchor = true;
                        if (maxColumnIndex - minColumnIndex >= 0) {
                          cell.cellProps.colSpan =
                            maxColumnIndex - minColumnIndex + 1;
                        }
                        if (maxRowIndex - minRowIndex >= 0) {
                          cell.cellProps.rowSpan =
                            maxRowIndex - minRowIndex + 1;
                        }
                      } else if (cell) {
                        cell.ghost = true;
                      }
                    }
                  }
                } else if (horizontal) {
                  for (
                    let rowIndex = minRowIndex;
                    rowIndex <= maxRowIndex;
                    rowIndex++
                  ) {
                    const rowCells = virtualSelectedCells.filter(
                      (c) => c.row === rowIndex
                    );
                    const minColumnIndex = Math.min(
                      ...rowCells.map((c) => c.column)
                    );
                    const maxColumnIndex = Math.max(
                      ...rowCells.map((c) => c.column)
                    );
                    for (const cell of rowCells) {
                      if (cell.column === minColumnIndex) {
                        cell.cellProps.colSpan =
                          maxColumnIndex - minColumnIndex + 1;
                        cell.anchor = true;
                      } else {
                        cell.ghost = true;
                      }
                    }
                  }
                } else if (vertical) {
                  for (
                    let columnIndex = minColumnIndex;
                    columnIndex <= maxColumnIndex;
                    columnIndex++
                  ) {
                    const columnCells = virtualSelectedCells.filter(
                      (c) => c.column === columnIndex
                    );
                    const minRowIndex = Math.min(
                      ...columnCells.map((c) => c.row)
                    );
                    const maxRowIndex = Math.max(
                      ...columnCells.map((c) => c.row)
                    );
                    for (const cell of columnCells) {
                      if (cell.row === minRowIndex) {
                        cell.cellProps.rowSpan = maxRowIndex - minRowIndex + 1;
                        cell.anchor = true;
                      } else {
                        cell.ghost = true;
                      }
                    }
                  }
                }
              });

              clearSelectedCells();
            }
            function unMergeCells() {
              set((state) => {
                const selectedCells = state.sheets[
                  state.currentSheetIndex
                ].gantt.head
                  .concat(state.sheets[state.currentSheetIndex].gantt.body)
                  .flat()
                  .filter((c) => isSelected(c.id));

                const anchorCells = selectedCells.filter((c) => c.anchor);

                for (const cell of anchorCells) {
                  const type = cell.type;
                  const colSpan = cell.cellProps.colSpan;
                  const rowSpan = cell.cellProps.rowSpan;
                  const minCol = cell.column;
                  const minRow = cell.row;
                  const regionCells =
                    state.sheets[state.currentSheetIndex].gantt[type];
                  for (
                    let rowIndex = minRow;
                    rowIndex < minRow + (rowSpan ?? 1);
                    rowIndex++
                  ) {
                    const rowCells = regionCells[rowIndex];
                    for (
                      let columnIndex = minCol;
                      columnIndex < minCol + (colSpan ?? 1);
                      columnIndex++
                    ) {
                      const cell = rowCells[columnIndex];
                      if (!cell) continue;
                      cell.ghost = false;
                      delete cell.cellProps.colSpan;
                      delete cell.cellProps.rowSpan;
                      cell.anchor = false;
                    }
                  }
                }
              });
              clearSelectedCells();
            }
            function deleteRows() {
              const selectedCells = getAllCells().filter((c) =>
                get().selectedIds.has(c.id)
              );
              selectedCells.forEach((cell) => {
                deleteRow(cell.type, cell.row);
              });
              clearSelectedCells();
            }
            function deleteColumns() {
              const selectedCells = getAllCells().filter((c) =>
                get().selectedIds.has(c.id)
              );
              selectedCells.forEach((cell) => {
                deleteColumn(cell.column);
              });
              clearSelectedCells();
            }
            function setSelection(next: Set<string>) {
              set(() => ({ selectedIds: new Set(next) }));
            }
            function patchSelection({
              add,
              remove,
            }: {
              add: string[];
              remove: string[];
            }) {
              set((state) => {
                const s = new Set(state.selectedIds);
                for (const id of add) s.add(id);
                for (const id of remove) s.delete(id);
                return { selectedIds: s };
              });
            }
            function clearSelection() {
              set((state) => {
                state.selectedIds = new Set();
              });
            }
            function isSelected(id: string) {
              return get().selectedIds.has(id);
            }
            function getSelectedCells() {
              return getAllCells().filter((c) => get().selectedIds.has(c.id));
            }
            function pasteContentToSelectedCells(content: string) {
              const selectedCells = getSelectedCells();
              for (const cell of selectedCells) {
                updateCellContent(cell.id, content, cell.type);
              }
              clearSelectedCells();
            }
            function applyStyleToSelectedCells(style: React.CSSProperties) {
              const selectedCells = getSelectedCells();
              for (const cell of selectedCells) {
                updateCellStyle(cell.id, style);
              }
              clearSelectedCells();
            }
            function clearStyleToSelectedCells() {
              const selectedCells = getSelectedCells();
              for (const cell of selectedCells) {
                clearCellStyle(cell.id);
              }
              clearSelectedCells();
            }
            function deleteContentToSelectedCells() {
              const selectedCells = getSelectedCells();
              for (const cell of selectedCells) {
                updateCellContent(cell.id, "", cell.type);
              }
              clearSelectedCells();
            }
            function clearContentAndStyleToSelectedCells() {
              const selectedCells = getSelectedCells();
              for (const cell of selectedCells) {
                updateCellContent(cell.id, "", cell.type);
                clearCellStyle(cell.id);
              }
              clearSelectedCells();
            }
            return {
              selectAllCells,
              getCurrentSheet,
              addSheet,
              updateSheet,
              removeSheet,
              addNewSheet,
              moveSheet,
              changeSheetIndex,
              initializeGantt,
              updateCellContent,
              updateCellStyle,
              batchUpdateCellStyles,
              clearCellStyle,
              getSheetList,
              getCurrentHead,
              getCurrentBody,
              addRow,
              addColumn,
              deleteRow,
              deleteColumn,
              getAllCells,
              getCellById,
              formattingCellIndex,
              mergeCells,
              unMergeCells,
              addTopSideSelected,
              addBottomSideSelected,
              addLeftSideSelected,
              addRightSideSelected,
              deleteRows,
              deleteColumns,
              addAboveRow,
              addBelowRow,
              addLeftColumn,
              addRightColumn,
              setSelection,
              patchSelection,
              clearSelection,
              isSelected,
              getSelectedCells,
              pasteContentToSelectedCells,
              deleteContentToSelectedCells,
              applyStyleToSelectedCells,
              clearStyleToSelectedCells,
              clearContentAndStyleToSelectedCells,
            };
          })
        ),
        {
          name: "gantt-sheets-storage",
          storage: {
            getItem: (name) => {
              const str = localStorage.getItem(name);
              if (!str) return null;
              return {
                state: {
                  ...JSON.parse(str).state,
                  sheets: JSON.parse(str).state.sheets.filter(
                    (s: Sheet) => !!s
                  ),
                  selectedIds: new Set(JSON.parse(str).state.selectedIds),
                },
              };
            },
            setItem: (name, newValue) => {
              const str = JSON.stringify({
                state: {
                  ...newValue.state,
                  selectedIds: Array.from(newValue.state.selectedIds),
                },
              });
              localStorage.setItem(name, str);
            },
            removeItem: (name) => {
              console.log("🚀 ~ name:", name);
              localStorage.removeItem(name);
            },
          },
        }
      )
    )
  )
);
