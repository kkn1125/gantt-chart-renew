import { useGanttStore } from "@/store/gantt.store";
import { memo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

interface FooterProps {}
const Footer: React.FC<FooterProps> = () => {
  const getSheetList = useGanttStore(useShallow((state) => state.getSheetList));
  const addNewSheet = useGanttStore((state) => state.addNewSheet);
  const removeSheet = useGanttStore((state) => state.removeSheet);
  const changeSheetIndex = useGanttStore((state) => state.changeSheetIndex);
  const currentSheetIndex = useGanttStore((state) => state.currentSheetIndex);
  const [newSheetTitle, setNewSheetTitle] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [contextOpenIndex, setContextOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {/* 시트 탭 바 (목데이터) */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto rounded-md border bg-card p-2">
        {getSheetList().map((sheet, idx) => (
          <DropdownMenu
            key={sheet.id}
            open={contextOpenIndex === idx}
            onOpenChange={(o) => !o && setContextOpenIndex(null)}
          >
            <DropdownMenuTrigger asChild>
              <button
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextOpenIndex(idx);
                }}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm ${
                  currentSheetIndex === idx
                    ? "bg-primary/80 text-primary-foreground/80 hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={() => {
                  if (currentSheetIndex === idx) return;
                  changeSheetIndex(idx);
                }}
              >
                {idx + 1}. {sheet.title}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>이름 변경</DropdownMenuItem>
              <DropdownMenuItem>복제</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>왼쪽으로 이동</DropdownMenuItem>
              <DropdownMenuItem>오른쪽으로 이동</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => removeSheet(sheet.id)}
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
        <Button size="sm" variant="outline" onClick={() => setOpenAdd(true)}>
          + 시트 추가
        </Button>
      </div>

      {/* 시트 추가 모달 */}
      <Sheet open={openAdd} onOpenChange={setOpenAdd}>
        <SheetContent
          side="top"
          className="mx-auto max-w-screen-sm rounded-b-md border-x"
        >
          <SheetHeader>
            <SheetTitle>새 시트 추가</SheetTitle>
          </SheetHeader>
          <div className="px-4">
            <Input
              autoFocus
              placeholder="시트 제목을 입력하세요"
              value={newSheetTitle}
              onChange={(e) => setNewSheetTitle(e.target.value)}
            />
          </div>
          <SheetFooter>
            <div className="flex w-full justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenAdd(false)}>
                취소
              </Button>
              <Button
                onClick={() => {
                  const title = newSheetTitle.trim();
                  if (!title) return;
                  addNewSheet(title);
                  setNewSheetTitle("");
                  setOpenAdd(false);
                }}
              >
                추가
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <footer className="border-t py-3 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-center px-4">
          <span>Copyright 2025. devkimson. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default memo(Footer);
