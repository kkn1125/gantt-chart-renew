import { nanoid } from "nanoid";
import { create } from "zustand";
import { combine, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const DEFAULT_CONTENT = "-";

export interface Cell {
  id: string;
  row: number;
  column: number;
  content: string;
  selected: boolean;
  type: "head" | "body";
  style: React.CSSProperties;
  cellProps: Record<string, any>;
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
  // selectedCellId: string | null;
  // selectedRegion: "head" | "body" | null;
}
// interface GanttCreator {
//   getCurrentSheet: () => Sheet | null;
//   addSheet: (sheet: Sheet) => void;
//   updateSheet: (id: string, values: Partial<Sheet>) => void;
//   removeSheet: (id: string) => void;
//   addNewSheet: (title?: string) => void;
//   initializeGantt: () => void;
//   changeSheetIndex: (index: number) => void;
//   updateHeadCellContent: (id: string, content: string) => void;
//   updateBodyCellContent: (id: string, content: string) => void;
//   setSelectedCell: (cellId: string, region: "head" | "body") => void;
//   updateCellStyle: (id: string, style: Partial<React.CSSProperties>) => void;
// }

const initialState: GanttState = {
  sheets: [],
  currentSheetIndex: -1,
  // selectedCellId: null,
  // selectedRegion: null,
};

export const useGanttStore = create(
  devtools(
    persist(
      immer(
        combine(initialState, (set, get) => {
          function changeSheetIndex(index: number) {
            if (index < 0 || index >= get().sheets.length) {
              return;
            }
            set((state) => {
              state.currentSheetIndex = index;
            });
          }
          function initializeIndex() {
            const isOne = get().sheets.length === 1;
            set((state) => {
              state.currentSheetIndex = isOne
                ? state.sheets.length - 1
                : state.currentSheetIndex ?? 0;
            });
          }
          function initializeGantt() {
            if (get().sheets.length === 0) {
              addNewSheet();
              initializeIndex();
            }
          }
          function addSheet(newSheet: Sheet) {
            set((state) => {
              state.sheets.push(newSheet);
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
          function deleteRow(region: "head" | "body", rowIndex: number) {
            set((state) => {
              if (
                state.sheets[state.currentSheetIndex].gantt[region].length === 1
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
                state.sheets[state.currentSheetIndex].gantt.head[0].length === 1
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
                      selected: false,
                      type: "head",
                      style: {},
                      content: DEFAULT_CONTENT,
                      cellProps: {},
                    },
                  ],
                ],
                body: [
                  [
                    {
                      id: nanoid(),
                      row: 0,
                      column: 0,
                      selected: false,
                      type: "body",
                      style: {},
                      content: DEFAULT_CONTENT,
                      cellProps: {},
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
                  if (cell.id === id) cell.style = { ...cell.style, ...style };
                })
              );
              state.sheets[sheetIndex].gantt.body.forEach((row) =>
                row.forEach((cell) => {
                  if (cell.id === id) cell.style = { ...cell.style, ...style };
                })
              );
            });
          }
          function setSelectedCell(cellId: string) {
            setSelectCells(cellId, true);
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
          function getSelectedCells() {
            return getAllCells().filter((c) => c.selected);
          }
          function hasSelectedCells() {
            return getSelectedCells().length > 0;
          }
          function getSheetList() {
            return get().sheets.map((s) => ({ id: s.id, title: s.title }));
          }
          function setSelectCells(cellId: string, selected: boolean) {
            set((state) => {
              const sheet = state.sheets[state.currentSheetIndex];
              sheet.gantt.head
                .concat(sheet.gantt.body)
                .flat()
                .map((cell) => {
                  if (cell.id === cellId) {
                    cell.selected = selected;
                  }
                });
            });
          }
          function clearSelectedCells() {
            set((state) => {
              state.sheets[state.currentSheetIndex].gantt.head.forEach(
                (row) => {
                  row.forEach((c) => {
                    c.selected = false;
                  });
                }
              );
              state.sheets[state.currentSheetIndex].gantt.body.forEach(
                (row) => {
                  row.forEach((c) => {
                    c.selected = false;
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

          return {
            getCurrentSheet,
            addSheet,
            updateSheet,
            removeSheet,
            addNewSheet,
            initializeGantt,
            changeSheetIndex,
            updateCellContent,
            setSelectedCell,
            updateCellStyle,
            getSheetList,
            getCurrentHead,
            getCurrentBody,
            addRow,
            addColumn,
            deleteRow,
            deleteColumn,
            getAllCells,
            getSelectedCells,
            hasSelectedCells,
            setSelectCells,
            clearSelectedCells,
            getCellById,
            formattingCellIndex,
          };
        })
      ),
      {
        name: "gantt-sheets-storage",
      }
    )
  )
);
