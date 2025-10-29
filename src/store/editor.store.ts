import { create } from "zustand";
import { combine } from "zustand/middleware";

export const useEditorStore = create(
  combine(
    {
      editMode: "none",
    },
    (set) => ({
      setEditMode: (editMode: "none" | string) => set({ editMode }),
    })
  )
);
