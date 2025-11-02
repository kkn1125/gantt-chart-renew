import { ModeToggle } from "@/components/atom/ModeToggle";
import { Input } from "@/components/ui/input";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Separator } from "@/components/ui/separator";
import { VERSION } from "@/config/variables";
import { useGanttStore } from "@/store/gantt.store";

interface HeaderProps {}
const Header: React.FC<HeaderProps> = () => {
  const addRow = useGanttStore((state) => state.addRow);
  const addColumn = useGanttStore((state) => state.addColumn);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-3 px-4">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-lg">Gantt Chart</span>
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            v{VERSION}
          </span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <nav className="flex items-center">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>파일</MenubarTrigger>
              <MenubarContent align="start">
                <MenubarItem>
                  새 시트<MenubarShortcut>Ctrl+N</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  열기…<MenubarShortcut>Ctrl+O</MenubarShortcut>
                </MenubarItem>
                {/* <MenubarItem>저장</MenubarItem> */}
                <MenubarSeparator />
                <MenubarLabel>내보내기</MenubarLabel>
                <MenubarItem>CSV로 내보내기</MenubarItem>
                <MenubarItem>XLSX로 내보내기</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>도구</MenubarTrigger>
              <MenubarContent align="start">
                {/* <MenubarLabel>편집</MenubarLabel> */}
                <MenubarItem onClick={() => addColumn("left", 0, 0)}>
                  새 열 추가
                  <MenubarShortcut>Ctrl+C</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => addRow("head", "top", 0)}>
                  헤더 새 행 추가<MenubarShortcut>Ctrl+R</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onClick={() => addRow("body", "bottom", 0)}>
                  바디 새 행 추가<MenubarShortcut>Ctrl+Alt+R</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem>
                  되돌리기<MenubarShortcut>Ctrl+Z</MenubarShortcut>
                </MenubarItem>
                <MenubarItem>
                  다시실행<MenubarShortcut>Ctrl+Y</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarLabel>보기</MenubarLabel>
                <MenubarItem>격자선 보이기</MenubarItem>
                <MenubarItem>주말 음영</MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>도움말</MenubarTrigger>
              <MenubarContent align="start">
                {/* <MenubarLabel>도움말</MenubarLabel> */}
                <MenubarItem>문서</MenubarItem>
                <MenubarItem>문의하기</MenubarItem>
                <MenubarSeparator />
                <MenubarLabel>정보</MenubarLabel>
                <MenubarItem>릴리즈 노트</MenubarItem>
                <MenubarItem>버전 정보</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Input placeholder="시트 검색" className="h-8 w-48" />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
