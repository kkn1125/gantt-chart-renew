import { create } from "zustand";
import { combine } from "zustand/middleware";

export const useEditorStore = create(
  combine(
    {
      editMode: "none",
      copyContent: "",
      copyStyle: {},
      pressedKey: "",
    },
    (set, get) => ({
      setEditMode: (editMode: "none" | string) => set({ editMode }),
      setCopyContent: (content: string) => set({ copyContent: content }),
      setCopyStyle: (style: React.CSSProperties) => set({ copyStyle: style }),
      clearCopyContent: () => set({ copyContent: "" }),
      clearCopyStyle: () => set({ copyStyle: {} }),
      getCopyContent: () => get().copyContent,
      getCopyStyle: () => get().copyStyle,
      hasStyle: () => Object.keys(get().copyStyle).length > 0,
      hasContent: () => get().copyContent.length > 0,
      setPressedKey: (key: string) => set({ pressedKey: key }),
      isPressedKey: (key: string) => get().pressedKey === key,
      clearPressedKey: () => set({ pressedKey: "" }),
    })
  )
);
